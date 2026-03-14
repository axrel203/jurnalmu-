'use client'

import React, { useState, useRef, useEffect } from 'react'

interface PatternLockProps {
    onComplete: (pattern: string) => void
    size?: number
    className?: string
    error?: boolean
    resetTrigger?: number
}

const GRID_SIZE = 3
const TOTAL_DOTS = GRID_SIZE * GRID_SIZE

export default function PatternLock({
    onComplete,
    size = 280,
    className = '',
    error = false,
    resetTrigger = 0,
}: PatternLockProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [pattern, setPattern] = useState<number[]>([])
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null)
    const [dotPositions, setDotPositions] = useState<{ x: number, y: number, id: number }[]>([])

    // Calculate dot positions based on container size
    useEffect(() => {
        if (!containerRef.current) return

        const updatePositions = () => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return

            const cellWidth = rect.width / GRID_SIZE
            const cellHeight = rect.height / GRID_SIZE
            const positions = []

            for (let i = 0; i < TOTAL_DOTS; i++) {
                const row = Math.floor(i / GRID_SIZE)
                const col = i % GRID_SIZE
                positions.push({
                    id: i,
                    x: col * cellWidth + cellWidth / 2,
                    y: row * cellHeight + cellHeight / 2,
                })
            }
            setDotPositions(positions)
        }

        updatePositions()
        window.addEventListener('resize', updatePositions)
        return () => window.removeEventListener('resize', updatePositions)
    }, [])

    useEffect(() => {
        if (resetTrigger > 0) {
            setPattern([])
        }
    }, [resetTrigger])

    // Get dot ID from coordinates
    const getDotFromEvent = (clientX: number, clientY: number) => {
        if (!containerRef.current || dotPositions.length === 0) return null
        
        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const y = clientY - rect.top

        // Find closest dot
        for (const dot of dotPositions) {
            const distance = Math.sqrt(Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2))
            // Hit radius
            if (distance < size / 8) {
                return dot.id
            }
        }
        return null
    }

    const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
        // e.preventDefault()
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY

        const dotId = getDotFromEvent(clientX, clientY)
        if (dotId !== null) {
            setPattern([dotId])
            setIsDrawing(true)
            
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect) {
                setCurrentPos({ x: clientX - rect.left, y: clientY - rect.top })
            }
        }
    }

    const handlePointerMove = (e: React.PointerEvent | React.TouchEvent) => {
        if (!isDrawing) return
        // e.preventDefault() // prevent scrolling while drawing on mobile if possible

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY
        
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
            setCurrentPos({ x: clientX - rect.left, y: clientY - rect.top })
        }

        const dotId = getDotFromEvent(clientX, clientY)
        if (dotId !== null && !pattern.includes(dotId)) {
            // Check for skipped dots (e.g. from 0 directly to 2, must include 1)
            const lastDot = pattern[pattern.length - 1]
            const newPattern = [...pattern]
            
            // Simple interpolation for straight lines across center
            if (lastDot !== undefined) {
                const diff = Math.abs(dotId - lastDot)
                const sum = dotId + lastDot
                
                // Horizontal skip (0-2, 3-5, 6-8)
                if (diff === 2 && Math.floor(dotId / 3) === Math.floor(lastDot / 3)) {
                    const middle = sum / 2
                    if (!newPattern.includes(middle)) newPattern.push(middle)
                }
                // Vertical skip (0-6, 1-7, 2-8)
                else if (diff === 6) {
                    const middle = sum / 2
                    if (!newPattern.includes(middle)) newPattern.push(middle)
                }
                // Diagonal skip (0-8, 2-6)
                else if ((dotId === 0 && lastDot === 8) || (dotId === 8 && lastDot === 0)) {
                    if (!newPattern.includes(4)) newPattern.push(4)
                }
                else if ((dotId === 2 && lastDot === 6) || (dotId === 6 && lastDot === 2)) {
                    if (!newPattern.includes(4)) newPattern.push(4)
                }
            }
            
            newPattern.push(dotId)
            setPattern(newPattern)
        }
    }

    const handlePointerUp = () => {
        if (isDrawing) {
            setIsDrawing(false)
            setCurrentPos(null)
            if (pattern.length > 0) {
                onComplete(pattern.join(''))
            }
        }
    }

    // Render lines connecting the dots
    const renderLines = () => {
        if (pattern.length === 0 || dotPositions.length === 0) return null

        const lines = []
        for (let i = 0; i < pattern.length - 1; i++) {
            const startNode = dotPositions[pattern[i]]
            const endNode = dotPositions[pattern[i + 1]]
            lines.push(
                <line
                    key={`line-${i}`}
                    x1={startNode.x}
                    y1={startNode.y}
                    x2={endNode.x}
                    y2={endNode.y}
                    stroke={error ? 'var(--color-red-500, #ef4444)' : 'var(--color-primary-500, #8b5cf6)'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-60"
                />
            )
        }

        // Render line from last dot to current pointer position
        if (isDrawing && currentPos && pattern.length > 0) {
            const lastNode = dotPositions[pattern[pattern.length - 1]]
            lines.push(
                <line
                    key="drawing-line"
                    x1={lastNode.x}
                    y1={lastNode.y}
                    x2={currentPos.x}
                    y2={currentPos.y}
                    stroke={error ? 'var(--color-red-500, #ef4444)' : 'var(--color-primary-500, #8b5cf6)'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-40"
                />
            )
        }

        return (
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                {lines}
            </svg>
        )
    }

    const colorClass = error 
        ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
        : 'bg-primary-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]'

    return (
        <div 
            ref={containerRef}
            className={`relative mx-auto touch-none select-none ${className}`}
            style={{ width: size, height: size }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerUp}
        >
            {renderLines()}
            
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: TOTAL_DOTS }).map((_, i) => {
                    const isSelected = pattern.includes(i)
                    return (
                        <div key={i} className="flex items-center justify-center">
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-transform duration-200">
                                {/* Dot background/hit area */}
                                <div className={`absolute w-12 h-12 rounded-full opacity-0 hover:opacity-10 transition-opacity ${isSelected ? colorClass : 'bg-[var(--text-primary)]'}`} />
                                
                                {/* Visible dot */}
                                <div 
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                        isSelected 
                                            ? `${colorClass} scale-150` 
                                            : 'bg-[var(--text-secondary)] opacity-50'
                                    }`} 
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
