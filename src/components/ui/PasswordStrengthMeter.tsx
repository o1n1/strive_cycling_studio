// src/components/ui/PasswordStrengthMeter.tsx
'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  showLabel?: boolean;
  className?: string;
}

interface StrengthConfig {
  strength: number;
  label: string;
  color: string;
  bgColor: string;
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  return strength;
}

function getStrengthConfig(strength: number): StrengthConfig {
  const configs: Record<number, StrengthConfig> = {
    0: { strength: 0, label: 'Sin contraseña', color: 'text-gray-400', bgColor: 'bg-gray-200' },
    1: { strength: 1, label: 'Muy débil', color: 'text-red-600', bgColor: 'bg-red-500' },
    2: { strength: 2, label: 'Débil', color: 'text-orange-600', bgColor: 'bg-orange-500' },
    3: { strength: 3, label: 'Media', color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
    4: { strength: 4, label: 'Fuerte', color: 'text-green-600', bgColor: 'bg-green-500' },
    5: { strength: 5, label: 'Muy fuerte', color: 'text-green-700', bgColor: 'bg-green-600' },
  };
  
  return configs[strength] || configs[0];
}

export default function PasswordStrengthMeter({
  password,
  showLabel = true,
  className = '',
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const config = getStrengthConfig(strength);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            className={`h-2 flex-1 rounded-full ${
              level <= strength ? config.bgColor : 'bg-gray-200'
            }`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{
              duration: 0.3,
              delay: level * 0.05,
            }}
          />
        ))}
      </div>

      {showLabel && password.length > 0 && (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </p>
          
          <div className="space-y-1 text-xs text-gray-600">
            <RequirementItem 
              met={password.length >= 8} 
              text="Mínimo 8 caracteres" 
            />
            <RequirementItem 
              met={/[a-z]/.test(password) && /[A-Z]/.test(password)} 
              text="Mayúsculas y minúsculas" 
            />
            <RequirementItem 
              met={/[0-9]/.test(password)} 
              text="Al menos un número" 
            />
            <RequirementItem 
              met={/[^a-zA-Z0-9]/.test(password)} 
              text="Carácter especial (opcional)" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
        met ? 'bg-green-500' : 'bg-gray-300'
      }`}>
        {met && (
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className={met ? 'text-green-700' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}