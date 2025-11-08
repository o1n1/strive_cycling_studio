// src/app/(auth)/restablecer-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'

export default function RestablecerPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [verificandoSesion, setVerificandoSesion] = useState(true)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // Verificar que el usuario tenga sesión activa
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.error('No hay sesión activa:', error)
          router.push('/login?error=Sesión expirada. Solicita un nuevo enlace.')
          return
        }

        setVerificandoSesion(false)
      } catch (err) {
        console.error('Error verificando sesión:', err)
        router.push('/login?error=Error al verificar sesión')
      }
    }

    verificarSesion()
  }, [router, supabase.auth])

  const validarPassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Debe contener al menos una mayúscula'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Debe contener al menos una minúscula'
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Debe contener al menos un número'
    }
    return null
  }

  const calcularFortaleza = (pwd: string): number => {
    let fortaleza = 0
    if (pwd.length >= 8) fortaleza += 25
    if (pwd.length >= 12) fortaleza += 15
    if (/[A-Z]/.test(pwd)) fortaleza += 20
    if (/[a-z]/.test(pwd)) fortaleza += 20
    if (/[0-9]/.test(pwd)) fortaleza += 20
    return Math.min(fortaleza, 100)
  }

  const fortaleza = calcularFortaleza(password)
  
  const getColorFortaleza = (f: number) => {
    if (f < 40) return 'bg-red-500'
    if (f < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextoFortaleza = (f: number) => {
    if (f < 40) return 'Débil'
    if (f < 70) return 'Media'
    return 'Fuerte'
  }

  const manejarRestablecimiento = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    const errorPassword = validarPassword(password)
    if (errorPassword) {
      setError(errorPassword)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setCargando(true)

    try {
      // Actualizar contraseña del usuario
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setExito(true)

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        router.push('/login?message=Contraseña actualizada exitosamente')
      }, 3000)

    } catch (err) {
      console.error('Error al restablecer contraseña:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al actualizar contraseña. Intenta nuevamente.'
      )
    } finally {
      setCargando(false)
    }
  }

  if (verificandoSesion) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glassmorphism-premium rounded-3xl p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-4 border-[#E84A27] border-t-transparent rounded-full animate-spin" />
              <span className="text-white">Verificando sesión...</span>
            </div>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
            {!exito ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#E84A27] to-[#FF6B35] rounded-full flex items-center justify-center"
                  >
                    <svg 
                      className="w-10 h-10 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                  </motion.div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Nueva Contraseña
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base">
                    Ingresa tu nueva contraseña segura
                  </p>
                </motion.div>

                <form onSubmit={manejarRestablecimiento} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={mostrarPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={cargando}
                        className="pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {mostrarPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                          <span>Fortaleza:</span>
                          <span className="font-semibold">{getTextoFortaleza(fortaleza)}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fortaleza}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full ${getColorFortaleza(fortaleza)} transition-colors duration-300`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Confirmar contraseña
                    </label>
                    <Input
                      type={mostrarPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={cargando}
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                    >
                      <p className="text-red-300 text-sm text-center">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={cargando || !password || !confirmPassword}
                  >
                    {cargando ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Actualizando...</span>
                      </div>
                    ) : (
                      'Actualizar contraseña'
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <svg 
                    className="w-12 h-12 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  ¡Contraseña actualizada!
                </h2>
                <p className="text-gray-300 mb-6">
                  Tu contraseña ha sido actualizada exitosamente.
                  Redirigiendo al inicio de sesión...
                </p>

                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <div className="w-5 h-5 border-2 border-[#E84A27] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Redirigiendo...</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}