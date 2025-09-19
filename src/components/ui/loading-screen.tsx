'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingScreenProps {
  isLoading: boolean
  onComplete?: () => void
}

export default function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      setFadeOut(false)
      
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            // Start fade out animation
            setTimeout(() => {
              setFadeOut(true)
              // Complete loading after fade animation
              setTimeout(() => {
                onComplete?.()
              }, 500)
            }, 200)
            return 100
          }
          return prev + Math.random() * 15 + 5
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isLoading, onComplete])

  if (!isLoading) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Container */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto relative animate-pulse">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-white rounded-full p-4 shadow-2xl">
              <Image
                src="/snitilogo.png"
                alt="S.N. ITI Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
        </div>

        {/* Institute Name */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            S.N. Private Industrial Training Institute
          </h1>
          <p className="text-white/90 text-sm md:text-base">
            Excellence in Technical Education Since 2009
          </p>
        </div>

        {/* Loading Progress */}
        <div className="w-64 mx-auto">
          <div className="mb-4">
            <div className="flex justify-between text-white/80 text-sm mb-2">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-white to-white/80 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="text-white/70 text-xs">
            {progress < 30 && "Initializing application..."}
            {progress >= 30 && progress < 60 && "Loading content..."}
            {progress >= 60 && progress < 90 && "Preparing interface..."}
            {progress >= 90 && "Almost ready..."}
          </div>
        </div>

        {/* Affiliation Text */}
        <div className="mt-8 text-white/60 text-xs text-center max-w-md mx-auto">
          <p>Approved by Directorate of Technical Education, Govt. of Rajasthan</p>
          <p className="mt-1">Affiliated to NCVT (DGE&T) Govt. of India</p>
        </div>
      </div>

      {/* Animated Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/10 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 border border-white/10 rounded-full animate-spin-slow-reverse"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 border border-white/10 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-10 w-8 h-8 border border-white/10 rounded-full animate-bounce delay-500"></div>
      </div>
    </div>
  )
}

// Add custom animations to global CSS
export const loadingScreenStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes spin-slow-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  
  .animate-spin-slow-reverse {
    animation: spin-slow-reverse 12s linear infinite;
  }
`
