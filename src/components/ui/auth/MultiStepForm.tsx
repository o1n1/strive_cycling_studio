// src/components/auth/MultiStepForm.tsx
'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiStepFormProps {
  children: ReactNode;
  currentStep: number;
  className?: string;
}

export default function MultiStepForm({
  children,
  currentStep,
  className = '',
}: MultiStepFormProps) {
  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}