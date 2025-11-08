// src/components/auth/SuccessAnimation.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

interface SuccessAnimationProps {
  title?: string;
  message?: string;
  onComplete?: () => void;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export default function SuccessAnimation({
  title = '¡Registro exitoso!',
  message = 'Tu cuenta ha sido creada con éxito',
  onComplete,
  autoRedirect = true,
  redirectDelay = 3000,
}: SuccessAnimationProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Obtener dimensiones de ventana
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Detener confetti después de 5 segundos
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Auto-redirect
    if (autoRedirect && onComplete) {
      const redirectTimer = setTimeout(() => {
        onComplete();
      }, redirectDelay);

      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(redirectTimer);
      };
    }

    return () => clearTimeout(confettiTimer);
  }, [autoRedirect, onComplete, redirectDelay]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#AE3F21', '#9C7A5E', '#1A1814', '#FFFCF3', '#B39A72']}
        />
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        className="mb-6"
      >
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
          <motion.svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-[#1A1814] mb-4"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-[#B39A72] mb-8 max-w-md"
      >
        {message}
      </motion.p>

      {autoRedirect && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-[#B39A72]"
        >
          Redirigiendo en {Math.ceil(redirectDelay / 1000)} segundos...
        </motion.p>
      )}
    </div>
  );
}