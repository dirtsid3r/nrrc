export interface Message {
  id: number
  text: string
  sender: "user" | "system"
  timestamp: Date
  type: "question" | "hint" | "error" | "system"
} 