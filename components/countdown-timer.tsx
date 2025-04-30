"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  initialTime: number // in seconds
  isRunning: boolean
  onTimeUp: () => void
  currentTime: number
}

export default function CountdownTimer({ initialTime, isRunning, onTimeUp, currentTime }: CountdownTimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (currentTime <= 300) return "text-red-500" // Last 5 minutes
    if (currentTime <= 600) return "text-yellow-500" // Last 10 minutes
    return "text-white"
  }

  return (
    <div className={`countdown font-mono text-4xl font-bold text-center ${getTimerColor()}`}>
      {formatTime(currentTime)}
    </div>
  )
}
