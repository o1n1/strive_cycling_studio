// src/components/reservas/MisReservasCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { EstadoReserva } from '@/lib/types/enums'
import ModalCancelarReserva from './ModalCancelarReserva'

// ============================================================================
// TIPOS
// ============================================================================

interface MiReserva {
  id: string
  estado: EstadoReserva
  creditos_usados: number
  created_at: string
  cancelada_at: string | null
  cancelada_tardia: boolean
  razon_cancelacion: string | null
  check_in_at: string | null
  check_out_at: string | null
  clase: {
    id: string
    fecha_hora: string
    duracion: number
    nombre_clase: string | null
    salon: {
      nombre: string
    }
    disciplina: {
      nombre: string
      color_hex: string
    }
    coach: {
      profiles: {
        nombre_completo: string
        foto_url: string | null
      }
    } | null
  }
  espacio: {
    numero: number
    tipo_equipo: string
  } | null
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function MisReservasCard({ reserva }: { reserva: MiReserva }) {
  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false)

  // Formatear fecha y hora
  const fecha = new Date(reserva.clase.fecha_hora)
  const esHoy = fecha.toDateString() === new Date().toDateString()
  const esManana = fecha.toDateString() === new Date(Date.now() + 86400000).toDateString()
  const esPasada = fecha < new Date()
  
  const fechaTexto = esHoy ? 'Hoy' : esManana ? 'Mañana' : 
    fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
  
  const horaTexto = fecha.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  // Colores según estado
  const obtenerColorEstado = () => {
    switch (reserva.estado) {
      case 'confirmada':
        return esPasada ? 'gray' : 'green'
      case 'completada':
        return 'blue'
      case 'cancelada':
        return 'red'
      case 'no_show':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const obtenerTextoEstado = () => {
    switch (reserva.estado) {
      case 'confirmada':
        return esPasada ? 'Pendiente Check-in' : 'Confirmada'
      case 'completada':
        return 'Completada'
      case 'cancelada':
        return 'Cancelada'
      case 'no_show':
        return 'No Show'
      default:
        return reserva.estado
    }
  }

  const colorEstado = obtenerColorEstado()

  // Puede cancelar si está confirmada y no ha pasado
  const puedeCancelar = reserva.estado === 'confirmada' && !esPasada

  // Calcular horas restantes
  const horasRestantes = Math.floor((fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60))
  const puedeRecuperarCreditos = horasRestantes >= 2

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
      >
        {/* Header con fecha y estado */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Icono de disciplina */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{ 
                background: `linear-gradient(135deg, ${reserva.clase.disciplina.color_hex}20, ${reserva.clase.disciplina.color_hex}40)`,
                border: `1px solid ${reserva.clase.disciplina.color_hex}30`
              }}
            >
              {reserva.clase.disciplina.nombre.toLowerCase().includes('cycling') ? '🚴' : '💪'}
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
                {reserva.clase.duracion} min • {reserva.clase.disciplina.nombre}
              </p>
            </div>
          </div>

          {/* Badge de estado */}
          <div className={`px-4 py-2 rounded-xl ${
            colorEstado === 'green' ? 'bg-green-500/10 border border-green-500/20' :
            colorEstado === 'blue' ? 'bg-blue-500/10 border border-blue-500/20' :
            colorEstado === 'red' ? 'bg-red-500/10 border border-red-500/20' :
            colorEstado === 'orange' ? 'bg-[#FF6B35]/10 border border-[#FF6B35]/20' :
            'bg-white/10 border border-white/20'
          }`}>
            <p className={`font-semibold text-sm ${
              colorEstado === 'green' ? 'text-green-400' :
              colorEstado === 'blue' ? 'text-blue-400' :
              colorEstado === 'red' ? 'text-red-400' :
              colorEstado === 'orange' ? 'text-[#FF6B35]' :
              'text-white/60'
            }`}>
              {obtenerTextoEstado()}
            </p>
          </div>
        </div>

        {/* Nombre de clase */}
        {reserva.clase.nombre_clase && (
          <h3 className="text-white font-bold text-lg mb-4">
            {reserva.clase.nombre_clase}
          </h3>
        )}

        {/* Detalles en grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Salón */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🏢</span>
            <div>
              <p className="text-white/40 text-xs">Salón</p>
              <p className="text-white font-medium text-sm">{reserva.clase.salon.nombre}</p>
            </div>
          </div>

          {/* Espacio */}
          {reserva.espacio && (
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <div>
                <p className="text-white/40 text-xs">Espacio</p>
                <p className="text-white font-medium text-sm">
                  #{reserva.espacio.numero} • {reserva.espacio.tipo_equipo}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Coach */}
        {reserva.clase.coach && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {reserva.clase.coach.profiles.foto_url ? (
                <Image 
                  src={reserva.clase.coach.profiles.foto_url} 
                  alt={reserva.clase.coach.profiles.nombre_completo}
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
              <p className="text-white font-semibold">{reserva.clase.coach.profiles.nombre_completo}</p>
            </div>
          </div>
        )}

        {/* Info de créditos */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <div>
              <p className="text-white/40 text-xs">Créditos</p>
              <p className="text-white font-medium">
                {reserva.creditos_usados} {reserva.creditos_usados === 1 ? 'crédito' : 'créditos'}
              </p>
            </div>
          </div>

          {reserva.estado === 'cancelada' && (
            <div className="text-right">
              <p className="text-white/40 text-xs">Estado</p>
              <p className={`font-medium text-sm ${
                reserva.cancelada_tardia ? 'text-red-400' : 'text-green-400'
              }`}>
                {reserva.cancelada_tardia ? 'No devueltos' : 'Devueltos'}
              </p>
            </div>
          )}
        </div>

        {/* Check-in info */}
        {reserva.check_in_at && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <p className="text-blue-400 text-sm">
              ✅ Check-in: {new Date(reserva.check_in_at).toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        )}

        {/* Razón de cancelación */}
        {reserva.estado === 'cancelada' && reserva.razon_cancelacion && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
            <p className="text-white/40 text-xs mb-1">Razón de cancelación</p>
            <p className="text-white/80 text-sm">{reserva.razon_cancelacion}</p>
          </div>
        )}

        {/* Advertencia de cancelación tardía */}
        {puedeCancelar && !puedeRecuperarCreditos && (
          <div className="p-3 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 mb-4">
            <p className="text-[#FF6B35] text-sm">
              ⚠️ Si cancelas ahora, no se devolverán los créditos (menos de 2h de anticipación)
            </p>
          </div>
        )}

        {/* Botones de acción */}
        {puedeCancelar && (
          <button
            onClick={() => setModalCancelarAbierto(true)}
            className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
          >
            ❌ Cancelar Reserva
          </button>
        )}
      </motion.div>

      {/* Modal de cancelación */}
      {modalCancelarAbierto && (
        <ModalCancelarReserva
          reserva={reserva}
          puedeRecuperarCreditos={puedeRecuperarCreditos}
          onCerrar={() => setModalCancelarAbierto(false)}
        />
      )}
    </>
  )
}