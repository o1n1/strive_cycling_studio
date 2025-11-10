'use client'

// src/components/clases/FormularioAsignarCoach.tsx
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { asignarCoachDirecto } from '@/lib/actions/clases-actions'
import type { ClaseConRelaciones } from '@/lib/actions/clases-actions'

interface Coach {
  id: string
  biografia: string | null
  especialidades: string[] | null
  total_clases_impartidas: number
  calificacion_promedio: number
  activo: boolean
  disponible_para_clases: boolean
  profiles: {
    nombre_completo: string
    foto_url: string | null
  }
}

interface Props {
  clase: ClaseConRelaciones
  coaches: Coach[]
}

export function FormularioAsignarCoach({ clase, coaches }: Props) {
  const router = useRouter()
  const [coachSeleccionado, setCoachSeleccionado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const manejarAsignar = async () => {
    if (!coachSeleccionado) {
      setError('Selecciona un coach')
      return
    }

    const coachNombre = coaches.find(c => c.id === coachSeleccionado)?.profiles.nombre_completo
    if (!confirm(`¿Asignar ${coachNombre} a esta clase?`)) {
      return
    }

    setCargando(true)
    setError(null)

    const resultado = await asignarCoachDirecto(clase.id, coachSeleccionado)

    if (resultado.success) {
      router.push('/admin/clases')
      router.refresh()
    } else {
      setError(resultado.error)
      setCargando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Info de la Clase */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">
            {clase.disciplina.tipo === 'cycling' ? '🚴' : '💪'}
          </span>
          <div className="flex-1">
            <h3 className="text-white text-xl font-semibold mb-2">
              {clase.disciplina.nombre} - {clase.salon.nombre}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>
                  {new Date(clase.fecha_hora).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span>
                  {new Date(clase.fecha_hora).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{clase.duracion} min</span>
              </div>
              {clase.especialidad && (
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>{clase.especialidad.nombre}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Lista de Coaches */}
      {coaches.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No hay coaches disponibles
          </h3>
          <p className="text-white/60 mb-6">
            No hay coaches activos y aprobados en este momento
          </p>
          <Link
            href="/admin/personal"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
          >
            Gestionar Personal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-white text-lg font-semibold">
            Selecciona un Coach ({coaches.length} disponibles)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches.map((coach) => (
              <motion.button
                key={coach.id}
                onClick={() => setCoachSeleccionado(coach.id)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                  coachSeleccionado === coach.id
                    ? 'bg-[#E84A27]/20 border-2 border-[#E84A27] shadow-lg shadow-[#E84A27]/25'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E84A27]/50'
                }`}
              >
                {/* Badge seleccionado */}
                {coachSeleccionado === coach.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#E84A27] flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Foto */}
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {coach.profiles.foto_url ? (
                      <Image
                        src={coach.profiles.foto_url}
                        alt={coach.profiles.nombre_completo}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-1">
                      {coach.profiles.nombre_completo}
                    </h4>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1 text-sm text-white/60">
                        <span>📊</span>
                        <span>{coach.total_clases_impartidas} clases</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span>⭐</span>
                        <span className={`font-medium ${
                          coach.calificacion_promedio >= 4.5 ? 'text-green-400' :
                          coach.calificacion_promedio >= 4.0 ? 'text-yellow-400' :
                          'text-white/60'
                        }`}>
                          {coach.calificacion_promedio.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Biografía */}
                    {coach.biografia && (
                      <p className="text-white/60 text-sm line-clamp-2">
                        {coach.biografia}
                      </p>
                    )}

                    {/* Especialidades */}
                    {coach.especialidades && coach.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coach.especialidades.slice(0, 3).map((esp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs"
                          >
                            {esp}
                          </span>
                        ))}
                        {coach.especialidades.length > 3 && (
                          <span className="text-white/40 text-xs">
                            +{coach.especialidades.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Botones */}
      {coaches.length > 0 && (
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/admin/clases"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            Cancelar
          </Link>
          <button
            onClick={manejarAsignar}
            disabled={!coachSeleccionado || cargando}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Asignando...' : 'Asignar Coach'}
          </button>
        </div>
      )}
    </div>
  )
}