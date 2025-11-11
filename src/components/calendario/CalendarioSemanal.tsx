// src/components/calendario/CalendarioSemanal.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ClaseConRelaciones } from '@/lib/actions/clases-actions'

// ============================================================================
// TYPES
// ============================================================================

interface CalendarioSemanalProps {
  clasesIniciales: ClaseConRelaciones[]
  rol: 'admin' | 'coach'
}

interface ClasePorDia {
  dia: Date
  clases: ClaseConRelaciones[]
}

// ============================================================================
// HELPERS
// ============================================================================

function obtenerInicioSemana(fecha: Date): Date {
  const dia = new Date(fecha)
  const diaSemana = dia.getDay()
  const diff = dia.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1) // Lunes como primer día
  return new Date(dia.setDate(diff))
}

function formatearHora(fechaHora: string): string {
  return new Date(fechaHora).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function agruparPorDia(clases: ClaseConRelaciones[]): ClasePorDia[] {
  const grupos: { [key: string]: ClaseConRelaciones[] } = {}
  
  clases.forEach(clase => {
    const fecha = new Date(clase.fecha_hora)
    const key = fecha.toDateString()
    
    if (!grupos[key]) {
      grupos[key] = []
    }
    grupos[key].push(clase)
  })

  return Object.entries(grupos).map(([dateStr, clasesDelDia]) => ({
    dia: new Date(dateStr),
    clases: clasesDelDia.sort((a, b) => 
      new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
    )
  })).sort((a, b) => a.dia.getTime() - b.dia.getTime())
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function CalendarioSemanal({ clasesIniciales, rol }: CalendarioSemanalProps) {
  const [semanaActual, setSemanaActual] = useState(obtenerInicioSemana(new Date()))
  
  // Calcular días de la semana
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(semanaActual)
    dia.setDate(semanaActual.getDate() + i)
    return dia
  })

  // Filtrar clases de esta semana
  const finSemana = new Date(semanaActual)
  finSemana.setDate(finSemana.getDate() + 7)
  
  const clasesSemana = clasesIniciales.filter(clase => {
    const fechaClase = new Date(clase.fecha_hora)
    return fechaClase >= semanaActual && fechaClase < finSemana
  })

  const clasesPorDia = agruparPorDia(clasesSemana)

  // Navegación
  const irSemanaAnterior = () => {
    const nueva = new Date(semanaActual)
    nueva.setDate(nueva.getDate() - 7)
    setSemanaActual(nueva)
  }

  const irSemanaSiguiente = () => {
    const nueva = new Date(semanaActual)
    nueva.setDate(nueva.getDate() + 7)
    setSemanaActual(nueva)
  }

  const irSemanaActualHoy = () => {
    setSemanaActual(obtenerInicioSemana(new Date()))
  }

  const esHoy = (fecha: Date) => {
    const hoy = new Date()
    return fecha.toDateString() === hoy.toDateString()
  }

  const obtenerClasesDelDia = (dia: Date) => {
    return clasesPorDia.find(cpd => cpd.dia.toDateString() === dia.toDateString())?.clases || []
  }

  return (
    <div className="space-y-6">
      {/* Controles de navegación */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={irSemanaAnterior}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          ← Anterior
        </button>

        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">
            {semanaActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={irSemanaActualHoy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 bg-[#E84A27]/10 border border-[#E84A27]/20 text-[#E84A27] hover:bg-[#E84A27]/20"
          >
            Hoy
          </button>
        </div>

        <button
          onClick={irSemanaSiguiente}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          Siguiente →
        </button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-4">
        {diasSemana.map((dia, idx) => {
          const clasesDelDia = obtenerClasesDelDia(dia)
          const hoy = esHoy(dia)

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-300 ${
                hoy 
                  ? 'bg-[#E84A27]/5 border-[#E84A27]/30' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Header del día */}
              <div className={`p-4 border-b ${
                hoy ? 'border-[#E84A27]/20' : 'border-white/10'
              }`}>
                <div className="text-center">
                  <p className={`text-xs font-medium uppercase mb-1 ${
                    hoy ? 'text-[#E84A27]' : 'text-white/60'
                  }`}>
                    {dia.toLocaleDateString('es-MX', { weekday: 'short' })}
                  </p>
                  <p className={`text-2xl font-bold ${
                    hoy ? 'text-white' : 'text-white/80'
                  }`}>
                    {dia.getDate()}
                  </p>
                </div>
              </div>

              {/* Clases del día */}
              <div className="p-3 space-y-2 min-h-[200px]">
                {clasesDelDia.length === 0 ? (
                  <p className="text-white/40 text-xs text-center mt-4">
                    Sin clases
                  </p>
                ) : (
                  clasesDelDia.map(clase => (
                    <Link
                      key={clase.id}
                      href={`/${rol}/clases/${clase.id}`}
                      className="block group"
                    >
                      <div className={`
                        p-3 rounded-xl border transition-all duration-300
                        ${clase.disciplina.nombre === 'Cycling' 
                          ? 'bg-[#E84A27]/10 border-[#E84A27]/20 hover:bg-[#E84A27]/20' 
                          : 'bg-[#9D4EDD]/10 border-[#9D4EDD]/20 hover:bg-[#9D4EDD]/20'
                        }
                      `}>
                        {/* Hora */}
                        <p className="text-white text-xs font-semibold mb-1">
                          {formatearHora(clase.fecha_hora)}
                        </p>

                        {/* Disciplina */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {clase.disciplina.nombre === 'Cycling' ? '🚴' : '💪'}
                          </span>
                          <p className="text-white/80 text-xs font-medium truncate">
                            {clase.nombre_clase || clase.disciplina.nombre}
                          </p>
                        </div>

                        {/* Info adicional */}
                        <div className="space-y-1">
                          {/* Coach */}
                          {clase.coach ? (
                            <p className="text-white/60 text-xs truncate">
                              👤 {Array.isArray(clase.coach.profiles) 
                                ? clase.coach.profiles[0]?.nombre_completo 
                                : clase.coach.profiles?.nombre_completo}
                            </p>
                          ) : (
                            <p className="text-[#FF6B35] text-xs">
                              📋 Sin asignar
                            </p>
                          )}

                          {/* Ocupación */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  (clase.reservas_count / clase.capacidad) > 0.8 
                                    ? 'bg-red-500' 
                                    : (clase.reservas_count / clase.capacidad) > 0.5 
                                      ? 'bg-[#FF6B35]' 
                                      : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${(clase.reservas_count / clase.capacidad) * 100}%` 
                                }}
                              />
                            </div>
                            <p className="text-white/60 text-xs whitespace-nowrap">
                              {clase.reservas_count}/{clase.capacidad}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E84A27]" />
            <span className="text-white/60">Cycling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#9D4EDD]" />
            <span className="text-white/60">Funcional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-white/60">&lt;50% ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
            <span className="text-white/60">50-80% ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-white/60">&gt;80% ocupado</span>
          </div>
        </div>
      </div>
    </div>
  )
}