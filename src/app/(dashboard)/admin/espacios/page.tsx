import { Suspense } from 'react'
import Link from 'next/link'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { SalonCard } from '@/components/espacios/SalonCard'
import { obtenerSalones, obtenerEstadisticasSalon } from '@/lib/actions/espacios-actions'

// Forzar renderizado dinámico (usa cookies para auth)
export const dynamic = 'force-dynamic'

// ============================================================================
// PÁGINA - LISTA DE SALONES
// ============================================================================

async function SalonesContent() {
  const resultado = await obtenerSalones()

  if (!resultado.success || !resultado.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <svg className="w-20 h-20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium mb-2">Error al cargar salones</p>
        <p className="text-sm">{resultado.error || 'Error desconocido'}</p>
      </div>
    )
  }

  const salones = resultado.data

  // Obtener estadísticas de cada salón
  const salonesConEstadisticas = await Promise.all(
    salones.map(async (salon) => {
      if (!salon.id) return null
      const stats = await obtenerEstadisticasSalon(salon.id)
      return {
        id: salon.id,
        nombre: salon.nombre,
        descripcion: salon.descripcion,
        tipo: salon.tipo,
        capacidad_maxima: salon.capacidad_maxima,
        activo: salon.activo,
        orden_display: salon.orden_display,
        totalEspacios: stats.data?.total || 0,
        espaciosDisponibles: stats.data?.disponibles || 0
      }
    })
  ).then(results => results.filter((r): r is NonNullable<typeof r> => r !== null))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {salonesConEstadisticas.map((salon) => (
        <SalonCard key={salon.id} {...salon} />
      ))}
    </div>
  )
}

function LoadingSalones() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  )
}

export default function EspaciosPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Gestión de Espacios
                </h1>
                <p className="text-white/60">
                  Administra salones y sus espacios (bicis/tapetes)
                </p>
              </div>
              
              <Link
                href="/admin/espacios/nuevo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-medium hover:shadow-lg hover:shadow-[#E84A27]/50 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crear Salón
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingSalones />}>
            <SalonesContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}