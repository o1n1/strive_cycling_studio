// src/components/clases/SolicitudCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { asignarCoachAClase } from '@/lib/actions/clases-actions'
import type { SolicitudConRelaciones } from '@/lib/actions/clases-actions'
import { useToast } from '@/hooks/useToast'

interface Props {
  solicitud: SolicitudConRelaciones
  claseId: string
}

export function SolicitudCard({ solicitud }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [cargando, setCargando] = useState(false)

  const manejarAsignar = async () => {
    if (!confirm(`¿Asignar ${solicitud.coach.profiles.nombre_completo} a esta clase?`)) {
      return
    }

    setCargando(true)
    const resultado = await asignarCoachAClase(solicitud.clase_id, solicitud.id)

    if (resultado.success) {
      toast.exito(`✅ Coach asignado correctamente`)
      router.refresh()
    } else {
      toast.error(`❌ ${resultado.error}`)
      setCargando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:border-[#E84A27]/50 hover:shadow-lg hover:shadow-[#E84A27]/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#E84A27]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {solicitud.coach.profiles.foto_url ? (
              <Image
                src={solicitud.coach.profiles.foto_url}
                alt={solicitud.coach.profiles.nombre_completo}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-lg mb-1">
              {solicitud.coach.profiles.nombre_completo}
            </h4>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-white/60">
                <span>⭐</span>
                <span className="font-medium text-white">
                  {Number(solicitud.coach.calificacion_promedio || 5).toFixed(1)}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-white/60">
                <span>📊</span>
                <span>{solicitud.coach.total_clases_impartidas || 0} clases</span>
              </div>
            </div>
          </div>
        </div>

        {solicitud.mensaje && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/40 text-xs mb-1">Mensaje:</p>
            <p className="text-white/80 text-sm">{solicitud.mensaje}</p>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={manejarAsignar}
            disabled={cargando}
            className="w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Asignando...' : '✅ Asignar a Esta Clase'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}