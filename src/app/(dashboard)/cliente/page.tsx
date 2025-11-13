// src/app/(dashboard)/cliente/page.tsx
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { obtenerEstadisticasCliente } from '@/lib/actions/reservas-actions'

// ============================================================================
// CONTENIDO DEL DASHBOARD
// ============================================================================

async function DashboardContent() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre_completo')
    .eq('id', user.id)
    .single()

  // Obtener estadísticas
  const estadisticasRes = await obtenerEstadisticasCliente()
  const stats = estadisticasRes.success ? estadisticasRes.data : {
    reservas_totales: 0,
    clases_asistidas: 0,
    no_shows: 0,
    creditos_disponibles: 0,
    proxima_clase: null,
  }

  const nombrePrimero = profile?.nombre_completo?.split(' ')[0] || 'Cliente'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          ¡Hola, {nombrePrimero}! 💪
        </h1>
        <p className="text-white/60">
          Bienvenido a tu dashboard personal
        </p>
      </div>

      {/* Créditos Destacados */}
      <div className="bg-gradient-to-br from-[#E84A27] to-[#FF6B35] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">
                Créditos Disponibles
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold text-white">
                  {stats.creditos_disponibles}
                </span>
                <span className="text-white/80 text-xl">créditos</span>
              </div>
            </div>
            <Link
              href="/cliente/paquetes"
              className="px-6 py-3 bg-white text-[#E84A27] font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 shadow-xl"
            >
              Comprar Más
            </Link>
          </div>
          {stats.creditos_disponibles <= 2 && (
            <p className="text-white/90 text-sm mt-4">
              ⚠️ Tus créditos están por agotarse. Compra un paquete para continuar reservando.
            </p>
          )}
        </div>
      </div>

      {/* Próxima Clase */}
      {stats.proxima_clase && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#E84A27]/50 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span>
            Tu Próxima Clase
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-sm mb-1">Disciplina</p>
                <p className="text-white font-semibold text-lg">
                  {stats.proxima_clase.clase.disciplina.nombre}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-sm mb-1">Fecha y Hora</p>
                <p className="text-white font-semibold">
                  {new Date(stats.proxima_clase.clase.fecha_hora).toLocaleString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-sm mb-1">Salón</p>
                <p className="text-white font-semibold">
                  {stats.proxima_clase.clase.salon.nombre}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.proxima_clase.clase.coach && (
                <div>
                  <p className="text-white/40 text-sm mb-1">Coach</p>
                  <div className="flex items-center gap-3">
                    {stats.proxima_clase.clase.coach.profiles.foto_url ? (
                      <img
                        src={stats.proxima_clase.clase.coach.profiles.foto_url}
                        alt="Coach"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E84A27] to-[#FF6B35] flex items-center justify-center text-white font-bold">
                        {stats.proxima_clase.clase.coach.profiles.nombre_completo.charAt(0)}
                      </div>
                    )}
                    <p className="text-white font-semibold">
                      {stats.proxima_clase.clase.coach.profiles.nombre_completo}
                    </p>
                  </div>
                </div>
              )}
              {stats.proxima_clase.espacio && (
                <div>
                  <p className="text-white/40 text-sm mb-1">Tu Espacio</p>
                  <p className="text-white font-semibold">
                    {stats.proxima_clase.espacio.tipo_equipo} #{stats.proxima_clase.espacio.numero}
                  </p>
                </div>
              )}
              <div className="pt-4">
                <Link
                  href="/cliente/reservas"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/50 transition-all duration-300"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reservas */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#E84A27]/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">
                Total Reservas
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.reservas_totales}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] flex items-center justify-center text-2xl">
              📅
            </div>
          </div>
          <p className="text-white/60 text-sm">
            Clases reservadas en total
          </p>
        </div>

        {/* Clases Asistidas */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FF6B35]/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">
                Clases Completadas
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.clases_asistidas}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E84A27] flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B35] to-[#E84A27] rounded-full transition-all duration-500"
                style={{
                  width: `${stats.reservas_totales > 0 ? (stats.clases_asistidas / stats.reservas_totales) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-white/60 text-sm font-medium">
              {stats.reservas_totales > 0
                ? Math.round((stats.clases_asistidas / stats.reservas_totales) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Asistencia */}
        <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FF006E]/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider mb-1">
                No-Shows
              </p>
              <p className="text-4xl font-bold text-white">
                {stats.no_shows}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF006E] to-[#9D4EDD] flex items-center justify-center text-2xl">
              ⚠️
            </div>
          </div>
          <p className="text-white/60 text-sm">
            {stats.no_shows === 0
              ? '¡Excelente asistencia!'
              : 'Intenta no faltar a tus clases'}
          </p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/cliente/clases"
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#E84A27]/50 transition-all duration-300"
        >
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Explorar Clases
          </h3>
          <p className="text-white/60 text-sm">
            Descubre clases disponibles
          </p>
        </Link>

        <Link
          href="/cliente/reservas"
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FF6B35]/50 transition-all duration-300"
        >
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Mis Reservas
          </h3>
          <p className="text-white/60 text-sm">
            Gestiona tus reservas
          </p>
        </Link>

        <Link
          href="/cliente/paquetes"
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#FF006E]/50 transition-all duration-300"
        >
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Comprar Paquete
          </h3>
          <p className="text-white/60 text-sm">
            Adquiere más créditos
          </p>
        </Link>

        <Link
          href="/cliente/perfil"
          className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#9D4EDD]/50 transition-all duration-300"
        >
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-white font-semibold text-lg mb-2">
            Mi Perfil
          </h3>
          <p className="text-white/60 text-sm">
            Actualiza tu información
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
      <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default function ClienteDashboardPage() {
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