// src/app/(auth)/email-confirmado/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'

export default function EmailConfirmadoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [contador, setContador] = useState(5)
  const [verificando, setVerificando] = useState(true)
  const [emailVerificado, setEmailVerificado] = useState(false)

  useEffect(() => {
    const verificarEstado = async () => {
      // Supabase maneja el token automáticamente al hacer clic en el link
      // Solo verificamos que el usuario esté autenticado y verificado
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email_confirmed_at) {
        setEmailVerificado(true)
      }

      setVerificando(false)
    }

    verificarEstado()
  }, [supabase])

  useEffect(() => {
    if (!verificando && emailVerificado) {
      const timer = setInterval(() => {
        setContador((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/login')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [verificando, emailVerificado, router])

  if (verificando) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-white">Verificando tu email...</p>
          </div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
            >
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-white mb-3">
                ¡Email Verificado!
              </h1>
              <p className="text-white/70 mb-8">
                Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades de STRIVE.
              </p>

              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-white/60">
                  Redirigiendo al inicio de sesión en <span className="text-[#FF6B35] font-bold text-lg">{contador}</span>s
                </p>
              </div>

              <Button
                onClick={() => router.push('/login')}
                style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
                className="w-full"
              >
                Ir a Inicio de Sesión
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}