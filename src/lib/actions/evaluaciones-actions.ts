// src/lib/actions/evaluaciones-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DatosCalificacionAdmin, RespuestaAction } from '@/lib/types/personal.types'

export async function crearCalificacionCoach(
  datos: DatosCalificacionAdmin
): Promise<RespuestaAction> {
  try {
    const supabase = await createServerSupabaseClient()

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

    // Calcular promedio
    const promedio =
      (datos.calificacion_puntualidad +
        datos.calificacion_profesionalismo +
        datos.calificacion_energia +
        datos.calificacion_tecnica +
        datos.calificacion_liderazgo) /
      5

    // Crear calificación
    const { data: calificacion, error } = await supabase
      .from('calificaciones_admin_coaches')
      .insert({
        coach_id: datos.coach_id,
        admin_id: user.id,
        calificacion_puntualidad: datos.calificacion_puntualidad,
        calificacion_profesionalismo: datos.calificacion_profesionalismo,
        calificacion_energia: datos.calificacion_energia,
        calificacion_tecnica: datos.calificacion_tecnica,
        calificacion_liderazgo: datos.calificacion_liderazgo,
        calificacion_promedio: promedio,
        comentarios: datos.comentarios || null,
        fecha_evaluacion: new Date().toISOString(),
        periodo_evaluacion: datos.periodo_evaluacion || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error al crear calificación:', error)
      return { success: false, error: 'Error al crear calificación' }
    }

    // Actualizar calificación promedio del coach
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
        .update({ calificacion_promedio: promedioTotal })
        .eq('id', datos.coach_id)
    }

    // Notificar coach
    await supabase.from('notificaciones').insert({
      destinatario_id: datos.coach_id,
      tipo: 'evaluacion_recibida',
      titulo: 'Nueva evaluación',
      mensaje: `Has recibido una evaluación. Promedio: ${promedio.toFixed(1)}/5`,
      icono: '⭐'
    })

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${datos.coach_id}`)
    return { success: true, data: calificacion, mensaje: 'Evaluación creada correctamente' }
  } catch (error) {
    console.error('Error en crearCalificacionCoach:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function obtenerCalificacionesCoach(
  coachId: string
): Promise<RespuestaAction> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: calificaciones, error } = await supabase
      .from('calificaciones_admin_coaches')
      .select(
        `
        *,
        admin:profiles!calificaciones_admin_coaches_admin_id_fkey(nombre_completo)
      `
      )
      .eq('coach_id', coachId)
      .order('fecha_evaluacion', { ascending: false })

    if (error) {
      console.error('Error al obtener calificaciones:', error)
      return { success: false, error: 'Error al obtener calificaciones' }
    }

    return { success: true, data: calificaciones }
  } catch (error) {
    console.error('Error en obtenerCalificacionesCoach:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export async function obtenerMetricasCoach(coachId: string): Promise<RespuestaAction> {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener coach
    const { data: coach } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', coachId)
      .single()

    if (!coach) {
      return { success: false, error: 'Coach no encontrado' }
    }

    // Obtener clases impartidas
    const { count: totalClases } = await supabase
      .from('clases')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('estado', 'completada')

    // Obtener calificaciones de clientes
    const { data: calificacionesClientes } = await supabase
      .from('calificaciones')
      .select('calificacion')
      .eq('coach_id', coachId)

    const promedioClientes =
      calificacionesClientes && calificacionesClientes.length > 0
        ? calificacionesClientes.reduce((sum, cal) => sum + cal.calificacion, 0) /
          calificacionesClientes.length
        : 0

    // Obtener solicitudes
    const { count: solicitudesAceptadas } = await supabase
      .from('solicitudes_clases')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('estado', 'aprobado')

    const { count: solicitudesRechazadas } = await supabase
      .from('solicitudes_clases')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coachId)
      .eq('estado', 'rechazado')

    return {
      success: true,
      data: {
        total_clases_impartidas: totalClases || 0,
        calificacion_promedio_clientes: Number(promedioClientes.toFixed(2)),
        calificacion_promedio_admin: coach.calificacion_promedio || 5.0,
        solicitudes_aceptadas: solicitudesAceptadas || 0,
        solicitudes_rechazadas: solicitudesRechazadas || 0
      }
    }
  } catch (error) {
    console.error('Error en obtenerMetricasCoach:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}