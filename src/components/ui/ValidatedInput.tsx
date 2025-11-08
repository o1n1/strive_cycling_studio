// src/components/ui/ValidatedInput.tsx
'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ValidationState {
  isValid: boolean | null
  isChecking: boolean
  message: string
}

interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  validation?: ValidationState
  error?: string
  showValidation?: boolean
  icon?: React.ReactNode
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, validation, error, showValidation = true, icon, ...props }, ref) => {
    const hasError = error || (validation && validation.isValid === false)
    const hasSuccess = validation && validation.isValid === true

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-white/90">
          {label} {props.required && <span className="text-[#FF6B35]">*</span>}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={`
              w-full px-4 py-2.5 rounded-lg
              ${icon ? 'pl-10' : ''}
              ${showValidation ? 'pr-10' : ''}
              border transition-all duration-200
              bg-white/10 text-white placeholder-white/40
              focus:outline-none focus:ring-2
              ${hasError 
                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                : hasSuccess
                  ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500'
                  : 'border-white/20 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />

          {showValidation && (
            <AnimatePresence mode="wait">
              {validation?.isChecking && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-4 h-4 text-[#FF6B35] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </motion.div>
              )}

              {!validation?.isChecking && hasSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {!validation?.isChecking && hasError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {error ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence mode="wait">
          {(error || (showValidation && validation?.message)) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`text-xs ${
                hasError 
                  ? 'text-red-400' 
                  : hasSuccess 
                    ? 'text-green-400' 
                    : 'text-white/60'
              }`}
            >
              {error || validation?.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'