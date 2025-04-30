"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, Fragment } from "react"
import { cn } from "@/lib/utils"
import CountdownTimer from "./countdown-timer"
import { SupportChat } from "./support-chat"
import { VisualSortingPuzzle } from "./sorting-puzzle"
import type { PuzzleType, PuzzleData, SortingPuzzle } from "@/types/puzzle-types"
import { isSortingPuzzle } from "@/types/puzzle-types"
import { playSound } from "@/utils/sounds"
import { WelcomeModal } from './welcome-modal'
import { EndGameModal } from './end-game-modal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { TypewriterText } from "./typewriter-text"
import type { Message } from "@/types/message-types"
import "./reactor-console.css"

interface SortingItem {
  id: string
  name: string
}

interface ReactorConsoleProps {
  puzzleData: PuzzleData
}

interface CategoryAssignments {
  [key: string]: string[]
}

// Define a local message type for backward compatibility
interface LocalMessage {
  id: number
  text: string
  sender: string
  timestamp: Date
  type?: "question" | "hint" | "error" | "system"
}

interface GameState {
  currentStep: number
  reactorStatus: number
  timeRemaining: number
  gameComplete: boolean
  message: string
  currentAssignments: CategoryAssignments
  wrongAttempts: number
  hintIndex: number
  supportMessages: LocalMessage[]
}

interface MessageBlock {
  id: string
  text: string
  type: "error" | "success" | "hint" | "system" | "action" | "input" | "default"
  isTyping?: boolean
}

const defaultMessage: LocalMessage = {
  id: 1,
  text: "WARNING: NEXUS-AI emergency system is operating in power conservation mode. Each query will consume 1 minute of reactor time. Use wisely.",
  sender: "system",
  timestamp: new Date(),
}

