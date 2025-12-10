import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";

async function runAppendCommand(text: string): Promise<void> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, "thoughtmap", "thoughtmap.py");

  return new Promise((resolve, reject) => {
    const processArgs = [scriptPath, "--add", text];
    const child = spawn("python3", processArgs, { cwd: projectRoot });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `thoughtmap.py exited with code ${code}`));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    await runAppendCommand(text);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
