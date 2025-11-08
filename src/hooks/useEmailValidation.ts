// src/hooks/useEmailValidation.ts
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ValidationResult {
  isValid: boolean | null
  isChecking: boolean
  message: string
}

/**
 * Hook para validar email en tiempo real
 * - Verifica formato
 * - Verifica que no exista en BD (debounced 500ms)
 */
export function useEmailValidation(
  email: string, 
  enabled: boolean = true,
  currentUserId?: string
) {
  const [result, setResult] = useState<ValidationResult>({
    isValid: null,
    isChecking: false,
    message: '',
  })

  const validateEmail = useCallback(
    async (emailToValidate: string) => {
      // Validar formato
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailToValidate)) {
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Formato de email inválido',
        })
        return
      }

      // Verificar en BD
      setResult(prev => ({ ...prev, isChecking: true, message: 'Verificando...' }))

      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', emailToValidate)
          .maybeSingle()

        if (error) throw error

        // Si existe Y no es el usuario actual (para editar perfil futuro)
        if (data && (!currentUserId || data.id !== currentUserId)) {
          setResult({
            isValid: false,
            isChecking: false,
            message: 'Este email ya está registrado',
          })
        } else {
          setResult({
            isValid: true,
            isChecking: false,
            message: 'Email disponible',
          })
        }
      } catch (error) {
        console.error('Error validando email:', error)
        setResult({
          isValid: false,
          isChecking: false,
          message: 'Error al verificar email',
        })
      }
    },
    [currentUserId]
  )

  // Debounce 500ms
  useEffect(() => {
    if (!enabled || !email || email.length < 3) {
      setResult({ isValid: null, isChecking: false, message: '' })
      return
    }

    const timeoutId = setTimeout(() => {
      validateEmail(email)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [email, enabled, validateEmail])

  return result
}