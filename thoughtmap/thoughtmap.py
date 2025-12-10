import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments for Thoughtmap operations."""
    parser = argparse.ArgumentParser(
        description="Append thoughts, suggest links, or generate Thoughtmap outputs.",
    )
    parser.add_argument(
        "--log",
        default=Path(__file__).resolve().parent / "thought_log.txt",
        help="Path to the thought log file (default: thought_log.txt)",
    )
    parser.add_argument(
        "--out",
        default=Path(__file__).resolve().parent / "mindmap.md",
        help="Path to the output Markdown mindmap (default: mindmap.md)",
    )
    parser.add_argument("--add", help="Append a timestamped thought to the log")
    parser.add_argument(
        "--suggest",
        action="store_true",
        help="Return placeholder suggestions for related thoughts",
    )
    return parser.parse_args()


def sanitize_label(raw_label: str) -> str:
    """Sanitize Mermaid labels by removing unsafe characters and normalizing whitespace."""
    sanitized = raw_label
    for character in "()[]{}":
        sanitized = sanitized.replace(character, "")
    collapsed = " ".join(sanitized.split())
    return collapsed.strip()


def normalize_message_text(text: str) -> str:
    """Normalize message text by collapsing whitespace and stripping edges."""
    return " ".join(text.split()).strip()


def detect_role_and_text(raw_text: str) -> tuple[str, str]:
    """Detect the role from the input text and return clean role/text for logging."""
    stripped = raw_text.strip()
    lowered = stripped.lower()
    role = "User"
    if lowered.startswith("assistant:"):
        role = "Assistant"
        stripped = stripped.split(":", 1)[1].strip()
    elif lowered.startswith("user:"):
        stripped = stripped.split(":", 1)[1].strip()
    clean_text = normalize_message_text(stripped)
    return role, clean_text


def append_thought(log_path: Path, text: str) -> None:
    """Append a timestamped thought with role detection to the thought log."""
    role, clean_text = detect_role_and_text(text)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    entry = f"[{timestamp}] {role}: {clean_text}"
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as stream:
        stream.write(entry + "\n")
    print(f"Appended thought as {role} at {timestamp}.")


def read_log(log_path: Path) -> list[str]:
    """Read the thought log and return non-empty lines."""
    if not log_path.exists():
        raise FileNotFoundError(f"Log file not found: {log_path}")

    lines = []
    for raw_line in log_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line:
            lines.append(line)
    return lines


def parse_log_line(raw_line: str) -> Optional[Dict[str, str]]:
    """Parse a single log line into structured fields for downstream rendering."""
    line = raw_line.strip()
    if not line:
        return None

    timestamp = ""
    remainder = line
    if line.startswith("[") and "]" in line:
        closing = line.find("]")
        timestamp = line[1:closing].strip()
        remainder = line[closing + 1 :].strip()

    if ":" not in remainder:
        return None

    role_part, message_part = remainder.split(":", 1)
    role = role_part.strip() or "User"
    message = normalize_message_text(message_part)
    if not message:
        return None

    normalized_role = "Assistant" if role.lower().startswith("assistant") else "User"
    return {
        "timestamp": timestamp,
        "role": normalized_role,
        "text": message,
    }


def group_semantically(nodes: List[Dict[str, str]]) -> List[Any]:
    """
    TODO: Use embeddings or LLM to group related nodes.
    """
    return []


def build_nodes(lines: List[str]) -> tuple[List[Dict[str, str]], List[str]]:
    """Convert log lines into structured nodes and gather warnings for invalid entries."""
    parsed_nodes: List[Dict[str, str]] = []
    warnings: List[str] = []

    for raw_line in lines:
        parsed = parse_log_line(raw_line)
        if not parsed:
            warning_detail = sanitize_label(raw_line) or raw_line.strip()
            warnings.append(f"  %% Skipped unparseable line: {warning_detail}")
            continue
        parsed_nodes.append(parsed)

    return parsed_nodes, warnings


def build_mindmap(nodes: List[Dict[str, str]], warnings: List[str]) -> str:
    """Build a Mermaid flowchart mindmap from structured nodes and warnings."""
    mermaid_lines = ["```mermaid", "graph TD"]
    node_definitions: list[str] = []
    edges: list[str] = []

    root_id = "root"
    node_definitions.append(f"  {root_id}[\"Conversation\"]")
    previous_id = root_id

    for index, node in enumerate(nodes):
        node_id = f"n{index}"
        label = sanitize_label(
            f"[{node.get('timestamp', '')}] {node.get('role', 'User')}: {node.get('text', '')}"
        )
        node_definitions.append(f"  {node_id}[\"{label}\"]")
        edges.append(f"  {previous_id} --> {node_id}")
        previous_id = node_id

    mermaid_lines.extend(node_definitions)
    mermaid_lines.extend(warnings)
    mermaid_lines.extend(edges)
    mermaid_lines.append("```")
    return "\n".join(mermaid_lines) + "\n"


def build_json(nodes: List[Dict[str, str]], groups: List[Any]) -> Dict[str, Any]:
    """Assemble structured JSON for downstream consumers."""
    edges: List[List[str]] = []
    previous_id = "root"
    node_payload: List[Dict[str, str]] = []

    for index, node in enumerate(nodes):
        node_id = f"n{index}"
        node_payload.append({
            "id": node_id,
            "text": node.get("text", ""),
            "role": node.get("role", "User"),
            "timestamp": node.get("timestamp", ""),
        })
        edges.append([previous_id, node_id])
        previous_id = node_id

    return {
        "root": "Conversation",
        "nodes": node_payload,
        "edges": edges,
        "groups": groups,
    }


def write_output(output_path: Path, content: str) -> None:
    """Write textual output to the target path, ensuring the directory exists."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")


