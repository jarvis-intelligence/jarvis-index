#!/usr/bin/env sh

# Behavioral contract for the real SessionStart probe. Fixtures are local commands
# so no case can reach a jarvis installation, network service, or the filesystem
# outside the temporary directory.

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
TARGET="$REPO_ROOT/plugin/hooks/jarvis-index-status.sh"
TMP_DIR=$(mktemp -d)
FIXTURE_REPO="$TMP_DIR/repository"
FIXTURE_BIN="$TMP_DIR/bin"
UVX_SENTINEL="$TMP_DIR/uvx-called"
TESTS=0
PASSES=0
FAILS=0

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT HUP INT TERM

mkdir -p "$FIXTURE_REPO" "$FIXTURE_BIN"

cat > "$FIXTURE_BIN/git" <<'EOF'
#!/bin/sh
case "${1:-} ${2:-}" in
  "rev-parse --show-toplevel")
    if [ "${GIT_MODE:-repository}" = "non-repository" ]; then
      exit 1
    fi
    printf '%s\n' "$FIXTURE_REPO"
    ;;
  "rev-parse HEAD")
    printf '%s\n' "$FIXTURE_HEAD"
    ;;
  *)
    exit 1
    ;;
esac
EOF

cat > "$FIXTURE_BIN/jarvis" <<'EOF'
#!/bin/sh
if [ "${1:-}" != "list" ]; then
  exit 1
fi

case "${JARVIS_MODE:-empty}" in
  failing)
    exit 1
    ;;
  empty)
    exit 0
    ;;
  fresh)
    printf 'fixture-slug\t✓ ready\tPython\t%s\t%s\n' "$FIXTURE_HEAD" "$FIXTURE_REPO"
    ;;
  stale)
    printf 'fixture-slug\t✓ ready\tPython\tindexed-commit\t%s\n' "$FIXTURE_REPO"
    ;;
  unindexed)
    printf 'another-slug\t✓ ready\tPython\tindexed-commit\t%s/another\n' "$FIXTURE_REPO"
    ;;
  *)
    exit 1
    ;;
esac
EOF

cat > "$FIXTURE_BIN/uvx" <<'EOF'
#!/bin/sh
: > "$UVX_SENTINEL"
EOF

chmod +x "$FIXTURE_BIN/git" "$FIXTURE_BIN/jarvis" "$FIXTURE_BIN/uvx"

record() {
  TESTS=$((TESTS + 1))
  if [ "$1" = "pass" ]; then
    PASSES=$((PASSES + 1))
    printf 'ok %s - %s\n' "$TESTS" "$2"
  else
    FAILS=$((FAILS + 1))
    printf 'not ok %s - %s\n' "$TESTS" "$2"
    printf '# expected %s; got exit %s and %s stdout bytes\n' "$3" "$STATUS" "$BYTES"
  fi
}

run_target() {
  CASE_PATH=$1
  GIT_MODE=$2
  JARVIS_MODE=$3
  OUT_FILE="$TMP_DIR/output-$TESTS"
  STATUS=0
  rm -f "$OUT_FILE"
  (
    cd "$FIXTURE_REPO" || exit 125
    PATH="$CASE_PATH" \
      FIXTURE_REPO="$FIXTURE_REPO" \
      FIXTURE_HEAD="head-commit" \
      GIT_MODE="$GIT_MODE" \
      JARVIS_MODE="$JARVIS_MODE" \
      UVX_SENTINEL="$UVX_SENTINEL" \
      /bin/sh "$TARGET" > "$OUT_FILE"
  )
  STATUS=$?
  BYTES=$(wc -c < "$OUT_FILE" | tr -d ' ')
}

assert_silent() {
  run_target "$1" "$2" "$3"
  if [ "$STATUS" -eq 0 ] && [ "$BYTES" -eq 0 ]; then
    return 0
  fi
  return 1
}

assert_signal() {
  run_target "$FIXTURE_BIN" repository "$1"
  printf '%s\n' "$2" > "$TMP_DIR/expected-$TESTS"
  if [ "$STATUS" -eq 0 ] && cmp -s "$TMP_DIR/expected-$TESTS" "$OUT_FILE"; then
    return 0
  fi
  return 1
}

# 1. jarvis absent: a cold-cache uvx fallback would create this sentinel.
rm -f "$UVX_SENTINEL"
if assert_silent "$FIXTURE_BIN" repository empty && [ ! -e "$UVX_SENTINEL" ]; then
  record pass "SessionStart hook is silent when jarvis is unavailable"
else
  record fail "SessionStart hook is silent when jarvis is unavailable" "exit 0, zero stdout bytes, and no uvx fallback"
fi

# 2. git is deliberately unavailable even though a jarvis fixture exists.
GIT_ABSENT_BIN="$TMP_DIR/git-absent-bin"
mkdir -p "$GIT_ABSENT_BIN"
cp "$FIXTURE_BIN/jarvis" "$GIT_ABSENT_BIN/jarvis"
cp "$FIXTURE_BIN/uvx" "$GIT_ABSENT_BIN/uvx"
if assert_silent "$GIT_ABSENT_BIN" repository empty; then
  record pass "SessionStart hook is silent when git is unavailable"
else
  record fail "SessionStart hook is silent when git is unavailable" "exit 0 and zero stdout bytes"
fi

# 3. git is present but declines to identify a repository root.
if assert_silent "$FIXTURE_BIN" non-repository empty; then
  record pass "SessionStart hook is silent outside a git repository"
else
  record fail "SessionStart hook is silent outside a git repository" "exit 0 and zero stdout bytes"
fi

# 4-6. A broken, empty, or current list result is advisory and produces no signal.
if assert_silent "$FIXTURE_BIN" repository failing; then
  record pass "SessionStart hook is silent when jarvis list fails"
else
  record fail "SessionStart hook is silent when jarvis list fails" "exit 0 and zero stdout bytes"
fi

if assert_silent "$FIXTURE_BIN" repository empty; then
  record pass "SessionStart hook is silent when jarvis list is empty"
else
  record fail "SessionStart hook is silent when jarvis list is empty" "exit 0 and zero stdout bytes"
fi

if assert_silent "$FIXTURE_BIN" repository fresh; then
  record pass "SessionStart hook is silent when the index is current"
else
  record fail "SessionStart hook is silent when the index is current" "exit 0 and zero stdout bytes"
fi

# 7-8. The signal payload is compared byte-for-byte, including one JSON object.
STALE_JSON='{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"jarvis: index for '\''fixture-slug'\'' is stale (indexed at indexed-commit, HEAD is head-commit). Run `jarvis reindex fixture-slug` or call indexRepo before trusting structural results."}}'
if assert_signal stale "$STALE_JSON"; then
  record pass "SessionStart hook reports a stale index"
else
  record fail "SessionStart hook reports a stale index" "exit 0 and the exact stale SessionStart JSON object"
fi

UNINDEXED_JSON='{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"jarvis: this repository is not indexed. Run `jarvis index` or call indexRepo before trusting structural results."}}'
if assert_signal unindexed "$UNINDEXED_JSON"; then
  record pass "SessionStart hook reports an unindexed repository"
else
  record fail "SessionStart hook reports an unindexed repository" "exit 0 and the exact unindexed SessionStart JSON object"
fi

printf '1..%s\n' "$TESTS"
printf '# tests %s\n' "$TESTS"
printf '# pass %s\n' "$PASSES"
printf '# fail %s\n' "$FAILS"
printf '# cancelled 0\n'

if [ "$FAILS" -ne 0 ]; then
  exit 1
fi

exit 0
