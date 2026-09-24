#!/usr/bin/env python
"""PostToolUse hook: formats a file after Write/Edit, dispatched by extension.

Reads the hook's stdin JSON payload itself (no jq dependency -- not installed
in this environment). Never fails the tool call: formatter errors are printed
to stderr and swallowed so a bad edit doesn't block the session.
"""
import json
import shutil
import subprocess
import sys

FORMATTERS = {
    ".py": ["black", "--quiet"],
    ".json": ["npx", "--yes", "prettier", "--log-level", "silent", "--write"],
    ".js": ["npx", "--yes", "prettier", "--log-level", "silent", "--write"],
    ".md": ["npx", "--yes", "prettier", "--log-level", "silent", "--write"],
}


def main():
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0

    tool_input = payload.get("tool_input", {})
    tool_response = payload.get("tool_response", {})
    file_path = tool_input.get("file_path") or tool_response.get("filePath")
    if not file_path:
        return 0

    ext = "." + file_path.rsplit(".", 1)[-1].lower() if "." in file_path else ""
    formatter = FORMATTERS.get(ext)
    if formatter is None:
        return 0

    # subprocess.run's default shell=False can't resolve Windows .CMD shims
    # (e.g. npx) by bare name -- shutil.which() applies PATHEXT and finds them.
    exe = shutil.which(formatter[0])
    if exe is None:
        print(f"format-on-edit: {formatter[0]} not found on PATH, skipping {file_path}", file=sys.stderr)
        return 0

    try:
        subprocess.run([exe] + formatter[1:] + [file_path], check=False, capture_output=True, timeout=30)
    except Exception as exc:
        print(f"format-on-edit: {ext} formatter failed for {file_path}: {exc}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
