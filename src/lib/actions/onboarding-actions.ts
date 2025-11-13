// src/lib/actions/onboarding-actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type {
  DatosOnboardingPaso2,
  DatosOnboardingPaso3,
  RespuestaAction
} from '@/lib/types/personal.types'

/**
 * Crear cuenta de usuario en auth.users y profile
 */
export async function crearCuentaOnboarding(
  datos: DatosOnboardingPaso2,
  invitacionId: string
): Promise<RespuestaAction<{ userId: string }>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datos.email,
      password: datos.password,
      options: {
        data: {
          invitacion_id: invitacionId
        }
      }
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Error al crear cuenta' }
    }

    return { success: true, data: { userId: authData.user.id } }
  } catch (error) {
    console.error('Error en crearCuentaOnboarding:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Guardar información personal (paso 3)
 */
export async function guardarInfoPersonal(
  datos: DatosOnboardingPaso3,
  userId: string,
  tipoPersonal: 'coach' | 'staff'
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Actualizar profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nombre_completo: datos.nombre_completo,
        telefono: datos.telefono,
        fecha_nacimiento: datos.fecha_nacimiento
      })
      .eq('id', userId)

    if (profileError) {
      return { success: false, error: 'Error al actualizar perfil' }
    }

    // Actualizar tabla específica (coaches o staff)
    const tablaNombre = tipoPersonal === 'coach' ? 'coaches' : 'staff'
    
    const { error: updateError } = await supabase
      .from(tablaNombre)
      .update({
        curp: datos.curp,
        rfc: datos.rfc,
        direccion_completa: datos.direccion_completa,
        cuenta_bancaria_banco: datos.cuenta_bancaria_banco,
        cuenta_bancaria_clabe: datos.cuenta_bancaria_clabe,
        cuenta_bancaria_beneficiario: datos.cuenta_bancaria_beneficiario,
        contacto_emergencia_nombre: datos.contacto_emergencia_nombre,
        contacto_emergencia_telefono: datos.contacto_emergencia_telefono,
        contacto_emergencia_relacion: datos.contacto_emergencia_relacion
      })
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: 'Error al guardar información personal' }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error en guardarInfoPersonal:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Guardar info específica de coach (paso 4)
 */
export async function guardarInfoCoach(
  userId: string,
  datos: {
    biografia: string
    anos_experiencia: number
    certificaciones: string[]
    disponibilidad_semanal: Record<string, string[]>
  }
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('coaches')
      .update({
        biografia: datos.biografia,
        anos_experiencia: datos.anos_experiencia,
        certificaciones: datos.certificaciones,
        disponibilidad_semanal: datos.disponibilidad_semanal
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: 'Error al guardar información de coach' }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error en guardarInfoCoach:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Guardar info específica de staff (paso 4)
 */
export async function guardarInfoStaff(
  userId: string,
  datos: {
    horario_entrada: string
    horario_salida: string
    dias_laborales: number[]
  }
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('staff')
      .update({
        horario_entrada: datos.horario_entrada,
        horario_salida: datos.horario_salida,
        dias_laborales: datos.dias_laborales
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: 'Error al guardar información de staff' }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error en guardarInfoStaff:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Completar onboarding (marca como completo y en revisión)
 */
export async function completarOnboarding(
  userId: string,
  tipoPersonal: 'coach' | 'staff',
  invitacionId: string
): Promise<RespuestaAction<void>> {
  try {
    const supabase = await createServerSupabaseClient()

    // Actualizar invitación
    await supabase
      .from('invitaciones_personal')
      .update({
        estado: 'aceptada',
        aceptada_at: new Date().toISOString()
      })
      .eq('id', invitacionId)

    // Actualizar tabla específica
    const tablaNombre = tipoPersonal === 'coach' ? 'coaches' : 'staff'
    
    const { error } = await supabase
      .from(tablaNombre)
      .update({
        onboarding_completo: true,
        documentos_completos: true,
        estado: 'pendiente' // Esperando aprobación admin
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: 'Error al completar onboarding' }
    }

    // TODO: Crear notificación para admin

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error en completarOnboarding:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}