def write_json(output_path: Path, payload: Dict[str, Any]) -> None:
    """Write JSON payload to disk with stable formatting."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def generate_outputs(log_path: Path, markdown_path: Path, json_path: Path) -> None:
    """Generate Mermaid and JSON outputs from the log file."""
    entries = read_log(log_path)
    nodes, warnings = build_nodes(entries)
    groups = group_semantically(nodes)
    mindmap_md = build_mindmap(nodes, warnings)
    mindmap_json = build_json(nodes, groups)
    write_output(markdown_path, mindmap_md)
    write_json(json_path, mindmap_json)
    print(f"Wrote mindmap markdown to {markdown_path} and JSON to {json_path}.")


def generate_placeholder_suggestions(nodes: List[Dict[str, str]]) -> Dict[str, List[str]]:
    """Return placeholder suggestions based on minimal heuristics."""
    # TODO: Replace with AI-driven semantic linking suggestions.
    suggestions: List[str] = []
    if not nodes:
        return {"suggestions": ["No thoughts available to suggest relationships."]}

    if len(nodes) > 1:
        suggestions.append("Thought 0 relates to thought 1")
    suggestions.append("Possible cluster: thoughts 0,1")
    if len(nodes) > 3:
        suggestions.append("Consider grouping thoughts 2,3 for deeper analysis")

    return {"suggestions": suggestions}


def handle_suggest(log_path: Path) -> None:
    """Handle the --suggest command by returning placeholder JSON suggestions."""
    entries = read_log(log_path)
    nodes, _ = build_nodes(entries)
    suggestions = generate_placeholder_suggestions(nodes)
    print(json.dumps(suggestions, indent=2))


def main() -> None:
    """Entrypoint for Thoughtmap CLI workflows."""
    args = parse_args()
    log_path = Path(args.log)
    output_path = Path(args.out)

    if args.add:
        append_thought(log_path, args.add)
        return

    if args.suggest:
        handle_suggest(log_path)
        return

    json_path = output_path.with_suffix(".json")
    generate_outputs(log_path, output_path, json_path)


if __name__ == "__main__":
    main()
