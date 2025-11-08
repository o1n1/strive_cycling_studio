'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { EstadoEspacio } from '@/lib/types/enums'
import { actualizarEstadoEspacio } from '@/lib/actions/espacios-actions'

interface EspacioCardProps {
  id: string
  numero: number
  tipo_equipo: string
  marca_equipo: string | null
  estado: EstadoEspacio
  usos_desde_mantenimiento: number
  usos_para_mantenimiento: number
  onEstadoChange?: () => void
}

const getEstadoInfo = (estado: EstadoEspacio) => {
  switch (estado) {
    case 'disponible':
      return { label: 'Disponible', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: '✓' }
    case 'ocupado':
      return { label: 'Ocupado', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: '⊙' }
    case 'mantenimiento':
      return { label: 'Mantenimiento', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50', icon: '⚠' }
  }
}

export function EspacioCard({
  id,
  numero,
  tipo_equipo,
  marca_equipo,
  estado,
  usos_desde_mantenimiento,
  usos_para_mantenimiento,
  onEstadoChange
}: EspacioCardProps) {
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const estadoInfo = getEstadoInfo(estado)

  const porcentajeUso = Math.round((usos_desde_mantenimiento / usos_para_mantenimiento) * 100)
  const necesitaMantenimiento = porcentajeUso >= 80

  const handleCambiarEstado = async (nuevoEstado: EstadoEspacio) => {
    setLoading(true)
    setShowMenu(false)
    const resultado = await actualizarEstadoEspacio(id, nuevoEstado)
    if (resultado.success) onEstadoChange?.()
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl bg-white/5 backdrop-blur-xl border ${estadoInfo.borderColor} hover:bg-white/10 transition-all duration-300 ${loading && 'opacity-60'}`}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${estadoInfo.bgColor} flex items-center justify-center text-xl font-bold ${estadoInfo.color}`}>
              {numero}
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {tipo_equipo === 'bici' ? '🚴 Bici' : '🏋️ Tapete'} #{numero}
              </div>
              <div className="text-xs text-white/60">{marca_equipo || tipo_equipo}</div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-10 z-20 w-48 rounded-lg bg-[#1A1814] border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="p-1">
                  <button
                    onClick={() => handleCambiarEstado('disponible')}
                    disabled={estado === 'disponible'}
                    className="w-full px-3 py-2 rounded-md text-left text-sm text-white hover:bg-white/10 disabled:opacity-50 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Disponible
                  </button>
                  <button
                    onClick={() => handleCambiarEstado('mantenimiento')}
                    disabled={estado === 'mantenimiento'}
                    className="w-full px-3 py-2 rounded-md text-left text-sm text-white hover:bg-white/10 disabled:opacity-50 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Mantenimiento
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${estadoInfo.bgColor} ${estadoInfo.borderColor} border`}>
          <span className="text-lg">{estadoInfo.icon}</span>
          <span className={`text-xs font-medium ${estadoInfo.color}`}>{estadoInfo.label}</span>
        </div>

        {estado !== 'mantenimiento' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Uso</span>
              <span className={`font-medium ${necesitaMantenimiento ? 'text-red-400' : 'text-white'}`}>
                {usos_desde_mantenimiento} / {usos_para_mantenimiento}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${necesitaMantenimiento ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${porcentajeUso}%` }}
              />
            </div>
            {necesitaMantenimiento && (
              <div className="text-xs text-red-400 flex items-center gap-1">
                <span>⚠</span>
                Requiere mantenimiento pronto
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}