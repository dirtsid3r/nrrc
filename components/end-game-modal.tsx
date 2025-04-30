import { useEffect } from 'react'
import { Modal } from './modal'
import { playSound } from '@/utils/sounds'

interface EndGameModalProps {
  isOpen: boolean
  onClose: () => void
  isSuccess: boolean
}

export function EndGameModal({ isOpen, onClose, isSuccess }: EndGameModalProps) {
  useEffect(() => {
    if (isOpen) {
      playSound(isSuccess ? 'success' : 'error')
    }
  }, [isOpen, isSuccess])

  return (
    <Modal isOpen={isOpen} onClose={onClose} type={isSuccess ? 'success' : 'failure'}>
      <div className="space-y-8 text-center">
        {isSuccess ? (
          <>
            <h2 className="text-4xl font-bold text-green-400 animate-pulse">
              Mission Accomplished!
            </h2>
            <div className="space-y-4">
              <p className="text-xl text-green-200">
                You've successfully stabilized the reactor and saved countless lives.
              </p>
              <div className="py-6">
                <div className="w-32 h-32 mx-auto">
                  {/* Success Icon/Animation */}
                  <svg
                    className="w-full h-full text-green-500 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-green-300 font-semibold">
                The world is safer thanks to your quick thinking and expertise.
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-red-500 animate-pulse">
              Reactor Meltdown
            </h2>
            <div className="space-y-4">
              <p className="text-xl text-red-200">
                Critical failure in containment systems.
              </p>
              <div className="py-6">
                <div className="w-32 h-32 mx-auto">
                  {/* Failure Icon/Animation */}
                  <svg
                    className="w-full h-full text-red-500 animate-spin-slow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-red-300 font-semibold">
                Emergency evacuation protocols initiated. Goodbye.
              </p>
            </div>
          </>
        )}

        <div className="pt-4">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-semibold transform transition-all duration-200 hover:scale-105
              ${
                isSuccess
                  ? 'bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-900/50'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/50'
              }`}
          >
            {isSuccess ? 'Mission Report' : 'Emergency Exit'}
          </button>
        </div>
      </div>
    </Modal>
  )
} 