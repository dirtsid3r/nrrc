"use client"

import React, { useState, useEffect } from 'react'
import { playSound } from '@/utils/sounds'

interface TypewriterTextProps {
  text: string
  speed?: number
}

export function TypewriterText({ text, speed = 10 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('')
  
  useEffect(() => {
    let i = 0
    setDisplayText('')
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        if (!text[i].match(/\s/) && i % 3 === 0) {
          playSound('incoming')
        }
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayText}</span>
} 