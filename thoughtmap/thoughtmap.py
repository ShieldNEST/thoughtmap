import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert a thought log into a Mermaid flowchart.")
    parser.add_argument("--log", required=True, help="Path to the thought log file")
    parser.add_argument("--out", required=True, help="Path to the output Markdown file")
    return parser.parse_args()


def sanitize_label(raw_label: str) -> str:
    sanitized = raw_label
    for character in "()[]{}":
        sanitized = sanitized.replace(character, "")
    collapsed = " ".join(sanitized.split())
    return collapsed.strip()


def read_log(log_path: Path) -> list[str]:
    if not log_path.exists():
        raise FileNotFoundError(f"Log file not found: {log_path}")

    lines = []
    for raw_line in log_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line:
            lines.append(line)
    return lines


def parse_entry(raw_line: str) -> str | None:
    if ":" not in raw_line:
        return None

    speaker, message = raw_line.split(":", 1)
    speaker_label = sanitize_label(speaker)
    message_label = sanitize_label(message)

    if not speaker_label or not message_label:
        return None

    return f"{speaker_label}: {message_label}"


def build_mindmap(lines: list[str]) -> str:
    mermaid_lines = ["```mermaid", "graph TD"]
    node_definitions: list[str] = []
    edges: list[str] = []
    warnings: list[str] = []

    root_id = "n0"
    node_definitions.append(f"  {root_id}[\"Conversation\"]")
    previous_id = root_id

    for index, raw_line in enumerate(lines, start=1):
        label = parse_entry(raw_line)
        if not label:
            warning_detail = sanitize_label(raw_line) or raw_line.strip()
            warnings.append(f"  %% Skipped unparseable line: {warning_detail}")
            continue

        node_id = f"n{index}"
        node_definitions.append(f"  {node_id}[\"{label}\"]")
        edges.append(f"  {previous_id} --> {node_id}")
        previous_id = node_id

    mermaid_lines.extend(node_definitions)
    mermaid_lines.extend(warnings)
    mermaid_lines.extend(edges)
    mermaid_lines.append("```")
    return "\n".join(mermaid_lines) + "\n"


def write_output(output_path: Path, content: str) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")


def main() -> None:
    args = parse_args()
    log_path = Path(args.log)
    output_path = Path(args.out)

    entries = read_log(log_path)
    mindmap = build_mindmap(entries)
    write_output(output_path, mindmap)


if __name__ == "__main__":
    main()
