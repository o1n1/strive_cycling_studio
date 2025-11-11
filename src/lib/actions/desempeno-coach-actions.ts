// src/lib/actions/desempeno-coach-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { MetricasDesempenoCoach, RespuestaAction } from '@/lib/types/personal.types'

/**
 * Obtener métricas completas de desempeño de un coach
 * @param coachId - ID del coach
 * @param fechaInicio - Fecha inicio del período (ISO string)
 * @param fechaFin - Fecha fin del período (ISO string)
 */
export async function obtenerMetricasDesempeno(
  coachId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<RespuestaAction<MetricasDesempenoCoach>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verificar que el coach existe
    const { data: coach } = await supabase
      .from('coaches')
      .select('id, estado')
      .eq('id', coachId)
      .single()

    if (!coach) {
      return { success: false, error: 'Coach no encontrado' }
    }

    // 1. Total de clases impartidas en el período
    const { data: clasesImpartidas, error: errorClases } = await supabase
      .from('clases')
      .select('id, capacidad, reservas_count, fecha_hora, estado')
      .eq('coach_id', coachId)
      .gte('fecha_hora', fechaInicio)
      .lte('fecha_hora', fechaFin)
      .in('estado', ['completada', 'en_curso'])

    if (errorClases) {
      console.error('Error al obtener clases:', errorClases)
    }

    const totalClasesImpartidas = clasesImpartidas?.length || 0

    // 2. Promedio de asistencia (% ocupación)
    let promedioAsistencia = 0
    if (clasesImpartidas && clasesImpartidas.length > 0) {
      const porcentajes = clasesImpartidas.map((clase) => {
        if (clase.capacidad === 0) return 0
        return (clase.reservas_count / clase.capacidad) * 100
      })
      promedioAsistencia =
        porcentajes.reduce((sum, p) => sum + p, 0) / porcentajes.length
    }

    // 3. Calificación promedio de clientes
    const { data: calificacionesClientes } = await supabase
      .from('calificaciones')
      .select('calificacion')
      .eq('coach_id', coachId)
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin)

    let calificacionPromedioClientes = 5
    if (calificacionesClientes && calificacionesClientes.length > 0) {
      calificacionPromedioClientes =
        calificacionesClientes.reduce((sum, cal) => sum + cal.calificacion, 0) /
        calificacionesClientes.length
    }

    // 4. Calificación promedio admin en el período
    const { data: calificacionesAdmin } = await supabase
      .from('calificaciones_admin_coaches')
      .select('calificacion_promedio')
      .eq('coach_id', coachId)
      .gte('fecha_evaluacion', fechaInicio.split('T')[0])
      .lte('fecha_evaluacion', fechaFin.split('T')[0])

    let calificacionPromedioAdmin = 5
    if (calificacionesAdmin && calificacionesAdmin.length > 0) {
      calificacionPromedioAdmin =
        calificacionesAdmin.reduce((sum, cal) => sum + cal.calificacion_promedio, 0) /
        calificacionesAdmin.length
    }

    // 5. No-shows en sus clases
    const { count: totalNoShows } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'no_show')
      .in(
        'clase_id',
        clasesImpartidas?.map((c) => c.id) || []
      )

    // 6. Solicitudes de clases
    const { data: solicitudes } = await supabase
      .from('solicitudes_clases')
      .select('estado')
      .eq('coach_id', coachId)
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin)

    const solicitudesAceptadas =
      solicitudes?.filter((s) => s.estado === 'aprobado').length || 0
    const solicitudesRechazadas =
      solicitudes?.filter((s) => s.estado === 'rechazado').length || 0

    // 7. Puntualidad (esto requeriría registros de llegada)
    // Por ahora dejamos valores por defecto
    // TODO: Implementar sistema de check-in para coaches
    const llegadasTarde = 0
    const llegadasATiempo = totalClasesImpartidas

    const metricas: MetricasDesempenoCoach = {
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      total_clases_impartidas: totalClasesImpartidas,
      promedio_asistencia: Number(promedioAsistencia.toFixed(2)),
      calificacion_promedio_clientes: Number(calificacionPromedioClientes.toFixed(2)),
      calificacion_promedio_admin: Number(calificacionPromedioAdmin.toFixed(2)),
      total_no_shows: totalNoShows || 0,
      solicitudes_aceptadas: solicitudesAceptadas,
      solicitudes_rechazadas: solicitudesRechazadas,
      llegadas_tarde: llegadasTarde,
      llegadas_a_tiempo: llegadasATiempo
    }

    return { success: true, data: metricas }
  } catch (error) {
    console.error('Error en obtenerMetricasDesempeno:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener evolución de métricas mes a mes
 * @param coachId - ID del coach
 * @param mesesAtras - Número de meses hacia atrás
 */
export async function obtenerEvolucionMetricas(coachId: string, mesesAtras: number = 6) {
  try {
    const metricas = []
    const hoy = new Date()

    for (let i = mesesAtras - 1; i >= 0; i--) {
      // Calcular inicio y fin del mes
      const mesActual = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const mesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 1)

      const fechaInicio = mesActual.toISOString()
      const fechaFin = mesSiguiente.toISOString()

      // Obtener métricas del mes
      const resultado = await obtenerMetricasDesempeno(coachId, fechaInicio, fechaFin)

      if (resultado.success && resultado.data) {
        metricas.push({
          mes: mesActual.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }),
          ...resultado.data
        })
      }
    }

    return { success: true, data: metricas }
  } catch (error) {
    console.error('Error en obtenerEvolucionMetricas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener métricas comparativas con otros coaches
 * @param coachId - ID del coach
 * @param fechaInicio - Fecha inicio del período
 * @param fechaFin - Fecha fin del período
 */
export async function obtenerMetricasComparativas(
  coachId: string,
  fechaInicio: string,
  fechaFin: string
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener métricas del coach
    const metricasCoach = await obtenerMetricasDesempeno(coachId, fechaInicio, fechaFin)
    if (!metricasCoach.success || !metricasCoach.data) {
      return { success: false, error: 'Error al obtener métricas del coach' }
    }

    // Obtener todos los coaches activos
    const { data: coaches } = await supabase
      .from('coaches')
      .select('id')
      .eq('estado', 'aprobado')
      .eq('activo', true)
      .neq('id', coachId)

    if (!coaches || coaches.length === 0) {
      return {
        success: true,
        data: {
          ...metricasCoach.data,
          comparacion: null
        }
      }
    }

    // Obtener métricas promedio de otros coaches
    let totalClasesOtros = 0
    let totalAsistenciaOtros = 0
    let totalCalificacionOtros = 0
    let contadores = 0

    for (const coach of coaches) {
      const metricas = await obtenerMetricasDesempeno(coach.id, fechaInicio, fechaFin)
      if (metricas.success && metricas.data) {
        totalClasesOtros += metricas.data.total_clases_impartidas
        totalAsistenciaOtros += metricas.data.promedio_asistencia
        totalCalificacionOtros += metricas.data.calificacion_promedio_clientes
        contadores++
      }
    }

    if (contadores === 0) {
      return {
        success: true,
        data: {
          ...metricasCoach.data,
          comparacion: null
        }
      }
    }

    const promediosOtros = {
      clases: totalClasesOtros / contadores,
      asistencia: totalAsistenciaOtros / contadores,
      calificacion: totalCalificacionOtros / contadores
    }

    return {
      success: true,
      data: {
        ...metricasCoach.data,
        comparacion: {
          promedio_clases_otros: Number(promediosOtros.clases.toFixed(1)),
          promedio_asistencia_otros: Number(promediosOtros.asistencia.toFixed(2)),
          promedio_calificacion_otros: Number(promediosOtros.calificacion.toFixed(2)),
          diferencia_clases: Number(
            (
              metricasCoach.data.total_clases_impartidas - promediosOtros.clases
            ).toFixed(1)
          ),
          diferencia_asistencia: Number(
            (metricasCoach.data.promedio_asistencia - promediosOtros.asistencia).toFixed(2)
          ),
          diferencia_calificacion: Number(
            (
              metricasCoach.data.calificacion_promedio_clientes -
              promediosOtros.calificacion
            ).toFixed(2)
          )
        }
      }
    }
  } catch (error) {
    console.error('Error en obtenerMetricasComparativas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener clases próximas del coach
 * @param coachId - ID del coach
 * @param limite - Número de clases a obtener (default: 5)
 */
export async function obtenerClasesProximas(coachId: string, limite: number = 5) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('clases')
      .select(
        `
        *,
        salon:salones(nombre),
        disciplina:disciplinas(nombre),
        especialidad:especialidades(nombre)
      `
      )
      .eq('coach_id', coachId)
      .gte('fecha_hora', new Date().toISOString())
      .in('estado', ['programada', 'en_curso'])
      .order('fecha_hora', { ascending: true })
      .limit(limite)

    if (error) {
      console.error('Error al obtener clases próximas:', error)
      return { success: false, error: 'Error al obtener clases' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error en obtenerClasesProximas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener historial de clases del coach
 * @param coachId - ID del coach
 * @param fechaInicio - Fecha inicio del período
 * @param fechaFin - Fecha fin del período
 * @param limite - Número máximo de clases (default: 50)
 */
export async function obtenerHistorialClases(
  coachId: string,
  fechaInicio: string,
  fechaFin: string,
  limite: number = 50
) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('clases')
      .select(
        `
        *,
        salon:salones(nombre),
        disciplina:disciplinas(nombre),
        especialidad:especialidades(nombre)
      `
      )
      .eq('coach_id', coachId)
      .gte('fecha_hora', fechaInicio)
      .lte('fecha_hora', fechaFin)
      .eq('estado', 'completada')
      .order('fecha_hora', { ascending: false })
      .limit(limite)

    if (error) {
      console.error('Error al obtener historial:', error)
      return { success: false, error: 'Error al obtener historial' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error en obtenerHistorialClases:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}