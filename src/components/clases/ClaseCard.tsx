'use client'

// src/components/clases/ClaseCard.tsx
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ClaseConRelaciones } from '@/lib/actions/clases-actions'
import { cancelarClase, desasignarCoach, eliminarClase } from '@/lib/actions/clases-actions'
import { useRouter } from 'next/navigation'

interface ClaseCardProps {
  clase: ClaseConRelaciones
}

export function ClaseCard({ clase }: ClaseCardProps) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)

  const obtenerColorEstado = () => {
    if (clase.estado === 'cancelada') return 'gray'
    if (clase.estado === 'completada') return 'blue'
    if (!clase.coach_id) return 'orange'
    return 'green'
  }

  const obtenerTextoEstado = () => {
    if (clase.estado === 'cancelada') return 'Cancelada'
    if (clase.estado === 'completada') return 'Completada'
    if (!clase.coach_id) return 'Sin Asignar'
    return 'Confirmada'
  }

  const obtenerColorDisciplina = () => {
    if (clase.disciplina.tipo === 'cycling') return '[#E84A27]'
    if (clase.disciplina.tipo === 'funcional') return '[#FF006E]'
    return '[#9D4EDD]'
  }

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearHora = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const manejarCancelar = async () => {
    if (!confirm('¿Estás seguro de cancelar esta clase? Se notificará a todos los afectados.')) {
      return
    }

    setCargando(true)
    const resultado = await cancelarClase(clase.id)
    
    if (resultado.success) {
      router.refresh()
    } else {
      alert(`Error: ${resultado.error}`)
    }
    setCargando(false)
  }

  const manejarDesasignar = async () => {
    if (!clase.coach_id) return

    if (!confirm('¿Desasignar coach de esta clase?')) {
      return
    }

    setCargando(true)
    const resultado = await desasignarCoach(clase.id)
    
    if (resultado.success) {
      router.refresh()
    } else {
      alert(`Error: ${resultado.error}`)
    }
    setCargando(false)
  }

  const manejarEliminar = async () => {
    if (clase.reservas_count > 0) {
      alert(`No se puede eliminar. La clase tiene ${clase.reservas_count} reserva(s).`)
      return
    }

    if (!confirm('⚠️ ¿ELIMINAR esta clase permanentemente?\n\nEsta acción NO se puede deshacer.')) {
      return
    }

    if (!confirm('¿Estás completamente seguro? Esta es la última advertencia.')) {
      return
    }

    setCargando(true)
    const resultado = await eliminarClase(clase.id)
    
    if (resultado.success) {
      router.refresh()
    } else {
      alert(`Error: ${resultado.error}`)
      setCargando(false)
    }
  }

  const colorEstado = obtenerColorEstado()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/5">
        <div className={`h-1 bg-gradient-to-r from-${obtenerColorDisciplina()} to-transparent`} />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${obtenerColorDisciplina()} to-transparent flex items-center justify-center text-2xl`}>
                {clase.disciplina.tipo === 'cycling' ? '🚴' : '💪'}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {clase.nombre_clase || clase.disciplina.nombre}
                </h3>
                <p className="text-white/60 text-sm">
                  {formatearHora(clase.fecha_hora)} • {clase.duracion} min
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-white/10">
            <p className="text-white/90 font-medium">
              {formatearFecha(clase.fecha_hora)}
            </p>
            <p className="text-white/60 text-sm mt-1">
              {clase.salon.nombre}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {clase.disciplina.tipo === 'cycling' ? '🚴' : '💪'}
                </span>
                <div>
                  <p className="text-white/40 text-xs">Disciplina</p>
                  <p className="text-white font-medium">{clase.disciplina.nombre}</p>
                </div>
              </div>

              {clase.especialidad && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-white/40 text-xs">Especialidad</p>
                    <p className="text-white font-medium">{clase.especialidad.nombre}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {clase.coach ? (
                <>
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
                </>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                  <span className="text-xl">⚠️</span>
                  <p className="text-[#FF6B35] font-medium">Sin asignar</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <p className="text-white/60 text-sm">
                {clase.reservas_count}/{clase.capacidad} reservados
              </p>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${obtenerColorDisciplina()} transition-all duration-300`}
                  style={{ width: `${(clase.reservas_count / clase.capacidad) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className={`px-4 py-2 rounded-xl ${
              colorEstado === 'green' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
              colorEstado === 'orange' ? 'bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35]' :
              colorEstado === 'gray' ? 'bg-white/5 border border-white/10 text-white/40' :
              'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}>
              <p className="font-semibold text-sm whitespace-nowrap">
                {obtenerTextoEstado()}
              </p>
            </div>

            {clase.estado === 'programada' && (
              <div className="flex flex-col gap-2 w-full">
                {clase.coach_id ? (
                  <button
                    onClick={manejarDesasignar}
                    disabled={cargando}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Desasignar
                  </button>
                ) : (
                  <Link
                    href={`/admin/clases/${clase.id}/asignar`}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium text-center transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
                  >
                    Asignar Coach
                  </Link>
                )}

                <Link
                  href={`/admin/clases/${clase.id}/editar`}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium text-center transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                >
                  Editar
                </Link>

                <button
                  onClick={manejarCancelar}
                  disabled={cargando}
                  className="w-full px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Cancelando...' : 'Cancelar Clase'}
                </button>

                {clase.reservas_count === 0 && (
                  <button
                    onClick={manejarEliminar}
                    disabled={cargando}
                    className="w-full px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-red-900/20 border border-red-500/30 text-red-300 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cargando ? 'Eliminando...' : '🗑️ Eliminar'}
                  </button>
                )}
              </div>
            )}

            <Link
              href={`/admin/clases/${clase.id}`}
              className="w-full px-4 py-2 rounded-xl text-sm font-medium text-center transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}