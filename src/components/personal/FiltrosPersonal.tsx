// src/components/personal/FiltrosPersonal.tsx
'use client'

import type { TipoPersonal } from '@/lib/types/personal.types'
import type { EstadoPersonal } from '@/lib/types/enums'

interface FiltrosPersonalProps {
  filtros: {
    tipo?: TipoPersonal
    estado?: EstadoPersonal
    busqueda?: string
  }
  onCambiarFiltros: (filtros: {
    tipo?: TipoPersonal
    estado?: EstadoPersonal
    busqueda?: string
  }) => void
}

export function FiltrosPersonal({ filtros, onCambiarFiltros }: FiltrosPersonalProps) {
  const handleCambiarTipo = (tipo: TipoPersonal | 'todos') => {
    onCambiarFiltros({
      ...filtros,
      tipo: tipo === 'todos' ? undefined : tipo
    })
  }

  const handleCambiarEstado = (estado: EstadoPersonal | 'todos') => {
    onCambiarFiltros({
      ...filtros,
      estado: estado === 'todos' ? undefined : estado
    })
  }

  const handleCambiarBusqueda = (busqueda: string) => {
    onCambiarFiltros({
      ...filtros,
      busqueda: busqueda || undefined
    })
  }

  const limpiarFiltros = () => {
    onCambiarFiltros({})
  }

  const hayFiltrosActivos = filtros.tipo || filtros.estado || filtros.busqueda

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🔍 Filtros
        </h3>
        
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-semibold transition-all"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Buscar por nombre o email
          </label>
          <input
            type="text"
            value={filtros.busqueda || ''}
            onChange={(e) => handleCambiarBusqueda(e.target.value)}
            placeholder="Escribe para buscar..."
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#E84A27] focus:outline-none focus:ring-2 focus:ring-[#E84A27]/20 transition-all"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Tipo de Personal
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCambiarTipo('todos')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${!filtros.tipo
                  ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              Todos
            </button>
            
            <button
              onClick={() => handleCambiarTipo('coach')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${filtros.tipo === 'coach'
                  ? 'bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              🏋️ Coaches
            </button>
            
            <button
              onClick={() => handleCambiarTipo('staff')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${filtros.tipo === 'staff'
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              👔 Staff
            </button>
          </div>
        </div>

        {/* Estado */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Estado
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleCambiarEstado('todos')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${!filtros.estado
                  ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              Todos
            </button>
            
            <button
              onClick={() => handleCambiarEstado('pendiente')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${filtros.estado === 'pendiente'
                  ? 'bg-yellow-500/30 text-yellow-200 border-2 border-yellow-400'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              ⏳ Pendientes
            </button>
            
            <button
              onClick={() => handleCambiarEstado('aprobado')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${filtros.estado === 'aprobado'
                  ? 'bg-green-500/30 text-green-200 border-2 border-green-400'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              ✅ Aprobados
            </button>
            
            <button
              onClick={() => handleCambiarEstado('rechazado')}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all
                ${filtros.estado === 'rechazado'
                  ? 'bg-red-500/30 text-red-200 border-2 border-red-400'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              ❌ Rechazados
            </button>
          </div>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hayFiltrosActivos && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-white/50">Filtros activos:</span>
            
            {filtros.tipo && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] text-white">
                {filtros.tipo === 'coach' ? '🏋️ Coaches' : '👔 Staff'}
              </span>
            )}
            
            {filtros.estado && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                {filtros.estado === 'pendiente' && '⏳ Pendientes'}
                {filtros.estado === 'aprobado' && '✅ Aprobados'}
                {filtros.estado === 'rechazado' && '❌ Rechazados'}
              </span>
            )}
            
            {filtros.busqueda && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                🔍 &quot;{filtros.busqueda}&quot;
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}