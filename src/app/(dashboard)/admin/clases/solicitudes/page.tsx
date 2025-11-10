// src/app/(dashboard)/admin/clases/solicitudes/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { SolicitudCard } from '@/components/clases/SolicitudCard'
import { obtenerSolicitudes } from '@/lib/actions/clases-actions'
import type { SolicitudConRelaciones } from '@/lib/actions/clases-actions'

export const dynamic = 'force-dynamic'

// ============================================================================
// TIPOS
// ============================================================================

interface ClaseInfo {
  fecha_hora: string
  duracion: number
  salon: {
    nombre: string
  }
  disciplina: {
    nombre: string
  }
}

interface GrupoSolicitudes {
  clase: ClaseInfo
  solicitudes: SolicitudConRelaciones[]
}

// ============================================================================
// SERVIDOR - DATOS
// ============================================================================

async function obtenerDatosSolicitudes() {
  const resultado = await obtenerSolicitudes({
    estado: 'pendiente'
  })

  if (!resultado.success) {
    return { solicitudesPorClase: [], error: resultado.error }
  }

  // Agrupar por clase
  const solicitudesPorClase = resultado.data.reduce((acc, solicitud) => {
    const claseId = solicitud.clase_id
    if (!acc[claseId]) {
      acc[claseId] = {
        clase: solicitud.clase,
        solicitudes: []
      }
    }
    acc[claseId].solicitudes.push(solicitud)
    return acc
  }, {} as Record<string, GrupoSolicitudes>)

  return { 
    solicitudesPorClase: Object.values(solicitudesPorClase), 
    error: null 
  }
}

// ============================================================================
// COMPONENTE CONTENIDO
// ============================================================================

async function SolicitudesContent() {
  const { solicitudesPorClase, error } = await obtenerDatosSolicitudes()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-2">Error al cargar solicitudes</p>
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
            Solicitudes de Clases
          </h1>
          <p className="text-white/60 text-lg">
            Revisa y asigna coaches a las clases solicitadas
          </p>
        </div>

        <Link
          href="/admin/clases"
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          ← Volver a Clases
        </Link>
      </div>

      {/* KPI */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF006E]/10 flex items-center justify-center text-2xl">
            🙋
          </div>
          <div>
            <p className="text-white/60 text-sm">Total Solicitudes Pendientes</p>
            <p className="text-white text-3xl font-bold">
              {solicitudesPorClase.reduce((acc, grupo) => acc + grupo.solicitudes.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Clases con Solicitudes */}
      {solicitudesPorClase.length === 0 ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No hay solicitudes pendientes
          </h3>
          <p className="text-white/60 mb-6">
            Todas las clases están asignadas o no tienen solicitudes
          </p>
          <Link
            href="/admin/clases"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
          >
            Ver Todas las Clases
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {solicitudesPorClase.map((grupo, index) => (
            <div key={index} className="space-y-4">
              {/* Info de la Clase */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {grupo.clase.disciplina.nombre === 'Cycling' ? '🚴' : '💪'}
                      </span>
                      <div>
                        <h3 className="text-white text-xl font-semibold">
                          {grupo.clase.disciplina.nombre} - {grupo.clase.salon.nombre}
                        </h3>
                        <p className="text-white/60">
                          {new Date(grupo.clase.fecha_hora).toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} • {new Date(grupo.clase.fecha_hora).toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} • {grupo.clase.duracion} min
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-[#FF006E]/10 border border-[#FF006E]/20">
                    <p className="text-[#FF006E] font-semibold">
                      {grupo.solicitudes.length} solicitud(es)
                    </p>
                  </div>
                </div>
              </div>

              {/* Solicitudes para esta clase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grupo.solicitudes.map((solicitud) => (
                  <SolicitudCard 
                    key={solicitud.id} 
                    solicitud={solicitud}
                    claseId={grupo.clase.fecha_hora}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// LOADING
// ============================================================================

function LoadingSolicitudes() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-40 bg-white/5 rounded-xl animate-pulse" />
      </div>

      <div className="h-24 bg-white/5 rounded-2xl animate-pulse" />

      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PAGE
// ============================================================================

export default function SolicitudesPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingSolicitudes />}>
            <SolicitudesContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}