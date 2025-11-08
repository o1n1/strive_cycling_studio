'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { TipoDisciplina } from '@/lib/types/enums'
import { crearSalon, actualizarSalon, type SalonData } from '@/lib/actions/espacios-actions'

// ============================================================================
// TYPES
// ============================================================================

interface SalonFormProps {
  salonInicial?: Partial<SalonData> & { id?: string }
  modo: 'crear' | 'editar'
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SalonForm({ salonInicial, modo }: SalonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: salonInicial?.nombre || '',
    descripcion: salonInicial?.descripcion || '',
    tipo: (salonInicial?.tipo || 'cycling') as TipoDisciplina,
    capacidad_maxima: salonInicial?.capacidad_maxima || 20,
    activo: salonInicial?.activo ?? true,
    orden_display: salonInicial?.orden_display || 0
  })

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (modo === 'crear') {
        const resultado = await crearSalon(formData)
        
        if (!resultado.success) {
          setError(resultado.error || 'Error al crear salón')
          return
        }

        router.push(`/admin/espacios/${resultado.data?.id}`)
        router.refresh()
      } else {
        if (!salonInicial?.id) {
          setError('ID de salón no encontrado')
          return
        }

        const resultado = await actualizarSalon(salonInicial.id, formData)
        
        if (!resultado.success) {
          setError(resultado.error || 'Error al actualizar salón')
          return
        }

        router.push('/admin/espacios')
        router.refresh()
      }
    } catch {
      setError('Error inesperado al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  const tipoOptions: { value: TipoDisciplina; label: string; icon: string; gradient: string }[] = [
    { value: 'cycling', label: 'Cycling', icon: '🚴', gradient: 'from-[#E84A27] to-[#FF6B35]' },
    { value: 'funcional', label: 'Funcional', icon: '🏋️', gradient: 'from-[#FF006E] to-[#9D4EDD]' },
    { value: 'ambos', label: 'Híbrido', icon: '⚡', gradient: 'from-[#E84A27] via-[#FF006E] to-[#9D4EDD]' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensaje de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Nombre */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Nombre del salón *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Ej: Salón Principal"
          required
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Descripción
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Descripción opcional del salón..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none resize-none"
        />
      </div>

      {/* Tipo de disciplina */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Tipo de disciplina *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {tipoOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo: option.value }))}
              className={`
                relative overflow-hidden p-4 rounded-lg border transition-all duration-300
                ${formData.tipo === option.value 
                  ? `border-[#E84A27] bg-gradient-to-br ${option.gradient} bg-opacity-20` 
                  : 'border-white/10 bg-white/5 hover:border-white/20'
                }
              `}
            >
              <div className="text-3xl mb-2">{option.icon}</div>
              <div className="text-sm font-medium text-white">{option.label}</div>
              
              {formData.tipo === option.value && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 rounded-full bg-[#E84A27] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Capacidad máxima */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Capacidad máxima *
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="100"
            value={formData.capacidad_maxima}
            onChange={(e) => setFormData(prev => ({ ...prev, capacidad_maxima: parseInt(e.target.value) }))}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E84A27]"
          />
          <div className="w-20 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-center font-bold">
            {formData.capacidad_maxima}
          </div>
        </div>
        <p className="text-xs text-white/40">
          Número máximo de espacios (bicis/tapetes) que puede tener este salón
        </p>
      </div>

      {/* Orden de visualización */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Orden de visualización
        </label>
        <input
          type="number"
          min="0"
          value={formData.orden_display}
          onChange={(e) => setFormData(prev => ({ ...prev, orden_display: parseInt(e.target.value) || 0 }))}
          placeholder="0"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
        />
        <p className="text-xs text-white/40">
          Los salones se mostrarán ordenados de menor a mayor número
        </p>
      </div>

      {/* Estado activo */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
        <div>
          <div className="font-medium text-white">Salón activo</div>
          <div className="text-sm text-white/60">
            Los salones inactivos no serán visibles para coaches y clientes
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, activo: !prev.activo }))}
          className={`
            relative w-14 h-8 rounded-full transition-colors duration-300
            ${formData.activo ? 'bg-[#E84A27]' : 'bg-white/20'}
          `}
        >
          <div className={`
            absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300
            ${formData.activo && 'translate-x-6'}
          `} />
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors duration-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-medium hover:shadow-lg hover:shadow-[#E84A27]/50 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : modo === 'crear' ? 'Crear salón' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}