function ReactorConsole({ puzzleData = [] }: ReactorConsoleProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answer, setAnswer] = useState("")
  const [message, setMessage] = useState("")
  const [hintIndex, setHintIndex] = useState(0)
  const [reactorStatus, setReactorStatus] = useState(0)
  const [activeTab, setActiveTab] = useState("reactor")
  const [timeRemaining, setTimeRemaining] = useState(45 * 60) // 45 minutes in seconds
  const [gameComplete, setGameComplete] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [isGameInitialized, setIsGameInitialized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const currentPuzzle = puzzleData[currentStep]
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showEndGame, setShowEndGame] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetPassword, setResetPassword] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [currentAssignments, setCurrentAssignments] = useState<CategoryAssignments>({})
  const [supportMessages, setSupportMessages] = useState<LocalMessage[]>([defaultMessage])
  const [messageBlocks, setMessageBlocks] = useState<MessageBlock[]>([])
  const [isTypingComplete, setIsTypingComplete] = useState(true)

  // Load saved state
  useEffect(() => {
    if (!puzzleData?.length) return
    
    const savedState = localStorage.getItem('reactorGameState')
    if (savedState) {
      try {
        const state: GameState = JSON.parse(savedState)
        setCurrentStep(state.currentStep ?? 0)
        setReactorStatus(state.reactorStatus ?? 0)
        setTimeRemaining(state.timeRemaining ?? 45 * 60)
        setGameComplete(state.gameComplete ?? false)
        setMessage(state.message ?? "")
        setCurrentAssignments(state.currentAssignments ?? {})
        setWrongAttempts(state.wrongAttempts ?? 0)
        setHintIndex(state.hintIndex ?? 0)
        setIsGameInitialized(true)
        setShowWelcome(false)
        
        // Ensure proper message loading with timestamp conversion
        if (Array.isArray(state.supportMessages) && state.supportMessages.length > 0) {
          const processedMessages = state.supportMessages.map(msg => ({
            ...msg,
            id: msg.id || Date.now(),
            timestamp: new Date(msg.timestamp),
            type: msg.type || "system"
          }))
          setSupportMessages(processedMessages)
        } else {
          setSupportMessages([{
            ...defaultMessage,
            id: Date.now(),
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('Error loading saved state:', error)
        localStorage.removeItem('reactorGameState')
        setShowWelcome(true)
        setSupportMessages([{
          ...defaultMessage,
          id: Date.now(),
          timestamp: new Date()
        }])
      }
    } else {
      setShowWelcome(true)
      setSupportMessages([{
        ...defaultMessage,
        id: Date.now(),
        timestamp: new Date()
      }])
    }

    const muteSetting = localStorage.getItem('reactorMuted')
    if (muteSetting) {
      setIsMuted(muteSetting === 'true')
    }
  }, [puzzleData])

  // Initialize timer only when game is initialized
  useEffect(() => {
    if (!isGameInitialized || gameComplete) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timerRef.current)
          handlePlaySound('error')
          return 0
        }
        if (prev <= 300) {
          handlePlaySound('tick')
        } else {
          handlePlaySound('tick')
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isGameInitialized, gameComplete])

  // Handle time deduction
  const handleTimeDeduction = () => {
    handlePlaySound('error')
    setTimeRemaining((prev) => Math.max(0, prev - 60))
  }

  // Handle time up
  useEffect(() => {
    if (timeRemaining === 0) {
      setMessage(
        (prev) =>
          `${prev}\n\n//SYSTEM FAILURE: Reactor meltdown imminent. Evacuation protocol initiated.`
      )
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setShowEndGame(true)
    }
  }, [timeRemaining])

  // Save state on changes
  useEffect(() => {
    const gameState: GameState = {
      currentStep,
      reactorStatus,
      timeRemaining,
      gameComplete,
      message,
      currentAssignments,
      wrongAttempts,
      hintIndex,
      supportMessages
    }
    localStorage.setItem('reactorGameState', JSON.stringify(gameState))
  }, [currentStep, reactorStatus, timeRemaining, gameComplete, message, currentAssignments, wrongAttempts, hintIndex, supportMessages])

  // Save mute preference
  useEffect(() => {
    localStorage.setItem('reactorMuted', isMuted.toString())
  }, [isMuted])

  // Modify the playSound function to respect mute setting
  const handlePlaySound = (soundName: string) => {
    if (!isMuted) {
      playSound(soundName)
    }
  }

  // Add reset functionality
  const handleReset = () => {
    if (resetPassword === 'RESET123') {
      localStorage.removeItem('reactorGameState')
      setCurrentStep(0)
      setReactorStatus(0)
      setTimeRemaining(45 * 60)
      setGameComplete(false)
      setMessage("")
      setCurrentAssignments({})
      setWrongAttempts(0)
      setHintIndex(0)
      setSupportMessages([defaultMessage])
      setShowResetDialog(false)
      setResetPassword("")
      setIsGameInitialized(false)
      setShowWelcome(true)
    }
  }

  // Helper function to add a new message block
  const addMessageBlock = useCallback((text: string, type: MessageBlock["type"] = "default") => {
    setMessageBlocks(prev => [...prev, {
      id: Date.now().toString(),
      text,
      type
    }])
  }, [])

  // Handle game initialization
  const handleGameStart = useCallback(() => {
    setIsGameInitialized(true)
    setShowWelcome(false)
    if (currentPuzzle && messageBlocks.length === 0) {
      addMessageBlock(currentPuzzle.initialMessage, "system")
    }
  }, [currentPuzzle, messageBlocks.length, addMessageBlock])

  // Initialize puzzle message - only when puzzle changes
  useEffect(() => {
    if (!currentPuzzle || !isGameInitialized) return

    // Only set message when changing to a new puzzle
    if (currentStep > 0) {
      addMessageBlock(currentPuzzle.initialMessage, "system")
    }

    // Handle sorting puzzle initialization
    if (isSortingPuzzle(currentPuzzle)) {
      const sortingPuzzle = currentPuzzle
      const initialAssignments: Record<string, string[]> = {}
      sortingPuzzle.categories.forEach(category => {
        initialAssignments[category] = []
      })
      setCurrentAssignments(initialAssignments)
    }
  }, [currentStep, currentPuzzle, isGameInitialized, addMessageBlock])

  useEffect(() => {
    // Scroll terminal to bottom when message changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [message])

  const handleTabChange = (tab: string) => {
    handlePlaySound('button')
    setActiveTab(tab)
  }

  const handleSortingCommand = (command: string) => {
    const currentPuzzle = puzzleData[currentStep]
    if (!isSortingPuzzle(currentPuzzle)) {
      setMessage((prev) => `${prev}\n\n> ${command}\n\n//ERROR: Current puzzle is not a sorting puzzle`)
      return
    }
    
    const parts = command.toLowerCase().split(" ")

    switch (parts[0]) {
      case "list":
        handlePlaySound('button')
        if (parts[1] === "categories") {
          setMessage((prev) => `${prev}\n\n> ${command}\n\nAvailable categories:\n${currentPuzzle.categories.join("\n")}`)
        } else if (parts[1] === "items") {
          setMessage(
            (prev) =>
              `${prev}\n\n> ${command}\n\nAvailable items:\n${currentPuzzle.items
                .map((item) => `${item.id}: ${item.name}`)
                .join("\n")}`,
          )
        }
        break

      case "assign":
        if (parts.length !== 3) {
          handlePlaySound('error')
          setMessage((prev) => `${prev}\n\n> ${command}\n\n//ERROR: Invalid command format. Use: assign [item_id] [category]`)
          return
        }

        const itemId = parts[1].toUpperCase()
        const category = parts[2]
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        if (!currentPuzzle.items.find((item) => item.id === itemId)) {
          setMessage((prev) => `${prev}\n\n> ${command}\n\n//ERROR: Invalid item ID`)
          return
        }

        if (!currentPuzzle.categories.includes(category)) {
          setMessage((prev) => `${prev}\n\n> ${command}\n\n//ERROR: Invalid category`)
          return
        }

        handleAssignment(itemId, category)
        break

      case "show":
        handlePlaySound('button')
        if (parts[1] === "assignments") {
          const assignments = (currentPuzzle as SortingPuzzle).categories
            .map((category: string) => {
              const items = currentAssignments[category] || []
              return items.length > 0 ? items.map(id => `${id} → ${category}`).join("\n") : null
            })
            .filter(Boolean)
            .join("\n")
          
          setMessage(
            (prev) => `${prev}\n\n> ${command}\n\nCurrent assignments:\n${assignments || "No assignments made yet"}`,
          )
        }
        break

      case "check":
        handlePlaySound('button')
        if (parts[1] === "solution") {
          checkSolution()
        }
        break

      default:
        handlePlaySound('error')
        setMessage((prev) => `${prev}\n\n> ${command}\n\n//ERROR: Unknown command`)
    }
  }

  const handleAssignment = (itemId: string, category: string) => {
    const currentPuzzle = puzzleData[currentStep]
    if (!isSortingPuzzle(currentPuzzle)) return

    // Check if this assignment is correct according to the solution
    const isCorrectAssignment = currentPuzzle.solution[category]?.includes(itemId)

    if (isCorrectAssignment) {
        handlePlaySound('success')
        // Add item to the correct category
        const newAssignments = { ...currentAssignments }
        if (!newAssignments[category]) {
            newAssignments[category] = []
        }
        newAssignments[category].push(itemId)
        setCurrentAssignments(newAssignments)
        setMessage((prev) => `${prev}\n\n//SUCCESS: Correct! ${itemId} belongs in ${category}`)

        // Check if all items are correctly sorted
        const allItemsSorted = currentPuzzle.items.every(item => 
            Object.entries(currentPuzzle.solution).some(([cat, items]) => 
                items.includes(item.id) && currentAssignments[cat]?.includes(item.id)
            )
        )

        if (allItemsSorted) {
            const newStatus = Math.round(((currentStep + 1) / puzzleData.length) * 100)
            setReactorStatus(newStatus)
            setMessage((prev) => `${prev}\n\n//SUCCESS: ${currentPuzzle.successMessage}`)
            
            if (currentStep < puzzleData.length - 1) {
                setTimeout(() => {
                    setCurrentStep(currentStep + 1)
                    setCurrentAssignments({})
                    setWrongAttempts(0)
                    setHintIndex(0)
                }, 2000)
            } else {
                setGameComplete(true)
                setMessage((prev) => `${prev}\n\n//SYSTEM: All reactor systems restored. Meltdown averted.`)
                setShowEndGame(true)
            }
        }
    } else {
        handlePlaySound('error')
        // Incorrect assignment
        setWrongAttempts((prev) => prev + 1)
        setMessage((prev) => `${prev}\n\n//ERROR: Incorrect. ${itemId} does not belong in ${category}`)
        handleTimeDeduction()

        if (wrongAttempts === 1 && hintIndex < currentPuzzle.hints.length) {
            setMessage((prev) => `${prev}\n\n//HINT: ${currentPuzzle.hints[hintIndex]}`)
            setHintIndex((prev) => prev + 1)
        }
    }
  }

  const checkSolution = () => {
    const currentPuzzle = puzzleData[currentStep]
    if (!isSortingPuzzle(currentPuzzle)) return

    const isCorrect = Object.entries(currentPuzzle.solution).every(([category, itemIds]) => {
      const assignedItems = currentAssignments[category] || []
      return (
        itemIds.length === assignedItems.length && itemIds.every((id) => assignedItems.includes(id))
      )
    })

    if (isCorrect) {
      handlePlaySound('success')
      const newStatus = Math.round(((currentStep + 1) / puzzleData.length) * 100)
      setReactorStatus(newStatus)
      setMessage((prev) => `${prev}\n\n//SUCCESS: ${currentPuzzle.successMessage}`)
      
      if (currentStep < puzzleData.length - 1) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1)
          setCurrentAssignments({})
          setWrongAttempts(0)
          setHintIndex(0)
        }, 2000)
      } else {
        setGameComplete(true)
        setMessage((prev) => `${prev}\n\n//SYSTEM: All reactor systems restored. Meltdown averted.`)
        setShowEndGame(true)
      }
    } else {
      handlePlaySound('error')
      setWrongAttempts((prev) => prev + 1)
      setMessage((prev) => `${prev}\n\n//ERROR: Incorrect classification. Please try again.`)

      if (wrongAttempts === 1 && hintIndex < currentPuzzle.hints.length) {
        setMessage((prev) => `${prev}\n\n//HINT: ${currentPuzzle.hints[hintIndex]}`)
        setHintIndex((prev) => prev + 1)
      }
    }
  }

  const handleAnswerSubmit = useCallback(() => {
    if (!isTypingComplete) return // Don't process new input while typing

    const currentPuzzle = puzzleData[currentStep]
    if (!currentPuzzle) return

    if (currentPuzzle.type === "sorting") {
      handleSortingCommand(answer)
      setAnswer("")
      return
    }

    if (answer.toLowerCase() === currentPuzzle.passphrase.toLowerCase()) {
      handlePlaySound('success')
      const newStatus = Math.round(((currentStep + 1) / puzzleData.length) * 100)
      setReactorStatus(newStatus)

      addMessageBlock(`> ${answer}`, "input")
      addMessageBlock(`//SUCCESS: ${currentPuzzle.successMessage}`, "success")
      
      setAnswer("")
      setWrongAttempts(0)
      setHintIndex(0)

      if (currentStep < puzzleData.length - 1) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1)
          const nextPuzzle = puzzleData[currentStep + 1]
          if (nextPuzzle && isSortingPuzzle(nextPuzzle)) {
            const initialAssignments: Record<string, string[]> = {}
            nextPuzzle.categories.forEach(category => {
              initialAssignments[category] = []
            })
            setCurrentAssignments(initialAssignments)
          }
        }, 2000)
      } else {
        setGameComplete(true)
        addMessageBlock("//SUCCESS: All reactor systems restored. Meltdown averted.", "success")
        setShowEndGame(true)
      }
    } else {
      handlePlaySound('error')
      setWrongAttempts(prev => prev + 1)

      addMessageBlock(`> ${answer}`, "input")
      addMessageBlock("//ERROR: Invalid system command.", "error")

      if (wrongAttempts === 1 && hintIndex < currentPuzzle.hints.length) {
        addMessageBlock(`//HINT: ${currentPuzzle.hints[hintIndex]}`, "hint")
        setHintIndex(prev => prev + 1)
      }

      setAnswer("")
    }
  }, [currentStep, puzzleData, answer, isTypingComplete, wrongAttempts, hintIndex, addMessageBlock])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handlePlaySound('keystroke')
    if (e.key === "Enter") {
      handlePlaySound('button')
      handleAnswerSubmit()
    }
  }

  // Update the handleSupportMessage function to convert between types
  const handleSupportMessage = (messages: Message[]): void => {
    if (!messages?.length) return // Add null check to satisfy TS
    
    // Ensure all messages have proper timestamps and IDs
    const processedMessages = messages.map(msg => ({
      ...msg,
      id: msg.id || Date.now(),
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      type: msg.type || "system"
    }))
    setSupportMessages(processedMessages as LocalMessage[])
  }

  // Replace the message content rendering with the new block-based system
  const renderMessageBlock = useCallback((block: MessageBlock) => {
    const baseClass = "p-3 rounded-lg animate-fadeIn"
    let className = ""

    switch (block.type) {
      case "error":
        className = "message-error"
        break
      case "success":
        className = "message-success"
        break
      case "hint":
        className = "message-hint"
        break
      case "system":
        className = "message-system"
        break
      case "action":
        className = "message-action"
        break
      case "input":
        className = "text-red-300 font-bold"
        break
      default:
        className = "text-red-400"
    }

    // Only use TypewriterText for initial system messages
    if (block.type === "system" && block.text === currentPuzzle?.initialMessage) {
      return (
        <div key={block.id} className={`${baseClass} ${className}`}>
          <TypewriterText text={block.text} speed={50} />
        </div>
      )
    }

    // Add special styling for messages containing "ACTION REQUIRED"
    if (block.text.includes("//ACTION REQUIRED")) {
      return (
        <div key={block.id} className={`${baseClass} ${className}`}>
          {block.text.split("//ACTION REQUIRED").map((part, index) => {
            // First part (before ACTION REQUIRED) - return as is
            if (index === 0) return part;
            
            // Find the end of the line containing ACTION REQUIRED
            const actionLineEnd = part.indexOf('\n') >= 0 ? part.indexOf('\n') : part.length;
            const actionLine = part.substring(0, actionLineEnd);
            const restOfText = part.substring(actionLineEnd);
            
            return (
              <Fragment key={index}>
                <span className="action-highlight">{"//ACTION REQUIRED"}{actionLine}</span>
                {restOfText}
              </Fragment>
            );
          })}
        </div>
      );
    }

    return (
      <div key={block.id} className={`${baseClass} ${className}`}>
        {block.text}
      </div>
    )
  }, [currentPuzzle])

  // Add useEffect for auto-scrolling
  useEffect(() => {
    // Scroll to the newest message when messages are added
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messageBlocks]) // Re-run when messageBlocks change

  // Add scroll marker at bottom of messages
  const renderContent = () => {
    return (
      <div className="space-y-4">
        {messageBlocks.map(renderMessageBlock)}
        <div ref={messageEndRef} /> {/* Scroll to this element */}
      </div>
    )
  }

  return (
    <>
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)}
        onStart={handleGameStart}
      />
      
      <EndGameModal 
        isOpen={showEndGame}
        onClose={() => setShowEndGame(false)}
        isSuccess={gameComplete}
      />

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-black border border-red-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Reset Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Enter the reset password to confirm. This will erase all progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg w-full"
            placeholder="Enter reset password..."
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-900 text-white hover:bg-zinc-800">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="bg-red-900 text-white hover:bg-red-800"
            >
              Reset Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-screen bg-black text-white">
        {/* Header with controls */}
        <header className="flex justify-between items-center p-4 bg-gradient-to-r from-black to-zinc-950 border-b border-zinc-800/30">
          <div className="text-2xl font-bold tracking-wider text-red-500 animate-pulse">N.R.R.C</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              {isMuted ? (
                <span className="text-red-500">🔇</span>
              ) : (
                <span className="text-green-500">🔊</span>
              )}
            </button>
            <button
              onClick={() => setShowResetDialog(true)}
              className="px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 text-white transition-colors"
            >
              Reset
            </button>
            <div className="bg-black/80 px-4 py-1 rounded-lg border border-zinc-800/50 shadow-lg">
              {String(currentStep + 1).padStart(2, "0")} of {String(puzzleData.length).padStart(2, "0")}
            </div>
          </div>
        </header>

        {/* Tab Navigation with subtle highlight */}
        <div className="flex border-b border-zinc-800">
          <button
            className={`px-6 py-2 focus:outline-none transition-all duration-300 ${
              activeTab === "reactor"
                ? "bg-red-900/50 text-white border-b-2 border-red-500"
                : "bg-black text-gray-400 hover:text-white hover:bg-zinc-900"
            }`}
            onClick={() => handleTabChange("reactor")}
          >
            Reactor
          </button>
          <button
            className={`px-6 py-2 focus:outline-none transition-all duration-300 ${
              activeTab === "support"
                ? "bg-red-900/50 text-white border-b-2 border-red-500"
                : "bg-black text-gray-400 hover:text-white hover:bg-zinc-900"
            }`}
            onClick={() => handleTabChange("support")}
          >
            NEXUS-AI
            </button>
          </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="w-1/4 flex flex-col bg-gradient-to-b from-red-900/50 to-black border-r border-zinc-800/30">
            {activeTab === "reactor" ? (
              <div className="flex-1 p-4 flex flex-col justify-between">
                {/* Top Section */}
            <div className="text-center mb-4">
                  <div className="text-3xl font-bold">Reactor Status</div>
              <div className="flex items-center justify-center">
                    <div className="text-6xl font-bold mt-2">{reactorStatus}%</div>
              </div>
            </div>

                {/* Middle Section - Reactor Diagram */}
            <div className="flex-1 flex items-center justify-center">
                  <div className="reactor-diagram mx-auto flex flex-col justify-center items-center" style={{ height: "85%", maxHeight: "500px", marginTop: "60px" }}>
                    <svg viewBox="0 0 200 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      {/* Main reactor chamber */}
                      <rect 
                        x="95" 
                        y="50" 
                        width="10" 
                        height="200" 
                        fill="black" 
                        stroke="#f44336" 
                        strokeWidth="3" 
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
                      </rect>
                      
                      {/* Top reactor core */}
                      <circle 
                        cx="100" 
                        cy="80" 
                        r="30" 
                        fill={currentStep >= 3 ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)"} 
                        stroke={currentStep >= 3 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3" 
                        className="transition-colors duration-1000">
                        <animate 
                          attributeName="opacity" 
                          values="0.4;0.8;0.4" 
                          dur="3s" 
                          repeatCount="indefinite" 
                        />
                        <animate 
                          attributeName="r" 
                          values="30;33;30" 
                          dur="4s" 
                          repeatCount="indefinite" 
                        />
                      </circle>
                      
                      {/* Middle reactor core */}
                      <circle 
                        cx="100" 
                        cy="150" 
                        r="30" 
                        fill={currentStep >= 6 ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)"} 
                        stroke={currentStep >= 6 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate 
                          attributeName="opacity" 
                          values="0.4;0.8;0.4" 
                          dur="4s" 
                          repeatCount="indefinite" 
                        />
                        <animate 
                          attributeName="r" 
                          values="30;33;30" 
                          dur="5s" 
                          repeatCount="indefinite" 
                        />
                      </circle>
                      
                      {/* Bottom reactor core */}
                      <circle 
                        cx="100" 
                        cy="220" 
                        r="30" 
                        fill={currentStep >= 9 ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)"} 
                        stroke={currentStep >= 9 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate 
                          attributeName="opacity" 
                          values="0.4;0.8;0.4" 
                          dur="5s" 
                          repeatCount="indefinite" 
                        />
                        <animate 
                          attributeName="r" 
                          values="30;33;30" 
                          dur="6s" 
                          repeatCount="indefinite" 
                        />
                      </circle>
                      
                      {/* Cooling pipes */}
                      {/* Top level */}
                      <line 
                        x1="55" 
                        y1="80" 
                        x2="70" 
                        y2="80" 
                        stroke={currentStep >= 1 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                      </line>
                      <line 
                        x1="130" 
                        y1="80" 
                        x2="145" 
                        y2="80" 
                        stroke={currentStep >= 2 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
                      </line>
                      
                      {/* Middle level */}
                      <line 
                        x1="55" 
                        y1="150" 
                        x2="70" 
                        y2="150" 
                        stroke={currentStep >= 4 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
                      </line>
                      <line 
                        x1="130" 
                        y1="150" 
                        x2="145" 
                        y2="150" 
                        stroke={currentStep >= 5 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="3.5s" repeatCount="indefinite" />
                      </line>
                      
                      {/* Bottom level */}
                      <line 
                        x1="55" 
                        y1="220" 
                        x2="70" 
                        y2="220" 
                        stroke={currentStep >= 7 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
                      </line>
                      <line 
                        x1="130" 
                        y1="220" 
                        x2="145" 
                        y2="220" 
                        stroke={currentStep >= 8 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="4.5s" repeatCount="indefinite" />
                      </line>
                      
                      {/* Control nodes */}
                      {/* Left side */}
                      <circle 
                        cx="45" 
                        cy="80" 
                        r="10" 
                        fill={currentStep >= 1 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"} 
                        stroke={currentStep >= 1 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-width" values="3;4;3" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle 
                        cx="45" 
                        cy="150" 
                        r="10" 
                        fill={currentStep >= 4 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"} 
                        stroke={currentStep >= 4 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-width" values="3;4;3" dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle 
                        cx="45" 
                        cy="220" 
                        r="10" 
                        fill={currentStep >= 7 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"} 
                        stroke={currentStep >= 7 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-width" values="3;4;3" dur="5s" repeatCount="indefinite" />
                      </circle>
                      
                      {/* Right side */}
                      <circle 
                        cx="155" 
                        cy="80" 
                        r="10" 
                        fill={currentStep >= 2 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"} 
                        stroke={currentStep >= 2 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-width" values="3;4;3" dur="3.5s" repeatCount="indefinite" />
                      </circle>
                      <circle 
                        cx="155" 
                        cy="150" 
                        r="10" 
                        fill={currentStep >= 5 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"} 
                        stroke={currentStep >= 5 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-width" values="3;4;3" dur="4.5s" repeatCount="indefinite" />
                      </circle>
                      <circle 
                        cx="155" 
                        cy="220" 
                        r="10" 
                        fill={currentStep >= 8 ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"} 
                        stroke={currentStep >= 8 ? "#00ff00" : "#f44336"} 
                        strokeWidth="3"
                        className="transition-colors duration-1000">
                        <animate attributeName="stroke-width" values="3;4;3" dur="5.5s" repeatCount="indefinite" />
                      </circle>
                      
                      {/* Energy output indicator */}
                      {reactorStatus > 0 && (
                        <circle 
                          cx="100" 
                          cy="270" 
                          r="12" 
                          fill="#00ff00"
                          className="transition-colors duration-1000">
                          <animate 
                            attributeName="opacity" 
                            values="0.4;1;0.4" 
                            dur="1.5s" 
                            repeatCount="indefinite" 
                          />
                          <animate 
                            attributeName="r" 
                            values="12;14;12" 
                            dur="2s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      )}
                </svg>
              </div>
            </div>

                {/* Bottom Section */}
                <div className="mt-2">
                  <div className="text-base text-center mb-2 font-bold">Time to Meltdown</div>
              <CountdownTimer
                initialTime={timeRemaining}
                isRunning={!gameComplete}
                    currentTime={timeRemaining}
                    onTimeUp={() => {}}
                  />
                </div>
              </div>
            ) : (
              <SupportChat
                onTimeDeduction={handleTimeDeduction}
                currentPuzzle={currentStep}
                hints={currentPuzzle?.hints || []}
                hintsUsed={hintIndex}
                messages={supportMessages.map(msg => ({
                  ...msg,
                  sender: msg.sender === "system" ? "system" : "user" // Ensure sender is either "system" or "user"
                }) as Message)}
                onMessagesUpdate={handleSupportMessage}
              />
            )}
        </div>

        {/* Right panel - Terminal */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black">
            <div className="p-4 text-lg border-b border-zinc-800 bg-gradient-to-r from-black to-zinc-950 flex justify-between items-center">
              <div>
                <span className="text-green-400">Reactor Fix Terminal</span>
                <span className="ml-2 text-sm text-zinc-500">v1.0.0</span>
              </div>
              <div className="bg-black/80 px-4 py-1 rounded-lg border border-zinc-800/50 shadow-lg">
                {String(currentStep + 1).padStart(2, "0")} of {String(puzzleData.length).padStart(2, "0")}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <div
                ref={terminalRef}
                className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap font-mono terminal-content"
              >
                {renderContent()}

                {currentPuzzle?.type === "sorting" && (
                  <div className="mt-4 border-t border-red-900/30 pt-4 animate-fadeIn">
                    <VisualSortingPuzzle
                      puzzle={currentPuzzle}
                      currentAssignments={currentAssignments}
                      onAssign={handleAssignment}
                    />
                  </div>
                )}
              </div>
              <div className="p-4 bg-black border-t border-zinc-800">
                <div className="flex">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                    className="terminal-input flex-1 p-2 rounded-l focus:outline-none"
                disabled={gameComplete}
              />
                  <button
                    onClick={handleAnswerSubmit}
                    className="upload-button ml-0 px-6 py-2 rounded-r focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={gameComplete}
                  >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </>
  )
}

export { ReactorConsole }
export default ReactorConsole
