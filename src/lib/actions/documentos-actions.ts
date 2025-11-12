// src/lib/actions/documentos-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TipoDocumento, EstadoDocumento } from '@/lib/types/enums'

// ============== INTERFACES ==============

export interface DocumentoPersonal {
  id: string
  coach_id: string | null
  staff_id: string | null
  tipo_documento: TipoDocumento
  url_archivo: string
  nombre_archivo: string
  estado: EstadoDocumento
  version: number
  documento_anterior_id: string | null
  revisado_por: string | null
  revisado_at: string | null
  comentarios_admin: string | null
  created_at: string
  updated_at: string
}

interface RespuestaExito<T = unknown> {
  success: true
  data: T
  mensaje?: string
}

interface RespuestaError {
  success: false
  error: string
}

type RespuestaAction<T = unknown> = RespuestaExito<T> | RespuestaError

// ============== UPLOAD DE DOCUMENTOS ==============

export async function uploadDocumento(formData: FormData): Promise<RespuestaAction<DocumentoPersonal>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'No autenticado' }
    }

    // Obtener datos del form
    const archivo = formData.get('archivo') as File
    const tipoDocumento = formData.get('tipo_documento') as TipoDocumento
    const personalId = formData.get('personal_id') as string
    const tipoPersonal = formData.get('tipo_personal') as 'coach' | 'staff'

    if (!archivo || !tipoDocumento || !personalId) {
      return { success: false, error: 'Datos incompletos' }
    }

    // Validar tamaño (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      return { success: false, error: 'El archivo no puede superar 5MB' }
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(archivo.type)) {
      return { success: false, error: 'Tipo de archivo no permitido. Solo PDF o imágenes' }
    }

    // Generar nombre único
    const timestamp = Date.now()
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${personalId}/${tipoDocumento}/${timestamp}.${extension}`

    // Upload a Storage
    const { error: uploadError } = await supabase.storage
      .from('documentos-personal')
      .upload(nombreArchivo, archivo, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error al subir archivo:', uploadError)
      return { success: false, error: 'Error al subir el archivo' }
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('documentos-personal')
      .getPublicUrl(nombreArchivo)

    // Verificar si ya existe documento de este tipo
    const { data: documentoExistente } = await supabase
      .from('documentos_personal')
      .select('id, version')
      .eq(tipoPersonal === 'coach' ? 'coach_id' : 'staff_id', personalId)
      .eq('tipo_documento', tipoDocumento)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    // Preparar datos
    const datosDocumento = {
      [tipoPersonal === 'coach' ? 'coach_id' : 'staff_id']: personalId,
      tipo_documento: tipoDocumento,
      url_archivo: publicUrl,
      nombre_archivo: archivo.name,
      estado: 'pendiente' as EstadoDocumento,
      version: documentoExistente ? documentoExistente.version + 1 : 1,
      documento_anterior_id: documentoExistente?.id || null
    }

    // Insertar en BD
    const { data: documento, error: dbError } = await supabase
      .from('documentos_personal')
      .insert(datosDocumento)
      .select()
      .single()

    if (dbError || !documento) {
      console.error('Error al guardar en BD:', dbError)
      // Eliminar archivo de storage
      await supabase.storage.from('documentos-personal').remove([nombreArchivo])
      return { success: false, error: 'Error al guardar el documento' }
    }

    revalidatePath('/onboarding')
    revalidatePath('/admin/personal')

    return {
      success: true,
      data: documento as DocumentoPersonal,
      mensaje: 'Documento subido correctamente'
    }
  } catch (error) {
    console.error('Error en uploadDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== OBTENER DOCUMENTOS ==============

export async function obtenerDocumentosPersonal(
  personalId: string,
  tipoPersonal: 'coach' | 'staff'
): Promise<RespuestaAction<DocumentoPersonal[]>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: documentos, error } = await supabase
      .from('documentos_personal')
      .select('*')
      .eq(tipoPersonal === 'coach' ? 'coach_id' : 'staff_id', personalId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener documentos:', error)
      return { success: false, error: 'Error al obtener documentos' }
    }

    return { success: true, data: (documentos || []) as DocumentoPersonal[] }
  } catch (error) {
    console.error('Error en obtenerDocumentosPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== APROBAR DOCUMENTO ==============

export async function aprobarDocumento(
  documentoId: string
): Promise<RespuestaAction<DocumentoPersonal>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verificar que es admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfil?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    // Actualizar documento
    const { data: documento, error } = await supabase
      .from('documentos_personal')
      .update({
        estado: 'aprobado' as EstadoDocumento,
        revisado_por: user.id,
        revisado_at: new Date().toISOString(),
        comentarios_admin: null
      })
      .eq('id', documentoId)
      .select()
      .single()

    if (error || !documento) {
      console.error('Error al aprobar documento:', error)
      return { success: false, error: 'Error al aprobar documento' }
    }

    // Verificar si todos los documentos están aprobados
    const personalId = documento.coach_id || documento.staff_id
    const tipoPersonal = documento.coach_id ? 'coach' : 'staff'

    if (personalId) {
      const { data: todosDocumentos } = await supabase
        .from('documentos_personal')
        .select('estado')
        .eq(tipoPersonal === 'coach' ? 'coach_id' : 'staff_id', personalId)

      const todosAprobados = todosDocumentos?.every((doc: { estado: string }) => doc.estado === 'aprobado')

      if (todosAprobados) {
        // Actualizar flag documentos_completos
        await supabase
          .from(tipoPersonal === 'coach' ? 'coaches' : 'staff')
          .update({ documentos_completos: true })
          .eq('id', personalId)
      }
    }

    revalidatePath('/admin/personal')
    return {
      success: true,
      data: documento as DocumentoPersonal,
      mensaje: 'Documento aprobado'
    }
  } catch (error) {
    console.error('Error en aprobarDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== RECHAZAR DOCUMENTO ==============

export async function rechazarDocumento(
  documentoId: string,
  comentarios: string
): Promise<RespuestaAction<DocumentoPersonal>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Verificar que es admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'No autenticado' }
    }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfil?.rol !== 'admin') {
      return { success: false, error: 'No autorizado' }
    }

    if (!comentarios.trim()) {
      return { success: false, error: 'Debes proporcionar una razón para rechazar' }
    }

    // Actualizar documento
    const { data: documento, error } = await supabase
      .from('documentos_personal')
      .update({
        estado: 'rechazado' as EstadoDocumento,
        revisado_por: user.id,
        revisado_at: new Date().toISOString(),
        comentarios_admin: comentarios
      })
      .eq('id', documentoId)
      .select()
      .single()

    if (error || !documento) {
      console.error('Error al rechazar documento:', error)
      return { success: false, error: 'Error al rechazar documento' }
    }

    revalidatePath('/admin/personal')
    return {
      success: true,
      data: documento as DocumentoPersonal,
      mensaje: 'Documento rechazado'
    }
  } catch (error) {
    console.error('Error en rechazarDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// ============== ELIMINAR DOCUMENTO ==============

export async function eliminarDocumento(
  documentoId: string
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Obtener documento
    const { data: documento, error: fetchError } = await supabase
      .from('documentos_personal')
      .select('url_archivo')
      .eq('id', documentoId)
      .single()

    if (fetchError || !documento) {
      return { success: false, error: 'Documento no encontrado' }
    }

    // Extraer path del Storage de la URL
    const urlParts = documento.url_archivo.split('/documentos-personal/')
    const storagePath = urlParts[1]

    // Eliminar de Storage
    if (storagePath) {
      await supabase.storage.from('documentos-personal').remove([storagePath])
    }

    // Eliminar de BD
    const { error: deleteError } = await supabase
      .from('documentos_personal')
      .delete()
      .eq('id', documentoId)

    if (deleteError) {
      console.error('Error al eliminar documento:', deleteError)
      return { success: false, error: 'Error al eliminar documento' }
    }

    revalidatePath('/admin/personal')
    return { success: true, data: undefined, mensaje: 'Documento eliminado' }
  } catch (error) {
    console.error('Error en eliminarDocumento:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}