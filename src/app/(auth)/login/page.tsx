// src/app/(auth)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import { createClient } from '@/lib/supabase/client'
import { DASHBOARD_ROUTES, type RolUsuario } from '@/lib/types/enums'

const STORAGE_KEY = 'strive_remember_me'

interface RememberedCredentials {
  email: string
  password: string
}

export default function LoginPage() {
  const supabase = createClient()

  const [datos, setDatos] = useState({
    email: '',
    password: '',
  })

  const [recordarme, setRecordarme] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  // Cargar credenciales guardadas al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const credentials: RememberedCredentials = JSON.parse(saved)
        setDatos({
          email: credentials.email,
          password: credentials.password,
        })
        setRecordarme(true)
      }
    } catch (error) {
      console.error('Error cargando credenciales guardadas:', error)
    }
  }, [])

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      // Guardar o eliminar credenciales según checkbox
      if (recordarme) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email: datos.email,
            password: datos.password,
          })
        )
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }

      // 1. Autenticar usuario
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: datos.email,
        password: datos.password,
      })

      if (authError) throw authError

      // 2. Obtener perfil para redirección por rol
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', authData.user.id)
        .single<{ rol: RolUsuario }>()

      if (profileError) throw profileError

      // 3. Redirigir según rol (full page reload para limpiar estado)
      window.location.href = DASHBOARD_ROUTES[profile.rol]
    } catch (err) {
      console.error('Error en login:', err)
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      setCargando(false)
    }
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card glassmorphism */}
          <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E84A27]/20 via-transparent to-[#9D4EDD]/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />

            {/* Logo y título */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#E84A27] via-[#FF6B35] to-[#FF006E] bg-clip-text text-transparent">
                STRIVE
              </h1>
              <p className="text-white/70 text-sm">
                No limits, just power
              </p>
            </motion.div>

            {/* Mensaje de error con shake animation */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Formulario */}
            <form onSubmit={manejarLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">Email</label>
                <input
                  type="email"
                  value={datos.email}
                  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                  disabled={cargando}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all disabled:opacity-50"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={datos.password}
                    onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                    disabled={cargando}
                    placeholder="Tu contraseña"
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {mostrarPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox Recuérdame */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="recordarme"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#E84A27] focus:ring-[#FF6B35] focus:ring-offset-0"
                />
                <label htmlFor="recordarme" className="ml-2 text-sm text-white/70 cursor-pointer">
                  Recuérdame en este dispositivo
                </label>
              </div>

              {/* Botón Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={cargando}
                className="w-full"
              >
                {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              {/* Links */}
              <div className="space-y-3 pt-4">
                <div className="text-center">
                  <Link
                    href="/recuperar-password"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#1A1814]/80 px-2 text-white/40">O</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    href="/registro"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    ¿No tienes cuenta? <span className="text-[#E84A27]">Regístrate</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}