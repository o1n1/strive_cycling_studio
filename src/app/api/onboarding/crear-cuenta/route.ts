// src/app/api/onboarding/crear-cuenta/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, rol, token } = await request.json()

    const supabase = await createServerSupabaseClient()

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rol
        }
      }
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'Error al crear cuenta' },
        { status: 400 }
      )
    }

    // Actualizar profile con rol
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ rol, onboarding_completo: false })
      .eq('id', authData.user.id)

    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar perfil' },
        { status: 400 }
      )
    }

    // Crear registro en tabla correspondiente (coaches o staff)
    const tabla = rol === 'coach' ? 'coaches' : 'staff'
    const { error: insertError } = await supabase
      .from(tabla)
      .insert({
        id: authData.user.id,
        estado: 'pendiente',
        onboarding_completo: false,
        invitacion_id: token
      })

    if (insertError) {
      return NextResponse.json(
        { success: false, error: 'Error al crear registro de personal' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      mensaje: 'Cuenta creada correctamente'
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}