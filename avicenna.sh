#!/usr/bin/env bash
# avicenna.sh
#
# Usage:
#   ./avicenna.sh <iterations> <prd_json> <progress_md>
#
# Example:
#   ./avicenna.sh 20 prd.json Progress.md
#
# Expected PRD shape (minimum):
# {
#   "worktree": "feature-auth-overhaul",
#   "tasks": [
#     {
#       "id": "refresh-token-rotation",
#       "title": "Implement refresh token rotation",
#       "status": "todo"
#     }
#   ]
# }
#
# Requirements:
#   - codex CLI installed and authenticated
#   - git repo
#   - jq
#   - python3
#
# Behavior:
#   1. Reads your manually created prd.json and Progress.md in the MAIN worktree
#   2. Uses prd.json["worktree"] as both the PRD worktree name and branch name
#   3. Creates exactly one worktree for the whole PRD, or reuses it if it exists
#   4. Asks Codex to choose exactly one next task from the canonical main-worktree prd.json
#   5. Runs Codex inside the PRD worktree, but still requires it to update the canonical main-worktree prd.json and Progress.md
#   6. Requires Codex to update prd.json when a task is completed
#   7. Requires Codex to append progress to Progress.md
#   8. Requires Codex to make a meaningful git commit
#   9. Stops when all work is complete

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <iterations> <prd_json> <progress_md>"
  exit 1
fi

ITERATIONS="$1"
PRD_FILE_INPUT="$2"
PROGRESS_FILE_INPUT="$3"

REPO_ROOT="$(git rev-parse --show-toplevel)"
MAIN_WORKTREE_ROOT="$REPO_ROOT"
cd "$MAIN_WORKTREE_ROOT"

if [[ ! -f "$PRD_FILE_INPUT" ]]; then
  echo "PRD JSON file not found: $PRD_FILE_INPUT"
  exit 1
fi

if [[ ! -f "$PROGRESS_FILE_INPUT" ]]; then
  echo "Progress markdown file not found: $PROGRESS_FILE_INPUT"
  echo "Create it manually first, then rerun."
  exit 1
fi

if ! jq empty "$PRD_FILE_INPUT" >/dev/null 2>&1; then
  echo "PRD file is not valid JSON: $PRD_FILE_INPUT"
  exit 1
fi

if ! jq -e '.worktree | strings | length > 0' "$PRD_FILE_INPUT" >/dev/null 2>&1; then
  echo "PRD JSON must contain a non-empty string field: .worktree"
  exit 1
fi

if ! jq -e '.tasks | arrays' "$PRD_FILE_INPUT" >/dev/null 2>&1; then
  echo "PRD JSON must contain an array field: .tasks"
  exit 1
fi

PRD_FILE_ABS="$(python3 -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$PRD_FILE_INPUT")"
PROGRESS_FILE_ABS="$(python3 -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$PROGRESS_FILE_INPUT")"

sanitize_name() {
  local s="$1"
  s="$(echo "$s" | tr '[:upper:]' '[:lower:]')"
  s="$(echo "$s" | sed -E 's/[^a-z0-9._\/-]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"
  printf '%s' "$s"
}

WORKTREE_NAME_RAW="$(jq -r '.worktree' "$PRD_FILE_ABS")"
WORKTREE_NAME="$(sanitize_name "$WORKTREE_NAME_RAW")"

if [[ -z "$WORKTREE_NAME" ]]; then
  echo "Invalid worktree name in .worktree"
  exit 1
fi

BRANCH_NAME="$WORKTREE_NAME"
WORKTREE_BASE="${MAIN_WORKTREE_ROOT}/.avicenna-worktrees"
WORKTREE_PATH="${WORKTREE_BASE}/${WORKTREE_NAME}"
mkdir -p "$WORKTREE_BASE"

SELECT_SCHEMA="$(mktemp)"
SELECT_OUTPUT="$(mktemp)"
RUN_OUTPUT="$(mktemp)"
SELECT_PROMPT="$(mktemp)"
RUN_PROMPT="$(mktemp)"

