// src/app/(dashboard)/admin/clases/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { ClaseCard } from '@/components/clases/ClaseCard'
import { FiltrosClases } from '@/components/clases/FiltrosClases'
import { obtenerClases } from '@/lib/actions/clases-actions'

export const dynamic = 'force-dynamic'

// ============================================================================
// SERVIDOR - DATOS
// ============================================================================

async function obtenerDatosClases() {
  const hoy = new Date()
  const proximos7Dias = new Date(hoy)
  proximos7Dias.setDate(hoy.getDate() + 7)

  const resultado = await obtenerClases({
    desde: hoy.toISOString(),
    hasta: proximos7Dias.toISOString(),
    solo_futuras: true
  })

  if (!resultado.success) {
    return { clases: [], error: resultado.error }
  }

  return { clases: resultado.data, error: null }
}

async function obtenerEstadisticas() {
  const hoy = new Date()
  const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0)).toISOString()
  const finHoy = new Date(hoy.setHours(23, 59, 59, 999)).toISOString()

  const proximos7Dias = new Date()
  proximos7Dias.setDate(proximos7Dias.getDate() + 7)

  const clasesHoyResult = await obtenerClases({
    desde: inicioHoy,
    hasta: finHoy
  })

  const sinAsignarResult = await obtenerClases({
    solo_sin_asignar: true,
    solo_futuras: true
  })

  const proximaSemanaResult = await obtenerClases({
    desde: new Date().toISOString(),
    hasta: proximos7Dias.toISOString()
  })

  return {
    clasesHoy: clasesHoyResult.success ? clasesHoyResult.data.length : 0,
    sinAsignar: sinAsignarResult.success ? sinAsignarResult.data.length : 0,
    totalProximaSemana: proximaSemanaResult.success ? proximaSemanaResult.data.length : 0,
    solicitudesPendientes: 0
  }
}

// ============================================================================
// COMPONENTE CONTENIDO
// ============================================================================

async function ClasesContent() {
  const { clases, error } = await obtenerDatosClases()
  const stats = await obtenerEstadisticas()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-2">Error al cargar clases</p>
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
            Gestión de Clases
          </h1>
          <p className="text-white/60 text-lg">
            Crea, asigna y administra las clases del estudio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/clases/solicitudes"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            Ver Solicitudes
          </Link>
          <Link
            href="/admin/clases/nueva"
            className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 hover:scale-105"
          >
            + Crear Clase
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-[#E84A27]/50 hover:shadow-lg hover:shadow-[#E84A27]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E84A27]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#E84A27]/10 flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
            <p className="text-white/60 text-sm mb-1">Clases Hoy</p>
            <p className="text-white text-3xl font-bold">{stats.clasesHoy}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-[#FF6B35]/50 hover:shadow-lg hover:shadow-[#FF6B35]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>
            <p className="text-white/60 text-sm mb-1">Sin Asignar</p>
            <p className="text-white text-3xl font-bold">{stats.sinAsignar}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-[#FF006E]/50 hover:shadow-lg hover:shadow-[#FF006E]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF006E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF006E]/10 flex items-center justify-center text-2xl">
                🙋
              </div>
            </div>
            <p className="text-white/60 text-sm mb-1">Solicitudes</p>
            <p className="text-white text-3xl font-bold">{stats.solicitudesPendientes}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-[#9D4EDD]/50 hover:shadow-lg hover:shadow-[#9D4EDD]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#9D4EDD]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
            <p className="text-white/60 text-sm mb-1">Próxima Semana</p>
            <p className="text-white text-3xl font-bold">{stats.totalProximaSemana}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosClases />

      {/* Lista de Clases */}
      {clases.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No hay clases programadas
          </h3>
          <p className="text-white/60 mb-6">
            Comienza creando tu primera clase para los próximos días
          </p>
          <Link
            href="/admin/clases/nueva"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
          >
            + Crear Primera Clase
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {clases.map((clase) => (
            <ClaseCard key={clase.id} clase={clase} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// LOADING
// ============================================================================

function LoadingClases() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-12 w-40 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>

      <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PAGE
// ============================================================================

export default function AdminClasesPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingClases />}>
            <ClasesContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}