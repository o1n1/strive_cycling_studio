// src/app/api/onboarding/finalizar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { personal_id, tipo_personal, firma_base64, token } = await request.json()

    const supabase = await createServerSupabaseClient()

    // Guardar firma en Storage
    const timestamp = Date.now()
    const firmaPath = `${personal_id}/contrato/${timestamp}.png`

    // Convertir base64 a blob
    const base64Data = firma_base64.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    const { error: uploadError } = await supabase.storage
      .from('contratos-firmados')
      .upload(firmaPath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: 'Error al guardar firma' },
        { status: 400 }
      )
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('contratos-firmados')
      .getPublicUrl(firmaPath)

    // Guardar en tabla firmas_documentos
    const { error: firmaError } = await supabase
      .from('firmas_documentos')
      .insert({
        usuario_id: personal_id,
        firma_base64,
        firma_storage_url: publicUrl,
        tipo_documento: 'contrato',
        metadata: {
          tipo_personal,
          token_invitacion: token
        }
      })

    if (firmaError) {
      return NextResponse.json(
        { success: false, error: 'Error al registrar firma' },
        { status: 400 }
      )
    }

    // Actualizar tabla correspondiente
    const tabla = tipo_personal === 'coach' ? 'coaches' : 'staff'
    const { error: updateError } = await supabase
      .from(tabla)
      .update({
        contrato_firmado_url: publicUrl,
        contrato_firmado_at: new Date().toISOString(),
        onboarding_completo: true,
        estado: 'pendiente' // Admin debe aprobar
      })
      .eq('id', personal_id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Error al actualizar estado' },
        { status: 400 }
      )
    }

    // Actualizar profiles
    await supabase
      .from('profiles')
      .update({ onboarding_completo: true })
      .eq('id', personal_id)

    // Marcar invitación como aceptada
    await supabase
      .from('invitaciones_personal')
      .update({
        estado: 'aceptada',
        aceptada_at: new Date().toISOString()
      })
      .eq('token', token)

    return NextResponse.json({
      success: true,
      mensaje: 'Onboarding completado correctamente'
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}