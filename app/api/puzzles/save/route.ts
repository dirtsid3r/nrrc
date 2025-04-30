import { NextResponse } from "next/server"
import fs from 'fs/promises'
import path from 'path'
import { PuzzleData } from "@/types/puzzle-types"

export async function POST(request: Request) {
  try {
    const puzzles: PuzzleData[] = await request.json()
    
    // Create the data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })
    
    // Save to a JSON file
    const savePath = path.join(dataDir, 'saved-puzzle-data.json')
    await fs.writeFile(savePath, JSON.stringify(puzzles, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving puzzles:', error)
    return NextResponse.json(
      { error: "Failed to save puzzles" },
      { status: 500 }
    )
  }
} 