cleanup() {
  rm -f "$SELECT_SCHEMA" "$SELECT_OUTPUT" "$RUN_OUTPUT" "$SELECT_PROMPT" "$RUN_PROMPT"
}
trap cleanup EXIT

branch_exists() {
  git show-ref --verify --quiet "refs/heads/$1" || \
  git show-ref --verify --quiet "refs/remotes/origin/$1"
}

worktree_exists() {
  local path="$1"
  git worktree list --porcelain | grep -Fqx "worktree $path"
}

ensure_single_prd_worktree() {
  echo "Main worktree root: $MAIN_WORKTREE_ROOT"
  echo "Canonical PRD:      $PRD_FILE_ABS"
  echo "Canonical progress: $PROGRESS_FILE_ABS"
  echo "PRD worktree name:  $WORKTREE_NAME"
  echo "Branch name:        $BRANCH_NAME"
  echo "PRD worktree path:  $WORKTREE_PATH"

  if worktree_exists "$WORKTREE_PATH"; then
    echo "Reusing existing worktree: $WORKTREE_PATH"
    return 0
  fi

  if [[ -e "$WORKTREE_PATH" ]]; then
    echo "Path exists but is not a registered git worktree: $WORKTREE_PATH"
    exit 1
  fi

  if branch_exists "$BRANCH_NAME"; then
    echo "Creating worktree from existing branch: $BRANCH_NAME"
    git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
  else
    echo "Creating new worktree and branch: $BRANCH_NAME"
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH"
  fi
}

cat > "$SELECT_SCHEMA" <<'JSON'
{
  "type": "object",
  "additionalProperties": false,
  "required": ["status", "task_id", "task_title"],
  "properties": {
    "status": {
      "type": "string",
      "enum": ["TASK_SELECTED", "COMPLETE"]
    },
    "task_id": {
      "type": "string",
      "minLength": 1
    },
    "task_title": {
      "type": "string",
      "minLength": 1
    }
  }
}
JSON

ensure_single_prd_worktree

for ((i=1; i<=ITERATIONS; i++)); do
  echo
  echo "============================================================"
  echo "Avicenna iteration $i / $ITERATIONS"
  echo "============================================================"

  # Always read the canonical files from the MAIN worktree.
  if ! jq empty "$PRD_FILE_ABS" >/dev/null 2>&1; then
    echo "Canonical PRD file became invalid JSON: $PRD_FILE_ABS"
    exit 1
  fi

  cat > "$SELECT_PROMPT" <<EOF
You are Avicenna.

Your job in this step is ONLY to select the next single highest-priority task.

Canonical files to inspect in the MAIN worktree:
- PRD JSON: @$PRD_FILE_ABS
- progress log: @$PROGRESS_FILE_ABS

The PRD JSON is the source of truth.
Assume:
- .worktree is the PRD-wide worktree/branch name
- .tasks is the task list
- each task has at least id, title, and status fields

Instructions:
1. Read the canonical PRD JSON from the MAIN worktree.
2. Read the canonical Progress.md from the MAIN worktree.
3. Choose exactly one highest-priority unfinished task.
4. Prefer tasks that unblock other work, reduce technical risk, or establish important foundations.
5. Do not simply choose the first task in the file.
6. If everything in the PRD is complete, return status COMPLETE.
7. Return ONLY valid JSON matching the provided schema.
8. task_id must exactly match the selected task's id in the PRD JSON.
9. task_title must exactly match the selected task's title in the PRD JSON.

