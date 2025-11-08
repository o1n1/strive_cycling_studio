// src/components/auth/StepIndicator.tsx
'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  variant?: 'dots' | 'bar' | 'numbered';
  className?: string;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
  variant = 'dots',
  className = '',
}: StepIndicatorProps) {
  if (variant === 'bar') {
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#1A1814]">
            Paso {currentStep} de {totalSteps}
          </span>
          <span className="text-xs text-[#B39A72]">
            {Math.round(percentage)}% completado
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#AE3F21] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'numbered') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${step < currentStep 
                    ? 'bg-[#AE3F21] text-white' 
                    : step === currentStep
                    ? 'bg-[#AE3F21] text-white ring-4 ring-[#AE3F21]/20'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}
                initial={{ scale: 0.8 }}
                animate={{ scale: step === currentStep ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {step < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step
                )}
              </motion.div>
              {labels && labels[index] && (
                <span className={`
                  mt-2 text-xs font-medium text-center
                  ${step === currentStep ? 'text-[#AE3F21]' : 'text-gray-500'}
                `}>
                  {labels[index]}
                </span>
              )}
            </div>
            
            {index < totalSteps - 1 && (
              <div className={`
                w-16 h-0.5 mx-2
                ${step < currentStep ? 'bg-[#AE3F21]' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Variant: dots (default)
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <motion.div
          key={step}
          className={`
            rounded-full transition-all duration-300
            ${step === currentStep 
              ? 'w-8 h-3 bg-[#AE3F21]' 
              : step < currentStep
              ? 'w-3 h-3 bg-[#AE3F21]'
              : 'w-3 h-3 bg-gray-300'
            }
          `}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: step * 0.05 }}
        />
      ))}
    </div>
  );
}