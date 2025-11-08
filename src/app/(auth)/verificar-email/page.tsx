// src/app/(auth)/verificar-email/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'

export default function VerificarEmailPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState<string>('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const obtenerEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      } else {
        router.push('/login')
      }
    }
    obtenerEmail()
  }, [supabase, router])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const reenviarEmail = async () => {
    setEnviando(true)
    setMensaje(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setMensaje('✅ Email reenviado exitosamente')
      setCooldown(60)
    } catch (err) {
      setMensaje('❌ Error al reenviar email')
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  const irALogin = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#E84A27] to-[#FF6B35] rounded-full flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.div>

            <h1 className="text-3xl font-bold text-center mb-2 text-white">
              Verifica tu Email
            </h1>
            <p className="text-center text-white/70 mb-6">
              Te enviamos un link de verificación a:
            </p>
            
            <div className="bg-white/10 rounded-lg p-3 mb-6 text-center">
              <p className="text-white font-semibold break-all">{email}</p>
            </div>

            <div className="space-y-3 mb-6 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <span className="text-[#FF6B35] mt-1">1.</span>
                <p>Revisa tu bandeja de entrada (y spam)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#FF6B35] mt-1">2.</span>
                <p>Haz clic en el enlace de verificación</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#FF6B35] mt-1">3.</span>
                <p>Serás redirigido automáticamente</p>
              </div>
            </div>

            {mensaje && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-4 p-3 rounded-lg text-sm ${
                  mensaje.includes('✅') 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {mensaje}
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={reenviarEmail}
                disabled={enviando || cooldown > 0}
                variant="primary"
                className="w-full"
                style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
              >
                {cooldown > 0 
                  ? `Reenviar en ${cooldown}s` 
                  : enviando 
                  ? 'Enviando...' 
                  : 'Reenviar Email'}
              </Button>

              <Button
                onClick={irALogin}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Ir a Inicio de Sesión
              </Button>
            </div>

            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/60 text-center">
                💡 El link de verificación expira en 24 horas
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}