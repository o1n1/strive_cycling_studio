// src/lib/actions/clases-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  EstadoClase, 
  EstadoPersonal,
  TipoDisciplina 
} from '@/lib/types/enums'

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ClaseData {
  id: string
  fecha_hora: string
  duracion: number
  salon_id: string
  disciplina_id: string
  especialidad_id: string | null
  coach_id: string | null
  capacidad: number
  reservas_count: number
  estado: EstadoClase
  nombre_clase: string | null
  descripcion: string | null
  notas_coach: string | null
  playlist_url: string | null
  es_recurrente: boolean
  recurrencia_id: string | null
  asignada_por: string | null
  asignada_at: string | null
  created_at: string
  updated_at: string
}

export interface ClaseConRelaciones extends ClaseData {
  salon: {
    id: string
    nombre: string
    tipo: TipoDisciplina
  }
  disciplina: {
    id: string
    nombre: string
    tipo: TipoDisciplina
  }
  especialidad: {
    id: string
    nombre: string
    descripcion: string | null
  } | null
  coach: {
    id: string
    biografia: string | null
    profiles: {
      nombre_completo: string
      foto_url: string | null
    }
  } | null
}

export interface SolicitudClaseData {
  id: string
  clase_id: string
  coach_id: string
  estado: EstadoPersonal
  mensaje: string | null
  respondida_por: string | null
  respondida_at: string | null
  notas_respuesta: string | null
  created_at: string
  updated_at: string
}

export interface SolicitudConRelaciones extends SolicitudClaseData {
  clase: {
    fecha_hora: string
    duracion: number
    salon: {
      nombre: string
    }
    disciplina: {
      nombre: string
    }
  }
  coach: {
    total_clases_impartidas: number
    calificacion_promedio: number
    profiles: {
      nombre_completo: string
      foto_url: string | null
    }
  }
}

export interface CrearClaseInput {
  fecha_hora: string
  duracion: number
  salon_id: string
  disciplina_id: string
  especialidad_id?: string | null
  capacidad: number
  nombre_clase?: string | null
  descripcion?: string | null
}

export interface ActualizarClaseInput {
  fecha_hora?: string
  duracion?: number
  salon_id?: string
  especialidad_id?: string | null
  capacidad?: number
  nombre_clase?: string | null
  descripcion?: string | null
  notas_coach?: string | null
  playlist_url?: string | null
}

export type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================================================
// CLASES - CRUD COMPLETO
// ============================================================================

/**
 * Obtener todas las clases con filtros opcionales
 * - Admin: ve todas
 * - Coach: ve las que le están asignadas + disponibles (sin coach)
 * - Cliente/Staff: solo ve publicadas (con coach asignado y en futuro)
 */
