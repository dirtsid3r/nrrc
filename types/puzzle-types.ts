export interface SortingItem {
  id: string
  name: string
  category?: string
}

export interface BasePuzzle {
  id: number
  name: string
  type: "passphrase" | "sorting"
  initialMessage: string
  hints: string[]
  successMessage: string
}

export interface PassphrasePuzzle extends BasePuzzle {
  type: "passphrase"
  passphrase: string
}

export interface SortingPuzzle extends BasePuzzle {
  type: "sorting"
  items: SortingItem[]
  categories: string[]
  solution: Record<string, string[]>
}

export type PuzzleType = PassphrasePuzzle | SortingPuzzle

// Helper type for arrays of puzzles
export type PuzzleData = PuzzleType[]

export function isSortingPuzzle(puzzle: PuzzleType | undefined): puzzle is SortingPuzzle {
  return puzzle?.type === "sorting"
}

export function isPassphrasePuzzle(puzzle: PuzzleType | undefined): puzzle is PassphrasePuzzle {
  return puzzle?.type === "passphrase"
}
