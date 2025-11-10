// src/app/(dashboard)/admin/clases/[id]/asignar/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { FormularioAsignarCoach } from '@/components/clases/FormularioAsignarCoach'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { obtenerClasePorId } from '@/lib/actions/clases-actions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

interface CoachRaw {
  id: string
  biografia: string | null
  especialidades: string[] | null
  total_clases_impartidas: number
  calificacion_promedio: number
  activo: boolean
  disponible_para_clases: boolean
  profiles: {
    nombre_completo: string
    foto_url: string | null
  }[]
}

async function obtenerDatosAsignacion(id: string) {
  const claseResult = await obtenerClasePorId(id)
  if (!claseResult.success) {
    return null
  }

  const supabase = await createServerSupabaseClient()

  const { data: coachesRaw } = await supabase
    .from('coaches')
    .select(`
      id,
      biografia,
      especialidades,
      total_clases_impartidas,
      calificacion_promedio,
      activo,
      disponible_para_clases,
      profiles!inner (
        nombre_completo,
        foto_url
      )
    `)
    .eq('activo', true)
    .eq('estado', 'aprobado')
    .eq('disponible_para_clases', true)
    .order('calificacion_promedio', { ascending: false })

  // Transformar profiles de array a objeto
  const coaches = (coachesRaw as CoachRaw[] || []).map(coach => ({
    id: coach.id,
    biografia: coach.biografia,
    especialidades: coach.especialidades,
    total_clases_impartidas: coach.total_clases_impartidas,
    calificacion_promedio: coach.calificacion_promedio,
    activo: coach.activo,
    disponible_para_clases: coach.disponible_para_clases,
    profiles: Array.isArray(coach.profiles) ? coach.profiles[0] : coach.profiles
  }))

  return {
    clase: claseResult.data,
    coaches: coaches
  }
}

async function AsignarCoachContent({ params }: PageProps) {
  const datos = await obtenerDatosAsignacion(params.id)

  if (!datos) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Asignar Coach
        </h1>
        <p className="text-white/60 text-lg">
          Selecciona un coach para esta clase
        </p>
      </div>

      <FormularioAsignarCoach 
        clase={datos.clase}
        coaches={datos.coaches}
      />
    </div>
  )
}

function LoadingAsignar() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

export default function AsignarCoachPage({ params }: PageProps) {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingAsignar />}>
            <AsignarCoachContent params={params} />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}