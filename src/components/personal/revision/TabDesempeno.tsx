// src/components/personal/revision/TabDesempeno.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { obtenerMetricasDesempeno } from '@/lib/actions/desempeno-coach-actions'
import type { MetricasDesempenoCoach } from '@/lib/types/personal.types'

interface TabDesempenoProps {
  coachId: string
}

export default function TabDesempeno({ coachId }: TabDesempenoProps) {
  const [metricas, setMetricas] = useState<MetricasDesempenoCoach | null>(null)
  const [cargando, setCargando] = useState(true)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mes' | 'trimestre' | 'año'>('mes')
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const cargarMetricas = useCallback(async () => {
    try {
      setCargando(true)
      setMensaje(null)

      const ahora = new Date()
      const fechaFin = ahora.toISOString()
      let fechaInicio: string

      switch (periodoSeleccionado) {
        case 'mes':
          const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
          fechaInicio = inicioMes.toISOString()
          break
        case 'trimestre':
          const inicioTrimestre = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1)
          fechaInicio = inicioTrimestre.toISOString()
          break
        case 'año':
          const inicioAño = new Date(ahora.getFullYear(), 0, 1)
          fechaInicio = inicioAño.toISOString()
          break
      }

      const resultado = await obtenerMetricasDesempeno(coachId, fechaInicio, fechaFin)

      if (resultado.success) {
        setMetricas(resultado.data)
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al cargar métricas' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setCargando(false)
    }
  }, [coachId, periodoSeleccionado])

  useEffect(() => {
    cargarMetricas()
  }, [cargarMetricas])

  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-green-400'
    if (porcentaje >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getColorCalificacion = (calificacion: number) => {
    if (calificacion >= 4.5) return 'text-green-400'
    if (calificacion >= 3.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#E84A27] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Cargando métricas de desempeño...</p>
        </div>
      </div>
    )
  }

  if (!metricas) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white mb-2">Sin datos</h3>
        <p className="text-white/60">No hay métricas disponibles para este período</p>
      </div>
    )
  }

  const tasaPuntualidad =
    metricas.llegadas_a_tiempo + metricas.llegadas_tarde > 0
      ? (metricas.llegadas_a_tiempo / (metricas.llegadas_a_tiempo + metricas.llegadas_tarde)) * 100
      : 100

  const tasaAceptacion =
    metricas.solicitudes_aceptadas + metricas.solicitudes_rechazadas > 0
      ? (metricas.solicitudes_aceptadas / (metricas.solicitudes_aceptadas + metricas.solicitudes_rechazadas)) * 100
      : 0

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

      {/* Selector de período */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Métricas de Desempeño</h3>
        <div className="flex gap-2">
          {(['mes', 'trimestre', 'año'] as const).map((periodo) => (
            <button
              key={periodo}
              onClick={() => setPeriodoSeleccionado(periodo)}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all duration-300 capitalize
                ${periodoSeleccionado === periodo
                  ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                  : 'bg-white/5 text-white/60 hover:text-white'
                }
              `}
            >
              {periodo === 'mes' ? 'Mes Actual' : periodo === 'trimestre' ? 'Último Trimestre' : 'Este Año'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Clases impartidas */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎓</div>
            <p className="text-white/40 text-sm mb-1">Clases Impartidas</p>
            <p className="text-3xl font-bold text-white">{metricas.total_clases_impartidas}</p>
          </div>
        </div>

        {/* Promedio asistencia */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-white/40 text-sm mb-1">Promedio Asistencia</p>
            <p className={`text-3xl font-bold ${getColorPorcentaje(metricas.promedio_asistencia)}`}>
              {metricas.promedio_asistencia.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Calificación clientes */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <p className="text-white/40 text-sm mb-1">Calificación Clientes</p>
            <p className={`text-3xl font-bold ${getColorCalificacion(metricas.calificacion_promedio_clientes)}`}>
              {metricas.calificacion_promedio_clientes.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Calificación admin */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-white/40 text-sm mb-1">Calificación Admin</p>
            <p className={`text-3xl font-bold ${getColorCalificacion(metricas.calificacion_promedio_admin)}`}>
              {metricas.calificacion_promedio_admin.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Puntualidad */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Puntualidad</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Llegadas a tiempo</span>
              <span className="text-white font-medium">{metricas.llegadas_a_tiempo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Llegadas tarde</span>
              <span className="text-white font-medium">{metricas.llegadas_tarde}</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Tasa de Puntualidad</span>
                <span className={`text-xl font-bold ${getColorPorcentaje(tasaPuntualidad)}`}>
                  {tasaPuntualidad.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-[#E84A27] to-[#FF6B35] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${tasaPuntualidad}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Solicitudes de clases */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Solicitudes de Clases</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Aceptadas</span>
              <span className="text-green-400 font-medium">{metricas.solicitudes_aceptadas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Rechazadas</span>
              <span className="text-red-400 font-medium">{metricas.solicitudes_rechazadas}</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Tasa de Aceptación</span>
                <span className={`text-xl font-bold ${getColorPorcentaje(tasaAceptacion)}`}>
                  {tasaAceptacion.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${tasaAceptacion}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asistencia */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Asistencia a Clases</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-white/40 text-sm mb-2">Promedio de Asistencia</p>
            <p className={`text-4xl font-bold ${getColorPorcentaje(metricas.promedio_asistencia)}`}>
              {metricas.promedio_asistencia.toFixed(0)}%
            </p>
            <div className="w-full bg-white/10 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-[#E84A27] to-[#FF6B35] h-2 rounded-full transition-all duration-500"
                style={{ width: `${metricas.promedio_asistencia}%` }}
              />
            </div>
          </div>

          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-white/40 text-sm mb-2">Total No-Shows</p>
            <p className="text-4xl font-bold text-red-400">{metricas.total_no_shows}</p>
            <p className="text-white/60 text-xs mt-2">en sus clases</p>
          </div>

          <div className="text-center p-4 bg-white/5 rounded-xl">
            <p className="text-white/40 text-sm mb-2">Clases Impartidas</p>
            <p className="text-4xl font-bold text-white">{metricas.total_clases_impartidas}</p>
            <p className="text-white/60 text-xs mt-2">en este período</p>
          </div>
        </div>
      </div>

      {/* Comparativa de calificaciones */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Comparativa de Calificaciones</h4>
        <div className="space-y-6">
          {/* Calificación de clientes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">Calificación de Clientes</span>
              <span className={`text-2xl font-bold ${getColorCalificacion(metricas.calificacion_promedio_clientes)}`}>
                {metricas.calificacion_promedio_clientes.toFixed(1)}/5
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(metricas.calificacion_promedio_clientes / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Calificación de admin */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">Calificación de Administración</span>
              <span className={`text-2xl font-bold ${getColorCalificacion(metricas.calificacion_promedio_admin)}`}>
                {metricas.calificacion_promedio_admin.toFixed(1)}/5
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#E84A27] to-[#FF6B35] h-3 rounded-full transition-all duration-500"
                style={{ width: `${(metricas.calificacion_promedio_admin / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Promedio general */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Promedio General</span>
              <span className={`text-3xl font-bold ${getColorCalificacion((metricas.calificacion_promedio_clientes + metricas.calificacion_promedio_admin) / 2)}`}>
                {((metricas.calificacion_promedio_clientes + metricas.calificacion_promedio_admin) / 2).toFixed(1)}/5
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((metricas.calificacion_promedio_clientes + metricas.calificacion_promedio_admin) / 2 / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del período */}
      <div className="bg-gradient-to-br from-[#E84A27]/10 to-[#FF6B35]/10 backdrop-blur-xl border border-[#E84A27]/30 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Resumen del Período</h4>
        <div className="space-y-3 text-sm">
          <p className="text-white/80">
            📅 <span className="font-medium">Período evaluado:</span>{' '}
            {new Date(metricas.periodo.inicio).toLocaleDateString('es-MX')} -{' '}
            {new Date(metricas.periodo.fin).toLocaleDateString('es-MX')}
          </p>
          <p className="text-white/80">
            🎓 <span className="font-medium">Total de clases:</span> {metricas.total_clases_impartidas}
          </p>
          <p className="text-white/80">
            👥 <span className="font-medium">Asistencia promedio:</span> {metricas.promedio_asistencia.toFixed(0)}%
          </p>
          <p className="text-white/80">
            ⭐ <span className="font-medium">Calificación general:</span>{' '}
            {((metricas.calificacion_promedio_clientes + metricas.calificacion_promedio_admin) / 2).toFixed(1)}/5
          </p>
          <p className="text-white/80">
            ⏰ <span className="font-medium">Puntualidad:</span> {tasaPuntualidad.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  )
}