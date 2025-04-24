"use client"

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Particle {
  id: number
  x: number
  y: number
  character: string
  opacity: number
  scale: number
  speed: number
  rotation: number
}

export function MouseTail() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Characters to use for the tail effect - moved outside of component to prevent recreation
  const characters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '×', '÷', '=', '%', '.', '(', ')']

  // Memoize the particle creation function to avoid recreating it on every render
  const createParticle = useCallback((x: number, y: number) => {
    if (Math.random() > 0.6) {
      const character = characters[Math.floor(Math.random() * characters.length)]
      return {
        id: Date.now(),
        x,
        y,
        character,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.6,
        speed: 1 + Math.random() * 2,
        rotation: Math.random() * 360
      }
    }
    return null
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
    
    const newParticle = createParticle(e.clientX, e.clientY)
    if (newParticle) {
      setParticles(prev => [...prev, newParticle])
    }
  }, [createParticle]);

  // Update particles animation
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev
        .map(particle => ({
          ...particle,
          y: particle.y + particle.speed,
          opacity: particle.opacity - 0.01,
          rotation: particle.rotation + 1
        }))
        .filter(particle => particle.opacity > 0)
    )
  }, []);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Initialize mouse position to center of screen to avoid particles at (0,0)
    setMousePosition({ 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 2 
    })

    // Set up event listener
    window.addEventListener('mousemove', handleMouseMove)
    
    // Set up animation frame
    let animationFrameId: number
    
    const animate = () => {
      updateParticles()
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [handleMouseMove, updateParticles]) // Proper dependency array

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={cn(
            "absolute font-mono font-bold transition-opacity",
            "text-primary dark:text-primary"
          )}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            opacity: particle.opacity,
            transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
            fontSize: `${Math.max(14, 20 * particle.scale)}px`,
            textShadow: '0 0 5px rgba(var(--primary-rgb), 0.5)'
          }}
        >
          {particle.character}
        </div>
      ))}
    </div>
  )
}