Do not implement anything yet.
EOF

  codex exec \
    --sandbox read-only \
    --output-schema "$SELECT_SCHEMA" \
    --output-last-message "$SELECT_OUTPUT" \
    - < "$SELECT_PROMPT"

  echo "Selection JSON:"
  cat "$SELECT_OUTPUT"
  echo

  status="$(jq -r '.status' "$SELECT_OUTPUT")"

  if [[ "$status" == "COMPLETE" ]]; then
    echo "PRD complete, exiting."
    exit 0
  fi

  TASK_ID="$(jq -r '.task_id' "$SELECT_OUTPUT")"
  TASK_TITLE="$(jq -r '.task_title' "$SELECT_OUTPUT")"

  if [[ -z "$TASK_ID" || -z "$TASK_TITLE" ]]; then
    echo "Invalid task selection."
    exit 1
  fi

  if ! jq -e --arg id "$TASK_ID" '.tasks[] | select(.id == $id)' "$PRD_FILE_ABS" >/dev/null 2>&1; then
    echo "Selected task_id does not exist in canonical PRD JSON: $TASK_ID"
    exit 1
  fi

  FEATURE_NAME="$(sanitize_name "$TASK_ID")"
  if [[ -z "$FEATURE_NAME" ]]; then
    FEATURE_NAME="unknown-task"
  fi

  echo "Selected task id:    $TASK_ID"
  echo "Selected task title: $TASK_TITLE"
  echo "Feature token:       $FEATURE_NAME"
  echo "Using PRD worktree:  $WORKTREE_PATH"

  cat > "$RUN_PROMPT" <<EOF
You are Avicenna.

You are implementing EXACTLY ONE feature in this repository.

Execution context:
- Your current repository working directory is the PRD worktree: $WORKTREE_PATH
- The canonical PRD and progress files live in the MAIN worktree and MUST be updated there directly by absolute path

Canonical files in the MAIN worktree:
- PRD JSON: @$PRD_FILE_ABS
- progress log: @$PROGRESS_FILE_ABS

Selected task:
- ID: $TASK_ID
- Title: $TASK_TITLE
- Feature token: $FEATURE_NAME
- PRD worktree/branch: $BRANCH_NAME

Mandatory instructions:
1. Work on ONLY this single selected task.
2. Use the canonical PRD JSON as the source of truth for requirements and task structure.
3. First inspect the relevant code paths and make a brief implementation plan.
4. Keep scope tight and reviewable.
5. Run relevant feedback loops:
   - tests
   - type checks
   - lint
   - build checks
   Use the smallest relevant commands first.
6. Fix issues you introduced if they directly block this feature.
7. Append a concise entry to the canonical progress file at $PROGRESS_FILE_ABS.
   IMPORTANT: append only. Do not overwrite, truncate, recreate, or replace the file.
8. Update the canonical PRD file at $PRD_FILE_ABS if and only if the selected task is now done.
   - Set only the selected task's status to "done"
   - Preserve valid JSON
   - Do not mark unrelated tasks done
9. Make a git commit for this iteration with a meaningful message in exactly this format:
   feat($FEATURE_NAME)-[type]: message
   where [type] could be one of but not limited to:
   - add
   - fix
   - chore
   Examples:
   - feat($FEATURE_NAME)-add: implement refresh token rotation
   - feat($FEATURE_NAME)-fix: correct token expiry validation
10. The commit must happen if you made coherent useful changes.
11. Stage and commit both code changes in the PRD worktree and any canonical-file changes you made.
12. There is exactly one PRD worktree for the whole PRD. Do not create another worktree.
13. If all planned work is now complete, output exactly:
    <promise>COMPLETE</promise>

Guardrails:
- Do not start a second feature.
- Prefer minimal diffs.
- Do not overwrite Progress.md.
- Do not corrupt PRD JSON.
- Only mark the task complete in PRD JSON if it is actually complete.
- If the task cannot be fully completed, still make coherent partial progress,
  append that progress, and commit it if useful.

Your final response should include:
- what you changed
- what checks you ran
- whether you updated the canonical PRD JSON
- whether you updated the canonical Progress.md
- the exact commit message
- the commit hash
- and ONLY include <promise>COMPLETE</promise> if all work is complete
EOF

  codex exec \
    -C "$WORKTREE_PATH" \
    --dangerously-bypass-approvals-and-sandbox \
    --output-last-message "$RUN_OUTPUT" \
    - < "$RUN_PROMPT"

  result="$(cat "$RUN_OUTPUT")"

  echo
  echo "Codex result:"
  echo "$result"
  echo

  # Re-validate the canonical PRD after the runner modifies it.
  if ! jq empty "$PRD_FILE_ABS" >/dev/null 2>&1; then
    echo "Canonical PRD file was corrupted into invalid JSON: $PRD_FILE_ABS"
    exit 1
  fi

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete, exiting."
    exit 0
  fi
done