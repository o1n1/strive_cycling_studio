// src/lib/actions/reservas-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { EstadoReserva } from '@/lib/types/enums'

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface ActionResponse<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

interface ClaseDisponible {
  id: string
  fecha_hora: string
  duracion: number
  capacidad: number
  reservas_count: number
  espacios_disponibles: number
  nombre_clase: string | null
  descripcion: string | null
  estado: string
  salon: {
    id: string
    nombre: string
    tipo: string
  }
  disciplina: {
    id: string
    nombre: string
    tipo: string
    color_hex: string
  }
  especialidad: {
    id: string
    nombre: string
    descripcion: string
  } | null
  coach: {
    id: string
    biografia: string
    calificacion_promedio: number
    profiles: {
      nombre_completo: string
      foto_url: string | null
    }
  } | null
}

interface MiReserva {
  id: string
  estado: EstadoReserva
  creditos_usados: number
  created_at: string
  cancelada_at: string | null
  cancelada_tardia: boolean
  razon_cancelacion: string | null
  check_in_at: string | null
  check_out_at: string | null
  clase: {
    id: string
    fecha_hora: string
    duracion: number
    nombre_clase: string | null
    salon: {
      nombre: string
    }
    disciplina: {
      nombre: string
      color_hex: string
    }
    coach: {
      profiles: {
        nombre_completo: string
        foto_url: string | null
      }
    } | null
  }
  espacio: {
    numero: number
    tipo_equipo: string
  } | null
}

interface EstadisticasCliente {
  reservas_totales: number
  clases_asistidas: number
  no_shows: number
  creditos_disponibles: number
  creditos_congelados: boolean
  racha_asistencia: number
  proxima_clase: {
    id: string
    fecha_hora: string
    nombre_clase: string | null
    disciplina_nombre: string
    salon_nombre: string
  } | null
}

interface FiltrosClases {
  disciplina_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  solo_disponibles?: boolean
}

// ============================================================================
// OBTENER CLASES DISPONIBLES
// ============================================================================

/**
 * Obtiene todas las clases disponibles para reservar
 * Filtra por capacidad disponible y estado programado
 */
