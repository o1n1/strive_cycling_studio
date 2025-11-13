// src/app/(dashboard)/cliente/clases/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { obtenerClasesDisponibles, crearReserva } from '@/lib/actions/reservas-actions'
import type { ReservaConRelaciones } from '@/lib/actions/reservas-actions'

export default function ClasesDisponiblesPage() {
  const [clases, setClases] = useState<ReservaConRelaciones['clase'][]>([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState({
    disciplina: '',
    fecha: '',
    soloConEspacios: true,
  })
  const [reservando, setReservando] = useState<string | null>(null)

  useEffect(() => {
    cargarClases()
  }, [filtros])

  const cargarClases = async () => {
    setCargando(true)
    const resultado = await obtenerClasesDisponibles({
      solo_con_espacios: filtros.soloConEspacios,
      disciplina_id: filtros.disciplina || undefined,
      fecha_inicio: filtros.fecha ? new Date(filtros.fecha).toISOString() : undefined,
      fecha_fin: filtros.fecha
        ? new Date(new Date(filtros.fecha).setHours(23, 59, 59)).toISOString()
        : undefined,
    })

    if (resultado.success) {
      setClases(resultado.data)
    }
    setCargando(false)
  }

  const handleReservar = async (claseId: string) => {
    setReservando(claseId)
    const resultado = await crearReserva(claseId)

    if (resultado.success) {
      alert(resultado.mensaje || 'Reserva confirmada')
      cargarClases()
    } else {
      alert(resultado.error)
    }
    setReservando(null)
  }

  const espaciosDisponibles = (clase: ReservaConRelaciones['clase']) => {
    return clase.capacidad - clase.reservas_count
  }

  const esCasiLlena = (clase: ReservaConRelaciones['clase']) => {
    const disponibles = espaciosDisponibles(clase)
    return disponibles > 0 && disponibles <= 3
  }

  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm rounded-2xl p-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Clases Disponibles
            </h1>
            <p className="text-white/60">
              Encuentra y reserva tu próxima clase
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro Fecha */}
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#E84A27] focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              {/* Toggle Solo con Espacios */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.soloConEspacios}
                    onChange={(e) =>
                      setFiltros({ ...filtros, soloConEspacios: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-[#E84A27] focus:ring-2 focus:ring-[#E84A27] focus:ring-offset-0 transition-all"
                  />
                  <span className="text-white text-sm">
                    Solo clases con espacios disponibles
                  </span>
                </label>
              </div>

              {/* Botón Limpiar */}
              <div className="flex items-end">
                <button
                  onClick={() => setFiltros({ disciplina: '', fecha: '', soloConEspacios: true })}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all duration-300"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Clases */}
          {cargando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : clases.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No hay clases disponibles
              </h3>
              <p className="text-white/60">
                Intenta cambiar los filtros o vuelve más tarde
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clases.map((clase) => {
                const disponibles = espaciosDisponibles(clase)
                const casiLlena = esCasiLlena(clase)
                const llena = disponibles === 0

                return (
                  <div
                    key={clase.id}
                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#E84A27]/50 transition-all duration-300"
                  >
                    {/* Badge Estado */}
                    {llena && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        LLENA
                      </div>
                    )}
                    {casiLlena && !llena && (
                      <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                        ¡ÚLTIMOS LUGARES!
                      </div>
                    )}

                    {/* Header con Gradiente */}
                    <div className="h-32 bg-gradient-to-br from-[#E84A27] to-[#FF6B35] relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {clase.disciplina.nombre}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {clase.salon.nombre}
                        </p>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-4">
                      {/* Fecha y Hora */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                          📅
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Fecha y Hora</p>
                          <p className="text-white font-semibold text-sm">
                            {new Date(clase.fecha_hora).toLocaleDateString('es-MX', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            •{' '}
                            {new Date(clase.fecha_hora).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Coach */}
                      {clase.coach && (
                        <div className="flex items-center gap-3">
                          {clase.coach.profiles.foto_url ? (
                            <img
                              src={clase.coach.profiles.foto_url}
                              alt="Coach"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9D4EDD] to-[#FF006E] flex items-center justify-center text-white font-bold">
                              {clase.coach.profiles.nombre_completo.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-white/40 text-xs">Coach</p>
                            <p className="text-white font-semibold text-sm">
                              {clase.coach.profiles.nombre_completo}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Capacidad */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <p className="text-white/40 text-xs">Disponibles</p>
                          <p className="text-white font-bold text-lg">
                            {disponibles} / {clase.capacidad}
                          </p>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E84A27] to-[#FF6B35] rounded-full transition-all duration-500"
                              style={{
                                width: `${((clase.capacidad - disponibles) / clase.capacidad) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Botón Reservar */}
                      <button
                        onClick={() => handleReservar(clase.id)}
                        disabled={llena || reservando === clase.id}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                          llena
                            ? 'bg-white/5 text-white/40 cursor-not-allowed'
                            : reservando === clase.id
                            ? 'bg-white/10 text-white/60 cursor-wait'
                            : 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/50'
                        }`}
                      >
                        {reservando === clase.id
                          ? 'Reservando...'
                          : llena
                          ? 'Clase Llena'
                          : 'Reservar Ahora'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardBackground>
  )
}