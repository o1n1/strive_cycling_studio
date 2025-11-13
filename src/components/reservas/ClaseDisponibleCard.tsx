// src/components/reservas/ClaseDisponibleCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { crearReserva, agregarListaEspera } from '@/lib/actions/reservas-actions'
import ModalConfirmarReserva from './ModalConfirmarReserva'

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

// ============================================================================
// COMPONENTE
// ============================================================================

export default function ClaseDisponibleCard({ clase }: { clase: ClaseDisponible }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formatear fecha y hora
  const fecha = new Date(clase.fecha_hora)
  const esHoy = fecha.toDateString() === new Date().toDateString()
  const esManana = fecha.toDateString() === new Date(Date.now() + 86400000).toDateString()
  
  const fechaTexto = esHoy ? 'Hoy' : esManana ? 'Mañana' : 
    fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  
  const horaTexto = fecha.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  // Calcular porcentaje de ocupación
  const porcentajeOcupacion = (clase.reservas_count / clase.capacidad) * 100
  
  // Estado de disponibilidad
  const espaciosRestantes = clase.espacios_disponibles
  const casiLlena = porcentajeOcupacion >= 80
  const disponible = espaciosRestantes > 0

  // Manejar reserva
  const handleReservar = () => {
    if (disponible) {
      setModalAbierto(true)
    }
  }

  const confirmarReserva = async () => {
    setProcesando(true)
    setError(null)

    const resultado = await crearReserva(clase.id)
    
    if (resultado.success) {
      setModalAbierto(false)
      window.location.reload() // Recargar para actualizar datos
    } else {
      setError(resultado.error || 'Error al crear reserva')
    }
    
    setProcesando(false)
  }

  // Manejar lista de espera
  const handleListaEspera = async () => {
    setProcesando(true)
    setError(null)

    const resultado = await agregarListaEspera(clase.id)
    
    if (resultado.success) {
      window.location.reload()
    } else {
      setError(resultado.error || 'Error al agregar a lista de espera')
    }
    
    setProcesando(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
      >
        {/* Header con fecha y disciplina */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Icono de disciplina */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ 
                background: `linear-gradient(135deg, ${clase.disciplina.color_hex}20, ${clase.disciplina.color_hex}40)`,
                border: `1px solid ${clase.disciplina.color_hex}30`
              }}
            >
              {clase.disciplina.tipo === 'cycling' ? '🚴' : '💪'}
            </div>

            {/* Info de fecha y hora */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/40 text-sm">📅</span>
                <p className="text-white font-semibold">{fechaTexto}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">🕐</span>
                <p className="text-white text-2xl font-bold">{horaTexto}</p>
              </div>
              <p className="text-white/60 text-sm mt-1">
                {clase.duracion} minutos • {clase.disciplina.nombre}
              </p>
            </div>
          </div>

          {/* Badge de estado */}
          {!disponible ? (
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 font-semibold text-sm">Llena</p>
            </div>
          ) : casiLlena ? (
            <div className="px-4 py-2 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
              <p className="text-[#FF6B35] font-semibold text-sm">
                {espaciosRestantes} {espaciosRestantes === 1 ? 'lugar' : 'lugares'}
              </p>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 font-semibold text-sm">Disponible</p>
            </div>
          )}
        </div>

        {/* Nombre y descripción */}
        {clase.nombre_clase && (
          <h3 className="text-white font-bold text-xl mb-2">
            {clase.nombre_clase}
          </h3>
        )}
        
        {clase.descripcion && (
          <p className="text-white/60 text-sm mb-4 line-clamp-2">
            {clase.descripcion}
          </p>
        )}

        {/* Detalles */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Salón */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <div>
              <p className="text-white/40 text-xs">Salón</p>
              <p className="text-white font-medium text-sm">{clase.salon.nombre}</p>
            </div>
          </div>

          {/* Especialidad */}
          {clase.especialidad && (
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-white/40 text-xs">Especialidad</p>
                <p className="text-white font-medium text-sm">{clase.especialidad.nombre}</p>
              </div>
            </div>
          )}
        </div>

        {/* Coach */}
        {clase.coach && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {clase.coach.profiles.foto_url ? (
                <Image 
                  src={clase.coach.profiles.foto_url} 
                  alt={clase.coach.profiles.nombre_completo}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white/60 text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white/40 text-xs">Coach</p>
              <p className="text-white font-semibold">{clase.coach.profiles.nombre_completo}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-yellow-400 font-medium text-sm">
                  {clase.coach.calificacion_promedio.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Barra de ocupación */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/60 text-sm">Ocupación</p>
            <p className="text-white font-medium text-sm">
              {clase.reservas_count}/{clase.capacidad}
            </p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                porcentajeOcupacion >= 90 ? 'bg-red-500' :
                porcentajeOcupacion >= 80 ? 'bg-[#FF6B35]' :
                'bg-green-500'
              }`}
              style={{ width: `${porcentajeOcupacion}%` }}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          {disponible ? (
            <button
              onClick={handleReservar}
              disabled={procesando}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? 'Procesando...' : '🎟️ Reservar Ahora'}
            </button>
          ) : (
            <button
              onClick={handleListaEspera}
              disabled={procesando}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? 'Procesando...' : '⏰ Lista de Espera'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Modal de confirmación */}
      {modalAbierto && (
        <ModalConfirmarReserva
          clase={clase}
          onConfirmar={confirmarReserva}
          onCancelar={() => setModalAbierto(false)}
          procesando={procesando}
        />
      )}
    </>
  )
}