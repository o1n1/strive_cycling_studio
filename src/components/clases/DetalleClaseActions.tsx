// src/components/clases/DetalleClaseActions.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cancelarClase, desasignarCoach, eliminarClase } from '@/lib/actions/clases-actions'
import type { ClaseConRelaciones } from '@/lib/actions/clases-actions'
import { useToast } from '@/hooks/useToast'

interface Props {
  clase: ClaseConRelaciones
}

export function DetalleClaseActions({ clase }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [cargando, setCargando] = useState(false)

  const manejarCancelar = async () => {
    if (!confirm('¿Estás seguro de cancelar esta clase? Se notificará a todos los afectados.')) {
      return
    }

    setCargando(true)
    const resultado = await cancelarClase(clase.id)
    
    if (resultado.success) {
      toast.exito('✅ Clase cancelada correctamente')
      router.refresh()
    } else {
      toast.error(`❌ ${resultado.error}`)
      setCargando(false)
    }
  }

  const manejarDesasignar = async () => {
    if (!clase.coach_id) return

    if (!confirm('¿Desasignar coach de esta clase?')) {
      return
    }

    setCargando(true)
    const resultado = await desasignarCoach(clase.id)
    
    if (resultado.success) {
      toast.exito('✅ Coach desasignado')
      router.refresh()
    } else {
      toast.error(`❌ ${resultado.error}`)
      setCargando(false)
    }
  }

  const manejarEliminar = async () => {
    if (!confirm('⚠️ ¿ELIMINAR esta clase permanentemente?\n\nEsta acción NO se puede deshacer.')) {
      return
    }

    if (!confirm('¿Estás completamente seguro? Esta es la última advertencia.')) {
      return
    }

    setCargando(true)
    const resultado = await eliminarClase(clase.id)
    
    if (resultado.success) {
      toast.exito('✅ Clase eliminada')
      router.push('/admin/clases')
      router.refresh()
    } else {
      toast.error(`❌ ${resultado.error}`)
      setCargando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
      <div className="space-y-3">
        {clase.estado === 'programada' && (
          <Link
            href={`/admin/clases/${clase.id}/editar`}
            className="w-full block px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            ✏️ Editar Clase
          </Link>
        )}

        {clase.estado === 'programada' && (
          <>
            {clase.coach_id ? (
              <button
                onClick={manejarDesasignar}
                disabled={cargando}
                className="w-full px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Desasignando...' : '❌ Desasignar Coach'}
              </button>
            ) : (
              <Link
                href={`/admin/clases/${clase.id}/asignar`}
                className="w-full block px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
              >
                👤 Asignar Coach
              </Link>
            )}

            <button
              onClick={manejarCancelar}
              disabled={cargando}
              className="w-full px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 bg-white/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Cancelando...' : '🚫 Cancelar Clase'}
            </button>
          </>
        )}

        {clase.estado === 'programada' && clase.reservas_count === 0 && (
          <button
            onClick={manejarEliminar}
            disabled={cargando}
            className="w-full px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Eliminando...' : '🗑️ Eliminar Clase'}
          </button>
        )}
      </div>
    </div>
  )
}