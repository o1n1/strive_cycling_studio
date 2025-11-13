// src/components/reservas/FiltrosClasesCliente.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// ============================================================================
// TIPOS
// ============================================================================

interface Disciplina {
  id: string
  nombre: string
  tipo: string
  color_hex: string
}

interface FiltrosClasesClienteProps {
  disciplinas: Disciplina[]
  onFiltrosChange: (filtros: {
    disciplina_id?: string
    fecha_desde?: string
    fecha_hasta?: string
    solo_disponibles?: boolean
  }) => void
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function FiltrosClasesCliente({
  disciplinas,
  onFiltrosChange
}: FiltrosClasesClienteProps) {
  const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<string>('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [soloDisponibles, setSoloDisponibles] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Aplicar filtros
  const aplicarFiltros = () => {
    onFiltrosChange({
      disciplina_id: disciplinaSeleccionada || undefined,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      solo_disponibles: soloDisponibles
    })
  }

  // Limpiar filtros
  const limpiarFiltros = () => {
    setDisciplinaSeleccionada('')
    setFechaDesde('')
    setFechaHasta('')
    setSoloDisponibles(true)
    onFiltrosChange({
      solo_disponibles: true
    })
  }

  // Contar filtros activos
  const filtrosActivos = [
    disciplinaSeleccionada,
    fechaDesde,
    fechaHasta,
    !soloDisponibles
  ].filter(Boolean).length

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header con toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <h3 className="text-white font-bold text-lg">Filtros</h3>
          {filtrosActivos > 0 && (
            <div className="px-3 py-1 rounded-full bg-[#E84A27] text-white text-xs font-semibold">
              {filtrosActivos}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="text-white/60 hover:text-white transition-colors"
        >
          {mostrarFiltros ? '▲' : '▼'}
        </button>
      </div>

      {/* Filtros expandibles */}
      <motion.div
        initial={false}
        animate={{ 
          height: mostrarFiltros ? 'auto' : 0,
          opacity: mostrarFiltros ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-6 pt-4">
          {/* Disciplinas */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Disciplina
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Opción: Todas */}
              <button
                onClick={() => setDisciplinaSeleccionada('')}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  disciplinaSeleccionada === ''
                    ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] border-[#E84A27] text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">🏋️</div>
                <p className="font-semibold text-sm">Todas</p>
              </button>

              {/* Disciplinas disponibles */}
              {disciplinas.map((disciplina) => (
                <button
                  key={disciplina.id}
                  onClick={() => setDisciplinaSeleccionada(disciplina.id)}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    disciplinaSeleccionada === disciplina.id
                      ? 'border-2'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: disciplinaSeleccionada === disciplina.id
                      ? `${disciplina.color_hex}20`
                      : undefined,
                    borderColor: disciplinaSeleccionada === disciplina.id
                      ? disciplina.color_hex
                      : undefined
                  }}
                >
                  <div className="text-2xl mb-2">
                    {disciplina.tipo === 'cycling' ? '🚴' : '💪'}
                  </div>
                  <p 
                    className="font-semibold text-sm"
                    style={{ 
                      color: disciplinaSeleccionada === disciplina.id 
                        ? disciplina.color_hex 
                        : undefined 
                    }}
                  >
                    {disciplina.nombre}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Rango de fechas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fecha desde */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                min={fechaDesde || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Solo disponibles */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-white font-medium text-sm">Solo disponibles</p>
                <p className="text-white/60 text-xs">Ocultar clases llenas</p>
              </div>
            </div>
            <button
              onClick={() => setSoloDisponibles(!soloDisponibles)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soloDisponibles ? 'bg-[#E84A27]' : 'bg-white/20'
              }`}
            >
              <motion.div
                animate={{ x: soloDisponibles ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={limpiarFiltros}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10"
            >
              Limpiar
            </button>
            <button
              onClick={aplicarFiltros}
              className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/50"
            >
              Aplicar
            </button>
          </div>
        </div>
      </motion.div>

      {/* Resumen de filtros (cuando están colapsados) */}
      {!mostrarFiltros && filtrosActivos > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
          {disciplinaSeleccionada && (
            <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
              {disciplinas.find(d => d.id === disciplinaSeleccionada)?.nombre}
            </div>
          )}
          {fechaDesde && (
            <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
              Desde: {new Date(fechaDesde).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </div>
          )}
          {fechaHasta && (
            <div className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
              Hasta: {new Date(fechaHasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}