export async function obtenerClases(filtros?: {
  desde?: string
  hasta?: string
  salon_id?: string
  disciplina_id?: string
  coach_id?: string
  estado?: EstadoClase
  solo_sin_asignar?: boolean
  solo_futuras?: boolean
}): Promise<ActionResponse<ClaseConRelaciones[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    console.log('🔍 DEBUG - Obteniendo clases con filtros:', filtros)
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔍 DEBUG - Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      error: sessionError 
    })
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Perfil no encontrado' }
    }

    // Query base
    let query = supabase
      .from('clases')
      .select(`
        *,
        salon:salones (
          id,
          nombre,
          tipo
        ),
        disciplina:disciplinas (
          id,
          nombre,
          tipo
        ),
        especialidad:especialidades (
          id,
          nombre,
          descripcion
        ),
        coach:coaches (
          id,
          biografia,
          profiles!coaches_id_fkey (
            nombre_completo,
            foto_url
          )
        )
      `)
      .order('fecha_hora', { ascending: true })

    // Filtros por rol
    if (profile.rol === 'coach') {
      // Coach ve: sus clases asignadas + disponibles (sin coach)
      query = query.or(`coach_id.eq.${session.user.id},coach_id.is.null`)
    } else if (profile.rol === 'cliente' || profile.rol === 'staff') {
      // Cliente/Staff solo ve: con coach asignado + futuras
      query = query
        .not('coach_id', 'is', null)
        .gte('fecha_hora', new Date().toISOString())
    }
    // Admin ve todo (no agrega filtros)

    // Filtros adicionales
    if (filtros) {
      if (filtros.desde) {
        query = query.gte('fecha_hora', filtros.desde)
      }
      if (filtros.hasta) {
        query = query.lte('fecha_hora', filtros.hasta)
      }
      if (filtros.salon_id) {
        query = query.eq('salon_id', filtros.salon_id)
      }
      if (filtros.disciplina_id) {
        query = query.eq('disciplina_id', filtros.disciplina_id)
      }
      if (filtros.coach_id) {
        query = query.eq('coach_id', filtros.coach_id)
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado)
      }
      if (filtros.solo_sin_asignar) {
        query = query.is('coach_id', null)
      }
      if (filtros.solo_futuras) {
        query = query.gte('fecha_hora', new Date().toISOString())
      }
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: (data || []) as ClaseConRelaciones[] }
  } catch (error) {
    console.error('Error al obtener clases:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Obtener una clase específica por ID con todas sus relaciones
 */
export async function obtenerClasePorId(id: string): Promise<ActionResponse<ClaseConRelaciones>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data, error } = await supabase
      .from('clases')
      .select(`
        *,
        salon:salones (
          id,
          nombre,
          tipo
        ),
        disciplina:disciplinas (
          id,
          nombre,
          tipo
        ),
        especialidad:especialidades (
          id,
          nombre,
          descripcion
        ),
        coach:coaches (
          id,
          biografia,
          profiles!coaches_id_fkey (
            nombre_completo,
            foto_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return { success: false, error: 'Clase no encontrada' }

    return { success: true, data: data as ClaseConRelaciones }
  } catch (error) {
    console.error('Error al obtener clase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Crear nueva clase (solo admin)
 * Valida que no haya traslape de horarios en el mismo salón
 */
export async function crearClase(datos: CrearClaseInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { 
        success: false, 
        error: 'No autorizado. Solo administradores pueden crear clases.' 
      }
    }

    // Validar fecha en futuro
    const fechaClase = new Date(datos.fecha_hora)
    if (fechaClase < new Date()) {
      return { success: false, error: 'La fecha debe ser futura' }
    }

    // ✅ FIX: Validar traslape en salón
    const hayTraslape = await validarTraslapeEnSalon(
      supabase,
      datos.salon_id,
      datos.fecha_hora,
      datos.duracion
    )

    if (hayTraslape) {
      return { 
        success: false, 
        error: 'Ya existe una clase programada en ese salón a esa hora' 
      }
    }

    // Obtener capacidad del salón si no se especificó
    let capacidad = datos.capacidad
    if (!capacidad) {
      const { data: salon } = await supabase
        .from('salones')
        .select('capacidad_maxima')
        .eq('id', datos.salon_id)
        .single()
      
      capacidad = salon?.capacidad_maxima || 20
    }

    // Crear clase
    const { data, error } = await supabase
      .from('clases')
      .insert({
        fecha_hora: datos.fecha_hora,
        duracion: datos.duracion,
        salon_id: datos.salon_id,
        disciplina_id: datos.disciplina_id,
        especialidad_id: datos.especialidad_id || null,
        capacidad,
        nombre_clase: datos.nombre_clase || null,
        descripcion: datos.descripcion || null,
        estado: 'programada',
        reservas_count: 0,
        coach_id: null,
      })
      .select('id')
      .single()

    if (error) throw error

    // Notificar a todos los coaches
    await notificarCoachesSobreNuevaClase(data.id)

    revalidatePath('/admin/clases')
    revalidatePath('/coach/clases')

    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Error al crear clase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}



/**
 * Actualizar clase existente (solo admin)
 * Valida traslapes si se cambia fecha/hora/salón
 */
export async function actualizarClase(
  id: string, 
  datos: ActualizarClaseInput
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado. Solo administradores pueden editar clases.' }
    }

    // Obtener clase actual
    const { data: claseActual } = await supabase
      .from('clases')
      .select('*')
      .eq('id', id)
      .single()

    if (!claseActual) {
      return { success: false, error: 'Clase no encontrada' }
    }

    // Si cambió fecha/hora o salón, validar traslapes
    if (datos.fecha_hora || datos.salon_id || datos.duracion) {
      const nuevaFecha = datos.fecha_hora || claseActual.fecha_hora
      const nuevoSalon = datos.salon_id || claseActual.salon_id
      const nuevaDuracion = datos.duracion || claseActual.duracion
      
      const fechaFin = new Date(new Date(nuevaFecha).getTime() + nuevaDuracion * 60000).toISOString()
      
      const { data: traslapadas } = await supabase
        .from('clases')
        .select('id')
        .eq('salon_id', nuevoSalon)
        .neq('id', id)
        .neq('estado', 'cancelada')
        .or(`and(fecha_hora.lte.${nuevaFecha},fecha_hora.gte.${fechaFin})`)

      if (traslapadas && traslapadas.length > 0) {
        return { 
          success: false, 
          error: 'Ya existe otra clase en ese salón a esa hora' 
        }
      }
    }

    // Actualizar
    const { error } = await supabase
      .from('clases')
      .update(datos)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/clases')
    revalidatePath('/coach/clases')
    revalidatePath(`/admin/clases/${id}`)

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al actualizar clase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Cancelar clase (solo admin)
 * Notifica a todos los afectados y libera reservas
 */
export async function cancelarClase(id: string, razon?: string): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // FIX 1: Obtener clase SIN reservas en el mismo query
    const { data: clase } = await supabase
      .from('clases')
      .select('*')
      .eq('id', id)
      .single()

    if (!clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    // Cancelar clase
    const { error: errorCancelar } = await supabase
      .from('clases')
      .update({ 
        estado: 'cancelada',
        descripcion: razon ? `Cancelada: ${razon}` : 'Clase cancelada'
      })
      .eq('id', id)

    if (errorCancelar) throw errorCancelar

    // FIX 1: Obtener reservas por separado (puede ser vacío)
    const { data: reservas } = await supabase
      .from('reservas')
      .select('id, cliente_id, creditos_usados')
      .eq('clase_id', id)

    // Cancelar reservas si existen
    if (reservas && reservas.length > 0) {
      for (const reserva of reservas) {
        // Cancelar reserva
        await supabase
          .from('reservas')
          .update({ 
            estado: 'cancelada',
            razon_cancelacion: razon || 'Clase cancelada por el estudio'
          })
          .eq('id', reserva.id)

        // Devolver créditos al cliente
        await supabase.rpc('devolver_creditos_por_cancelacion', {
          p_cliente_id: reserva.cliente_id,
          p_creditos: reserva.creditos_usados || 1
        })

        // Notificar cliente (no bloquear si falla)
        try {
          await supabase.from('notificaciones').insert({
            destinatario_id: reserva.cliente_id,
            tipo: 'clase_cancelada',
            titulo: 'Clase Cancelada',
            mensaje: `La clase del ${new Date(clase.fecha_hora).toLocaleString('es-MX')} fue cancelada. Tus créditos han sido devueltos.`,
            url_accion: '/cliente/clases'
          })
        } catch (err) {
          console.error('Error al notificar cliente:', err)
        }
      }
    }

    // Notificar coach si estaba asignado (no bloquear si falla)
    if (clase.coach_id) {
      try {
        await supabase.from('notificaciones').insert({
          destinatario_id: clase.coach_id,
          tipo: 'clase_cancelada',
          titulo: 'Clase Cancelada',
          mensaje: `Tu clase del ${new Date(clase.fecha_hora).toLocaleString('es-MX')} fue cancelada.`,
          url_accion: '/coach/clases'
        })
      } catch (err) {
        console.error('Error al notificar coach:', err)
      }
    }

    revalidatePath('/admin/clases')
    revalidatePath('/coach/clases')
    revalidatePath('/cliente/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al cancelar clase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Eliminar clase (solo admin, solo si no tiene reservas)
 */
export async function eliminarClase(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // CRÍTICO: Verificar que no tenga reservas
    const { count } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('clase_id', id)

    if (count && count > 0) {
      return { 
        success: false, 
        error: `No se puede eliminar. La clase tiene ${count} reserva(s).` 
      }
    }

    // Eliminar clase
    // Las solicitudes se eliminan automáticamente por ON DELETE CASCADE
    const { error } = await supabase
      .from('clases')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al eliminar clase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// FIX: VALIDACIÓN DE CONFLICTOS CORRECTA
// ============================================================================

/**
 * Helper: Validar traslape de horarios
 * Una clase traslapa si: (inicio1 < fin2) AND (fin1 > inicio2)
 */
async function validarTraslapeEnSalon(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  salon_id: string,
  fecha_hora_inicio: string,
  duracion_minutos: number,
  excluir_clase_id?: string
): Promise<boolean> {
  const fechaInicio = new Date(fecha_hora_inicio)
  const fechaFin = new Date(fechaInicio.getTime() + duracion_minutos * 60000)

  let query = supabase
    .from('clases')
    .select('id')
    .eq('salon_id', salon_id)
    .neq('estado', 'cancelada')
    .lt('fecha_hora', fechaFin.toISOString())
    .gte('fecha_hora', fechaInicio.toISOString())

  if (excluir_clase_id) {
    query = query.neq('id', excluir_clase_id)
  }

  const { data } = await query

  return !!(data && data.length > 0)
}

async function validarTraslapeEnCoach(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  coach_id: string,
  fecha_hora_inicio: string,
  duracion_minutos: number,
  excluir_clase_id?: string
): Promise<boolean> {
  const fechaInicio = new Date(fecha_hora_inicio)
  const fechaFin = new Date(fechaInicio.getTime() + duracion_minutos * 60000)

  let query = supabase
    .from('clases')
    .select('id')
    .eq('coach_id', coach_id)
    .neq('estado', 'cancelada')
    .lt('fecha_hora', fechaFin.toISOString())
    .gte('fecha_hora', fechaInicio.toISOString())

  if (excluir_clase_id) {
    query = query.neq('id', excluir_clase_id)
  }

  const { data } = await query

  return !!(data && data.length > 0)
}

// ============================================================================
// SOLICITUDES DE COACHES
// ============================================================================

/**
 * Coach solicita impartir una clase
 * Valida que no tenga otra clase a la misma hora
 */
export async function solicitarClase(
  clase_id: string, 
  mensaje?: string
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'coach') {
      return { 
        success: false, 
        error: 'No autorizado. Solo coaches pueden solicitar clases.' 
      }
    }

    // Verificar que la clase existe y no tiene coach
    const { data: clase } = await supabase
      .from('clases')
      .select('*')
      .eq('id', clase_id)
      .single()

    if (!clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    if (clase.coach_id) {
      return { success: false, error: 'Esta clase ya tiene un coach asignado' }
    }

    // ✅ FIX: Validar traslape en coach
    const hayTraslape = await validarTraslapeEnCoach(
      supabase,
      session.user.id,
      clase.fecha_hora,
      clase.duracion
    )

    if (hayTraslape) {
      return { 
        success: false, 
        error: 'Ya tienes una clase asignada en ese horario' 
      }
    }

    // Verificar que no haya solicitado ya esta clase
    const { data: solicitudExistente } = await supabase
      .from('solicitudes_clases')
      .select('id')
      .eq('clase_id', clase_id)
      .eq('coach_id', session.user.id)
      .single()

    if (solicitudExistente) {
      return { success: false, error: 'Ya solicitaste esta clase' }
    }

    // Crear solicitud
    const { error } = await supabase
      .from('solicitudes_clases')
      .insert({
        clase_id,
        coach_id: session.user.id,
        mensaje: mensaje || null,
        estado: 'pendiente'
      })

    if (error) throw error

    // Notificar admin
    const adminId = await obtenerPrimerAdmin()
    if (adminId) {
      await supabase.from('notificaciones').insert({
        destinatario_id: adminId,
        tipo: 'solicitud_clase',
        titulo: 'Nueva Solicitud de Clase',
        mensaje: `Un coach ha solicitado impartir una clase`,
        url_accion: '/admin/clases/solicitudes'
      })
    }

    revalidatePath('/coach/clases')
    revalidatePath('/admin/clases/solicitudes')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al solicitar clase:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Coach cancela su solicitud (solo si está pendiente)
 */
export async function cancelarSolicitud(solicitud_id: string): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Verificar que la solicitud existe y es del coach
    const { data: solicitud } = await supabase
      .from('solicitudes_clases')
      .select('*')
      .eq('id', solicitud_id)
      .eq('coach_id', session.user.id)
      .single()

    if (!solicitud) {
      return { success: false, error: 'Solicitud no encontrada' }
    }

    if (solicitud.estado !== 'pendiente') {
      return { success: false, error: 'Solo puedes cancelar solicitudes pendientes' }
    }

    // Eliminar solicitud
    const { error } = await supabase
      .from('solicitudes_clases')
      .delete()
      .eq('id', solicitud_id)

    if (error) throw error

    revalidatePath('/coach/clases')
    revalidatePath('/admin/clases/solicitudes')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al cancelar solicitud:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Obtener solicitudes con filtros (admin y coaches)
 * - Admin: ve todas
 * - Coach: solo las suyas
 */
export async function obtenerSolicitudes(filtros?: {
  clase_id?: string
  coach_id?: string
  estado?: EstadoPersonal
}): Promise<ActionResponse<SolicitudConRelaciones[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return { success: false, error: 'Perfil no encontrado' }
    }

    let query = supabase
      .from('solicitudes_clases')
      .select(`
        *,
        clase:clases (
          fecha_hora,
          duracion,
          salon:salones (nombre),
          disciplina:disciplinas (nombre)
        ),
        coach:coaches (
          total_clases_impartidas,
          calificacion_promedio,
          profiles!coaches_id_fkey (
            nombre_completo,
            foto_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Filtros por rol
    if (profile.rol === 'coach') {
      query = query.eq('coach_id', session.user.id)
    }
    // Admin ve todas

    // Filtros adicionales
    if (filtros) {
      if (filtros.clase_id) {
        query = query.eq('clase_id', filtros.clase_id)
      }
      if (filtros.coach_id) {
        query = query.eq('coach_id', filtros.coach_id)
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado)
      }
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: (data || []) as SolicitudConRelaciones[] }
  } catch (error) {
    console.error('Error al obtener solicitudes:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// ASIGNACIÓN DE COACHES
// ============================================================================

/**
 * Admin asignar coach directamente a una clase (sin solicitudes)
 */
export async function asignarCoachDirecto(
  clase_id: string, 
  coach_id: string
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // Verificar que clase existe
    const { data: clase } = await supabase
      .from('clases')
      .select('*')
      .eq('id', clase_id)
      .single()

    if (!clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    // ✅ FIX: Validar traslape en coach
    const hayTraslape = await validarTraslapeEnCoach(
      supabase,
      coach_id,
      clase.fecha_hora,
      clase.duracion
    )

    if (hayTraslape) {
      return { 
        success: false, 
        error: 'El coach ya tiene una clase en ese horario' 
      }
    }

    // Asignar coach
    const { error: errorAsignar } = await supabase
      .from('clases')
      .update({
        coach_id,
        asignada_por: session.user.id,
        asignada_at: new Date().toISOString()
      })
      .eq('id', clase_id)

    if (errorAsignar) throw errorAsignar

    // Notificar coach (no bloquear si falla)
    try {
      await supabase.from('notificaciones').insert({
        destinatario_id: coach_id,
        tipo: 'clase_asignada',
        titulo: 'Nueva Clase Asignada',
        mensaje: `Te asignaron una clase para el ${new Date(clase.fecha_hora).toLocaleString('es-MX')}`,
        url_accion: '/coach/clases',
        data: { clase_id }
      })
    } catch (err) {
      console.error('Error al notificar coach:', err)
    }

    revalidatePath('/admin/clases')
    revalidatePath('/coach/clases')
    revalidatePath('/cliente/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al asignar coach directo:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}


/**
 * Admin asigna coach a una clase desde solicitudes
 * - Rechaza automáticamente las demás solicitudes
 * - Solo notifica al coach asignado
 */
export async function asignarCoachAClase(
  clase_id: string, 
  solicitud_id: string
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar autenticación y rol
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // Obtener solicitud
    const { data: solicitud } = await supabase
      .from('solicitudes_clases')
      .select('*')
      .eq('id', solicitud_id)
      .single()

    if (!solicitud) {
      return { success: false, error: 'Solicitud no encontrada' }
    }

    // Verificar que clase existe y no tiene coach
    const { data: clase } = await supabase
      .from('clases')
      .select('*')
      .eq('id', clase_id)
      .single()

    if (!clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    if (clase.coach_id) {
      return { success: false, error: 'Esta clase ya tiene un coach asignado' }
    }

    // Asignar coach a la clase
    const { error: errorAsignar } = await supabase
      .from('clases')
      .update({
        coach_id: solicitud.coach_id,
        asignada_por: session.user.id,
        asignada_at: new Date().toISOString()
      })
      .eq('id', clase_id)

    if (errorAsignar) throw errorAsignar

    // Marcar solicitud como aceptada
    await supabase
      .from('solicitudes_clases')
      .update({
        estado: 'aprobado',
        respondida_por: session.user.id,
        respondida_at: new Date().toISOString()
      })
      .eq('id', solicitud_id)

    // Rechazar otras solicitudes (sin notificar)
    await supabase
      .from('solicitudes_clases')
      .update({
        estado: 'rechazado',
        respondida_por: session.user.id,
        respondida_at: new Date().toISOString()
      })
      .eq('clase_id', clase_id)
      .neq('id', solicitud_id)
      .eq('estado', 'pendiente')

    // FIX 3: SOLO notificar al coach asignado (no bloquear si falla)
    try {
      await supabase.from('notificaciones').insert({
        destinatario_id: solicitud.coach_id,
        tipo: 'clase_asignada',
        titulo: '¡Clase Asignada!',
        mensaje: `Te asignaron la clase del ${new Date(clase.fecha_hora).toLocaleString('es-MX')}`,
        url_accion: '/coach/clases',
        data: { clase_id }
      })
    } catch (err) {
      console.error('Error al notificar coach:', err)
      // No fallar - asignación exitosa aunque notificación falle
    }

    revalidatePath('/admin/clases')
    revalidatePath('/admin/clases/solicitudes')
    revalidatePath('/coach/clases')
    revalidatePath('/cliente/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al asignar coach:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Admin desasigna coach de una clase
 */
export async function desasignarCoach(clase_id: string): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // Obtener clase para notificar coach
    const { data: clase } = await supabase
      .from('clases')
      .select('coach_id, fecha_hora')
      .eq('id', clase_id)
      .single()

    if (!clase || !clase.coach_id) {
      return { success: false, error: 'Clase no encontrada o no tiene coach asignado' }
    }

    // Desasignar
    const { error } = await supabase
      .from('clases')
      .update({
        coach_id: null,
        asignada_por: null,
        asignada_at: null
      })
      .eq('id', clase_id)

    if (error) throw error

    // Notificar coach (no bloquear si falla)
    try {
      await supabase.from('notificaciones').insert({
        destinatario_id: clase.coach_id,
        tipo: 'clase_desasignada',
        titulo: 'Clase Desasignada',
        mensaje: `Ya no tienes asignada la clase del ${new Date(clase.fecha_hora).toLocaleString('es-MX')}`,
        url_accion: '/coach/clases'
      })
    } catch (err) {
      console.error('Error al notificar coach:', err)
    }

    revalidatePath('/admin/clases')
    revalidatePath('/coach/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al desasignar coach:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Notificar a todos los coaches activos sobre nueva clase
 * (Se llama al crear clase)
 */
async function notificarCoachesSobreNuevaClase(clase_id: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener información de la clase
    const { data: clase } = await supabase
      .from('clases')
      .select(`
        fecha_hora,
        duracion,
        salon:salones!inner (nombre),
        disciplina:disciplinas!inner (nombre)
      `)
      .eq('id', clase_id)
      .single()

    if (!clase) return

    // Type assertion para las relaciones
    const salonNombre = (clase.salon as unknown as { nombre: string }).nombre
    const disciplinaNombre = (clase.disciplina as unknown as { nombre: string }).nombre

    // Obtener todos los coaches activos
    const { data: coaches } = await supabase
      .from('coaches')
      .select('id')
      .eq('activo', true)
      .eq('estado', 'aprobado')
      .eq('disponible_para_clases', true)

    if (!coaches || coaches.length === 0) return

    // Crear notificaciones para todos
    const notificaciones = coaches.map(coach => ({
      destinatario_id: coach.id,
      tipo: 'clase_creada',
      titulo: 'Nueva Clase Disponible',
      mensaje: `Nueva clase: ${disciplinaNombre} en ${salonNombre} - ${new Date(clase.fecha_hora).toLocaleString('es-MX')}`,
      url_accion: '/coach/clases/disponibles',
      data: { clase_id }
    }))

    await supabase.from('notificaciones').insert(notificaciones)
  } catch (error) {
    console.error('Error al notificar coaches:', error)
  }
}

/**
 * Obtener primer admin del sistema (para notificaciones)
 */
async function obtenerPrimerAdmin(): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('rol', 'admin')
      .eq('activo', true)
      .limit(1)
      .single()

    return data?.id || ''
  } catch {
    return ''
  }
}