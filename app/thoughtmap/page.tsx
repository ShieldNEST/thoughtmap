import fs from "node:fs/promises";
import path from "node:path";
import VoiceInput from "./VoiceInput";
import RegenerateButton from "./RegenerateButton";

async function readFileSafe(targetPath: string): Promise<string> {
  try {
    return await fs.readFile(targetPath, "utf-8");
  } catch {
    return "";
  }
}

export default async function ThoughtmapPage() {
  const projectRoot = process.cwd();
  const mindmapPath = path.join(projectRoot, "thoughtmap", "mindmap.md");
  const mindmapJsonPath = path.join(projectRoot, "thoughtmap", "mindmap.json");

  const [mindmapContent, mindmapJson] = await Promise.all([
    readFileSafe(mindmapPath),
    readFileSafe(mindmapJsonPath),
  ]);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold">Thoughtmap</h1>
          <p className="text-lg text-gray-700">
            Append new thoughts via voice, regenerate the map, and view the latest
            Mermaid and JSON outputs.
          </p>
        </header>

        <section className="space-y-4">
          <RegenerateButton />
          <VoiceInput />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Latest mindmap.md</h2>
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">{mindmapContent || "No mindmap generated yet."}</pre>
          </div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Latest mindmap.json</h2>
            <pre className="whitespace-pre-wrap break-words text-sm text-gray-800">{mindmapJson || "No JSON generated yet."}</pre>
          </div>
        </section>
      </div>
    </main>
  );
}
