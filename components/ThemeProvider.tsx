'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'kitty'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('kitty')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Permanently set kitty theme
        document.documentElement.setAttribute('data-theme', 'kitty')
    }, [])

    const setTheme = (newTheme: Theme) => {
        // No-op to prevent changes
    }

    const toggleTheme = () => {
        // No-op to prevent changes
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {/* We always render children so that useTheme() never fails.
          Components that depend on 'mounted' state can handle it internally. */}
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within ThemeProvider')
    return context
}
