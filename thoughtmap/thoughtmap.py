import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert a thought log into a Mermaid mindmap.")
    parser.add_argument("--log", required=True, help="Path to the thought log file")
    parser.add_argument("--out", required=True, help="Path to the output Markdown file")
    return parser.parse_args()


def read_log(log_path: Path) -> list[str]:
    if not log_path.exists():
        raise FileNotFoundError(f"Log file not found: {log_path}")

    lines = []
    for raw_line in log_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line:
            lines.append(line)
    return lines


def build_mindmap(lines: list[str]) -> str:
    mermaid_lines = ["```mermaid", "mindmap", "  root((Conversation))"]
    for entry in lines:
        mermaid_lines.append(f"    {entry}")
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
