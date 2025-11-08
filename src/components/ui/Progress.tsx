// src/components/ui/Progress.tsx
'use client';

import { motion } from 'framer-motion';

interface ProgressProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success';
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const colorClasses = {
  primary: 'bg-[#AE3F21]',
  secondary: 'bg-[#9C7A5E]',
  success: 'bg-green-500',
};

export default function Progress({
  value,
  showLabel = false,
  size = 'md',
  color = 'primary',
  className = '',
}: ProgressProps) {
  // Asegurar que value esté entre 0-100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#1A1814]">
            Progreso
          </span>
          <span className="text-sm font-semibold text-[#AE3F21]">
            {Math.round(normalizedValue)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
        />
      </div>
    </div>
  );
}