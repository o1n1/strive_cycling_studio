// src/hooks/usePhoneValidation.ts
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ValidationResult {
  isValid: boolean | null
  isChecking: boolean
  message: string
}

export function usePhoneValidation(
  phone: string, 
  enabled: boolean = true,
  currentUserId?: string
) {
  const [result, setResult] = useState<ValidationResult>({
    isValid: null,
    isChecking: false,
    message: '',
  })

  const validatePhone = useCallback(
    async (phoneToValidate: string) => {
      const cleanPhone = phoneToValidate.replace(/\D/g, '')

      if (cleanPhone.length !== 10) {
        setResult({
          isValid: false,
          isChecking: false,
          message: cleanPhone.length < 10 
            ? `Faltan ${10 - cleanPhone.length} dígitos` 
            : 'Debe ser exactamente 10 dígitos',
        })
        return
      }

      setResult(prev => ({ ...prev, isChecking: true, message: 'Verificando...' }))

      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('telefono', cleanPhone)
          .maybeSingle()

        if (error) throw error

        if (data && (!currentUserId || data.id !== currentUserId)) {
          setResult({
            isValid: false,
            isChecking: false,
            message: 'Este teléfono ya está registrado',
          })
        } else {
          setResult({
            isValid: true,
            isChecking: false,
            message: 'Teléfono disponible',
          })
        }
      } catch (error) {
        console.error('Error validando teléfono:', error)
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Error al verificar teléfono',
        })
      }
    },
    [currentUserId]
  )

  useEffect(() => {
    if (!enabled || !phone || phone.length < 3) {
      setResult({ isValid: null, isChecking: false, message: '' })
      return
    }

    const timeoutId = setTimeout(() => {
      validatePhone(phone)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [phone, enabled, validatePhone])

  return result
}

export function formatPhoneMX(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
}