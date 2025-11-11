// src/lib/actions/personal-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  DatosInvitacion,
  RespuestaAction,
  InvitacionPersonal,
  Coach,
  Staff,
  TipoPersonal
} from '@/lib/types/personal.types'

// ============== INVITACIONES ==============

/**
 * Invitar nuevo miembro del personal (coach o staff)
 * Crea invitación con token único y envía email
 */
export async function invitarPersonal(
  datos: DatosInvitacion
): Promise<RespuestaAction<InvitacionPersonal>> {
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

    // Verificar que el email no existe
    const { data: emailExistente } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', datos.email)
      .single()

    if (emailExistente) {
      return { success: false, error: 'El email ya está registrado en el sistema' }
    }

    // Verificar que no existe una invitación pendiente con ese email
    const { data: invitacionExistente } = await supabase
      .from('invitaciones_personal')
      .select('id, estado')
      .eq('email', datos.email)
      .single()

    if (invitacionExistente && invitacionExistente.estado === 'pendiente') {
      return {
        success: false,
        error: 'Ya existe una invitación pendiente para este email'
      }
    }

    // Crear invitación
    const { data: invitacion, error: errorInvitacion } = await supabase
      .from('invitaciones_personal')
      .insert({
        email: datos.email,
        rol: datos.tipo,
        disciplinas: datos.tipo === 'coach' ? [datos.disciplinas] : null,
        mensaje_personalizado: datos.mensaje_invitacion || null,
        invitado_por: user.id,
        estado: 'pendiente',
        expira_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
      })
      .select()
      .single()

    if (errorInvitacion || !invitacion) {
      console.error('Error al crear invitación:', errorInvitacion)
      return { success: false, error: 'Error al crear invitación' }
    }

    // TODO: Enviar email con link de onboarding
    // const linkOnboarding = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${invitacion.token}`
    // await enviarEmailInvitacion(datos.email, linkOnboarding, datos.mensaje_invitacion)

    revalidatePath('/admin/personal')
    return {
      success: true,
      data: invitacion as InvitacionPersonal,
      mensaje: 'Invitación enviada correctamente'
    }
  } catch (error) {
    console.error('Error en invitarPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener invitación por token (para onboarding)
 */
export async function obtenerInvitacionPorToken(
  token: string
): Promise<RespuestaAction<InvitacionPersonal>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: invitacion, error } = await supabase
      .from('invitaciones_personal')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invitacion) {
      return { success: false, error: 'Invitación no encontrada' }
    }

    // Verificar si expiró
    if (new Date(invitacion.expira_at) < new Date()) {
      // Actualizar estado a expirada
      await supabase
        .from('invitaciones_personal')
        .update({ estado: 'expirada' })
        .eq('id', invitacion.id)

      return { success: false, error: 'La invitación ha expirado' }
    }

    // Verificar si ya fue aceptada
    if (invitacion.estado === 'aceptada') {
      return { success: false, error: 'Esta invitación ya fue utilizada' }
    }

    return { success: true, data: invitacion as InvitacionPersonal }
  } catch (error) {
    console.error('Error en obtenerInvitacionPorToken:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== LISTAR PERSONAL ==============

/**
 * Obtener todo el personal (coaches + staff) con filtros
 */
export async function obtenerTodoPersonal(filtros?: {
  tipo?: TipoPersonal
  estado?: string
  busqueda?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener coaches
    let queryCoaches = supabase
      .from('coaches')
      .select(`
        *,
        profile:profiles!inner(
          id,
          nombre_completo,
          email,
          telefono,
          foto_url
        )
      `)

    if (filtros?.estado) {
      queryCoaches = queryCoaches.eq('estado', filtros.estado)
    }

    if (filtros?.busqueda) {
      queryCoaches = queryCoaches.or(
        `profile.nombre_completo.ilike.%${filtros.busqueda}%,profile.email.ilike.%${filtros.busqueda}%`
      )
    }

    // Obtener staff
    let queryStaff = supabase
      .from('staff')
      .select(`
        *,
        profile:profiles!inner(
          id,
          nombre_completo,
          email,
          telefono,
          foto_url
        )
      `)

    if (filtros?.estado) {
      queryStaff = queryStaff.eq('estado', filtros.estado)
    }

    if (filtros?.busqueda) {
      queryStaff = queryStaff.or(
        `profile.nombre_completo.ilike.%${filtros.busqueda}%,profile.email.ilike.%${filtros.busqueda}%`
      )
    }

    // Ejecutar queries en paralelo
    const [{ data: coaches, error: errorCoaches }, { data: staff, error: errorStaff }] =
      await Promise.all([queryCoaches, queryStaff])

    if (errorCoaches) {
      console.error('Error al obtener coaches:', errorCoaches)
    }
    if (errorStaff) {
      console.error('Error al obtener staff:', errorStaff)
    }

    // Combinar y formatear resultados
    const coachesFormateados =
      coaches?.map((c) => ({
        ...c,
        tipo: 'coach' as TipoPersonal,
        nombre: c.profile.nombre_completo,
        email: c.profile.email
      })) || []

    const staffFormateado =
      staff?.map((s) => ({
        ...s,
        tipo: 'staff' as TipoPersonal,
        nombre: s.profile.nombre_completo,
        email: s.profile.email
      })) || []

    let personal = [...coachesFormateados, ...staffFormateado]

    // Aplicar filtro de tipo si existe
    if (filtros?.tipo) {
      personal = personal.filter((p) => p.tipo === filtros.tipo)
    }

    // Ordenar por fecha de creación (más recientes primero)
    personal.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return { success: true, data: personal }
  } catch (error) {
    console.error('Error en obtenerTodoPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener estadísticas del personal
 */
export async function obtenerEstadisticasPersonal() {
  try {
    const supabase = await createServerSupabaseClient()

    // Contar coaches por estado
    const { count: coachesActivos } = await supabase
      .from('coaches')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobado')
      .eq('activo', true)

    const { count: coachesPendientes } = await supabase
      .from('coaches')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'en_revision'])

    const { count: coachesRechazados } = await supabase
      .from('coaches')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'rechazado')

    // Contar staff por estado
    const { count: staffActivos } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobado')
      .eq('activo', true)

    const { count: staffPendientes } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'en_revision'])

    const { count: staffRechazados } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'rechazado')

    // Contar documentos pendientes de revisión
    const { count: documentosPendientes } = await supabase
      .from('documentos_personal')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')

    return {
      success: true,
      data: {
        coaches: {
          activos: coachesActivos || 0,
          pendientes: coachesPendientes || 0,
          rechazados: coachesRechazados || 0
        },
        staff: {
          activos: staffActivos || 0,
          pendientes: staffPendientes || 0,
          rechazados: staffRechazados || 0
        },
        total_activos: (coachesActivos || 0) + (staffActivos || 0),
        total_pendientes: (coachesPendientes || 0) + (staffPendientes || 0),
        documentos_pendientes: documentosPendientes || 0
      }
    }
  } catch (error) {
    console.error('Error en obtenerEstadisticasPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== APROBACIÓN Y RECHAZO ==============

/**
 * Aprobar coach o staff
 */
export async function aprobarPersonal(
  id: string,
  tipo: TipoPersonal
): Promise<RespuestaAction<Coach | Staff>> {
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

    // Verificar que todos los documentos estén aprobados
    const tabla = tipo === 'coach' ? 'coaches' : 'staff'
    const columnaId = tipo === 'coach' ? 'coach_id' : 'staff_id'

    const { data: documentos } = await supabase
      .from('documentos_personal')
      .select('estado')
      .eq(columnaId, id)

    const hayDocumentosPendientes = documentos?.some((doc) => doc.estado === 'pendiente')
    const hayDocumentosRechazados = documentos?.some((doc) => doc.estado === 'rechazado')

    if (hayDocumentosPendientes) {
      return {
        success: false,
        error: 'Hay documentos pendientes de revisión. Revisa todos los documentos primero.'
      }
    }

    if (hayDocumentosRechazados) {
      return {
        success: false,
        error: 'Hay documentos rechazados. No se puede aprobar hasta que se corrijan.'
      }
    }

    // Aprobar personal
    const { data, error } = await supabase
      .from(tabla)
      .update({
        estado: 'aprobado',
        aprobado_por: user.id,
        aprobado_at: new Date().toISOString(),
        activo: true
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al aprobar personal:', error)
      return { success: false, error: 'Error al aprobar' }
    }

    // TODO: Enviar email de bienvenida

    // Crear notificación
    await supabase.from('notificaciones').insert({
      destinatario_id: id,
      tipo: 'aprobacion_personal',
      titulo: '¡Felicidades! Tu perfil ha sido aprobado',
      mensaje: 'Ya puedes empezar a trabajar en Strive Studio. Bienvenido al equipo.',
      icono: '🎉'
    })

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${id}`)
    return { success: true, data, mensaje: 'Personal aprobado correctamente' }
  } catch (error) {
    console.error('Error en aprobarPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Rechazar coach o staff
 */
export async function rechazarPersonal(
  id: string,
  tipo: TipoPersonal,
  razon: string
): Promise<RespuestaAction<Coach | Staff>> {
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

    if (!razon.trim()) {
      return { success: false, error: 'Debes proporcionar una razón para el rechazo' }
    }

    // Rechazar personal
    const tabla = tipo === 'coach' ? 'coaches' : 'staff'
    const { data, error } = await supabase
      .from(tabla)
      .update({
        estado: 'rechazado',
        notas_rechazo: razon,
        activo: false
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error al rechazar personal:', error)
      return { success: false, error: 'Error al rechazar' }
    }

    // Crear notificación
    await supabase.from('notificaciones').insert({
      destinatario_id: id,
      tipo: 'rechazo_personal',
      titulo: 'Actualización sobre tu solicitud',
      mensaje: `Tu solicitud no ha sido aprobada. Razón: ${razon}`,
      icono: '❌'
    })

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${id}`)
    return { success: true, data, mensaje: 'Personal rechazado' }
  } catch (error) {
    console.error('Error en rechazarPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Eliminar personal (solo admin)
 */
export async function eliminarPersonal(
  id: string,
  tipo: TipoPersonal
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

    // Eliminar de la tabla correspondiente
    const tabla = tipo === 'coach' ? 'coaches' : 'staff'
    const { error: errorEliminar } = await supabase.from(tabla).delete().eq('id', id)

    if (errorEliminar) {
      console.error('Error al eliminar personal:', errorEliminar)
      return { success: false, error: 'Error al eliminar' }
    }

    // Eliminar el perfil de usuario
    // Nota: Esto también eliminará todos los datos relacionados por CASCADE
    const { error: errorProfile } = await supabase.from('profiles').delete().eq('id', id)

    if (errorProfile) {
      console.error('Error al eliminar profile:', errorProfile)
    }

    revalidatePath('/admin/personal')
    return { success: true, data: undefined, mensaje: 'Personal eliminado correctamente' }
  } catch (error) {
    console.error('Error en eliminarPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== DESIGNAR HEAD COACH ==============

/**
 * Designar o remover Head Coach
 */
export async function designarHeadCoach(
  coachId: string,
  esHeadCoach: boolean,
  disciplina?: 'cycling' | 'funcional'
): Promise<RespuestaAction<Coach>> {
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

    if (esHeadCoach && !disciplina) {
      return { success: false, error: 'Debes especificar la disciplina' }
    }

    // Si se está asignando como head coach, verificar que no exista otro
    if (esHeadCoach && disciplina) {
      const { data: headCoachActual } = await supabase
        .from('coaches')
        .select('id, profile:profiles!inner(nombre_completo)')
        .eq('es_head_coach', true)
        .eq('head_coach_de', disciplina)
        .neq('id', coachId)
        .single()

      if (headCoachActual) {
        return {
          success: false,
          error: `Ya existe un Head Coach para ${disciplina}`
        }
      }
    }

    // Actualizar coach
    const { data, error } = await supabase
      .from('coaches')
      .update({
        es_head_coach: esHeadCoach,
        head_coach_de: esHeadCoach ? disciplina : null
      })
      .eq('id', coachId)
      .select()
      .single()

    if (error) {
      console.error('Error al designar Head Coach:', error)
      return { success: false, error: 'Error al actualizar' }
    }

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${coachId}`)
    return {
      success: true,
      data,
      mensaje: esHeadCoach
        ? `Head Coach de ${disciplina} designado correctamente`
        : 'Head Coach removido correctamente'
    }
  } catch (error) {
    console.error('Error en designarHeadCoach:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}