export async function obtenerClasesDisponibles(
  filtros?: FiltrosClases
): Promise<ActionResponse<ClaseDisponible[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Construir query base
    let query = supabase
      .from('clases')
      .select(`
        id,
        fecha_hora,
        duracion,
        capacidad,
        reservas_count,
        nombre_clase,
        descripcion,
        estado,
        salon:salones (
          id,
          nombre,
          tipo
        ),
        disciplina:disciplinas (
          id,
          nombre,
          tipo,
          color_hex
        ),
        especialidad:especialidades (
          id,
          nombre,
          descripcion
        ),
        coach:coaches (
          id,
          biografia,
          calificacion_promedio,
          profiles!coaches_id_fkey (
            nombre_completo,
            foto_url
          )
        )
      `)
      .eq('estado', 'programada')
      .gte('fecha_hora', new Date().toISOString())
      .order('fecha_hora', { ascending: true })

    // Aplicar filtros
    if (filtros?.disciplina_id) {
      query = query.eq('disciplina_id', filtros.disciplina_id)
    }

    if (filtros?.fecha_desde) {
      query = query.gte('fecha_hora', filtros.fecha_desde)
    }

    if (filtros?.fecha_hasta) {
      query = query.lte('fecha_hora', filtros.fecha_hasta)
    }

    const { data, error } = await query

    if (error) throw error

    // Calcular espacios disponibles y filtrar si es necesario
    let clasesDisponibles = (data || []).map((clase) => ({
      ...clase,
      espacios_disponibles: clase.capacidad - clase.reservas_count
    }))

    // Filtrar solo clases con espacios disponibles si se solicita
    if (filtros?.solo_disponibles) {
      clasesDisponibles = clasesDisponibles.filter(
        (clase) => clase.espacios_disponibles > 0
      )
    }

    return { success: true, data: clasesDisponibles }
  } catch (error) {
    console.error('Error al obtener clases disponibles:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// CREAR RESERVA
// ============================================================================

/**
 * Crea una nueva reserva para el cliente
 * Valida créditos disponibles y capacidad de la clase
 * Los triggers se encargan de consumir los créditos y validar capacidad
 */
export async function crearReserva(
  clase_id: string,
  espacio_id?: string
): Promise<ActionResponse<{ reserva_id: string }>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Verificar que sea cliente
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    if (profile?.rol !== 'cliente') {
      return { 
        success: false, 
        error: 'Solo los clientes pueden hacer reservas' 
      }
    }

    // Verificar que la clase existe y está disponible
    const { data: clase, error: errorClase } = await supabase
      .from('clases')
      .select('id, fecha_hora, capacidad, reservas_count, estado')
      .eq('id', clase_id)
      .single()

    if (errorClase || !clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    if (clase.estado !== 'programada') {
      return { success: false, error: 'Esta clase ya no está disponible' }
    }

    // Verificar que la clase no esté en el pasado
    if (new Date(clase.fecha_hora) < new Date()) {
      return { success: false, error: 'No puedes reservar clases pasadas' }
    }

    // Verificar que no tenga ya una reserva para esta clase
    const { data: reservaExistente } = await supabase
      .from('reservas')
      .select('id, estado')
      .eq('clase_id', clase_id)
      .eq('cliente_id', session.user.id)
      .in('estado', ['confirmada'])
      .single()

    if (reservaExistente) {
      return { success: false, error: 'Ya tienes una reserva para esta clase' }
    }

    // Verificar créditos disponibles
    const { data: cliente } = await supabase
      .from('clientes')
      .select('creditos_disponibles, creditos_congelados')
      .eq('id', session.user.id)
      .single()

    if (!cliente) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    if (cliente.creditos_congelados) {
      return { success: false, error: 'Tus créditos están congelados. Contacta al administrador.' }
    }

    if (cliente.creditos_disponibles < 1) {
      return { success: false, error: 'No tienes créditos suficientes. Compra un paquete para continuar.' }
    }

    // Verificar capacidad disponible
    if (clase.reservas_count >= clase.capacidad) {
      return { success: false, error: 'Esta clase está llena. ¿Deseas agregarte a la lista de espera?' }
    }

    // Crear la reserva
    // El trigger gestionar_creditos_reserva se encargará de validar y consumir los créditos
    // El trigger validar_capacidad_clase se encargará de validar la capacidad
    const { data: reserva, error: errorReserva } = await supabase
      .from('reservas')
      .insert({
        clase_id,
        cliente_id: session.user.id,
        espacio_id: espacio_id || null,
        estado: 'confirmada',
        creditos_usados: 1
      })
      .select('id')
      .single()

    if (errorReserva) {
      // Los triggers pueden lanzar excepciones que llegan como errores aquí
      if (errorReserva.message.includes('Créditos insuficientes')) {
        return { success: false, error: 'No tienes créditos suficientes' }
      }
      if (errorReserva.message.includes('Clase llena')) {
        return { success: false, error: 'Esta clase está llena' }
      }
      throw errorReserva
    }

    // Crear notificación de confirmación
    await supabase.from('notificaciones').insert({
      destinatario_id: session.user.id,
      tipo: 'reserva_confirmada',
      titulo: '¡Reserva Confirmada!',
      mensaje: `Tu reserva ha sido confirmada. ¡Nos vemos en la clase!`,
      url_accion: '/cliente/reservas',
      icono: 'check-circle'
    })

    revalidatePath('/cliente/reservas')
    revalidatePath('/cliente/clases')

    return { 
      success: true, 
      data: { reserva_id: reserva.id } 
    }
  } catch (error) {
    console.error('Error al crear reserva:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// CANCELAR RESERVA
// ============================================================================

/**
 * Cancela una reserva existente
 * Aplica políticas de cancelación (devolución si es con +2 horas de anticipación)
 * El trigger devolver_creditos_cancelacion maneja la devolución de créditos
 */
export async function cancelarReserva(
  reserva_id: string,
  razon?: string
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Obtener la reserva con información de la clase
    const { data: reserva, error: errorReserva } = await supabase
      .from('reservas')
      .select(`
        id,
        estado,
        cliente_id,
        creditos_usados,
        clase:clases (
          fecha_hora
        )
      `)
      .eq('id', reserva_id)
      .single()

    if (errorReserva || !reserva) {
      return { success: false, error: 'Reserva no encontrada' }
    }

    // Verificar que sea el dueño de la reserva
    if (reserva.cliente_id !== session.user.id) {
      return { success: false, error: 'No puedes cancelar esta reserva' }
    }

    // Verificar que la reserva esté confirmada
    if (reserva.estado !== 'confirmada') {
      return { success: false, error: 'Esta reserva ya fue cancelada o completada' }
    }

    // Verificar que la clase no haya pasado
    if (new Date(reserva.clase.fecha_hora) < new Date()) {
      return { success: false, error: 'No puedes cancelar una clase que ya pasó' }
    }

    // Calcular horas de anticipación
    const horasAnticipacion = 
      (new Date(reserva.clase.fecha_hora).getTime() - new Date().getTime()) / (1000 * 60 * 60)

    // Actualizar la reserva
    // El trigger devolver_creditos_cancelacion se encargará de la lógica de devolución
    const { error: errorCancelar } = await supabase
      .from('reservas')
      .update({ 
        estado: 'cancelada',
        cancelada_at: new Date().toISOString(),
        razon_cancelacion: razon || null
      })
      .eq('id', reserva_id)

    if (errorCancelar) throw errorCancelar

    // Crear notificación según el tipo de cancelación
    const mensaje = horasAnticipacion >= 2
      ? `Tu reserva ha sido cancelada y tus créditos han sido devueltos.`
      : `Tu reserva ha sido cancelada con menos de 2 horas de anticipación. No se devolverán los créditos.`

    await supabase.from('notificaciones').insert({
      destinatario_id: session.user.id,
      tipo: 'reserva_cancelada',
      titulo: 'Reserva Cancelada',
      mensaje,
      url_accion: '/cliente/reservas',
      icono: 'x-circle'
    })

    revalidatePath('/cliente/reservas')
    revalidatePath('/cliente/clases')

    return { 
      success: true, 
      data: undefined 
    }
  } catch (error) {
    console.error('Error al cancelar reserva:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// OBTENER MIS RESERVAS
// ============================================================================

/**
 * Obtiene todas las reservas del cliente
 * Puede filtrar por estado (activas, pasadas, canceladas)
 */
export async function obtenerMisReservas(
  estado_filtro?: 'activas' | 'pasadas' | 'canceladas' | 'todas'
): Promise<ActionResponse<MiReserva[]>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Construir query base
    let query = supabase
      .from('reservas')
      .select(`
        id,
        estado,
        creditos_usados,
        created_at,
        cancelada_at,
        cancelada_tardia,
        razon_cancelacion,
        check_in_at,
        check_out_at,
        clase:clases (
          id,
          fecha_hora,
          duracion,
          nombre_clase,
          salon:salones (
            nombre
          ),
          disciplina:disciplinas (
            nombre,
            color_hex
          ),
          coach:coaches (
            profiles!coaches_id_fkey (
              nombre_completo,
              foto_url
            )
          )
        ),
        espacio:espacios (
          numero,
          tipo_equipo
        )
      `)
      .eq('cliente_id', session.user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (estado_filtro === 'activas') {
      query = query
        .eq('estado', 'confirmada')
        .gte('clase.fecha_hora', new Date().toISOString())
    } else if (estado_filtro === 'pasadas') {
      query = query
        .in('estado', ['completada', 'no_show'])
    } else if (estado_filtro === 'canceladas') {
      query = query.eq('estado', 'cancelada')
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error al obtener reservas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// LISTA DE ESPERA
// ============================================================================

/**
 * Agrega al cliente a la lista de espera de una clase llena
 */
export async function agregarListaEspera(
  clase_id: string
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Verificar que la clase existe
    const { data: clase } = await supabase
      .from('clases')
      .select('id, fecha_hora, capacidad, reservas_count')
      .eq('id', clase_id)
      .single()

    if (!clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    // Verificar que la clase esté llena
    if (clase.reservas_count < clase.capacidad) {
      return { success: false, error: 'Esta clase aún tiene espacios disponibles' }
    }

    // Verificar que no esté ya en la lista de espera
    const { data: enLista } = await supabase
      .from('lista_espera')
      .select('id')
      .eq('clase_id', clase_id)
      .eq('cliente_id', session.user.id)
      .single()

    if (enLista) {
      return { success: false, error: 'Ya estás en la lista de espera' }
    }

    // Obtener la siguiente posición
    const { count } = await supabase
      .from('lista_espera')
      .select('*', { count: 'exact', head: true })
      .eq('clase_id', clase_id)

    const posicion = (count || 0) + 1

    // Agregar a lista de espera
    const { error: errorInsertar } = await supabase
      .from('lista_espera')
      .insert({
        clase_id,
        cliente_id: session.user.id,
        posicion,
        notificado: false
      })

    if (errorInsertar) throw errorInsertar

    // Crear notificación
    await supabase.from('notificaciones').insert({
      destinatario_id: session.user.id,
      tipo: 'lista_espera',
      titulo: 'Agregado a Lista de Espera',
      mensaje: `Has sido agregado a la lista de espera en posición ${posicion}. Te notificaremos si se libera un espacio.`,
      url_accion: '/cliente/clases',
      icono: 'clock'
    })

    revalidatePath('/cliente/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al agregar a lista de espera:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Remueve al cliente de la lista de espera
 */
export async function removerListaEspera(
  clase_id: string
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    const { error } = await supabase
      .from('lista_espera')
      .delete()
      .eq('clase_id', clase_id)
      .eq('cliente_id', session.user.id)

    if (error) throw error

    revalidatePath('/cliente/clases')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error al remover de lista de espera:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// ESTADÍSTICAS DEL CLIENTE
// ============================================================================

/**
 * Obtiene las estadísticas generales del cliente
 */
export async function obtenerEstadisticasCliente(): Promise<ActionResponse<EstadisticasCliente>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Obtener datos del cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select(`
        creditos_disponibles,
        creditos_congelados,
        total_clases_asistidas,
        total_no_shows,
        racha_asistencia
      `)
      .eq('id', session.user.id)
      .single()

    if (!cliente) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    // Contar reservas totales
    const { count: reservas_totales } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', session.user.id)
      .neq('estado', 'cancelada')

    // Obtener próxima clase
    const { data: proximaClase } = await supabase
      .from('reservas')
      .select(`
        id,
        clase:clases (
          id,
          fecha_hora,
          nombre_clase,
          disciplina:disciplinas (
            nombre
          ),
          salon:salones (
            nombre
          )
        )
      `)
      .eq('cliente_id', session.user.id)
      .eq('estado', 'confirmada')
      .gte('clase.fecha_hora', new Date().toISOString())
      .order('clase.fecha_hora', { ascending: true })
      .limit(1)
      .single()

    const estadisticas: EstadisticasCliente = {
      reservas_totales: reservas_totales || 0,
      clases_asistidas: cliente.total_clases_asistidas,
      no_shows: cliente.total_no_shows,
      creditos_disponibles: cliente.creditos_disponibles,
      creditos_congelados: cliente.creditos_congelados,
      racha_asistencia: cliente.racha_asistencia,
      proxima_clase: proximaClase ? {
        id: proximaClase.clase.id,
        fecha_hora: proximaClase.clase.fecha_hora,
        nombre_clase: proximaClase.clase.nombre_clase,
        disciplina_nombre: proximaClase.clase.disciplina.nombre,
        salon_nombre: proximaClase.clase.salon.nombre
      } : null
    }

    return { success: true, data: estadisticas }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// ============================================================================
// VERIFICAR DISPONIBILIDAD
// ============================================================================

/**
 * Verifica si una clase específica está disponible para reservar
 * Útil para validaciones en tiempo real
 */
export async function verificarDisponibilidad(
  clase_id: string
): Promise<ActionResponse<{
  disponible: boolean
  espacios_restantes: number
  tiene_creditos: boolean
}>> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return { success: false, error: 'No autenticado' }
    }

    // Obtener información de la clase
    const { data: clase } = await supabase
      .from('clases')
      .select('capacidad, reservas_count, estado')
      .eq('id', clase_id)
      .single()

    if (!clase) {
      return { success: false, error: 'Clase no encontrada' }
    }

    // Obtener créditos del cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('creditos_disponibles')
      .eq('id', session.user.id)
      .single()

    const espacios_restantes = clase.capacidad - clase.reservas_count
    const disponible = espacios_restantes > 0 && clase.estado === 'programada'
    const tiene_creditos = (cliente?.creditos_disponibles || 0) >= 1

    return { 
      success: true, 
      data: {
        disponible,
        espacios_restantes,
        tiene_creditos
      }
    }
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}