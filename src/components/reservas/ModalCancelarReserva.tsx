// src/components/reservas/ModalCancelarReserva.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cancelarReserva } from '@/lib/actions/reservas-actions'

// ============================================================================
// TIPOS
// ============================================================================

interface Reserva {
  id: string
  clase: {
    fecha_hora: string
    nombre_clase: string | null
    disciplina: {
      nombre: string
    }
  }
  creditos_usados: number
}

interface ModalCancelarReservaProps {
  reserva: Reserva
  puedeRecuperarCreditos: boolean
  onCerrar: () => void
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function ModalCancelarReserva({
  reserva,
  puedeRecuperarCreditos,
  onCerrar
}: ModalCancelarReservaProps) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [razon, setRazon] = useState('')

  const fecha = new Date(reserva.clase.fecha_hora)
  const fechaTexto = fecha.toLocaleDateString('es-MX', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })

  const handleCancelar = async () => {
    setProcesando(true)
    setError(null)

    const resultado = await cancelarReserva(reserva.id, razon || undefined)
    
    if (resultado.success) {
      window.location.reload() // Recargar para actualizar datos
    } else {
      setError(resultado.error || 'Error al cancelar reserva')
      setProcesando(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Cancelar Reserva
            </h2>
            <p className="text-white/60">
              ¿Estás seguro que deseas cancelar esta reserva?
            </p>
          </div>

          {/* Detalles de la clase */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
            {reserva.clase.nombre_clase && (
              <h3 className="text-white font-bold text-lg mb-2">
                {reserva.clase.nombre_clase}
              </h3>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏋️</span>
              <p className="text-white/80">{reserva.clase.disciplina.nombre}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <p className="text-white/80 capitalize">{fechaTexto}</p>
            </div>
          </div>

          {/* Política de devolución */}
          {puedeRecuperarCreditos ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    Devolución de créditos
                  </p>
                  <p className="text-white/80 text-sm">
                    Como cancelas con más de 2 horas de anticipación, se te devolverán{' '}
                    <strong>{reserva.creditos_usados}</strong> {reserva.creditos_usados === 1 ? 'crédito' : 'créditos'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-red-400 font-semibold mb-1">
                    Cancelación tardía
                  </p>
                  <p className="text-white/80 text-sm">
                    Como cancelas con menos de 2 horas de anticipación, NO se devolverán los créditos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Razón de cancelación (opcional) */}
          <div className="mb-6">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Razón de cancelación (opcional)
            </label>
            <textarea
              value={razon}
              onChange={(e) => setRazon(e.target.value)}
              placeholder="¿Por qué cancelas esta clase?"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 resize-none"
              disabled={procesando}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onCerrar}
              disabled={procesando}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volver
            </button>
            <button
              onClick={handleCancelar}
              disabled={procesando}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}