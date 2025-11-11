// src/app/(dashboard)/admin/clases/[id]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { obtenerClasePorId } from '@/lib/actions/clases-actions'
import { DetalleClaseActions } from '@/components/clases/DetalleClaseActions'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

async function DetalleClaseContent({ params }: PageProps) {
  const resultado = await obtenerClasePorId(params.id)

  if (!resultado.success) {
    notFound()
  }

  const clase = resultado.data

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearHora = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerColorDisciplina = () => {
    if (clase.disciplina.tipo === 'cycling') return 'from-[#E84A27] to-[#FF6B35]'
    if (clase.disciplina.tipo === 'funcional') return 'from-[#FF006E] to-[#9D4EDD]'
    return 'from-[#9D4EDD] to-[#5E60CE]'
  }

  const obtenerColorEstado = () => {
    if (clase.estado === 'cancelada') return 'gray'
    if (clase.estado === 'completada') return 'blue'
    if (!clase.coach_id) return 'orange'
    return 'green'
  }

  const obtenerTextoEstado = () => {
    if (clase.estado === 'cancelada') return 'Cancelada'
    if (clase.estado === 'completada') return 'Completada'
    if (!clase.coach_id) return 'Sin Asignar'
    return 'Confirmada'
  }

  const colorEstado = obtenerColorEstado()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <Link
            href="/admin/clases"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Volver a Clases</span>
          </Link>
          <h1 className="text-4xl font-bold text-white">
            Detalle de Clase
          </h1>
          <p className="text-white/60 text-lg">
            {formatearFecha(clase.fecha_hora)} • {formatearHora(clase.fecha_hora)}
          </p>
        </div>

        <div className={`px-6 py-3 rounded-xl ${
          colorEstado === 'green' ? 'bg-green-500/10 border border-green-500/20' :
          colorEstado === 'orange' ? 'bg-[#FF6B35]/10 border border-[#FF6B35]/20' :
          colorEstado === 'gray' ? 'bg-white/5 border border-white/10' :
          'bg-blue-500/10 border border-blue-500/20'
        }`}>
          <p className={`font-semibold text-lg ${
            colorEstado === 'green' ? 'text-green-400' :
            colorEstado === 'orange' ? 'text-[#FF6B35]' :
            colorEstado === 'gray' ? 'text-white/40' :
            'text-blue-400'
          }`}>
            {obtenerTextoEstado()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Principal */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${obtenerColorDisciplina()} flex items-center justify-center text-4xl`}>
                {clase.disciplina.tipo === 'cycling' ? '🚴' : '💪'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {clase.nombre_clase || clase.disciplina.nombre}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-white/60">
                  <span>🏢 {clase.salon.nombre}</span>
                  <span>⏱️ {clase.duracion} minutos</span>
                  <span>👥 {clase.capacidad} espacios</span>
                </div>
                {clase.especialidad && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span>🎯</span>
                    <span className="text-white font-medium">{clase.especialidad.nombre}</span>
                  </div>
                )}
              </div>
            </div>

            {clase.descripcion && (
              <div className="mt-6 p-4 rounded-xl bg-white/5">
                <p className="text-white/80">{clase.descripcion}</p>
              </div>
            )}
          </div>

          {/* Coach */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Coach Asignado</h3>
            {clase.coach ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden">
                  {clase.coach.profiles.foto_url ? (
                    <Image
                      src={clase.coach.profiles.foto_url}
                      alt={clase.coach.profiles.nombre_completo}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {clase.coach.profiles.nombre_completo}
                  </p>
                  {clase.coach.biografia && (
                    <p className="text-white/60 text-sm mt-1">
                      {clase.coach.biografia}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 p-8 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                <span className="text-3xl">⚠️</span>
                <p className="text-[#FF6B35] font-semibold">
                  Esta clase aún no tiene coach asignado
                </p>
              </div>
            )}
          </div>

          {clase.notas_coach && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Notas del Coach</h3>
              <p className="text-white/80">{clase.notas_coach}</p>
            </div>
          )}

          {clase.playlist_url && (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Playlist</h3>
              <a
                href={clase.playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 transition-all"
              >
                <span>🎵</span>
                <span>Ver Playlist</span>
              </a>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Reservas */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reservas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Confirmadas</span>
                <span className="text-white font-bold text-xl">{clase.reservas_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Capacidad</span>
                <span className="text-white font-bold text-xl">{clase.capacidad}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${obtenerColorDisciplina()} transition-all duration-300`}
                  style={{ width: `${(clase.reservas_count / clase.capacidad) * 100}%` }}
                />
              </div>
              <p className="text-white/40 text-sm text-center">
                {clase.capacidad - clase.reservas_count} espacios disponibles
              </p>
            </div>
          </div>

          {/* Info Adicional */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Creada</span>
                <span className="text-white">
                  {new Date(clase.created_at).toLocaleDateString('es-MX')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Última actualización</span>
                <span className="text-white">
                  {new Date(clase.updated_at).toLocaleDateString('es-MX')}
                </span>
              </div>
              {clase.asignada_por && clase.asignada_at && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Asignada</span>
                  <span className="text-white">
                    {new Date(clase.asignada_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DetalleClaseActions clase={clase} />
        </div>
      </div>
    </div>
  )
}

function LoadingDetalle() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-6 w-32 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[600px] bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-[600px] bg-white/5 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

export default function DetalleClasePage({ params }: PageProps) {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingDetalle />}>
            <DetalleClaseContent params={params} />
          </Suspense>
        </div>
      </div>
    </DashboardBackground>
  )
}