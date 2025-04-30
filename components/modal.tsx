import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  type?: 'welcome' | 'success' | 'failure'
}

export function Modal({ isOpen, onClose, children, type = 'welcome' }: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  const getModalStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-b from-green-900/90 to-black border-green-500 shadow-[0_0_50px_rgba(0,255,0,0.3)]'
      case 'failure':
        return 'bg-gradient-to-b from-red-900/90 to-black border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.3)]'
      default:
        return 'bg-gradient-to-b from-zinc-900/90 to-black border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 backdrop-blur-sm transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0",
          type === 'success' ? 'bg-green-950/50' : 
          type === 'failure' ? 'bg-red-950/50' : 
          'bg-black/50'
        )}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-11/12 max-w-3xl rounded-lg border p-6 shadow-2xl",
          "transform transition-all duration-300",
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0",
          getModalStyles()
        )}
      >
        {children}
      </div>
    </div>
  )
} 