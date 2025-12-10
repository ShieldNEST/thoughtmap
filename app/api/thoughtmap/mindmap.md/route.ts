import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const OUTPUT_PATH = path.join(process.cwd(), 'thoughtmap', 'mindmap.md')

export async function GET() {
  try {
    const mindmapContent = await readFile(OUTPUT_PATH, 'utf-8')
    
    return new NextResponse(mindmapContent, {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error reading mindmap:', error)
    return NextResponse.json(
      { error: 'Failed to read mindmap' },
      { status: 500 }
    )
  }
}
