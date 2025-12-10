# Thoughtmap MVP

This minimal prototype converts a conversational log into a Mermaid flowchart.

## Usage

Run the converter and generate `mindmap.md` from the provided `thought_log.txt`:

```bash
python3 thoughtmap.py --log thought_log.txt --out mindmap.md
```

The script validates that the log file exists and writes a fenced Mermaid `graph TD` block to the requested output path (creating parent directories if needed). Each log line is parsed into a normalized node label (stripping brackets, collapsing whitespace), and unparseable lines are skipped with an inline Mermaid comment noting the warning.

## Live Updating

Install the watcher dependency and regenerate `mindmap.md` whenever `thought_log.txt` changes:

```bash
python3 -m pip install watchdog
python3 watch_thoughtmap.py
```
