// src/app/(dashboard)/cliente/reservas/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { obtenerMisReservas, cancelarReserva } from '@/lib/actions/reservas-actions'
import type { ReservaConRelaciones } from '@/lib/actions/reservas-actions'
import type { EstadoReserva } from '@/lib/types/enums'

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<ReservaConRelaciones[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<'todas' | EstadoReserva>('todas')
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [reservaACancelar, setReservaACancelar] = useState<ReservaConRelaciones | null>(null)
  const [razonCancelacion, setRazonCancelacion] = useState('')

  useEffect(() => {
    cargarReservas()
  }, [filtroEstado])

  const cargarReservas = async () => {
    setCargando(true)
    const resultado = await obtenerMisReservas({
      estado: filtroEstado !== 'todas' ? filtroEstado : undefined,
    })

    if (resultado.success) {
      setReservas(resultado.data)
    }
    setCargando(false)
  }

  const iniciarCancelacion = (reserva: ReservaConRelaciones) => {
    setReservaACancelar(reserva)
    setMostrarModal(true)
  }

  const confirmarCancelacion = async () => {
    if (!reservaACancelar) return

    setCancelando(reservaACancelar.id)
    const resultado = await cancelarReserva(reservaACancelar.id, razonCancelacion || undefined)

    if (resultado.success) {
      alert(resultado.mensaje)
      await cargarReservas()
    } else {
      alert(resultado.error)
    }

    setCancelando(null)
    setMostrarModal(false)
    setReservaACancelar(null)
    setRazonCancelacion('')
  }

  const horasParaClase = (fechaHora: string) => {
    return (new Date(fechaHora).getTime() - Date.now()) / (1000 * 60 * 60)
  }

  const puedeCancelar = (reserva: ReservaConRelaciones) => {
    if (reserva.estado !== 'confirmada') return false
    const horas = horasParaClase(reserva.clase.fecha_hora)
    return horas > 0
  }

  const esCancelacionTardia = (fechaHora: string) => {
    const horas = horasParaClase(fechaHora)
    return horas < 2 && horas > 0
  }

  const badgeEstado = (estado: EstadoReserva) => {
    const estilos = {
      confirmada: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelada: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      completada: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      no_show: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    const textos = {
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      completada: 'Completada',
      no_show: 'No Asistió',
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${estilos[estado]}`}
      >
        {textos[estado]}
      </span>
    )
  }

  const reservasActivas = reservas.filter(
    (r) => r.estado === 'confirmada' && new Date(r.clase.fecha_hora) > new Date()
  )
  const reservasPasadas = reservas.filter(
    (r) =>
      r.estado !== 'confirmada' ||
      (r.estado === 'confirmada' && new Date(r.clase.fecha_hora) <= new Date())
  )

  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm rounded-2xl p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mis Reservas</h1>
            <p className="text-white/60">Gestiona tus clases reservadas</p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            {(['todas', 'confirmada', 'completada', 'cancelada', 'no_show'] as const).map(
              (estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filtroEstado === estado
                      ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {estado === 'todas' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              )
            )}
          </div>

          {cargando ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reservas.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-white mb-2">Sin reservas</h3>
              <p className="text-white/60 mb-6">
                No tienes reservas con el filtro seleccionado
              </p>
              <a
                href="/cliente/clases"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Explorar Clases
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Reservas Activas */}
              {reservasActivas.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>🔥</span>
                    Próximas Clases
                  </h2>
                  <div className="grid gap-4">
                    {reservasActivas.map((reserva) => {
                      const tardia = esCancelacionTardia(reserva.clase.fecha_hora)

                      return (
                        <div
                          key={reserva.id}
                          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#E84A27]/50 transition-all duration-300"
                        >
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              {/* Info Principal */}
                              <div className="flex-1 space-y-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                      {reserva.clase.disciplina.nombre}
                                    </h3>
                                    <p className="text-white/60 text-sm">
                                      {reserva.clase.salon.nombre}
                                      {reserva.espacio && ` • Espacio #${reserva.espacio.numero}`}
                                    </p>
                                  </div>
                                  {badgeEstado(reserva.estado)}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {/* Fecha */}
                                  <div>
                                    <p className="text-white/40 text-xs mb-1">Fecha</p>
                                    <p className="text-white font-semibold text-sm">
                                      {new Date(reserva.clase.fecha_hora).toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </p>
                                  </div>

                                  {/* Hora */}
                                  <div>
                                    <p className="text-white/40 text-xs mb-1">Hora</p>
                                    <p className="text-white font-semibold text-sm">
                                      {new Date(reserva.clase.fecha_hora).toLocaleTimeString('es-MX', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>

                                  {/* Duración */}
                                  <div>
                                    <p className="text-white/40 text-xs mb-1">Duración</p>
                                    <p className="text-white font-semibold text-sm">
                                      {reserva.clase.duracion} min
                                    </p>
                                  </div>

                                  {/* Coach */}
                                  {reserva.clase.coach && (
                                    <div>
                                      <p className="text-white/40 text-xs mb-1">Coach</p>
                                      <p className="text-white font-semibold text-sm truncate">
                                        {reserva.clase.coach.profiles.nombre_completo}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="flex flex-col gap-3">
                                {puedeCancelar(reserva) && (
                                  <>
                                    <button
                                      onClick={() => iniciarCancelacion(reserva)}
                                      disabled={cancelando === reserva.id}
                                      className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar'}
                                    </button>
                                    {tardia && (
                                      <p className="text-yellow-400 text-xs text-center">
                                        ⚠️ Cancelación tardía
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Historial */}
              {reservasPasadas.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>📜</span>
                    Historial
                  </h2>
                  <div className="grid gap-4">
                    {reservasPasadas.map((reserva) => (
                      <div
                        key={reserva.id}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 opacity-75"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {reserva.clase.disciplina.nombre}
                                </h3>
                                <p className="text-white/60 text-sm">
                                  {new Date(reserva.clase.fecha_hora).toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}{' '}
                                  •{' '}
                                  {new Date(reserva.clase.fecha_hora).toLocaleTimeString('es-MX', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              {badgeEstado(reserva.estado)}
                            </div>
                            {reserva.razon_cancelacion && (
                              <p className="text-white/40 text-sm">
                                Razón: {reserva.razon_cancelacion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Cancelación */}
      {mostrarModal && reservaACancelar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Cancelar Reserva</h3>
              <p className="text-white/60">
                {reservaACancelar.clase.disciplina.nombre} •{' '}
                {new Date(reservaACancelar.clase.fecha_hora).toLocaleDateString('es-MX')}
              </p>
            </div>

            {esCancelacionTardia(reservaACancelar.clase.fecha_hora) && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm font-medium">
                  ⚠️ Cancelación con menos de 2 horas de anticipación. Se aplicará penalización de 1
                  crédito adicional.
                </p>
              </div>
            )}

            <div>
              <label className="block text-white/60 text-sm font-medium mb-2">
                Razón de cancelación (opcional)
              </label>
              <textarea
                value={razonCancelacion}
                onChange={(e) => setRazonCancelacion(e.target.value)}
                placeholder="¿Por qué cancelas?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#E84A27] focus:border-transparent transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarModal(false)
                  setReservaACancelar(null)
                  setRazonCancelacion('')
                }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300"
              >
                No Cancelar
              </button>
              <button
                onClick={confirmarCancelacion}
                disabled={!!cancelando}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelando ? 'Cancelando...' : 'Sí, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardBackground>
  )
}