// src/app/(dashboard)/admin/clases/[id]/editar/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { FormularioEditarClase } from '@/components/clases/FormularioEditarClase'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { obtenerClasePorId } from '@/lib/actions/clases-actions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

async function obtenerDatosEdicion(id: string) {
  const supabase = await createServerSupabaseClient()

  const claseResult = await obtenerClasePorId(id)
  if (!claseResult.success) {
    return null
  }

  const { data: salones } = await supabase
    .from('salones')
    .select('id, nombre, tipo, capacidad_maxima')
    .eq('activo', true)
    .order('orden_display', { ascending: true })

  const { data: especialidades } = await supabase
    .from('especialidades')
    .select('id, nombre, descripcion, disciplina_id')
    .eq('activa', true)
    .order('nombre', { ascending: true })

  return {
    clase: claseResult.data,
    salones: salones || [],
    especialidades: especialidades || []
  }
}

async function EditarClaseContent({ params }: PageProps) {
  const datos = await obtenerDatosEdicion(params.id)

  if (!datos) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Editar Clase
        </h1>
        <p className="text-white/60 text-lg">
          Modifica los detalles de la clase programada
        </p>
      </div>

      <FormularioEditarClase 
        clase={datos.clase}
        salones={datos.salones}
        especialidades={datos.especialidades}
      />
    </div>
  )
}

function LoadingEditar() {
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

export default function EditarClasePage({ params }: PageProps) {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingEditar />}>
            <EditarClaseContent params={params} />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}