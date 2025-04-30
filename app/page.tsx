"use client"

import { useState, useEffect } from "react"
import ReactorConsole from "@/components/reactor-console"
import { defaultPuzzleData } from "@/data/puzzle-data"
import { AdminPanel } from "@/components/admin-panel"
import type { PuzzleType } from "@/types/puzzle-types"

export default function Home() {
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [currentPuzzles, setCurrentPuzzles] = useState<PuzzleType[]>(defaultPuzzleData)

  // Load puzzles on mount and when admin panel is closed
  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        const response = await fetch('/api/puzzles')
        if (!response.ok) throw new Error('Failed to load puzzles')
        const data = await response.json()
        setCurrentPuzzles(data)
      } catch (error) {
        console.error('Error loading puzzles:', error)
        setCurrentPuzzles(defaultPuzzleData)
      }
    }
    loadPuzzles()
  }, [showAdminPanel]) // Reload when admin panel is closed

  // Secret key combination to access admin panel (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setShowAdminPanel(!showAdminPanel)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showAdminPanel])

  return (
    <main className="min-h-screen">
      {showAdminPanel ? (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-white">Admin Panel</h2>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Close Admin Panel
            </button>
          </div>
          <AdminPanel />
        </div>
      ) : (
        <ReactorConsole puzzleData={currentPuzzles} />
      )}
    </main>
  )
}
