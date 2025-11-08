'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TipoDisciplina, EstadoEspacio } from '@/lib/types/enums'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SalonData {
  id?: string
  nombre: string
  descripcion: string | null
  tipo: TipoDisciplina
  capacidad_maxima: number
  activo: boolean
  orden_display: number
}

export interface EspacioData {
  salon_id: string
  numero: number
  tipo_equipo: string
  marca_equipo: string | null
  modelo_equipo: string | null
  estado: EstadoEspacio
  ultimo_mantenimiento: string | null
  proximo_mantenimiento: string | null
  usos_desde_mantenimiento: number
  usos_para_mantenimiento: number
  notas_mantenimiento: string | null
}

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// SALONES - CRUD COMPLETO
// ============================================================================

/**
 * Obtener todos los salones (admin ve todos, otros solo activos)
 */
export async function obtenerSalones(): Promise<ActionResponse<SalonData[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Verificar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Obtener perfil para validar rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    // Query base
    let query = supabase
      .from('salones')
      .select('*')
      .order('orden_display', { ascending: true })

    // Si no es admin, solo mostrar activos
    if (profile?.rol !== 'admin') {
      query = query.eq('activo', true)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error al obtener salones:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Obtener un salón específico por ID
 */
export async function obtenerSalonPorId(id: string): Promise<ActionResponse<SalonData>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data, error } = await supabase
      .from('salones')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) return { success: false, error: 'Salón no encontrado' }

    return { success: true, data }
  } catch (error) {
    console.error('Error al obtener salón:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Crear nuevo salón (solo admin)
 */
export async function crearSalon(datos: Omit<SalonData, 'id'>): Promise<ActionResponse<{ id: string }>> {
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
      return { success: false, error: 'No autorizado. Solo administradores pueden crear salones.' }
    }

    // Validar datos
    if (!datos.nombre || datos.nombre.trim().length === 0) {
      return { success: false, error: 'El nombre es requerido' }
    }

    if (datos.capacidad_maxima < 1) {
      return { success: false, error: 'La capacidad debe ser mayor a 0' }
    }

    // Crear salón
    const { data, error } = await supabase
      .from('salones')
      .insert({
        ...datos,
        nombre: datos.nombre.trim()
      })
      .select('id')
      .single()

    if (error) throw error

    // Revalidar caché
    revalidatePath('/admin/espacios')

    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Error al crear salón:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Actualizar salón existente (admin y staff)
 */
export async function actualizarSalon(
  id: string, 
  datos: Partial<SalonData>
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

    if (profile?.rol !== 'admin' && profile?.rol !== 'staff') {
      return { success: false, error: 'No autorizado' }
    }

    // Validar datos si se proporcionan
    if (datos.nombre !== undefined && datos.nombre.trim().length === 0) {
      return { success: false, error: 'El nombre no puede estar vacío' }
    }

    if (datos.capacidad_maxima !== undefined && datos.capacidad_maxima < 1) {
      return { success: false, error: 'La capacidad debe ser mayor a 0' }
    }

    // Actualizar
    const { error } = await supabase
      .from('salones')
      .update({
        ...datos,
        nombre: datos.nombre?.trim()
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/espacios')
    revalidatePath(`/admin/espacios/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar salón:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Eliminar salón (solo admin, solo si no tiene espacios)
 */
export async function eliminarSalon(id: string): Promise<ActionResponse> {
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
      return { success: false, error: 'No autorizado. Solo administradores pueden eliminar salones.' }
    }

    // Verificar que no tenga espacios
    const { count } = await supabase
      .from('espacios')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', id)

    if (count && count > 0) {
      return { 
        success: false, 
        error: `No se puede eliminar. El salón tiene ${count} espacio(s) asociado(s). Elimínalos primero.` 
      }
    }

    // Eliminar
    const { error } = await supabase
      .from('salones')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/espacios')

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar salón:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// ESPACIOS - CRUD COMPLETO
// ============================================================================

/**
 * Obtener espacios de un salón específico
 */
export async function obtenerEspaciosPorSalon(salonId: string): Promise<ActionResponse<EspacioData[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data, error } = await supabase
      .from('espacios')
      .select('*')
      .eq('salon_id', salonId)
      .order('numero', { ascending: true })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error al obtener espacios:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Crear nuevo espacio (solo admin)
 */
export async function crearEspacio(datos: Omit<EspacioData, 'id'>): Promise<ActionResponse<{ id: string }>> {
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

    // Validar que el número no esté duplicado en este salón
    const { data: existente } = await supabase
      .from('espacios')
      .select('numero')
      .eq('salon_id', datos.salon_id)
      .eq('numero', datos.numero)
      .single()

    if (existente) {
      return { 
        success: false, 
        error: `Ya existe un espacio con el número ${datos.numero} en este salón` 
      }
    }

    // Crear espacio
    const { data, error } = await supabase
      .from('espacios')
      .insert(datos)
      .select('id')
      .single()

    if (error) throw error

    revalidatePath(`/admin/espacios/${datos.salon_id}`)

    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Error al crear espacio:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Actualizar estado de espacio (admin y staff)
 */
export async function actualizarEstadoEspacio(
  id: string,
  estado: EstadoEspacio,
  notasMantenimiento?: string
): Promise<ActionResponse> {
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

    if (profile?.rol !== 'admin' && profile?.rol !== 'staff') {
      return { success: false, error: 'No autorizado' }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = { estado }

    // Si entra en mantenimiento, registrar fecha
    if (estado === 'mantenimiento') {
      updateData.ultimo_mantenimiento = new Date().toISOString().split('T')[0]
      updateData.usos_desde_mantenimiento = 0
      if (notasMantenimiento) {
        updateData.notas_mantenimiento = notasMantenimiento
      }
    }

    const { error } = await supabase
      .from('espacios')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    // Obtener salon_id para revalidar
    const { data: espacio } = await supabase
      .from('espacios')
      .select('salon_id')
      .eq('id', id)
      .single()

    if (espacio) {
      revalidatePath(`/admin/espacios/${espacio.salon_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Eliminar espacio (solo admin, solo si no tiene reservas futuras)
 */
export async function eliminarEspacio(id: string): Promise<ActionResponse> {
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

    // Verificar que no tenga reservas futuras
    const { count } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('espacio_id', id)
      .eq('estado', 'confirmada')

    if (count && count > 0) {
      return { 
        success: false, 
        error: `No se puede eliminar. El espacio tiene ${count} reserva(s) confirmada(s).` 
      }
    }

    // Obtener salon_id antes de eliminar
    const { data: espacio } = await supabase
      .from('espacios')
      .select('salon_id')
      .eq('id', id)
      .single()

    // Eliminar
    const { error } = await supabase
      .from('espacios')
      .delete()
      .eq('id', id)

    if (error) throw error

    if (espacio) {
      revalidatePath(`/admin/espacios/${espacio.salon_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar espacio:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Obtener estadísticas de salón
 */
export async function obtenerEstadisticasSalon(salonId: string): Promise<ActionResponse<{
  total: number
  disponibles: number
  ocupados: number
  mantenimiento: number
}>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { data, error } = await supabase
      .from('espacios')
      .select('estado')
      .eq('salon_id', salonId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      disponibles: data?.filter(e => e.estado === 'disponible').length || 0,
      ocupados: data?.filter(e => e.estado === 'ocupado').length || 0,
      mantenimiento: data?.filter(e => e.estado === 'mantenimiento').length || 0
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}