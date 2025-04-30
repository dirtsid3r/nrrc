import type { Message } from "@/types/message-types"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { playSound } from "@/utils/sounds"

interface SupportChatProps {
  onTimeDeduction: () => void
  currentPuzzle: number
  hints: string[]
  hintsUsed: number
  messages: Message[]
  onMessagesUpdate: (messages: Message[]) => void
}

// Humorous support messages for different situations
const SUPPORT_RESPONSES = {
  greetings: [
    "Hello! I'm here to help, though I must say my humor circuits are a bit rusty... get it? Because we're in a reactor? *beep boop*",
    "Welcome to emergency support! Don't worry, I've only had minor meltdowns... in my programming that is!",
    "Greetings! I'm your friendly neighborhood AI assistant. No pressure, but the fate of the reactor kind of depends on us...",
  ],
  encouragement: [
    "You're doing great! Much better than the last person... who, uh, never mind.",
    "Keep going! You're handling this nuclear crisis better than I handle my binary arithmetic!",
    "That's the spirit! You're really *radiating* confidence now! (Sorry, couldn't resist the pun)",
  ],
  confusion: [
    "Seems like you might be stuck. Would you like a hint? Promise it won't cost you an arm and a leg... just one minute of reactor time!",
    "Need some guidance? I'm like a GPS for nuclear puzzles, except I actually know where I'm going!",
    "Looking a bit lost there? Let me illuminate the path... preferably not with radioactive material.",
  ],
  success: [
    "Excellent work! You're really *splitting atoms* here! (Metaphorically speaking, of course)",
    "Outstanding! If I had hands, I'd give you a high-five... from behind proper radiation shielding, naturally",
    "Brilliant! You're making this look easier than explaining quantum mechanics to a cat!",
  ]
}

export function SupportChat({
  onTimeDeduction,
  currentPuzzle,
  hints,
  hintsUsed,
  messages,
  onMessagesUpdate,
}: SupportChatProps) {
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [consecutiveQuestions, setConsecutiveQuestions] = useState(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getRandomResponse = (type: keyof typeof SUPPORT_RESPONSES) => {
    const responses = SUPPORT_RESPONSES[type]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const shouldOfferHint = (input: string) => {
    const confusionIndicators = [
      "help",
      "stuck",
      "hint",
      "how",
      "what",
      "don't understand",
      "confused",
      "not sure",
    ]
    return confusionIndicators.some(indicator => input.toLowerCase().includes(indicator))
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    playSound('button')

    // Check if a similar message was sent in the last few messages to prevent duplicates
    const lastMessages = messages.slice(-3)
    const isDuplicate = lastMessages.some(msg => 
      msg.text.toLowerCase() === input.trim().toLowerCase() &&
      msg.sender === "user"
    )

    if (isDuplicate) {
      setInput("")
      return
    }

    const userMessage: Message = {
      id: Date.now(), // Use timestamp for unique IDs
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
      type: "question"
    }

    const updatedMessages = [...messages, userMessage]
    onMessagesUpdate(updatedMessages)
    setInput("")
    setIsTyping(true)

    // Simulate system thinking and typing
    await new Promise(resolve => setTimeout(resolve, 1000))

    let responseMessage: Message

    // Check if this is the first message
    if (messages.length <= 1) {
      responseMessage = {
        id: Date.now() + 1, // Ensure unique ID
        text: getRandomResponse('greetings'),
        sender: "system",
        timestamp: new Date(),
        type: "system"
      }
    }
    // If user seems confused or explicitly asks for help
    else if (shouldOfferHint(input) && hintsUsed < hints.length) {
      responseMessage = {
        id: Date.now() + 1,
        text: `${getRandomResponse('confusion')}\n\nHINT: ${hints[hintsUsed]}`,
        sender: "system",
        timestamp: new Date(),
        type: "hint"
      }
    }
    // If user has asked multiple questions in succession
    else if (consecutiveQuestions > 2 && hintsUsed < hints.length) {
      responseMessage = {
        id: Date.now() + 1,
        text: `I notice you're asking a lot of questions. Here's something that might help:\n\nHINT: ${hints[hintsUsed]}`,
        sender: "system",
        timestamp: new Date(),
        type: "hint"
      }
      setConsecutiveQuestions(0) // Reset counter after providing hint
    }
    // Regular interaction with encouragement
    else {
      responseMessage = {
        id: Date.now() + 1,
        text: getRandomResponse('encouragement'),
        sender: "system",
        timestamp: new Date(),
        type: "system"
      }
      setConsecutiveQuestions(prev => prev + 1)
    }

    setIsTyping(false)
    const finalMessages = [...updatedMessages, responseMessage]
    onMessagesUpdate(finalMessages)
    onTimeDeduction()
    playSound(responseMessage.type === 'hint' ? 'hint' : 'button')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    playSound('keystroke')
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Group messages by sender and date
  const groupMessages = (msgs: Message[]) => {
    const groups: Message[][] = []
    let currentGroup: Message[] = []

    msgs.forEach((msg, index) => {
      if (index === 0) {
        currentGroup.push(msg)
      } else {
        const prevMsg = msgs[index - 1]
        const timeDiff = msg.timestamp.getTime() - prevMsg.timestamp.getTime()
        
        // Group messages if they're from the same sender and within 5 minutes
        if (msg.sender === prevMsg.sender && timeDiff < 5 * 60 * 1000) {
          currentGroup.push(msg)
        } else {
          groups.push([...currentGroup])
          currentGroup = [msg]
        }
      }
    })

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    return groups
  }

  const messageGroups = groupMessages(messages)

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-black to-zinc-950">
        <div className="text-lg">
          <span className="text-green-400">Support Terminal</span>
          <span className="ml-2 text-sm text-zinc-500">Emergency Mode</span>
        </div>
        <div className="text-xs text-red-500 mt-1">
          Warning: Each message costs 1 minute of reactor time
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={cn(
              "flex flex-col",
              group[0].sender === "user" ? "items-end" : "items-start"
            )}
          >
            {group.map((message, messageIndex) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3 mb-1 animate-fadeIn",
                  message.sender === "user"
                    ? "bg-zinc-800 text-green-400 border border-zinc-700"
                    : message.type === "error"
                    ? "bg-red-900/30 text-red-400 border border-red-900/50"
                    : message.type === "hint"
                    ? "bg-green-900/30 text-green-400 border border-green-900/50"
                    : "bg-zinc-900/50 text-white border border-zinc-800/50",
                  messageIndex === 0 && "rounded-t-lg",
                  messageIndex === group.length - 1 && "rounded-b-lg"
                )}
              >
                <div className="text-sm font-mono whitespace-pre-line">{message.text}</div>
                {messageIndex === group.length - 1 && (
                  <div className="text-xs text-zinc-500 mt-1 font-mono">
                    {format(message.timestamp, "HH:mm:ss")}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-green-500">
            <div className="w-2 h-2 bg-current rounded-full animate-ping" />
            <div className="w-2 h-2 bg-current rounded-full animate-ping [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-current rounded-full animate-ping [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-gradient-to-r from-black to-zinc-950">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 opacity-50">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-black text-green-400 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 border border-zinc-800 font-mono placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className={cn(
              "px-4 py-2 rounded-lg transition-all duration-200 font-mono text-sm",
              input.trim() && !isTyping
                ? "bg-green-900/50 hover:bg-green-800/50 text-green-400 border border-green-900/50"
                : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-zinc-800/50"
            )}
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  )
} 