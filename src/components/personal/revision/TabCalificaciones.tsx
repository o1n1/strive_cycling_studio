// src/components/personal/revision/TabCalificaciones.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { guardarCalificacionAdmin, obtenerCalificacionesCoach } from '@/lib/actions/calificaciones-admin-actions'
import type { CalificacionAdminCoach, DatosCalificacionAdmin } from '@/lib/types/personal.types'

interface TabCalificacionesProps {
  coachId: string
  nombreCoach: string
}

export default function TabCalificaciones({ coachId, nombreCoach }: TabCalificacionesProps) {
  const [calificaciones, setCalificaciones] = useState<CalificacionAdminCoach[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const [formData, setFormData] = useState<DatosCalificacionAdmin>({
    coach_id: coachId,
    calificacion_puntualidad: 5,
    calificacion_profesionalismo: 5,
    calificacion_energia: 5,
    calificacion_tecnica: 5,
    calificacion_liderazgo: 5,
    comentarios: '',
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    periodo_evaluacion: ''
  })

  const cargarCalificaciones = useCallback(async () => {
    try {
      setCargando(true)
      setMensaje(null)

      const resultado = await obtenerCalificacionesCoach(coachId)

      if (resultado.success) {
        setCalificaciones(resultado.data)
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al cargar calificaciones' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setCargando(false)
    }
  }, [coachId])

  useEffect(() => {
    cargarCalificaciones()
  }, [cargarCalificaciones])

  const handleGuardarCalificacion = async () => {
    try {
      setGuardando(true)
      setMensaje(null)

      const resultado = await guardarCalificacionAdmin(formData)

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: 'Calificación guardada correctamente' })
        setMostrarFormulario(false)
        setFormData({
          ...formData,
          calificacion_puntualidad: 5,
          calificacion_profesionalismo: 5,
          calificacion_energia: 5,
          calificacion_tecnica: 5,
          calificacion_liderazgo: 5,
          comentarios: '',
          periodo_evaluacion: ''
        })
        cargarCalificaciones()
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al guardar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setGuardando(false)
    }
  }

  const promedioGeneral = calificaciones.length > 0
    ? (calificaciones.reduce((sum, cal) => sum + cal.calificacion_promedio, 0) / calificaciones.length).toFixed(1)
    : '5.0'

  const categorias: { key: keyof DatosCalificacionAdmin; label: string; icon: string }[] = [
    { key: 'calificacion_puntualidad', label: 'Puntualidad', icon: '⏰' },
    { key: 'calificacion_profesionalismo', label: 'Profesionalismo', icon: '👔' },
    { key: 'calificacion_energia', label: 'Energía', icon: '⚡' },
    { key: 'calificacion_tecnica', label: 'Técnica', icon: '🎯' },
    { key: 'calificacion_liderazgo', label: 'Liderazgo', icon: '👑' }
  ]

  const renderEstrellas = (value: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={`text-2xl transition-all duration-200 ${
              star <= value
                ? 'text-yellow-400 scale-110'
                : 'text-white/20 hover:text-white/40'
            } ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#E84A27] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Cargando calificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          className={`
            p-4 rounded-xl border backdrop-blur-xl
            ${mensaje.tipo === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
            }
          `}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-white/40 text-sm mb-1">Promedio General</p>
            <p className="text-3xl font-bold text-white">{promedioGeneral}</p>
            <p className="text-white/60 text-xs mt-1">de 5.0</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white/40 text-sm mb-1">Evaluaciones Totales</p>
            <p className="text-3xl font-bold text-white">{calificaciones.length}</p>
            <p className="text-white/60 text-xs mt-1">realizadas</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-white/40 text-sm mb-1">Última Evaluación</p>
            <p className="text-xl font-bold text-white">
              {calificaciones[0]
                ? new Date(calificaciones[0].fecha_evaluacion).toLocaleDateString('es-MX')
                : 'Sin evaluar'}
            </p>
          </div>
        </div>
      </div>

      {/* Botón nueva evaluación */}
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="px-6 py-2.5 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all duration-300"
        >
          {mostrarFormulario ? '✕ Cancelar' : '+ Nueva Evaluación'}
        </button>
      </div>

      {/* Formulario nueva evaluación */}
      {mostrarFormulario && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Nueva Evaluación para {nombreCoach}</h3>

          <div className="space-y-6">
            {/* Fecha y período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Fecha de Evaluación</label>
                <input
                  type="date"
                  value={formData.fecha_evaluacion}
                  onChange={(e) => setFormData({ ...formData, fecha_evaluacion: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E84A27]/50"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Período (opcional)</label>
                <input
                  type="text"
                  value={formData.periodo_evaluacion || ''}
                  onChange={(e) => setFormData({ ...formData, periodo_evaluacion: e.target.value })}
                  placeholder="Ej: Q1 2024, Enero 2024, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#E84A27]/50"
                />
              </div>
            </div>

            {/* Calificaciones por categoría */}
            <div className="space-y-4">
              {categorias.map((cat) => (
                <div
                  key={cat.key}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-white font-medium">{cat.label}</span>
                    </div>
                    <span className="text-white/40 text-sm">
                      {formData[cat.key as keyof DatosCalificacionAdmin]}/5
                    </span>
                  </div>
                  {renderEstrellas(
                    formData[cat.key as keyof DatosCalificacionAdmin] as number,
                    (value) => setFormData({ ...formData, [cat.key]: value })
                  )}
                </div>
              ))}
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-white/60 text-sm mb-2">Comentarios (opcional)</label>
              <textarea
                value={formData.comentarios || ''}
                onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#E84A27]/50 resize-none"
                placeholder="Agrega comentarios sobre el desempeño del coach..."
              />
            </div>

            {/* Botón guardar */}
            <button
              onClick={handleGuardarCalificacion}
              disabled={guardando}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all duration-300 disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar Evaluación'}
            </button>
          </div>
        </div>
      )}

      {/* Historial de calificaciones */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Historial de Evaluaciones</h3>

        {calificaciones.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h4 className="text-lg font-semibold text-white mb-2">Sin evaluaciones</h4>
            <p className="text-white/60">Este coach aún no tiene evaluaciones registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calificaciones.map((cal) => (
              <div
                key={cal.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-medium mb-1">
                      {new Date(cal.fecha_evaluacion).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {cal.periodo_evaluacion && (
                      <p className="text-white/40 text-sm">{cal.periodo_evaluacion}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{cal.calificacion_promedio.toFixed(1)}</p>
                    <p className="text-white/40 text-xs">Promedio</p>
                  </div>
                </div>

                {/* Desglose por categoría */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-white/40 text-xs mb-1">⏰ Puntualidad</p>
                    <p className="text-white font-medium">{cal.calificacion_puntualidad}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-xs mb-1">👔 Profesionalismo</p>
                    <p className="text-white font-medium">{cal.calificacion_profesionalismo}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-xs mb-1">⚡ Energía</p>
                    <p className="text-white font-medium">{cal.calificacion_energia}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-xs mb-1">🎯 Técnica</p>
                    <p className="text-white font-medium">{cal.calificacion_tecnica}/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/40 text-xs mb-1">👑 Liderazgo</p>
                    <p className="text-white font-medium">{cal.calificacion_liderazgo}/5</p>
                  </div>
                </div>

                {/* Comentarios */}
                {cal.comentarios && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white/40 text-xs mb-1">Comentarios:</p>
                    <p className="text-white/80 text-sm">{cal.comentarios}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}