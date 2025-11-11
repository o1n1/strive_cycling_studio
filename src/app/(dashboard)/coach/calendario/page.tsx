// src/app/(dashboard)/coach/calendario/page.tsx
import { Suspense } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { CalendarioSemanal } from '@/components/calendario/CalendarioSemanal'
import { obtenerClases } from '@/lib/actions/clases-actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ============================================================================
// OBTENER DATOS
// ============================================================================

async function obtenerDatosCalendarioCoach() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return { clases: [], error: 'No autenticado' }
  }

  // Obtener próximas 4 semanas de clases del coach
  const hoy = new Date()
  const dentro4Semanas = new Date()
  dentro4Semanas.setDate(hoy.getDate() + 28)

  const resultado = await obtenerClases({
    coach_id: session.user.id,
    desde: hoy.toISOString(),
    hasta: dentro4Semanas.toISOString()
  })

  if (!resultado.success) {
    return { clases: [], error: resultado.error }
  }

  // Obtener info del coach para stats
  const { data: coachData } = await supabase
    .from('coaches')
    .select('total_clases_impartidas, calificacion_promedio')
    .eq('id', session.user.id)
    .single()

  return { 
    clases: resultado.data, 
    coach: coachData,
    error: null 
  }
}

// ============================================================================
// COMPONENTE CONTENIDO
// ============================================================================

async function CalendarioCoachContent() {
  const { clases, coach, error } = await obtenerDatosCalendarioCoach()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-2">Error al cargar calendario</p>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            📅 Mi Calendario
          </h1>
          <p className="text-white/60 text-lg">
            Vista semanal de tus clases asignadas
          </p>
        </div>

        <Link
          href="/coach/clases"
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          📋 Vista Lista
        </Link>
      </div>

      {/* Stats del coach */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E84A27]/10 flex items-center justify-center text-2xl">
              📊
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Próximas Clases</p>
              <p className="text-white text-3xl font-bold">{clases.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-2xl">
              🎯
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Total Impartidas</p>
              <p className="text-white text-3xl font-bold">
                {coach?.total_clases_impartidas || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Calificación</p>
              <p className="text-white text-3xl font-bold">
                {coach?.calificacion_promedio 
                  ? Number(coach.calificacion_promedio).toFixed(1) 
                  : '5.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      {clases.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No tienes clases próximas
          </h3>
          <p className="text-white/60 mb-6">
            Solicita clases disponibles para comenzar
          </p>
          <Link
            href="/coach/clases"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
          >
            Ver Clases Disponibles
          </Link>
        </div>
      ) : (
        <CalendarioSemanal clasesIniciales={clases} rol="coach" />
      )}
    </div>
  )
}

// ============================================================================
// LOADING STATE
// ============================================================================

function CalendarioCoachLoading() {
  return (
    <div className="space-y-8">
      <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
    </div>
  )
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function CalendarioCoachPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <Suspense fallback={<CalendarioCoachLoading />}>
            <CalendarioCoachContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}