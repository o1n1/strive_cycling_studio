'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface DashboardBackgroundProps {
  children: ReactNode
}

export function DashboardBackground({ children }: DashboardBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814]">
      {/* Orb sutil superior */}
      <motion.div
        className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #E84A27 0%, #FF6B35 100%)',
          filter: 'blur(100px)',
          mixBlendMode: 'screen'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Orb sutil inferior */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #9D4EDD 0%, #FF006E 100%)',
          filter: 'blur(100px)',
          mixBlendMode: 'screen'
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}