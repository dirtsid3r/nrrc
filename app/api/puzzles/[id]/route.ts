import { NextResponse } from "next/server"
import { puzzleData } from "@/data/puzzle-data"
import { PuzzleData } from "@/types/puzzle-types"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const updatedPuzzle: PuzzleData = await request.json()

    // Find the puzzle index
    const puzzleIndex = puzzleData.findIndex((puzzle) => puzzle.id === id)
    if (puzzleIndex === -1) {
      return NextResponse.json(
        { error: "Puzzle not found" },
        { status: 404 }
      )
    }

    // Update the puzzle
    puzzleData[puzzleIndex] = updatedPuzzle

    // In a real application, you would save this to a database
    // For now, we'll just return the updated puzzle
    return NextResponse.json(updatedPuzzle)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update puzzle" },
      { status: 500 }
    )
  }
} 