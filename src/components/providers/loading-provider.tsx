'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import LoadingScreen from '@/components/ui/loading-screen'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  showPageLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export default function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const pathname = usePathname()

  // Initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Minimum loading time for branding

    return () => clearTimeout(timer)
  }, [])

  // Page navigation loading
  useEffect(() => {
    setIsPageLoading(true)
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 300) // Quick loading for navigation

    return () => clearTimeout(timer)
  }, [pathname])

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const showPageLoading = () => {
    setIsPageLoading(true)
    setTimeout(() => setIsPageLoading(false), 500)
  }

  const contextValue: LoadingContextType = {
    isLoading: isLoading || isPageLoading,
    setLoading,
    showPageLoading
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      <LoadingScreen 
        isLoading={isLoading || isPageLoading} 
        onComplete={() => {
          setIsLoading(false)
          setIsPageLoading(false)
        }}
      />
      {children}
    </LoadingContext.Provider>
  )
}
