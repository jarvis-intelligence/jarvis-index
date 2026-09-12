#!/usr/bin/env sh

# jarvis SessionStart probe. Always exits 0 and says nothing unless an index is
# actionable: a non-zero exit or stray stdout byte becomes a visible hook-error
# notice at every session start. The PATH remains user-trusted; this hook never
# fetches a replacement CLI or evaluates data returned by jarvis.

# Do not fall back to uvx: resolving a cold dependency tree would perform network
# work during session start and contradict the plugin's local-first promise.
if ! command -v jarvis >/dev/null 2>&1; then
  exit 0
fi

# Git is required only to identify the current repository and the commit to
# compare; without it, silence is safer than emitting a hook error.
if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

# A directory outside a working tree has no index status to report.
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
HEAD_COMMIT=$(git rev-parse HEAD 2>/dev/null) || exit 0

# `jarvis list` is a local, no-argument TSV probe. Failure, no rows, or a row
# whose expected fields cannot be read is advisory rather than an interruption.
ROWS=$(jarvis list 2>/dev/null) || exit 0
if [ -z "$ROWS" ]; then
  exit 0
fi

MATCH=$(printf '%s\n' "$ROWS" | while IFS="$(printf '\t')" read -r SLUG STATUS LANGUAGE INDEXED_COMMIT REPO_PATH EXTRA; do
  if [ "$REPO_PATH" = "$REPO_ROOT" ]; then
    printf '%s\t%s' "$SLUG" "$INDEXED_COMMIT"
    break
  fi
done)

if [ -z "$MATCH" ]; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"jarvis: this repository is not indexed. Run `jarvis index` or call indexRepo before trusting structural results."}}'
  exit 0
fi

IFS="$(printf '\t')" read -r SLUG INDEXED_COMMIT <<EOF
$MATCH
EOF

if [ -z "$SLUG" ] || [ -z "$INDEXED_COMMIT" ] || [ "$INDEXED_COMMIT" = "-" ]; then
  exit 0
fi

if [ "$INDEXED_COMMIT" != "$HEAD_COMMIT" ]; then
  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"SessionStart\",\"additionalContext\":\"jarvis: index for '$SLUG' is stale (indexed at $INDEXED_COMMIT, HEAD is $HEAD_COMMIT). Run \`jarvis reindex $SLUG\` or call indexRepo before trusting structural results.\"}}"
fi

exit 0
