// src/lib/actions/documentos-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  DocumentoPersonal,
  RespuestaAction,
  TipoPersonal
} from '@/lib/types/personal.types'
import type { TipoDocumento } from '@/lib/types/enums'

// ============== SUBIR DOCUMENTO ==============

/**
 * Subir documento personal
 * Maneja versiones si el documento ya existe
 */
export async function subirDocumento(
  formData: FormData
): Promise<RespuestaAction<DocumentoPersonal>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener usuario actual
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    // Extraer datos del FormData
    const archivo = formData.get('archivo') as File
    const tipoDocumento = formData.get('tipo_documento') as TipoDocumento
    const tipoPersonal = formData.get('tipo_personal') as TipoPersonal

    if (!archivo) {
      return { success: false, error: 'No se proporcionó archivo' }
    }

    if (!tipoDocumento) {
      return { success: false, error: 'No se proporcionó tipo de documento' }
    }

    if (!tipoPersonal) {
      return { success: false, error: 'No se proporcionó tipo de personal' }
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!tiposPermitidos.includes(archivo.type)) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido. Solo PDF o imágenes (JPG, PNG)'
      }
    }

    // Validar tamaño (10MB máximo)
    const tamañoMaximo = 10 * 1024 * 1024 // 10MB
    if (archivo.size > tamañoMaximo) {
      return { success: false, error: 'El archivo es demasiado grande (máximo 10MB)' }
    }

    // Verificar si ya existe un documento de este tipo
    const columnaId = tipoPersonal === 'coach' ? 'coach_id' : 'staff_id'
    const { data: documentoExistente } = await supabase
      .from('documentos_personal')
      .select('id, version, url_archivo')
      .eq(columnaId, user.id)
      .eq('tipo_documento', tipoDocumento)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const nuevaVersion = documentoExistente ? documentoExistente.version + 1 : 1

    // Subir archivo a Storage
    const extension = archivo.name.split('.').pop()
    const timestamp = Date.now()
    const rutaArchivo = `${tipoPersonal}/${user.id}/${tipoDocumento}_v${nuevaVersion}_${timestamp}.${extension}`

    const { error: errorUpload } = await supabase.storage
      .from('documentos-personal')
      .upload(rutaArchivo, archivo, {
        cacheControl: '3600',
        upsert: false
      })

    if (errorUpload) {
      console.error('Error al subir archivo:', errorUpload)
      return { success: false, error: 'Error al subir archivo' }
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('documentos-personal')
      .getPublicUrl(rutaArchivo)

    // Crear registro en base de datos
    const { data: documento, error: errorDB } = await supabase
      .from('documentos_personal')
      .insert({
        [columnaId]: user.id,
        tipo_documento: tipoDocumento,
        nombre_archivo: archivo.name,
        url_archivo: urlData.publicUrl,
        estado: 'pendiente',
        version: nuevaVersion,
        documento_anterior_id: documentoExistente?.id || null
      })
      .select()
      .single()

    if (errorDB) {
      console.error('Error al crear registro:', errorDB)
      // Intentar eliminar archivo subido
      await supabase.storage.from('documentos-personal').remove([rutaArchivo])
      return { success: false, error: 'Error al guardar información del documento' }
    }

    // Si es una nueva versión, notificar al admin
    if (documentoExistente) {
      await supabase.from('notificaciones').insert({
        tipo: 'documento_actualizado',
        titulo: 'Documento actualizado',
        mensaje: `${tipoPersonal === 'coach' ? 'Coach' : 'Staff'} ha subido una nueva versión del documento: ${tipoDocumento}`,
        data: {
          documento_id: documento.id,
          user_id: user.id
        }
      })
    }

    revalidatePath(`/${tipoPersonal}/perfil`)
    return { success: true, data: documento as DocumentoPersonal }
  } catch (error) {
    console.error('Error en subirDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== OBTENER DOCUMENTOS ==============

/**
 * Obtener documentos de un coach o staff
 */
export async function obtenerDocumentos(
  userId: string,
  tipoPersonal: TipoPersonal
): Promise<RespuestaAction<DocumentoPersonal[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const columnaId = tipoPersonal === 'coach' ? 'coach_id' : 'staff_id'

    const { data, error } = await supabase
      .from('documentos_personal')
      .select('*')
      .eq(columnaId, userId)
      .order('tipo_documento', { ascending: true })
      .order('version', { ascending: false })

    if (error) {
      console.error('Error al obtener documentos:', error)
      return { success: false, error: 'Error al obtener documentos' }
    }

    return { success: true, data: data as DocumentoPersonal[] }
  } catch (error) {
    console.error('Error en obtenerDocumentos:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Obtener documentos pendientes de revisión (admin)
 */
export async function obtenerDocumentosPendientes(): Promise<
  RespuestaAction<
    (DocumentoPersonal & {
      nombre_personal: string
      tipo_personal: TipoPersonal
    })[]
  >
> {
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

    // Obtener documentos pendientes de coaches
    const { data: docsCoaches } = await supabase
      .from('documentos_personal')
      .select(
        `
        *,
        coach:coaches!inner(
          id,
          profile:profiles!inner(nombre_completo)
        )
      `
      )
      .eq('estado', 'pendiente')
      .not('coach_id', 'is', null)

    // Obtener documentos pendientes de staff
    const { data: docsStaff } = await supabase
      .from('documentos_personal')
      .select(
        `
        *,
        staff:staff!inner(
          id,
          profile:profiles!inner(nombre_completo)
        )
      `
      )
      .eq('estado', 'pendiente')
      .not('staff_id', 'is', null)

    // Formatear resultados
    const documentos = [
      ...(docsCoaches?.map((doc) => ({
        ...doc,
        nombre_personal: doc.coach.profile.nombre_completo,
        tipo_personal: 'coach' as TipoPersonal
      })) || []),
      ...(docsStaff?.map((doc) => ({
        ...doc,
        nombre_personal: doc.staff.profile.nombre_completo,
        tipo_personal: 'staff' as TipoPersonal
      })) || [])
    ]

    // Ordenar por fecha de creación (más recientes primero)
    documentos.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return { success: true, data: documentos }
  } catch (error) {
    console.error('Error en obtenerDocumentosPendientes:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== REVISAR DOCUMENTOS (ADMIN) ==============

/**
 * Aprobar documento
 */
export async function aprobarDocumento(
  documentoId: string,
  comentarios?: string
): Promise<RespuestaAction<DocumentoPersonal>> {
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

    // Aprobar documento
    const { data: documento, error } = await supabase
      .from('documentos_personal')
      .update({
        estado: 'aprobado',
        revisado_por: user.id,
        revisado_at: new Date().toISOString(),
        comentarios_admin: comentarios || null
      })
      .eq('id', documentoId)
      .select()
      .single()

    if (error) {
      console.error('Error al aprobar documento:', error)
      return { success: false, error: 'Error al aprobar documento' }
    }

    // Verificar si todos los documentos están aprobados
    const userId = documento.coach_id || documento.staff_id
    const tipoPersonal = documento.coach_id ? 'coach' : 'staff'
    const columnaId = tipoPersonal === 'coach' ? 'coach_id' : 'staff_id'

    const { data: todosDocumentos } = await supabase
      .from('documentos_personal')
      .select('estado')
      .eq(columnaId, userId)

    const todosAprobados = todosDocumentos?.every((doc) => doc.estado === 'aprobado')

    // Si todos están aprobados, actualizar flag
    if (todosAprobados && userId) {
      const tabla = tipoPersonal === 'coach' ? 'coaches' : 'staff'
      await supabase.from(tabla).update({ documentos_completos: true }).eq('id', userId)

      // Notificar al usuario
      await supabase.from('notificaciones').insert({
        destinatario_id: userId,
        tipo: 'documentos_aprobados',
        titulo: '¡Todos tus documentos han sido aprobados!',
        mensaje: 'Tu perfil está siendo revisado para aprobación final.',
        icono: '✅'
      })
    }

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${userId}`)
    return { success: true, data: documento as DocumentoPersonal }
  } catch (error) {
    console.error('Error en aprobarDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Rechazar documento
 */
export async function rechazarDocumento(
  documentoId: string,
  comentarios: string
): Promise<RespuestaAction<DocumentoPersonal>> {
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

    if (!comentarios.trim()) {
      return { success: false, error: 'Debes proporcionar comentarios para el rechazo' }
    }

    // Obtener info del documento antes de rechazar
    const { data: docInfo } = await supabase
      .from('documentos_personal')
      .select('coach_id, staff_id')
      .eq('id', documentoId)
      .single()

    // Rechazar documento
    const { data: documento, error } = await supabase
      .from('documentos_personal')
      .update({
        estado: 'rechazado',
        revisado_por: user.id,
        revisado_at: new Date().toISOString(),
        comentarios_admin: comentarios
      })
      .eq('id', documentoId)
      .select()
      .single()

    if (error) {
      console.error('Error al rechazar documento:', error)
      return { success: false, error: 'Error al rechazar documento' }
    }

    // Notificar al usuario
    const userId = docInfo?.coach_id || docInfo?.staff_id
    if (userId) {
      await supabase.from('notificaciones').insert({
        destinatario_id: userId,
        tipo: 'documento_rechazado',
        titulo: 'Documento rechazado',
        mensaje: `Uno de tus documentos ha sido rechazado. Revisa los comentarios y sube una nueva versión.`,
        icono: '❌',
        data: {
          documento_id: documentoId,
          comentarios
        }
      })
    }

    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${userId}`)
    return { success: true, data: documento as DocumentoPersonal }
  } catch (error) {
    console.error('Error en rechazarDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Eliminar documento
 */
export async function eliminarDocumento(
  documentoId: string
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener info del documento
    const { data: documento } = await supabase
      .from('documentos_personal')
      .select('*')
      .eq('id', documentoId)
      .single()

    if (!documento) {
      return { success: false, error: 'Documento no encontrado' }
    }

    // Verificar permisos (solo el dueño o admin)
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

    const esAdmin = profile?.rol === 'admin'
    const esDueño =
      documento.coach_id === user.id || documento.staff_id === user.id

    if (!esAdmin && !esDueño) {
      return { success: false, error: 'No autorizado' }
    }

    // Extraer ruta del archivo de la URL
    const urlObj = new URL(documento.url_archivo)
    const rutaArchivo = urlObj.pathname.split('/storage/v1/object/public/documentos-personal/')[1]

    // Eliminar archivo de Storage
    if (rutaArchivo) {
      const { error: errorStorage } = await supabase.storage
        .from('documentos-personal')
        .remove([rutaArchivo])

      if (errorStorage) {
        console.error('Error al eliminar archivo:', errorStorage)
      }
    }

    // Eliminar registro de base de datos
    const { error: errorDB } = await supabase
      .from('documentos_personal')
      .delete()
      .eq('id', documentoId)

    if (errorDB) {
      console.error('Error al eliminar documento:', errorDB)
      return { success: false, error: 'Error al eliminar documento' }
    }

    const userId = documento.coach_id || documento.staff_id
    revalidatePath('/admin/personal')
    revalidatePath(`/admin/personal/${userId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error en eliminarDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}