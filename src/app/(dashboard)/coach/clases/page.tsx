// src/app/(dashboard)/coach/clases/page.tsx
import { Suspense } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { obtenerClases, obtenerSolicitudes, type ClaseConRelaciones } from '@/lib/actions/clases-actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ClaseCardCoach } from '@/components/clases/ClaseCardCoach'
import Link from 'next/link'

// ============================================================================
// TYPES
// ============================================================================

interface DatosClasesCoach {
  clasesAsignadas: ClaseConRelaciones[]
  clasesDisponibles: ClaseConRelaciones[]
  solicitudesPendientes: Array<{
    id: string
    clase_id: string
    coach_id: string
    mensaje: string | null
    estado: string
    created_at: string
  }>
  error: string | null
}

// ============================================================================
// OBTENER DATOS
// ============================================================================

async function obtenerDatosClasesCoach(): Promise<DatosClasesCoach> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return {
      clasesAsignadas: [],
      clasesDisponibles: [],
      solicitudesPendientes: [],
      error: 'No autenticado'
    }
  }

  // Clases asignadas (futuras)
  const clasesAsignadasResult = await obtenerClases({
    coach_id: session.user.id,
    solo_futuras: true
  })

  // Clases disponibles (sin coach, futuras)
  const clasesDisponiblesResult = await obtenerClases({
    solo_sin_asignar: true,
    solo_futuras: true
  })

  // Solicitudes pendientes del coach
  const solicitudesResult = await obtenerSolicitudes({
    coach_id: session.user.id,
    estado: 'pendiente'
  })

  return {
    clasesAsignadas: clasesAsignadasResult.success ? (clasesAsignadasResult.data || []) : [],
    clasesDisponibles: clasesDisponiblesResult.success ? (clasesDisponiblesResult.data || []) : [],
    solicitudesPendientes: solicitudesResult.success ? (solicitudesResult.data || []) : [],
    error: null
  }
}

// ============================================================================
// COMPONENTE CONTENIDO
// ============================================================================

async function ClasesCoachContent() {
  const datos = await obtenerDatosClasesCoach()

  if (datos.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-white text-lg mb-2">Error al cargar clases</p>
          <p className="text-white/60">{datos.error}</p>
        </div>
      </div>
    )
  }

  const { clasesAsignadas, clasesDisponibles, solicitudesPendientes } = datos

  // IDs de clases con solicitud pendiente
  const clasesConSolicitud = new Set(
    solicitudesPendientes.map(s => s.clase_id)
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Mis Clases
          </h1>
          <p className="text-white/60 text-lg">
            Gestiona tus clases asignadas y solicita nuevas
          </p>
        </div>

        <Link
          href="/coach"
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          ← Dashboard
        </Link>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E84A27]/10 flex items-center justify-center text-2xl">
              ✅
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Clases Asignadas</p>
              <p className="text-white text-3xl font-bold">{clasesAsignadas.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-2xl">
              📋
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Disponibles</p>
              <p className="text-white text-3xl font-bold">{clasesDisponibles.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 flex items-center justify-center text-2xl">
              🙋
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Solicitudes</p>
              <p className="text-white text-3xl font-bold">{solicitudesPendientes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clases Asignadas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            ✅ Tus Clases Asignadas
          </h2>
          <Link
            href="/coach/calendario"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            📅 Ver Calendario
          </Link>
        </div>

        {clasesAsignadas.length === 0 ? (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              No tienes clases asignadas
            </h3>
            <p className="text-white/60">
              Solicita clases disponibles más abajo para comenzar
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clasesAsignadas.map((clase) => (
              <ClaseCardCoach
                key={clase.id}
                clase={clase}
                tipo="asignada"
              />
            ))}
          </div>
        )}
      </div>

      {/* Clases Disponibles */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">
            📋 Clases Disponibles para Solicitar
          </h2>
          <div className="px-3 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-sm font-medium">
            {clasesDisponibles.length} disponibles
          </div>
        </div>

        {clasesDisponibles.length === 0 ? (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              No hay clases disponibles
            </h3>
            <p className="text-white/60">
              Todas las clases tienen coach asignado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clasesDisponibles.map((clase) => {
              const tieneSolicitud = clasesConSolicitud.has(clase.id)
              return (
                <ClaseCardCoach
                  key={clase.id}
                  clase={clase}
                  tipo={tieneSolicitud ? 'solicitada' : 'disponible'}
                  solicitud={solicitudesPendientes.find(s => s.clase_id === clase.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className="rounded-2xl bg-gradient-to-br from-[#E84A27]/5 to-[#FF6B35]/5 border border-[#E84A27]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">
              ¿Cómo funciona el sistema de solicitudes?
            </h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>• <strong className="text-white">Solicita clases:</strong> Haz clic en &quot;Solicitar&quot; en las clases disponibles</li>
              <li>• <strong className="text-white">Espera respuesta:</strong> El admin revisará todas las solicitudes</li>
              <li>• <strong className="text-white">Asignación:</strong> Si te asignan, recibirás una notificación</li>
              <li>• <strong className="text-white">Cancela:</strong> Puedes cancelar tus solicitudes si cambias de opinión</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// LOADING STATE
// ============================================================================

function ClasesCoachLoading() {
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

export default function ClasesCoachPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<ClasesCoachLoading />}>
            <ClasesCoachContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}