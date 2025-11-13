// src/components/reservas/ReservasClienteContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ClaseDisponibleCard from './ClaseDisponibleCard'
import MisReservasCard from './MisReservasCard'
import FiltrosClasesCliente from './FiltrosClasesCliente'
import { 
  obtenerClasesDisponibles, 
  obtenerMisReservas,
  obtenerEstadisticasCliente
} from '@/lib/actions/reservas-actions'

// ============================================================================
// TIPOS
// ============================================================================

type Tab = 'disponibles' | 'mis-reservas'

type Filtros = {
  disciplina_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  solo_disponibles?: boolean
}

interface Disciplina {
  id: string
  nombre: string
  tipo: string
  color_hex: string
}

interface ReservasClienteContentProps {
  disciplinas: Disciplina[]
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ReservasClienteContent({ disciplinas }: ReservasClienteContentProps) {
  // Estados
  const [tabActivo, setTabActivo] = useState<Tab>('disponibles')
  const [clasesDisponibles, setClasesDisponibles] = useState<any[]>([])
  const [misReservas, setMisReservas] = useState<any[]>([])
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [filtros, setFiltros] = useState<Filtros>({ solo_disponibles: true })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = async () => {
    setCargando(true)
    setError(null)

    try {
      // Cargar en paralelo
      const [clasesRes, reservasRes, statsRes] = await Promise.all([
        obtenerClasesDisponibles(filtros),
        obtenerMisReservas('activas'),
        obtenerEstadisticasCliente()
      ])

      if (clasesRes.success) {
        setClasesDisponibles(clasesRes.data || [])
      } else {
        setError(clasesRes.error || 'Error al cargar clases')
      }

      if (reservasRes.success) {
        setMisReservas(reservasRes.data || [])
      }

      if (statsRes.success) {
        setEstadisticas(statsRes.data)
      }
    } catch (err) {
      setError('Error al cargar datos')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  // Manejar cambio de filtros
  const handleFiltrosChange = (nuevosFiltros: Filtros) => {
    setFiltros(nuevosFiltros)
  }

  // Contar reservas activas
  const reservasActivas = misReservas.filter(r => r.estado === 'confirmada').length

  return (
    <div className="space-y-8">
      {/* Estadísticas rápidas */}
      {estadisticas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Créditos */}
          <div className="bg-gradient-to-br from-[#E84A27]/10 to-[#FF6B35]/10 border border-[#E84A27]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💳</span>
              <div>
                <p className="text-white/60 text-xs">Créditos</p>
                <p className="text-white text-3xl font-bold">
                  {estadisticas.creditos_disponibles}
                </p>
              </div>
            </div>
          </div>

          {/* Clases asistidas */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">✅</span>
              <div>
                <p className="text-white/60 text-xs">Asistidas</p>
                <p className="text-white text-3xl font-bold">
                  {estadisticas.clases_asistidas}
                </p>
              </div>
            </div>
          </div>

          {/* Racha */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="text-white/60 text-xs">Racha</p>
                <p className="text-white text-3xl font-bold">
                  {estadisticas.racha_asistencia}
                </p>
              </div>
            </div>
          </div>

          {/* Reservas activas */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-white/60 text-xs">Activas</p>
                <p className="text-white text-3xl font-bold">
                  {reservasActivas}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Próxima clase destacada */}
      {estadisticas?.proxima_clase && (
        <div className="bg-gradient-to-r from-[#E84A27]/10 to-[#FF6B35]/10 border border-[#E84A27]/20 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#E84A27] to-[#FF6B35] flex items-center justify-center text-3xl">
                ⏰
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Tu próxima clase</p>
                <h3 className="text-white font-bold text-xl mb-2">
                  {estadisticas.proxima_clase.nombre_clase || estadisticas.proxima_clase.disciplina_nombre}
                </h3>
                <p className="text-white/80 text-sm">
                  {new Date(estadisticas.proxima_clase.fecha_hora).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {estadisticas.proxima_clase.salon_nombre}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit">
        <button
          onClick={() => setTabActivo('disponibles')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            tabActivo === 'disponibles'
              ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white shadow-lg shadow-[#E84A27]/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          🏋️ Clases Disponibles
          {clasesDisponibles.length > 0 && (
            <span className="ml-2 px-2 py-1 rounded-full bg-white/20 text-xs">
              {clasesDisponibles.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTabActivo('mis-reservas')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            tabActivo === 'mis-reservas'
              ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white shadow-lg shadow-[#E84A27]/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          📋 Mis Reservas
          {reservasActivas > 0 && (
            <span className="ml-2 px-2 py-1 rounded-full bg-white/20 text-xs">
              {reservasActivas}
            </span>
          )}
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❌</span>
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-white/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de tabs */}
      <div className="min-h-screen">
        {tabActivo === 'disponibles' ? (
          <ClasesDisponiblesTab
            clases={clasesDisponibles}
            disciplinas={disciplinas}
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            cargando={cargando}
          />
        ) : (
          <MisReservasTab
            reservas={misReservas}
            cargando={cargando}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// TAB: CLASES DISPONIBLES
// ============================================================================

function ClasesDisponiblesTab({
  clases,
  disciplinas,
  filtros,
  onFiltrosChange,
  cargando
}: {
  clases: any[]
  disciplinas: Disciplina[]
  filtros: Filtros
  onFiltrosChange: (filtros: Filtros) => void
  cargando: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FiltrosClasesCliente
        disciplinas={disciplinas}
        onFiltrosChange={onFiltrosChange}
      />

      {/* Lista de clases */}
      {cargando ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : clases.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No hay clases disponibles
          </h3>
          <p className="text-white/60">
            Intenta ajustar los filtros o vuelve más tarde
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {clases.map((clase) => (
            <ClaseDisponibleCard key={clase.id} clase={clase} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// TAB: MIS RESERVAS
// ============================================================================

function MisReservasTab({
  reservas,
  cargando
}: {
  reservas: any[]
  cargando: boolean
}) {
  // Separar reservas por estado
  const reservasActivas = reservas.filter(r => {
    const fecha = new Date(r.clase.fecha_hora)
    return r.estado === 'confirmada' && fecha >= new Date()
  })

  const reservasPasadas = reservas.filter(r => {
    const fecha = new Date(r.clase.fecha_hora)
    return r.estado === 'confirmada' && fecha < new Date()
  })

  const reservasCanceladas = reservas.filter(r => r.estado === 'cancelada')

  return (
    <div className="space-y-8">
      {/* Reservas Activas */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">
            ✅ Reservas Activas
          </h2>
          <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
            {reservasActivas.length}
          </div>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reservasActivas.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              No tienes reservas activas
            </h3>
            <p className="text-white/60 mb-6">
              Reserva una clase para comenzar tu entrenamiento
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/50"
            >
              Ver Clases Disponibles
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {reservasActivas.map((reserva) => (
              <MisReservasCard key={reserva.id} reserva={reserva} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Reservas Pasadas */}
      {reservasPasadas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              📜 Historial
            </h2>
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 text-sm font-medium">
              {reservasPasadas.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservasPasadas.slice(0, 6).map((reserva) => (
              <MisReservasCard key={reserva.id} reserva={reserva} />
            ))}
          </div>

          {reservasPasadas.length > 6 && (
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Mostrando 6 de {reservasPasadas.length} clases pasadas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reservas Canceladas */}
      {reservasCanceladas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              ❌ Canceladas
            </h2>
            <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {reservasCanceladas.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservasCanceladas.slice(0, 4).map((reserva) => (
              <MisReservasCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}