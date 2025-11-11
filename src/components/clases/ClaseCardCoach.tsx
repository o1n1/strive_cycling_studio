// src/components/clases/ClaseCardCoach.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { ClaseConRelaciones } from '@/lib/actions/clases-actions'
import { solicitarClase, cancelarSolicitud } from '@/lib/actions/clases-actions'
import { useToast } from '@/hooks/useToast'

// ============================================================================
// TYPES
// ============================================================================

interface ClaseCardCoachProps {
  clase: ClaseConRelaciones
  tipo: 'asignada' | 'disponible' | 'solicitada'
  solicitud?: {
    id: string
    mensaje: string | null
    created_at: string
  }
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function ClaseCardCoach({ clase, tipo, solicitud }: ClaseCardCoachProps) {
  const router = useRouter()
  const toast = useToast()
  const [cargando, setCargando] = useState(false)

  // Calcular estado y colores
  const obtenerInfoEstado = () => {
    switch (tipo) {
      case 'asignada':
        return {
          texto: 'Asignada',
          color: 'green',
          icono: '✅'
        }
      case 'solicitada':
        return {
          texto: 'Solicitada',
          color: 'orange',
          icono: '🙋'
        }
      case 'disponible':
        return {
          texto: 'Disponible',
          color: 'blue',
          icono: '📋'
        }
    }
  }

  const infoEstado = obtenerInfoEstado()

  // Formatear fecha
  const fecha = new Date(clase.fecha_hora)
  const ahora = new Date()
  const esHoy = fecha.toDateString() === ahora.toDateString()
  const esPasado = fecha < ahora

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const manejarSolicitar = async () => {
    if (cargando) return
    
    setCargando(true)

    try {
      const result = await solicitarClase(clase.id)
      
      if (result.success) {
        toast.exito('✅ Solicitud enviada correctamente')
        router.refresh()
      } else {
        toast.error(`❌ ${result.error}`)
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido'
      toast.error(`❌ ${mensaje}`)
    } finally {
      setCargando(false)
    }
  }

  const manejarCancelarSolicitud = async () => {
    if (cargando || !solicitud) return
    
    const confirmar = window.confirm('¿Cancelar tu solicitud para esta clase?')
    if (!confirmar) return

    setCargando(true)

    try {
      const result = await cancelarSolicitud(solicitud.id)
      
      if (result.success) {
        toast.exito('✅ Solicitud cancelada')
        router.refresh()
      } else {
        toast.error(`❌ ${result.error}`)
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido'
      toast.error(`❌ ${mensaje}`)
    } finally {
      setCargando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-[#E84A27]/30 transition-all duration-300">
        {/* Header con disciplina */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {clase.disciplina.nombre === 'Cycling' ? '🚴' : '💪'}
              </span>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {clase.nombre_clase || clase.disciplina.nombre}
                </h3>
                {clase.especialidad && (
                  <p className="text-white/60 text-sm">
                    {clase.especialidad.nombre}
                  </p>
                )}
              </div>
            </div>

            {/* Badge de estado */}
            <div className={`
              px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-2
              ${infoEstado.color === 'green' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                infoEstado.color === 'orange' ? 'bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35]' :
                'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              }
            `}>
              <span>{infoEstado.icono}</span>
              <span>{infoEstado.texto}</span>
            </div>
          </div>

          {/* Info principal */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-white/60">
              <span className="text-white/40">📅</span> {' '}
              {esHoy ? 'Hoy' : fecha.toLocaleDateString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </div>
            <div className="text-white/60">
              <span className="text-white/40">🕐</span> {' '}
              {fecha.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="text-white/60">
              <span className="text-white/40">📍</span> {clase.salon.nombre}
            </div>
            <div className="text-white/60">
              <span className="text-white/40">⏱️</span> {clase.duracion} min
            </div>
          </div>

          {/* Descripción si existe */}
          {clase.descripcion && (
            <p className="mt-4 text-white/60 text-sm line-clamp-2">
              {clase.descripcion}
            </p>
          )}
        </div>

        {/* Footer con stats y acciones */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-white/60">
                <span className="text-white/40">👥</span> {' '}
                <span className="text-white font-semibold">{clase.reservas_count}</span>
                /{clase.capacidad}
              </div>
              <div className="text-white/60">
                <span className="text-white/40">📊</span> {' '}
                {Math.round((clase.reservas_count / clase.capacidad) * 100)}% ocupado
              </div>
            </div>
          </div>

          {/* Acciones según tipo */}
          <div className="flex flex-col gap-2">
            {tipo === 'asignada' && (
              <>
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-sm text-center font-medium">
                    ✅ Esta clase te fue asignada
                  </p>
                </div>
                {clase.notas_coach && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Tus notas:</p>
                    <p className="text-white/80 text-sm">{clase.notas_coach}</p>
                  </div>
                )}
              </>
            )}

            {tipo === 'disponible' && !esPasado && (
              <button
                onClick={manejarSolicitar}
                disabled={cargando}
                className="w-full px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Solicitando...' : '🙋 Solicitar Esta Clase'}
              </button>
            )}

            {tipo === 'solicitada' && solicitud && (
              <>
                <div className="p-3 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                  <p className="text-[#FF6B35] text-sm text-center font-medium">
                    🙋 Ya solicitaste esta clase
                  </p>
                  <p className="text-white/40 text-xs text-center mt-1">
                    Solicitada el {new Date(solicitud.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <button
                  onClick={manejarCancelarSolicitud}
                  disabled={cargando}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Cancelando...' : 'Cancelar Solicitud'}
                </button>
              </>
            )}

            {esPasado && tipo !== 'asignada' && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-sm text-center">
                  ⏱️ Clase pasada
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}