from pathlib import Path
import subprocess
import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


LOG_PATH = Path(__file__).resolve().parent / "thought_log.txt"
OUTPUT_PATH = Path(__file__).resolve().parent / "mindmap.md"
SCRIPT_PATH = Path(__file__).resolve().parent / "thoughtmap.py"


class ThoughtmapEventHandler(FileSystemEventHandler):
    """Regenerate the mindmap when the thought log changes."""

    def __init__(self, debounce_seconds: float = 0.5):
        super().__init__()
        self.debounce_seconds = debounce_seconds
        self._last_run = 0.0

    def _should_run(self) -> bool:
        now = time.time()
        if now - self._last_run < self.debounce_seconds:
            return False
        self._last_run = now
        return True

    def on_modified(self, event):
        if Path(event.src_path) != LOG_PATH:
            return
        if not self._should_run():
            return
        regenerate_mindmap()

    def on_created(self, event):
        if Path(event.src_path) != LOG_PATH:
            return
        if not self._should_run():
            return
        regenerate_mindmap()


def regenerate_mindmap() -> None:
    print("Regenerating mindmap from thought_log.txt...")
    subprocess.run(
        ["python3", str(SCRIPT_PATH), "--log", str(LOG_PATH), "--out", str(OUTPUT_PATH)],
        check=True,
    )
    print("mindmap.md updated.")


def main() -> None:
    if not LOG_PATH.exists():
        raise FileNotFoundError(f"Missing log file: {LOG_PATH}")

    event_handler = ThoughtmapEventHandler()
    observer = Observer()
    observer.schedule(event_handler, str(LOG_PATH.parent), recursive=False)

    print(f"Watching {LOG_PATH} for changes. Press Ctrl+C to stop.")
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping watcher...")
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
