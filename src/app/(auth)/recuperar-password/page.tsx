// src/app/(auth)/recuperar-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const manejarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      // Construir URL sin doble slash
      const origin = window.location.origin
      const redirectUrl = `${origin}/auth/confirm`
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (resetError) throw resetError

      setEnviado(true)
    } catch (err) {
      console.error('Error al enviar email:', err)
      setError(err instanceof Error ? err.message : 'Error al enviar el correo. Intenta nuevamente.')
    } finally {
      setCargando(false)
    }
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
            {!enviado ? (
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
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
                      />
                    </svg>
                  </motion.div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Recuperar Contraseña
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                  </p>
                </motion.div>

                <form onSubmit={manejarRecuperacion} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
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
                    disabled={cargando}
                  >
                    {cargando ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      'Enviar enlace de recuperación'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link 
                      href="/login"
                      className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center space-x-1"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                        />
                      </svg>
                      <span>Volver al inicio de sesión</span>
                    </Link>
                  </div>
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  ¡Email enviado!
                </h2>
                <p className="text-gray-300 mb-8">
                  Hemos enviado un enlace de recuperación a <strong className="text-white">{email}</strong>.
                  <br />
                  <br />
                  Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.
                  <br />
                  <br />
                  <span className="text-sm text-gray-400">
                    El enlace expira en 1 hora.
                  </span>
                </p>

                <div className="space-y-3">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Volver al inicio de sesión
                    </Button>
                  </Link>
                  
                  <button
                    onClick={() => setEnviado(false)}
                    className="w-full text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    ¿No recibiste el email? Reenviar
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}