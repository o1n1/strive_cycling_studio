// src/lib/actions/notificaciones-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Notificacion {
  id: string
  destinatario_id: string
  tipo: string
  titulo: string
  mensaje: string
  url_accion: string | null
  icono: string | null
  data: Record<string, unknown>
  leida: boolean
  leida_at: string | null
  expira_at: string | null
  created_at: string
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

export async function obtenerNotificaciones(limit = 50): Promise<RespuestaAction<Notificacion[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('destinatario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error al obtener notificaciones:', error)
      return { success: false, error: 'Error al cargar notificaciones' }
    }

    return { success: true, data: data as Notificacion[] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function contarNoLeidas(): Promise<RespuestaAction<number>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('destinatario_id', user.id)
      .eq('leida', false)

    if (error) return { success: false, error: 'Error al contar' }
    return { success: true, data: count || 0 }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function marcarComoLeida(notificacionId: string): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true, leida_at: new Date().toISOString() })
      .eq('id', notificacionId)
      .eq('destinatario_id', user.id)

    if (error) return { success: false, error: 'Error al actualizar' }

    revalidatePath('/')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function marcarTodasComoLeidas(): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { error } = await supabase
      .from('notificaciones')
      .update({ leida: true, leida_at: new Date().toISOString() })
      .eq('destinatario_id', user.id)
      .eq('leida', false)

    if (error) return { success: false, error: 'Error al actualizar' }

    revalidatePath('/')
    return { success: true, data: undefined, mensaje: 'Todas marcadas como leídas' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function eliminarNotificacion(notificacionId: string): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', notificacionId)
      .eq('destinatario_id', user.id)

    if (error) return { success: false, error: 'Error al eliminar' }

    revalidatePath('/')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function crearNotificacion(datos: {
  destinatario_id: string
  tipo: string
  titulo: string
  mensaje: string
  url_accion?: string
  icono?: string
  data?: Record<string, unknown>
  expira_at?: string
}): Promise<RespuestaAction<Notificacion>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('notificaciones')
      .insert({
        destinatario_id: datos.destinatario_id,
        tipo: datos.tipo,
        titulo: datos.titulo,
        mensaje: datos.mensaje,
        url_accion: datos.url_accion || null,
        icono: datos.icono || null,
        data: datos.data || {},
        expira_at: datos.expira_at || null
      })
      .select()
      .single()

    if (error) return { success: false, error: 'Error al crear notificación' }
    return { success: true, data: data as Notificacion }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}