'use client'

import { useState } from 'react'
import { EspacioCard } from './EspacioCard'
import type { EstadoEspacio } from '@/lib/types/enums'
import type { EspacioData } from '@/lib/actions/espacios-actions'

interface EspaciosGridProps {
  espacios: (EspacioData & { id: string })[]
  salonId: string
  onEspaciosChange: () => void
}

export function EspaciosGrid({ espacios, onEspaciosChange }: EspaciosGridProps) {
  const [filtroEstado, setFiltroEstado] = useState<EstadoEspacio | 'todos'>('todos')
  const [vistaLayout, setVistaLayout] = useState<'grid' | 'visual'>('grid')

  // Filtrar espacios
  const espaciosFiltrados = espacios.filter(e => 
    filtroEstado === 'todos' || e.estado === filtroEstado
  )

  // Estadísticas
  const stats = {
    total: espacios.length,
    disponibles: espacios.filter(e => e.estado === 'disponible').length,
    ocupados: espacios.filter(e => e.estado === 'ocupado').length,
    mantenimiento: espacios.filter(e => e.estado === 'mantenimiento').length
  }

  return (
    <div className="space-y-6">
      {/* Barra de controles */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Estadísticas rápidas */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
              ${filtroEstado === 'todos'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
              }
            `}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFiltroEstado('disponible')}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
              ${filtroEstado === 'disponible'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-white/5 text-white/60 hover:bg-green-500/10 border border-transparent'
              }
            `}
          >
            Disponibles ({stats.disponibles})
          </button>
          <button
            onClick={() => setFiltroEstado('ocupado')}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
              ${filtroEstado === 'ocupado'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                : 'bg-white/5 text-white/60 hover:bg-yellow-500/10 border border-transparent'
              }
            `}
          >
            Ocupados ({stats.ocupados})
          </button>
          <button
            onClick={() => setFiltroEstado('mantenimiento')}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
              ${filtroEstado === 'mantenimiento'
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'bg-white/5 text-white/60 hover:bg-red-500/10 border border-transparent'
              }
            `}
          >
            Mantenimiento ({stats.mantenimiento})
          </button>
        </div>

        {/* Selector de vista */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setVistaLayout('grid')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
              ${vistaLayout === 'grid'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </span>
          </button>
          <button
            onClick={() => setVistaLayout('visual')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
              ${vistaLayout === 'visual'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Layout
            </span>
          </button>
        </div>
      </div>

      {/* Vista Grid */}
      {vistaLayout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {espaciosFiltrados.length > 0 ? (
            espaciosFiltrados.map((espacio) => (
              <EspacioCard
                key={espacio.id}
                {...espacio}
                onEstadoChange={onEspaciosChange}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-white/40">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium">No hay espacios {filtroEstado !== 'todos' && `en estado "${filtroEstado}"`}</p>
            </div>
          )}
        </div>
      )}

      {/* Vista Layout Visual */}
      {vistaLayout === 'visual' && (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {espaciosFiltrados.map((espacio) => {
              const estadoInfo = 
                espacio.estado === 'disponible' ? { bg: 'bg-green-500', border: 'border-green-400' } :
                espacio.estado === 'ocupado' ? { bg: 'bg-yellow-500', border: 'border-yellow-400' } :
                { bg: 'bg-red-500', border: 'border-red-400' }

              return (
                <div
                  key={espacio.id}
                  className={`
                    relative group
                    w-20 h-20 rounded-lg
                    ${estadoInfo.bg} ${estadoInfo.border} border-2
                    flex items-center justify-center
                    text-white font-bold text-xl
                    cursor-pointer
                    hover:scale-110
                    transition-all duration-300
                    shadow-lg
                  `}
                  title={`${espacio.tipo_equipo} #${espacio.numero} - ${espacio.estado}`}
                >
                  {espacio.numero}
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-[#1A1814] text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-2xl border border-white/10">
                      <div className="font-medium">{espacio.tipo_equipo} #{espacio.numero}</div>
                      <div className="text-white/60">{espacio.marca_equipo}</div>
                      <div className="mt-1 capitalize">{espacio.estado}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-white/80">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-white/80">Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-white/80">Mantenimiento</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}