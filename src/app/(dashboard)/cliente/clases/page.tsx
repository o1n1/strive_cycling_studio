// src/app/(dashboard)/cliente/clases/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import ClaseDisponibleCard from '@/components/reservas/ClaseDisponibleCard'
import { obtenerClasesDisponibles, obtenerEstadisticasCliente } from '@/lib/actions/reservas-actions'
import { useToast } from '@/hooks/useToast'

// ============================================================================
// TIPOS
// ============================================================================

interface ClaseDisponible {
  id: string
  fecha_hora: string
  duracion: number
  capacidad: number
  reservas_count: number
  espacios_disponibles: number
  nombre_clase: string | null
  descripcion: string | null
  estado: string
  salon: {
    id: string
    nombre: string
    tipo: string
  }
  disciplina: {
    id: string
    nombre: string
    tipo: string
    color_hex: string
  }
  especialidad: {
    id: string
    nombre: string
    descripcion: string
  } | null
  coach: {
    id: string
    biografia: string
    calificacion_promedio: number
    profiles: {
      nombre_completo: string
      foto_url: string | null
    }
  } | null
}

interface Estadisticas {
  reservas_totales: number
  clases_asistidas: number
  no_shows: number
  creditos_disponibles: number
  creditos_congelados: boolean
  racha_asistencia: number
  proxima_clase: {
    id: string
    fecha_hora: string
    nombre_clase: string | null
    disciplina_nombre: string
    salon_nombre: string
  } | null
}

export default function ClasesDisponiblesPage() {
  const toast = useToast()
  
  // Estados
  const [clases, setClases] = useState<ClaseDisponible[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [cargando, setCargando] = useState(true)
  
  // Filtros
  const [filtroDisciplina, setFiltroDisciplina] = useState<string>('todas')
  const [filtroFecha, setFiltroFecha] = useState<string>('')
  const [soloDisponibles, setSoloDisponibles] = useState(true)

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [filtroDisciplina, filtroFecha, soloDisponibles])

  const cargarDatos = async () => {
    setCargando(true)

    try {
      // Cargar clases y estadísticas en paralelo
      const [clasesRes, statsRes] = await Promise.all([
        obtenerClasesDisponibles({
          disciplina_id: filtroDisciplina !== 'todas' ? filtroDisciplina : undefined,
          fecha_desde: filtroFecha || undefined,
          solo_disponibles: soloDisponibles
        }),
        obtenerEstadisticasCliente()
      ])

      if (clasesRes.success) {
        setClases(clasesRes.data || [])
      } else {
        toast.error(clasesRes.error || 'Error al cargar clases')
      }

      if (statsRes.success) {
        setEstadisticas(statsRes.data || null)
      }
    } catch (error) {
      toast.error('Error al cargar datos')
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  // Obtener disciplinas únicas
  const disciplinasUnicas = Array.from(
    new Set(clases.map(c => JSON.stringify({ id: c.disciplina.id, nombre: c.disciplina.nombre })))
  ).map(s => JSON.parse(s))

  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm rounded-2xl p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Clases Disponibles</h1>
            <p className="text-white/60">Reserva tu próxima clase</p>
          </div>

          {/* Estadísticas Rápidas */}
          {estadisticas && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Créditos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#E84A27]/10 to-[#FF6B35]/10 border border-[#E84A27]/20 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">💳</span>
                  <div>
                    <p className="text-white/60 text-xs">Créditos</p>
                    <p className="text-white text-3xl font-bold">
                      {estadisticas.creditos_disponibles}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Clases Asistidas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">✅</span>
                  <div>
                    <p className="text-white/60 text-xs">Asistidas</p>
                    <p className="text-white text-3xl font-bold">
                      {estadisticas.clases_asistidas}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Racha */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🔥</span>
                  <div>
                    <p className="text-white/60 text-xs">Racha</p>
                    <p className="text-white text-3xl font-bold">
                      {estadisticas.racha_asistencia}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Reservas Totales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">📊</span>
                  <div>
                    <p className="text-white/60 text-xs">Total</p>
                    <p className="text-white text-3xl font-bold">
                      {estadisticas.reservas_totales}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Disciplina */}
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Disciplina
                </label>
                <select
                  value={filtroDisciplina}
                  onChange={(e) => setFiltroDisciplina(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:bg-white"
                >
                  <option value="todas">Todas</option>
                  {disciplinasUnicas.map((d: { id: string; nombre: string }) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Solo Disponibles */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soloDisponibles}
                    onChange={(e) => setSoloDisponibles(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 text-[#E84A27] focus:ring-[#E84A27] focus:ring-offset-0 bg-white/5"
                  />
                  <span className="text-white">Solo con espacios</span>
                </label>
              </div>
            </div>
          </div>

          {/* Lista de Clases */}
          {cargando ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : clases.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No hay clases disponibles
              </h3>
              <p className="text-white/60 mb-6">
                Intenta ajustar los filtros o vuelve más tarde
              </p>
              <button
                onClick={() => {
                  setFiltroDisciplina('todas')
                  setFiltroFecha('')
                  setSoloDisponibles(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clases.map((clase) => (
                <ClaseDisponibleCard key={clase.id} clase={clase} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardBackground>
  )
}