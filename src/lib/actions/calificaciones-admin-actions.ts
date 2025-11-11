// src/lib/actions/calificaciones-admin-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  CalificacionAdminCoach,
  DatosCalificacionAdmin,
  RespuestaAction
} from '@/lib/types/personal.types'

// ============== CREAR Y ACTUALIZAR CALIFICACIONES ==============

/**
 * Crear o actualizar calificación de admin a coach
 */
export async function guardarCalificacionAdmin(
  datos: DatosCalificacionAdmin
): Promise<RespuestaAction<CalificacionAdminCoach>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verificar que el usuario es admin
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // Validar calificaciones (1-5)
    const calificaciones = [
      datos.calificacion_puntualidad,
      datos.calificacion_profesionalismo,
      datos.calificacion_energia,
      datos.calificacion_tecnica,
      datos.calificacion_liderazgo
    ]

    if (calificaciones.some((cal) => cal < 1 || cal > 5)) {
      return {
        success: false,
        error: 'Las calificaciones deben estar entre 1 y 5'
      }
    }

    // Verificar que el coach existe y está aprobado
    const { data: coach } = await supabase
      .from('coaches')
      .select('id, estado')
      .eq('id', datos.coach_id)
      .single()

    if (!coach) {
      return { success: false, error: 'Coach no encontrado' }
    }

    if (coach.estado !== 'aprobado') {
      return {
        success: false,
        error: 'Solo se pueden calificar coaches aprobados'
      }
    }

    // Verificar si ya existe una calificación para este período
    const { data: calificacionExistente } = await supabase
      .from('calificaciones_admin_coaches')
      .select('id')
      .eq('coach_id', datos.coach_id)
      .eq('fecha_evaluacion', datos.fecha_evaluacion)
      .eq('periodo_evaluacion', datos.periodo_evaluacion || '')
      .single()

    let resultado

    if (calificacionExistente) {
      // Actualizar calificación existente
      const { data, error } = await supabase
        .from('calificaciones_admin_coaches')
        .update({
          calificacion_puntualidad: datos.calificacion_puntualidad,
          calificacion_profesionalismo: datos.calificacion_profesionalismo,
          calificacion_energia: datos.calificacion_energia,
          calificacion_tecnica: datos.calificacion_tecnica,
          calificacion_liderazgo: datos.calificacion_liderazgo,
          comentarios: datos.comentarios || null
        })
        .eq('id', calificacionExistente.id)
        .select()
        .single()

      if (error) {
        console.error('Error al actualizar calificación:', error)
        return { success: false, error: 'Error al actualizar calificación' }
      }

      resultado = data
    } else {
      // Crear nueva calificación
      const { data, error } = await supabase
        .from('calificaciones_admin_coaches')
        .insert({
          coach_id: datos.coach_id,
          admin_id: user.id,
          calificacion_puntualidad: datos.calificacion_puntualidad,
          calificacion_profesionalismo: datos.calificacion_profesionalismo,
          calificacion_energia: datos.calificacion_energia,
          calificacion_tecnica: datos.calificacion_tecnica,
          calificacion_liderazgo: datos.calificacion_liderazgo,
          comentarios: datos.comentarios || null,
          fecha_evaluacion: datos.fecha_evaluacion,
          periodo_evaluacion: datos.periodo_evaluacion || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error al crear calificación:', error)
        return { success: false, error: 'Error al crear calificación' }
      }

      resultado = data
    }

    // Actualizar calificación promedio del coach en la tabla coaches
    const { data: todasCalificaciones } = await supabase
      .from('calificaciones_admin_coaches')
      .select('calificacion_promedio')
      .eq('coach_id', datos.coach_id)

    if (todasCalificaciones && todasCalificaciones.length > 0) {
      const promedioTotal =
        todasCalificaciones.reduce((sum, cal) => sum + cal.calificacion_promedio, 0) /
        todasCalificaciones.length

      await supabase
        .from('coaches')
        .update({ calificacion_promedio: promedioTotal.toFixed(2) })
        .eq('id', datos.coach_id)
    }

    // Notificar al coach
    await supabase.from('notificaciones').insert({
      destinatario_id: datos.coach_id,
      tipo: 'nueva_calificacion_admin',
      titulo: 'Nueva evaluación de desempeño',
      mensaje: `Has recibido una nueva evaluación de desempeño con un promedio de ${resultado.calificacion_promedio.toFixed(1)} estrellas.`,
      icono: '⭐',
      url_accion: '/coach/perfil#calificaciones'
    })

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${datos.coach_id}`)
    revalidatePath('/coach/perfil')
    return {
      success: true,
      data: resultado as CalificacionAdminCoach,
      mensaje: calificacionExistente
        ? 'Calificación actualizada correctamente'
        : 'Calificación guardada correctamente'
    }
  } catch (error) {
    console.error('Error en guardarCalificacionAdmin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== OBTENER CALIFICACIONES ==============

/**
 * Obtener todas las calificaciones de un coach
 */
export async function obtenerCalificacionesCoach(
  coachId: string
): Promise<RespuestaAction<CalificacionAdminCoach[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('calificaciones_admin_coaches')
      .select(
        `
        *,
        admin:profiles!calificaciones_admin_coaches_admin_id_fkey(
          nombre_completo,
          foto_url
        )
      `
      )
      .eq('coach_id', coachId)
      .order('fecha_evaluacion', { ascending: false })

    if (error) {
      console.error('Error al obtener calificaciones:', error)
      return { success: false, error: 'Error al obtener calificaciones' }
    }

    return { success: true, data: data as CalificacionAdminCoach[] }
  } catch (error) {
    console.error('Error en obtenerCalificacionesCoach:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener promedios por categoría de un coach
 */
export async function obtenerPromediosPorCategoria(coachId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: calificaciones, error } = await supabase
      .from('calificaciones_admin_coaches')
      .select(
        `
        calificacion_puntualidad,
        calificacion_profesionalismo,
        calificacion_energia,
        calificacion_tecnica,
        calificacion_liderazgo
      `
      )
      .eq('coach_id', coachId)

    if (error || !calificaciones || calificaciones.length === 0) {
      return {
        success: true,
        data: {
          puntualidad: 0,
          profesionalismo: 0,
          energia: 0,
          tecnica: 0,
          liderazgo: 0,
          promedio_general: 0,
          total_evaluaciones: 0
        }
      }
    }

    const n = calificaciones.length
    const promedios = {
      puntualidad:
        calificaciones.reduce((sum, c) => sum + c.calificacion_puntualidad, 0) / n,
      profesionalismo:
        calificaciones.reduce((sum, c) => sum + c.calificacion_profesionalismo, 0) / n,
      energia: calificaciones.reduce((sum, c) => sum + c.calificacion_energia, 0) / n,
      tecnica: calificaciones.reduce((sum, c) => sum + c.calificacion_tecnica, 0) / n,
      liderazgo:
        calificaciones.reduce((sum, c) => sum + c.calificacion_liderazgo, 0) / n
    }

    const promedio_general =
      (promedios.puntualidad +
        promedios.profesionalismo +
        promedios.energia +
        promedios.tecnica +
        promedios.liderazgo) /
      5

    return {
      success: true,
      data: {
        puntualidad: Number(promedios.puntualidad.toFixed(2)),
        profesionalismo: Number(promedios.profesionalismo.toFixed(2)),
        energia: Number(promedios.energia.toFixed(2)),
        tecnica: Number(promedios.tecnica.toFixed(2)),
        liderazgo: Number(promedios.liderazgo.toFixed(2)),
        promedio_general: Number(promedio_general.toFixed(2)),
        total_evaluaciones: n
      }
    }
  } catch (error) {
    console.error('Error en obtenerPromediosPorCategoria:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener historial de calificaciones por período
 */
export async function obtenerHistorialCalificaciones(
  coachId: string,
  periodos: number = 6
) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('calificaciones_admin_coaches')
      .select('fecha_evaluacion, calificacion_promedio, periodo_evaluacion')
      .eq('coach_id', coachId)
      .order('fecha_evaluacion', { ascending: true })
      .limit(periodos)

    if (error) {
      console.error('Error al obtener historial:', error)
      return { success: false, error: 'Error al obtener historial' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error en obtenerHistorialCalificaciones:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Eliminar calificación
 */
export async function eliminarCalificacion(
  calificacionId: string
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verificar que el usuario es admin
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // Obtener info antes de eliminar
    const { data: calificacion } = await supabase
      .from('calificaciones_admin_coaches')
      .select('coach_id')
      .eq('id', calificacionId)
      .single()

    // Eliminar calificación
    const { error } = await supabase
      .from('calificaciones_admin_coaches')
      .delete()
      .eq('id', calificacionId)

    if (error) {
      console.error('Error al eliminar calificación:', error)
      return { success: false, error: 'Error al eliminar calificación' }
    }

    // Recalcular promedio del coach
    if (calificacion?.coach_id) {
      const { data: calificacionesRestantes } = await supabase
        .from('calificaciones_admin_coaches')
        .select('calificacion_promedio')
        .eq('coach_id', calificacion.coach_id)

      if (calificacionesRestantes && calificacionesRestantes.length > 0) {
        const nuevoPromedio =
          calificacionesRestantes.reduce(
            (sum, cal) => sum + cal.calificacion_promedio,
            0
          ) / calificacionesRestantes.length

        await supabase
          .from('coaches')
          .update({ calificacion_promedio: nuevoPromedio.toFixed(2) })
          .eq('id', calificacion.coach_id)
      } else {
        // Si no quedan calificaciones, resetear a 5
        await supabase
          .from('coaches')
          .update({ calificacion_promedio: 5.0 })
          .eq('id', calificacion.coach_id)
      }

      revalidatePath('/admin/personal')
      revalidatePath(`/admin/personal/${calificacion.coach_id}`)
    }

    return { success: true, data: undefined, mensaje: 'Calificación eliminada' }
  } catch (error) {
    console.error('Error en eliminarCalificacion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Comparar coach con otros coaches (opcional para reporte)
 */
export async function compararConOtrosCoaches(coachId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener promedio del coach
    const promediosCoach = await obtenerPromediosPorCategoria(coachId)
    if (!promediosCoach.success || !promediosCoach.data) {
      return { success: false, error: 'Error al obtener datos del coach' }
    }

    // Obtener promedios de todos los coaches activos
    const { data: todosCoaches } = await supabase
      .from('coaches')
      .select('id, calificacion_promedio')
      .eq('estado', 'aprobado')
      .eq('activo', true)
      .neq('id', coachId)

    if (!todosCoaches || todosCoaches.length === 0) {
      return {
        success: true,
        data: {
          ...promediosCoach.data,
          ranking: 1,
          total_coaches: 1,
          percentil: 100
        }
      }
    }

    // Calcular ranking
    const calificaciones = todosCoaches
      .map((c) => c.calificacion_promedio)
      .sort((a, b) => b - a)

    const miCalificacion = promediosCoach.data.promedio_general
    const ranking = calificaciones.filter((cal) => cal > miCalificacion).length + 1
    const percentil = ((todosCoaches.length - ranking + 1) / (todosCoaches.length + 1)) * 100

    return {
      success: true,
      data: {
        ...promediosCoach.data,
        ranking,
        total_coaches: todosCoaches.length + 1,
        percentil: Math.round(percentil)
      }
    }
  } catch (error) {
    console.error('Error en compararConOtrosCoaches:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}