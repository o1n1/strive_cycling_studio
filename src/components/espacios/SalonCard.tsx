'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { TipoDisciplina } from '@/lib/types/enums'

// ============================================================================
// TYPES
// ============================================================================

interface SalonCardProps {
  id: string
  nombre: string
  descripcion: string | null
  tipo: TipoDisciplina
  capacidad_maxima: number
  activo: boolean
  totalEspacios?: number
  espaciosDisponibles?: number
}

// ============================================================================
// HELPERS
// ============================================================================

const getTipoInfo = (tipo: TipoDisciplina) => {
  switch (tipo) {
    case 'cycling':
      return {
        label: 'Cycling',
        icon: '🚴',
        gradient: 'from-[#E84A27] to-[#FF6B35]',
        bgGradient: 'from-[#E84A27]/10 to-[#FF6B35]/10'
      }
    case 'funcional':
      return {
        label: 'Funcional',
        icon: '🏋️',
        gradient: 'from-[#FF006E] to-[#9D4EDD]',
        bgGradient: 'from-[#FF006E]/10 to-[#9D4EDD]/10'
      }
    case 'ambos':
      return {
        label: 'Híbrido',
        icon: '⚡',
        gradient: 'from-[#E84A27] via-[#FF006E] to-[#9D4EDD]',
        bgGradient: 'from-[#E84A27]/10 via-[#FF006E]/10 to-[#9D4EDD]/10'
      }
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SalonCard({
  id,
  nombre,
  descripcion,
  tipo,
  capacidad_maxima,
  activo,
  totalEspacios = 0,
  espaciosDisponibles = 0
}: SalonCardProps) {
  const tipoInfo = getTipoInfo(tipo)
  const porcentajeDisponible = totalEspacios > 0 
    ? Math.round((espaciosDisponibles / totalEspacios) * 100) 
    : 0

  return (
    <Link href={`/admin/espacios/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className={`
          group relative overflow-hidden rounded-2xl
          bg-white/5 backdrop-blur-xl
          border border-white/10
          hover:border-[#E84A27]/50
          hover:bg-white/10
          transition-all duration-300
          ${!activo && 'opacity-60'}
        `}
      >
        {/* Gradiente de fondo según tipo */}
        <div className={`absolute inset-0 bg-gradient-to-br ${tipoInfo.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* Badge de estado inactivo */}
        {!activo && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-xl border border-white/20 text-white/60">
              Inactivo
            </span>
          </div>
        )}

        <div className="relative p-6">
          {/* Header con icono y tipo */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                w-12 h-12 rounded-xl
                bg-gradient-to-br ${tipoInfo.gradient}
                flex items-center justify-center
                text-2xl
                shadow-lg
                group-hover:scale-110
                transition-transform duration-300
              `}>
                {tipoInfo.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#E84A27] transition-colors duration-300">
                  {nombre}
                </h3>
                <span className={`
                  inline-block px-2 py-0.5 rounded-md text-xs font-medium
                  bg-gradient-to-r ${tipoInfo.gradient}
                  text-white
                `}>
                  {tipoInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {descripcion && (
            <p className="text-sm text-white/60 mb-4 line-clamp-2">
              {descripcion}
            </p>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Capacidad máxima */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Capacidad
              </span>
              <span className="text-2xl font-bold text-white">
                {capacidad_maxima}
              </span>
              <span className="text-xs text-white/60">
                espacios máx.
              </span>
            </div>

            {/* Espacios actuales */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Instalados
              </span>
              <span className="text-2xl font-bold text-white">
                {totalEspacios}
              </span>
              <span className="text-xs text-white/60">
                espacios actuales
              </span>
            </div>
          </div>

          {/* Barra de disponibilidad */}
          {totalEspacios > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Disponibilidad</span>
                <span className="font-medium text-white">
                  {espaciosDisponibles} / {totalEspacios}
                </span>
              </div>
              
              {/* Barra de progreso */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${porcentajeDisponible}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full bg-gradient-to-r ${tipoInfo.gradient}`}
                />
              </div>

              {/* Indicadores de estado */}
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-white/60">{espaciosDisponibles} disponibles</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-white/60">{totalEspacios - espaciosDisponibles} en uso</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer con botón de gestión */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">
                {totalEspacios === 0 ? 'Sin espacios configurados' : 'Ver detalles'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-[#E84A27] transition-colors duration-300">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Efecto de brillo hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </motion.div>
    </Link>
  )
}