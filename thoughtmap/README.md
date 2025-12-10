# Thoughtmap MVP

This minimal prototype converts a conversational log into a Mermaid mindmap.

## Usage

Run the converter and generate `mindmap.md` from the provided `thought_log.txt`:

```bash
python3 thoughtmap.py --log thought_log.txt --out mindmap.md
```

The script validates that the log file exists and writes a fenced Mermaid `mindmap` block to the requested output path (creating parent directories if needed).
