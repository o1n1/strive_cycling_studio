'use client'

// src/components/clases/ClaseCard.tsx
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ClaseConRelaciones } from '@/lib/actions/clases-actions'
import { cancelarClase, desasignarCoach } from '@/lib/actions/clases-actions'
import { useRouter } from 'next/navigation'

interface ClaseCardProps {
  clase: ClaseConRelaciones
}

export function ClaseCard({ clase }: ClaseCardProps) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)

  // Determinar color según estado y asignación
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

  const colorEstado = obtenerColorEstado()
  const colorDisciplina = obtenerColorDisciplina()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
    >
      {/* Gradiente hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${colorDisciplina}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          {/* Info Principal */}
          <div className="flex-1 space-y-4">
            {/* Fecha y hora */}
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-xl bg-${colorDisciplina}/10 border border-${colorDisciplina}/20`}>
                <p className={`text-${colorDisciplina} font-semibold text-sm`}>
                  {formatearHora(clase.fecha_hora)}
                </p>
              </div>
              <div>
                <p className="text-white font-medium capitalize">
                  {formatearFecha(clase.fecha_hora)}
                </p>
                <p className="text-white/60 text-sm">
                  {clase.duracion} minutos
                </p>
              </div>
            </div>

            {/* Salón y Disciplina */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-white/40 text-xs">Salón</p>
                  <p className="text-white font-medium">{clase.salon.nombre}</p>
                </div>
              </div>

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

            {/* Coach */}
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

            {/* Capacidad */}
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <p className="text-white/60 text-sm">
                {clase.reservas_count}/{clase.capacidad} reservados
              </p>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-${colorDisciplina} transition-all duration-300`}
                  style={{ width: `${(clase.reservas_count / clase.capacidad) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Estado y Acciones */}
          <div className="flex flex-col items-end gap-4">
            {/* Badge Estado */}
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

            {/* Botones */}
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
              </div>
            )}

            {clase.estado !== 'programada' && (
              <Link
                href={`/admin/clases/${clase.id}`}
                className="w-full px-4 py-2 rounded-xl text-sm font-medium text-center transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
              >
                Ver Detalles
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}