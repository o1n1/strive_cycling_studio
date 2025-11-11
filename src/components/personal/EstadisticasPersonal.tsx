// src/components/personal/EstadisticasPersonal.tsx
'use client'

import { useEffect, useState } from 'react'
import { obtenerEstadisticasPersonal } from '@/lib/actions/personal-actions'

interface Estadisticas {
  coaches: {
    activos: number
    pendientes: number
    rechazados: number
  }
  staff: {
    activos: number
    pendientes: number
    rechazados: number
  }
  total_activos: number
  total_pendientes: number
  documentos_pendientes: number
}

export function EstadisticasPersonal() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    setCargando(true)
    const resultado = await obtenerEstadisticasPersonal()
    if (resultado.success && resultado.data) {
      setEstadisticas(resultado.data)
    }
    setCargando(false)
  }

  if (cargando) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
            <div className="h-8 bg-white/10 rounded w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (!estadisticas) return null

  const stats = [
    {
      titulo: 'Personal Activo',
      valor: estadisticas.total_activos,
      subtitulo: `${estadisticas.coaches.activos} coaches, ${estadisticas.staff.activos} staff`,
      icono: '👥',
      color: 'from-[#E84A27] to-[#FF6B35]',
      borderColor: 'border-[#E84A27]/30'
    },
    {
      titulo: 'Pendientes Revisión',
      valor: estadisticas.total_pendientes,
      subtitulo: `${estadisticas.coaches.pendientes} coaches, ${estadisticas.staff.pendientes} staff`,
      icono: '⏳',
      color: 'from-[#FF6B35] to-[#FF8C42]',
      borderColor: 'border-[#FF6B35]/30'
    },
    {
      titulo: 'Documentos Pendientes',
      valor: estadisticas.documentos_pendientes,
      subtitulo: 'Requieren aprobación',
      icono: '📄',
      color: 'from-[#9D4EDD] to-[#C77DFF]',
      borderColor: 'border-[#9D4EDD]/30'
    },
    {
      titulo: 'Rechazados',
      valor: estadisticas.coaches.rechazados + estadisticas.staff.rechazados,
      subtitulo: `${estadisticas.coaches.rechazados} coaches, ${estadisticas.staff.rechazados} staff`,
      icono: '❌',
      color: 'from-[#FF006E] to-[#FF3D8F]',
      borderColor: 'border-[#FF006E]/30'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`
            bg-white/5 backdrop-blur-xl border ${stat.borderColor}
            rounded-2xl p-6
            hover:bg-white/10 hover:border-[#E84A27]/50
            transition-all duration-300
            hover:scale-105 hover:shadow-[0_8px_32px_rgba(232,74,39,0.3)]
            cursor-pointer
          `}
        >
          {/* Icono y Título */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{stat.icono}</div>
            <div
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                bg-gradient-to-r ${stat.color}
                text-white
              `}
            >
              {stat.titulo}
            </div>
          </div>

          {/* Valor Principal */}
          <div className="mb-2">
            <div className="text-4xl font-bold text-white">
              {stat.valor}
            </div>
          </div>

          {/* Subtítulo */}
          <div className="text-sm text-white/60">
            {stat.subtitulo}
          </div>
        </div>
      ))}
    </div>
  )
}