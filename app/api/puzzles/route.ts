import { NextResponse } from "next/server"
import { defaultPuzzleData } from "@/data/puzzle-data"
import fs from 'fs/promises'
import path from 'path'

const SAVE_FILE_PATH = path.join(process.cwd(), 'data', 'saved-puzzle-data.json')

export async function GET() {
  try {
    // Try to read saved puzzle data
    const savedData = await fs.readFile(SAVE_FILE_PATH, 'utf-8')
    return NextResponse.json(JSON.parse(savedData))
  } catch (error) {
    // Return default puzzle data if saved data doesn't exist or is invalid
    return NextResponse.json(defaultPuzzleData)
  }
}

export async function PUT(request: Request) {
  try {
    const puzzles = await request.json()
    
    // Create the data directory if it doesn't exist
    await fs.mkdir(path.dirname(SAVE_FILE_PATH), { recursive: true })
    
    // Save the updated puzzles
    await fs.writeFile(SAVE_FILE_PATH, JSON.stringify(puzzles, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving puzzles:', error)
    return NextResponse.json(
      { error: "Failed to save puzzles" },
      { status: 500 }
    )
  }
} 