// src/app/(dashboard)/coach/page.tsx
import { Suspense } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { obtenerClases } from '@/lib/actions/clases-actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

// ============================================================================
// OBTENER DATOS
// ============================================================================

async function obtenerDatosCoach() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  // Obtener info del coach
  const { data: coachData } = await supabase
    .from('coaches')
    .select(`
      *,
      profiles!coaches_id_fkey (
        nombre_completo,
        foto_url
      )
    `)
    .eq('id', session.user.id)
    .single()

  // Clases asignadas futuras
  const clasesResult = await obtenerClases({
    coach_id: session.user.id,
    solo_futuras: true
  })

  // Próxima clase
  const proximaClase = clasesResult.success && clasesResult.data.length > 0
    ? clasesResult.data[0]
    : null

  // Stats del mes actual
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const finMes = new Date()
  finMes.setMonth(finMes.getMonth() + 1)
  finMes.setDate(0)
  finMes.setHours(23, 59, 59, 999)

  const { data: clasesEsteMes } = await supabase
    .from('clases')
    .select('id')
    .eq('coach_id', session.user.id)
    .gte('fecha_hora', inicioMes.toISOString())
    .lte('fecha_hora', finMes.toISOString())
    .neq('estado', 'cancelada')

  // Solicitudes pendientes
  const { data: solicitudesPendientes } = await supabase
    .from('solicitudes_clases')
    .select('id')
    .eq('coach_id', session.user.id)
    .eq('estado', 'pendiente')

  return {
    coach: coachData,
    totalClasesMes: clasesEsteMes?.length || 0,
    totalClasesFuturas: clasesResult.success ? clasesResult.data.length : 0,
    proximaClase,
    solicitudesPendientes: solicitudesPendientes?.length || 0,
    calificacion: coachData?.calificacion_promedio || 5.0
  }
}

// ============================================================================
// COMPONENTE CONTENIDO
// ============================================================================

async function DashboardContent() {
  const datos = await obtenerDatosCoach()

  if (!datos) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Error al cargar datos</p>
      </div>
    )
  }

  const { coach, totalClasesMes, totalClasesFuturas, proximaClase, solicitudesPendientes, calificacion } = datos
  const perfil = Array.isArray(coach.profiles) ? coach.profiles[0] : coach.profiles

  return (
    <div className="space-y-8">
      {/* Header con info del coach */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
        <div className="flex items-start gap-6">
          {perfil?.foto_url ? (
            <Image
              src={perfil.foto_url}
              alt={perfil.nombre_completo || 'Coach'}
              width={96}
              height={96}
              className="rounded-2xl object-cover border border-white/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E84A27] to-[#FF6B35] flex items-center justify-center text-white text-3xl font-bold">
              {perfil?.nombre_completo?.charAt(0) || '?'}
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Coach'}!
            </h1>
            <p className="text-white/60 text-lg mb-4">
              {coach.disponible_para_clases 
                ? 'Listo para dar clases increíbles' 
                : 'No disponible temporalmente'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-white/80">
                <span>⭐</span>
                <span className="font-semibold">{Number(calificacion).toFixed(1)}</span>
                <span className="text-white/40">calificación</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/80">
                <span>📊</span>
                <span className="font-semibold">{coach.total_clases_impartidas || 0}</span>
                <span className="text-white/40">clases impartidas</span>
              </div>

              {coach.es_head_coach && (
                <div className="px-3 py-1 rounded-full bg-[#FF006E]/10 border border-[#FF006E]/20 text-[#FF006E] text-sm font-medium">
                  👑 Head Coach
                </div>
              )}
            </div>
          </div>

          <Link
            href="/coach/perfil"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            Ver Perfil
          </Link>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clases Este Mes */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#E84A27]/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E84A27]/10 flex items-center justify-center text-2xl">
              📅
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-1">Este Mes</p>
              <p className="text-white text-3xl font-bold">{totalClasesMes}</p>
            </div>
          </div>
        </div>

        {/* Clases Futuras */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#FF6B35]/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-2xl">
              🗓️
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-1">Próximas</p>
              <p className="text-white text-3xl font-bold">{totalClasesFuturas}</p>
            </div>
          </div>
        </div>

        {/* Solicitudes Pendientes */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#9D4EDD]/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 flex items-center justify-center text-2xl">
              🙋
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-1">Solicitudes</p>
              <p className="text-white text-3xl font-bold">{solicitudesPendientes}</p>
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#FF006E]/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF006E]/10 flex items-center justify-center text-2xl">
              ⭐
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm mb-1">Calificación</p>
              <p className="text-white text-3xl font-bold">{Number(calificacion).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Próxima Clase */}
      {proximaClase ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#E84A27]/10 to-[#FF6B35]/10 border border-[#E84A27]/20 p-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                🎯 Próxima Clase
              </h2>
              <p className="text-white/60">
                Prepárate para dar lo mejor
              </p>
            </div>
            <Link
              href="/coach/clases"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              Ver Todas
            </Link>
          </div>

          <div className="rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">
                {proximaClase.disciplina.nombre === 'Cycling' ? '🚴' : '💪'}
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {proximaClase.nombre_clase || proximaClase.disciplina.nombre}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-white/60">
                    📅 {new Date(proximaClase.fecha_hora).toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </div>
                  <div className="text-white/60">
                    🕐 {new Date(proximaClase.fecha_hora).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-white/60">
                    📍 {proximaClase.salon.nombre}
                  </div>
                  <div className="text-white/60">
                    👥 {proximaClase.reservas_count}/{proximaClase.capacidad}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No tienes clases asignadas
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
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/coach/clases"
          className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#E84A27]/30 transition-all duration-300"
        >
          <div className="text-3xl mb-4">📋</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Mis Clases
          </h3>
          <p className="text-white/60 text-sm">
            Ver y gestionar tus clases asignadas
          </p>
        </Link>

        <Link
          href="/coach/calendario"
          className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#FF6B35]/30 transition-all duration-300"
        >
          <div className="text-3xl mb-4">🗓️</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Calendario
          </h3>
          <p className="text-white/60 text-sm">
            Vista semanal y mensual de tu horario
          </p>
        </Link>

        <Link
          href="/coach/calificaciones"
          className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-[#9D4EDD]/30 transition-all duration-300"
        >
          <div className="text-3xl mb-4">⭐</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Calificaciones
          </h3>
          <p className="text-white/60 text-sm">
            Feedback de tus alumnos
          </p>
        </Link>
      </div>
    </div>
  )
}

// ============================================================================
// LOADING STATE
// ============================================================================

function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
    </div>
  )
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function CoachDashboardPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}