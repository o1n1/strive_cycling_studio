// src/app/api/onboarding/datos-personales/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { personal_id, tipo_personal, ...datosPersonales } = body

    const supabase = await createServerSupabaseClient()

    // Actualizar profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        nombre_completo: datosPersonales.nombre_completo,
        telefono: datosPersonales.telefono,
        fecha_nacimiento: datosPersonales.fecha_nacimiento
      })
      .eq('id', personal_id)

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar perfil' },
        { status: 400 }
      )
    }

    // Actualizar coaches o staff
    const tabla = tipo_personal === 'coach' ? 'coaches' : 'staff'
    const { error: personalError } = await supabase
      .from(tabla)
      .update({
        curp: datosPersonales.curp,
        rfc: datosPersonales.rfc,
        direccion_completa: datosPersonales.direccion_completa,
        cuenta_bancaria_banco: datosPersonales.cuenta_bancaria_banco,
        cuenta_bancaria_clabe: datosPersonales.cuenta_bancaria_clabe,
        cuenta_bancaria_beneficiario: datosPersonales.cuenta_bancaria_beneficiario,
        contacto_emergencia_nombre: datosPersonales.contacto_emergencia_nombre,
        contacto_emergencia_telefono: datosPersonales.contacto_emergencia_telefono,
        contacto_emergencia_relacion: datosPersonales.contacto_emergencia_relacion
      })
      .eq('id', personal_id)

    if (personalError) {
      return NextResponse.json(
        { success: false, error: 'Error al guardar información' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Información guardada correctamente'
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}