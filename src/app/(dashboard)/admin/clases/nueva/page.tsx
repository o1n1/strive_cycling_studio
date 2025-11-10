// src/app/(dashboard)/admin/clases/nueva/page.tsx
import { Suspense } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { FormularioClase } from '@/components/clases/FormularioClase'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ============================================================================
// OBTENER DATOS PARA EL FORMULARIO
// ============================================================================

async function obtenerDatosFormulario() {
  const supabase = await createServerSupabaseClient()

  // Obtener salones activos
  const { data: salones } = await supabase
    .from('salones')
    .select('id, nombre, tipo, capacidad_maxima')
    .eq('activo', true)
    .order('orden_display', { ascending: true })

  // Obtener disciplinas activas
  const { data: disciplinas } = await supabase
    .from('disciplinas')
    .select('id, nombre, tipo, duracion_default')
    .eq('activa', true)
    .order('orden_display', { ascending: true })

  // Obtener especialidades activas
  const { data: especialidades } = await supabase
    .from('especialidades')
    .select('id, nombre, descripcion, disciplina_id')
    .eq('activa', true)
    .order('nombre', { ascending: true })

  return {
    salones: salones || [],
    disciplinas: disciplinas || [],
    especialidades: especialidades || []
  }
}

// ============================================================================
// CONTENIDO
// ============================================================================

async function NuevaClaseContent() {
  const datos = await obtenerDatosFormulario()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Crear Nueva Clase
        </h1>
        <p className="text-white/60 text-lg">
          Programa una nueva clase y notifica a los coaches
        </p>
      </div>

      {/* Formulario */}
      <FormularioClase 
        salones={datos.salones}
        disciplinas={datos.disciplinas}
        especialidades={datos.especialidades}
      />
    </div>
  )
}

// ============================================================================
// LOADING
// ============================================================================

function LoadingNuevaClase() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="h-[600px] bg-white/5 rounded-2xl animate-pulse" />
    </div>
  )
}

// ============================================================================
// PAGE
// ============================================================================

export default function NuevaClasePage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingNuevaClase />}>
            <NuevaClaseContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}