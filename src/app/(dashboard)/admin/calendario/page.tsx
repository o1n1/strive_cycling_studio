// src/app/(dashboard)/admin/calendario/page.tsx
import { Suspense } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { CalendarioSemanal } from '@/components/calendario/CalendarioSemanal'
import { obtenerClases } from '@/lib/actions/clases-actions'
import Link from 'next/link'

// ============================================================================
// OBTENER DATOS
// ============================================================================

async function obtenerDatosCalendario() {
  // Obtener próximas 4 semanas de clases
  const hoy = new Date()
  const dentro4Semanas = new Date()
  dentro4Semanas.setDate(hoy.getDate() + 28)

  const resultado = await obtenerClases({
    desde: hoy.toISOString(),
    hasta: dentro4Semanas.toISOString()
  })

  if (!resultado.success) {
    return { clases: [], error: resultado.error }
  }

  return { clases: resultado.data, error: null }
}

// ============================================================================
// COMPONENTE CONTENIDO
// ============================================================================

async function CalendarioContent() {
  const { clases, error } = await obtenerDatosCalendario()

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
            📅 Calendario de Clases
          </h1>
          <p className="text-white/60 text-lg">
            Vista semanal de todas las clases programadas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/clases"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            📋 Vista Lista
          </Link>
          <Link
            href="/admin/clases/nueva"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 hover:scale-105"
          >
            + Crear Clase
          </Link>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E84A27]/10 flex items-center justify-center text-2xl">
              📊
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Total Clases</p>
              <p className="text-white text-3xl font-bold">{clases.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-2xl">
              📋
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Sin Asignar</p>
              <p className="text-white text-3xl font-bold">
                {clases.filter(c => !c.coach_id).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 flex items-center justify-center text-2xl">
              🚴
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Cycling</p>
              <p className="text-white text-3xl font-bold">
                {clases.filter(c => c.disciplina.nombre === 'Cycling').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF006E]/10 flex items-center justify-center text-2xl">
              💪
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Funcional</p>
              <p className="text-white text-3xl font-bold">
                {clases.filter(c => c.disciplina.nombre === 'Funcional').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <CalendarioSemanal clasesIniciales={clases} rol="admin" />
    </div>
  )
}

// ============================================================================
// LOADING STATE
// ============================================================================

function CalendarioLoading() {
  return (
    <div className="space-y-8">
      <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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

export default function CalendarioAdminPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <Suspense fallback={<CalendarioLoading />}>
            <CalendarioContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}