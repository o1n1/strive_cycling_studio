import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { SalonForm } from '@/components/espacios/SalonForm'
import { obtenerSalonPorId, obtenerEstadisticasSalon } from '@/lib/actions/espacios-actions'

interface Props {
  params: { id: string }
}

async function SalonContent({ id }: { id: string }) {
  const [resultadoSalon, resultadoStats] = await Promise.all([
    obtenerSalonPorId(id),
    obtenerEstadisticasSalon(id)
  ])

  if (!resultadoSalon.success || !resultadoSalon.data) {
    notFound()
  }

  const salon = resultadoSalon.data
  const stats = resultadoStats.data || { total: 0, disponibles: 0, ocupados: 0, mantenimiento: 0 }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="text-white/60 text-sm mb-2">Total Espacios</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="rounded-xl bg-green-500/10 backdrop-blur-xl border border-green-500/20 p-6">
          <div className="text-green-400 text-sm mb-2">Disponibles</div>
          <div className="text-3xl font-bold text-green-400">{stats.disponibles}</div>
        </div>
        <div className="rounded-xl bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 p-6">
          <div className="text-yellow-400 text-sm mb-2">Ocupados</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.ocupados}</div>
        </div>
        <div className="rounded-xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-6">
          <div className="text-red-400 text-sm mb-2">Mantenimiento</div>
          <div className="text-3xl font-bold text-red-400">{stats.mantenimiento}</div>
        </div>
      </div>

      {/* Botón para gestionar espacios */}
      <Link
        href={`/admin/espacios/${id}/gestionar`}
        className="block rounded-xl bg-gradient-to-r from-[#E84A27] to-[#FF6B35] p-6 text-white hover:shadow-lg hover:shadow-[#E84A27]/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Gestionar Espacios</h3>
            <p className="text-white/80">Agregar, editar o cambiar estados de bicis/tapetes</p>
          </div>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>

      {/* Formulario de edición */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Configuración del Salón
          </h2>
          <p className="text-white/60">
            Edita la información y configuración de este salón
          </p>
        </div>

        <SalonForm 
          salonInicial={{ ...salon, id }} 
          modo="editar" 
        />
      </div>
    </div>
  )
}

function LoadingSalon() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
    </div>
  )
}

export default function SalonDetailPage({ params }: Props) {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/admin/espacios" className="hover:text-white transition-colors">
              Espacios
            </Link>
            <span>/</span>
            <span className="text-white">Detalle de Salón</span>
          </div>

          <Suspense fallback={<LoadingSalon />}>
            <SalonContent id={params.id} />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}