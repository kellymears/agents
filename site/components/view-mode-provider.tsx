'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type ViewMode = 'source' | 'rendered'

interface ViewModeContextValue {
  mode: ViewMode
  toggle: () => void
}

const STORAGE_KEY = 'view-mode'

const ViewModeContext = createContext<ViewModeContextValue>({
  mode: 'rendered',
  toggle: () => {},
})

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('rendered')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'source' || stored === 'rendered') {
      setMode(stored)
    }
  }, [])

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'source' ? 'rendered' : 'source'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <ViewModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode(): ViewModeContextValue {
  return useContext(ViewModeContext)
}
