// src/app/(dashboard)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database.types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      setLoading(false)
    }

    getProfile()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AE3F21] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="mr-4 lg:hidden"
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Link href={`/${profile.rol}`}>
                <h1 className="text-2xl font-bold text-[#AE3F21]">STRIVE</h1>
              </Link>
            </div>

            {/* Usuario */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile.nombre_completo}
                </p>
                <p className="text-xs text-gray-500 capitalize">{profile.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-[#AE3F21] transition-colors"
                title="Cerrar sesión"
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
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#AE3F21] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <aside
              className="w-64 bg-white h-full"
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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#AE3F21] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Contenido principal */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}