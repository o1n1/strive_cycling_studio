// src/app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database.types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const verificarSesion = async () => {
      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push('/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profileData) {
        router.push('/login')
        return
      }

      setProfile(profileData)
      setLoading(false)
    }

    verificarSesion()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E84A27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  // Menús de navegación por rol
  const menusByRole: Record<string, { name: string; href: string; icon: string }[]> = {
    admin: [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Espacios', href: '/admin/espacios', icon: '🏢' },
      { name: 'Personal', href: '/admin/personal', icon: '👥' },
      { name: 'Clases', href: '/admin/clases', icon: '📅' },
      { name: 'Calendario', href: '/admin/calendario', icon: '🗓️' }, // ⭐ NUEVO
      { name: 'Clientes', href: '/admin/clientes', icon: '👤' },
      { name: 'Finanzas', href: '/admin/finanzas', icon: '💰' },
      { name: 'Reportes', href: '/admin/reportes', icon: '📈' },
    ],
    coach: [
      { name: 'Dashboard', href: '/coach', icon: '📊' },
      { name: 'Mis Clases', href: '/coach/clases', icon: '📅' },
      { name: 'Calendario', href: '/coach/calendario', icon: '🗓️' },
      { name: 'Calificaciones', href: '/coach/calificaciones', icon: '⭐' },
      { name: 'Perfil', href: '/coach/perfil', icon: '👤' },
    ],
    staff: [
      { name: 'Dashboard', href: '/staff', icon: '📊' },
      { name: 'Check-in', href: '/staff/checkin', icon: '✅' },
      { name: 'Ventas', href: '/staff/ventas', icon: '🛒' },
      { name: 'Inventario', href: '/staff/inventario', icon: '📦' },
    ],
    cliente: [
      { name: 'Dashboard', href: '/cliente', icon: '📊' },
      { name: 'Reservar Clase', href: '/cliente/reservar', icon: '📅' },
      { name: 'Mis Reservas', href: '/cliente/reservas', icon: '🎫' },
      { name: 'Paquetes', href: '/cliente/paquetes', icon: '💳' },
      { name: 'Historial', href: '/cliente/historial', icon: '📜' },
      { name: 'Perfil', href: '/cliente/perfil', icon: '👤' },
    ],
  }

  const menuItems = menusByRole[profile.rol] || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814]">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y menú mobile */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E84A27] to-[#FF6B35] flex items-center justify-center font-bold text-white text-xl">
                  S
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-white font-bold text-lg">Strive Studio</h1>
                  <p className="text-white/40 text-xs capitalize">{profile.rol}</p>
                </div>
              </div>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.slice(0, 5).map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Usuario y logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-white font-medium text-sm">{profile.nombre_completo}</p>
                <p className="text-white/40 text-xs">{profile.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-black/20 backdrop-blur-xl border-r border-white/10">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white shadow-lg shadow-[#E84A27]/50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Info del usuario en sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3">
              <p className="text-sm font-medium text-white truncate">
                {profile.nombre_completo}
              </p>
              <p className="text-xs text-white/60 capitalize">{profile.rol}</p>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <aside
              className="w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white shadow-lg shadow-[#E84A27]/50'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Info del usuario en sidebar mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3">
                  <p className="text-sm font-medium text-white truncate">
                    {profile.nombre_completo}
                  </p>
                  <p className="text-xs text-white/60 capitalize">{profile.rol}</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}