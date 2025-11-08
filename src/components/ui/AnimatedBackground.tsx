// src/components/ui/AnimatedBackground.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

/**
 * Fondo animado según Design System Strive
 * - Fondo negro #0A0A0A
 * - 2 orbs gigantes pulsantes (terracota/naranja y púrpura/rosa)
 * - Partículas flotantes
 */
export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [particulas, setParticulas] = useState<Array<{
    id: number;
    size: number;
    left: string;
    top: string;
    delay: number;
    duration: number;
  }>>([]);

  // Generar partículas solo en cliente para evitar error de hidratación
  useEffect(() => {
    setParticulas(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 20 + 15,
      }))
    );
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0A0A]">
      {/* Gradiente radial sutil */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1A1814 0%, #0A0A0A 100%)'
        }}
      />

      {/* ORB 1: Superior derecha - Terracota → Naranja */}
      <motion.div
        className="absolute -top-48 -right-48 w-96 h-96 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, #E84A27 0%, #FF6B35 100%)',
          filter: 'blur(150px)',
          mixBlendMode: 'screen',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ORB 2: Inferior izquierda - Púrpura → Rosa */}
      <motion.div
        className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, #9D4EDD 0%, #FF006E 100%)',
          filter: 'blur(150px)',
          mixBlendMode: 'screen',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particulas.map((particula) => (
          <motion.div
            key={particula.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: particula.size,
              height: particula.size,
              left: particula.left,
              top: particula.top,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [-20, 20],
              x: [-10, 10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particula.duration,
              repeat: Infinity,
              delay: particula.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}