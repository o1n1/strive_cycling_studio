// src/components/reservas/ModalConfirmarReserva.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// ============================================================================
// TIPOS
// ============================================================================

interface Clase {
  id: string
  fecha_hora: string
  duracion: number
  nombre_clase: string | null
  disciplina: {
    nombre: string
    color_hex: string
  }
  salon: {
    nombre: string
  }
  coach: {
    profiles: {
      nombre_completo: string
      foto_url: string | null
    }
  } | null
}

interface ModalConfirmarReservaProps {
  clase: Clase
  onConfirmar: () => void
  onCancelar: () => void
  procesando: boolean
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function ModalConfirmarReserva({
  clase,
  onConfirmar,
  onCancelar,
  procesando
}: ModalConfirmarReservaProps) {
  const fecha = new Date(clase.fecha_hora)
  const fechaTexto = fecha.toLocaleDateString('es-MX', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  })
  const horaTexto = fecha.toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancelar}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-br from-[#1A1814] to-[#0F0E0D] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#E84A27] to-[#FF6B35] flex items-center justify-center">
              <span className="text-3xl">🎟️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Confirmar Reserva
            </h2>
            <p className="text-white/60">
              Estás a punto de reservar esta clase
            </p>
          </div>

          {/* Detalles de la clase */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6 space-y-4">
            {/* Nombre de clase */}
            {clase.nombre_clase && (
              <div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {clase.nombre_clase}
                </h3>
              </div>
            )}

            {/* Disciplina */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${clase.disciplina.color_hex}20, ${clase.disciplina.color_hex}40)`,
                  border: `1px solid ${clase.disciplina.color_hex}30`
                }}
              >
                {clase.disciplina.nombre.toLowerCase().includes('cycling') ? '🚴' : '💪'}
              </div>
              <div>
                <p className="text-white/40 text-xs">Disciplina</p>
                <p className="text-white font-medium">{clase.disciplina.nombre}</p>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-white/40 text-xs">Fecha y hora</p>
                <p className="text-white font-medium capitalize">{fechaTexto}</p>
                <p className="text-white/80">{horaTexto}</p>
              </div>
            </div>

            {/* Duración */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-white/40 text-xs">Duración</p>
                <p className="text-white font-medium">{clase.duracion} minutos</p>
              </div>
            </div>

            {/* Salón */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="text-white/40 text-xs">Salón</p>
                <p className="text-white font-medium">{clase.salon.nombre}</p>
              </div>
            </div>

            {/* Coach */}
            {clase.coach && (
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {clase.coach.profiles.foto_url ? (
                    <Image 
                      src={clase.coach.profiles.foto_url} 
                      alt={clase.coach.profiles.nombre_completo}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/60">👤</span>
                  )}
                </div>
                <div>
                  <p className="text-white/40 text-xs">Coach</p>
                  <p className="text-white font-medium">{clase.coach.profiles.nombre_completo}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info importante */}
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">💳</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  Se consumirá 1 crédito
                </p>
                <p className="text-white/60 text-xs">
                  Puedes cancelar con al menos 2 horas de anticipación para recuperar tu crédito
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              disabled={procesando}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={procesando}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? 'Reservando...' : 'Confirmar'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}