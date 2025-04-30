import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { playSound } from '@/utils/sounds'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
  onStart: () => void
}

export function WelcomeModal({ isOpen, onClose, onStart }: WelcomeModalProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    // Reset states when modal opens
    if (isOpen) {
      setVideoLoaded(false)
      setVideoError(false)
    }
  }, [isOpen])

  const handleStart = () => {
    playSound('button')
    onStart()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black border border-zinc-800">
        <div className="relative">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-red-500 animate-pulse">
              Nuclear Reactor Recycling Center
            </h2>
            <p className="text-zinc-400">
              Welcome to the NRRC emergency control system. A critical malfunction has been detected in the reactor's core systems.
              Your mission is to restore functionality and prevent a catastrophic meltdown.
            </p>
            <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
              {!videoError && (
                <video
                  src="/videos/intro.mp4"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    videoLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  controls
                  controlsList="nodownload noremoteplayback"
                  preload="metadata"
                  onLoadedData={() => setVideoLoaded(true)}
                  onError={() => setVideoError(true)}
                >
                  <source src="/videos/intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {!videoLoaded && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-green-500 rounded-full animate-spin border-t-transparent" />
                </div>
              )}
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur">
                  <div className="text-center">
                    <p className="text-zinc-500 mb-2">Video unavailable</p>
                    <p className="text-xs text-zinc-600">Please check your connection and try again</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-zinc-500">
              <p>Time remaining until meltdown: 45:00</p>
              <p>Current reactor status: CRITICAL</p>
              <p>Emergency protocols: ACTIVE</p>
            </div>
            <div className="pt-4 flex justify-end space-x-4">
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-green-900/50 text-green-400 rounded-lg hover:bg-green-800/50 transition-colors border border-green-900/50 font-mono"
              >
                INITIATE EMERGENCY PROTOCOL
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 