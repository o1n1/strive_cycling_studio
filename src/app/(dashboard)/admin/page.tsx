// src/app/(dashboard)/admin/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  clientesActivos: number
  clasesHoy: number
  ingresosMes: number
  ocupacionPromedio: number
  espaciosDisponibles: number
  espaciosTotales: number
  coacheActivos: number
  reservasHoy: number
}

interface ActividadReciente {
  id: string
  tipo: 'reserva' | 'pago' | 'registro' | 'clase'
  descripcion: string
  timestamp: string
  usuario: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    clientesActivos: 0,
    clasesHoy: 0,
    ingresosMes: 0,
    ocupacionPromedio: 0,
    espaciosDisponibles: 0,
    espaciosTotales: 0,
    coacheActivos: 0,
    reservasHoy: 0
  })
  const [cargando, setCargando] = useState(true)
  const [actividadReciente] = useState<ActividadReciente[]>([])
  const supabase = createClient()

  const cargarEstadisticas = useCallback(async () => {
    try {
      // Contar clientes activos
      const { count: clientesCount } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })

      // ✅ CORREGIDO: fecha_hora en lugar de fecha
      const hoy = new Date()
      const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0)).toISOString()
      const finHoy = new Date(hoy.setHours(23, 59, 59, 999)).toISOString()

      const { count: clasesCount } = await supabase
        .from('clases')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_hora', inicioHoy)
        .lt('fecha_hora', finHoy)

      // Contar espacios
      const { count: espaciosTotalesCount } = await supabase
        .from('espacios')
        .select('*', { count: 'exact', head: true })

      const { count: espaciosDisponiblesCount } = await supabase
        .from('espacios')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'disponible')

      // Contar coaches activos
      const { count: coachesCount } = await supabase
        .from('coaches')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      // Calcular ocupación promedio
      const ocupacion = espaciosTotalesCount && espaciosDisponiblesCount
        ? Math.round(((espaciosTotalesCount - espaciosDisponiblesCount) / espaciosTotalesCount) * 100)
        : 0

      setStats({
        clientesActivos: clientesCount || 0,
        clasesHoy: clasesCount || 0,
        ingresosMes: 0, // Se calculará cuando tengamos sistema de pagos
        ocupacionPromedio: ocupacion,
        espaciosDisponibles: espaciosDisponiblesCount || 0,
        espaciosTotales: espaciosTotalesCount || 0,
        coacheActivos: coachesCount || 0,
        reservasHoy: 0 // Se calculará cuando tengamos sistema de reservas
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setCargando(false)
    }
  }, [supabase])

  useEffect(() => {
    cargarEstadisticas()
  }, [cargarEstadisticas])

  const modulosRapidos = [
    {
      nombre: 'Espacios',
      descripcion: 'Gestionar salones y equipos',
      icono: '🏢',
      href: '/admin/espacios',
      color: 'from-[#E84A27] to-[#FF6B35]',
      disponible: true
    },
    {
      nombre: 'Personal',
      descripcion: 'Coaches y staff',
      icono: '👥',
      href: '/admin/personal',
      color: 'from-[#FF006E] to-[#FF6B35]',
      disponible: false
    },
    {
      nombre: 'Clases',
      descripcion: 'Horarios y programación',
      icono: '📅',
      href: '/admin/clases',
      color: 'from-[#9D4EDD] to-[#FF006E]',
      disponible: true
    },
    {
      nombre: 'Clientes',
      descripcion: 'Base de clientes',
      icono: '👤',
      href: '/admin/clientes',
      color: 'from-[#FF6B35] to-[#E84A27]',
      disponible: false
    },
    {
      nombre: 'Finanzas',
      descripcion: 'Ingresos y pagos',
      icono: '💰',
      href: '/admin/finanzas',
      color: 'from-[#E84A27] to-[#9D4EDD]',
      disponible: false
    },
    {
      nombre: 'Reportes',
      descripcion: 'Análisis y métricas',
      icono: '📈',
      href: '/admin/reportes',
      color: 'from-[#9D4EDD] to-[#FF6B35]',
      disponible: false
    }
  ]

  if (cargando) {
    return (
      <DashboardBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E84A27] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Cargando dashboard...</p>
          </div>
        </div>
      </DashboardBackground>
    )
  }

  return (
    <DashboardBackground>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                Dashboard Administrativo
              </h1>
              <p className="text-white/60">
                Vista general del estado del estudio
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* KPIs Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Clientes Activos */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#E84A27]/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">Clientes Activos</p>
                  <p className="text-3xl font-bold text-white">{stats.clientesActivos}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">●</span>
                <span className="text-white/60">Base de clientes</span>
              </div>
            </div>

            {/* Clases Hoy */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FF6B35]/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">Clases Hoy</p>
                  <p className="text-3xl font-bold text-white">{stats.clasesHoy}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400">●</span>
                <span className="text-white/60">Programadas</span>
              </div>
            </div>

            {/* Ocupación */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FF006E]/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">Ocupación</p>
                  <p className="text-3xl font-bold text-white">{stats.ocupacionPromedio}%</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF006E] to-[#9D4EDD] transition-all duration-500"
                  style={{ width: `${stats.ocupacionPromedio}%` }}
                />
              </div>
            </div>

            {/* Espacios Disponibles */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#9D4EDD]/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-white/60 mb-1">Espacios</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.espaciosDisponibles}/{stats.espaciosTotales}
                  </p>
                </div>
                <div className="text-4xl">🏋️</div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-400">●</span>
                <span className="text-white/60">Disponibles</span>
              </div>
            </div>
          </motion.div>

          {/* Acceso Rápido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Acceso Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulosRapidos.map((modulo, index) => (
                <motion.div
                  key={modulo.nombre}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                >
                  {modulo.disponible ? (
                    <Link
                      href={modulo.href}
                      className="block group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`text-5xl bg-gradient-to-br ${modulo.color} bg-clip-text text-transparent`}>
                          {modulo.icono}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {modulo.nombre}
                          </h3>
                          <p className="text-sm text-white/60">
                            {modulo.descripcion}
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ) : (
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 opacity-50 cursor-not-allowed">
                      <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded">
                        Próximamente
                      </div>
                      <div className="flex items-start gap-4">
                        <div className={`text-5xl bg-gradient-to-br ${modulo.color} bg-clip-text text-transparent`}>
                          {modulo.icono}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {modulo.nombre}
                          </h3>
                          <p className="text-sm text-white/60">
                            {modulo.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alertas Importantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Alertas</h2>
            <div className="space-y-4">
              {/* Alerta de ejemplo - se reemplazará con datos reales */}
              {stats.espaciosTotales === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⚠️</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-yellow-300 mb-1">
                        No hay espacios configurados
                      </h3>
                      <p className="text-white/60 mb-3">
                        Para comenzar a operar, necesitas configurar los salones y sus espacios.
                      </p>
                      <Link
                        href="/admin/espacios"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                      >
                        Configurar Espacios
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {stats.coacheActivos === 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">ℹ️</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-300 mb-1">
                        No hay coaches registrados
                      </h3>
                      <p className="text-white/60 mb-3">
                        Invita coaches para que puedan impartir clases.
                      </p>
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 opacity-50 cursor-not-allowed text-sm font-medium"
                      >
                        Próximamente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje cuando todo está bien */}
              {stats.espaciosTotales > 0 && stats.coacheActivos > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">✅</div>
                    <div>
                      <h3 className="text-lg font-bold text-green-300 mb-1">
                        Sistema operativo
                      </h3>
                      <p className="text-white/60">
                        Todos los módulos básicos están configurados correctamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actividad Reciente (preparado para datos reales) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Actividad Reciente</h2>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              {actividadReciente.length > 0 ? (
                <div className="space-y-4">
                  {actividadReciente.map((actividad) => (
                    <div
                      key={actividad.id}
                      className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0"
                    >
                      <div className="text-2xl">
                        {actividad.tipo === 'reserva' && '📅'}
                        {actividad.tipo === 'pago' && '💳'}
                        {actividad.tipo === 'registro' && '✨'}
                        {actividad.tipo === 'clase' && '🎯'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{actividad.descripcion}</p>
                        <p className="text-sm text-white/60 mt-1">
                          {actividad.usuario} • {actividad.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-white/60">
                    No hay actividad reciente por mostrar
                  </p>
                  <p className="text-sm text-white/40 mt-2">
                    La actividad aparecerá aquí cuando el sistema esté en uso
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardBackground>
  )
}