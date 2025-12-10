'use server'

import { spawn } from 'child_process'
import { readFile } from 'fs/promises'
import path from 'path'

const SCRIPT_PATH = path.join(process.cwd(), 'thoughtmap', 'thoughtmap.py')
const LOG_PATH = path.join(process.cwd(), 'thoughtmap', 'thought_log.txt')
const OUTPUT_PATH = path.join(process.cwd(), 'thoughtmap', 'mindmap.md')

export async function regenerateMindmap() {
  try {
    // Run the Python script directly from server action
    const pythonProcess = spawn('python3', [
      SCRIPT_PATH,
      '--log',
      LOG_PATH,
      '--out',
      OUTPUT_PATH,
    ])

    let stderr = ''

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // Wait for the process to complete
    await new Promise<void>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`))
        } else {
          resolve()
        }
      })
    })

    // Read the generated mindmap
    const mindmapContent = await readFile(OUTPUT_PATH, 'utf-8')

    return {
      status: 'success',
      mindmap: mindmapContent,
    }
  } catch (error) {
    console.error('Error in regenerateMindmap:', error)
    throw error
  }
}
