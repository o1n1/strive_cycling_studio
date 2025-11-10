'use client'

// src/components/clases/FormularioEditarClase.tsx
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { actualizarClase } from '@/lib/actions/clases-actions'
import type { ClaseConRelaciones, ActualizarClaseInput } from '@/lib/actions/clases-actions'

interface Salon {
  id: string
  nombre: string
  tipo: string
  capacidad_maxima: number
}

interface Especialidad {
  id: string
  nombre: string
  descripcion: string | null
  disciplina_id: string
}

interface Props {
  clase: ClaseConRelaciones
  salones: Salon[]
  especialidades: Especialidad[]
}

export function FormularioEditarClase({ clase, salones, especialidades }: Props) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fechaHoraInicial = new Date(clase.fecha_hora)
  const [formData, setFormData] = useState({
    fecha: fechaHoraInicial.toISOString().split('T')[0],
    hora: fechaHoraInicial.toTimeString().slice(0, 5),
    duracion: clase.duracion,
    salon_id: clase.salon_id,
    especialidad_id: clase.especialidad_id || '',
    capacidad: clase.capacidad,
    nombre_clase: clase.nombre_clase || '',
    descripcion: clase.descripcion || '',
    notas_coach: clase.notas_coach || '',
    playlist_url: clase.playlist_url || ''
  })

  const especialidadesFiltradas = useMemo(() => {
    return especialidades.filter(e => e.disciplina_id === clase.disciplina_id)
  }, [especialidades, clase.disciplina_id])

  const manejarCambioSalon = (salonId: string) => {
    const salon = salones.find(s => s.id === salonId)
    setFormData({
      ...formData,
      salon_id: salonId,
      capacidad: salon?.capacidad_maxima || formData.capacidad
    })
  }

  const validarFormulario = (): string | null => {
    if (!formData.fecha) return 'Selecciona una fecha'
    if (!formData.hora) return 'Selecciona una hora'
    if (!formData.salon_id) return 'Selecciona un salón'
    if (formData.capacidad <= 0) return 'La capacidad debe ser mayor a 0'
    if (formData.duracion <= 0) return 'La duración debe ser mayor a 0'

    const fechaHora = new Date(`${formData.fecha}T${formData.hora}`)
    if (fechaHora < new Date() && clase.estado === 'programada') {
      return 'La fecha y hora deben ser futuras para clases programadas'
    }

    return null
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setCargando(true)

    try {
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`)
      
      const datos: ActualizarClaseInput = {
        fecha_hora: fechaHora.toISOString(),
        duracion: formData.duracion,
        salon_id: formData.salon_id,
        especialidad_id: formData.especialidad_id || null,
        capacidad: formData.capacidad,
        nombre_clase: formData.nombre_clase || null,
        descripcion: formData.descripcion || null,
        notas_coach: formData.notas_coach || null,
        playlist_url: formData.playlist_url || null
      }

      const resultado = await actualizarClase(clase.id, datos)

      if (resultado.success) {
        router.push('/admin/clases')
        router.refresh()
      } else {
        setError(resultado.error)
      }
    } catch {
      setError('Error al actualizar la clase')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-6">
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Info no editable */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-400 text-sm font-medium mb-2">Información de la Clase</p>
          <div className="flex items-center gap-4 text-sm text-blue-300">
            <span>📚 {clase.disciplina.nombre}</span>
            {clase.coach && (
              <span>👤 Coach: {clase.coach.profiles.nombre_completo}</span>
            )}
            <span>📊 Estado: {clase.estado}</span>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              min={clase.estado === 'programada' ? new Date().toISOString().split('T')[0] : undefined}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Hora <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
              required
            />
          </div>
        </div>

        {/* Salón */}
        <div>
          <label className="block text-white font-medium mb-2">
            Salón <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.salon_id}
            onChange={(e) => manejarCambioSalon(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
            required
          >
            {salones.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.nombre} (Cap. {salon.capacidad_maxima})
              </option>
            ))}
          </select>
        </div>

        {/* Especialidad */}
        {especialidadesFiltradas.length > 0 && (
          <div>
            <label className="block text-white font-medium mb-2">
              Especialidad <span className="text-white/40">(opcional)</span>
            </label>
            <select
              value={formData.especialidad_id}
              onChange={(e) => setFormData({ ...formData, especialidad_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
            >
              <option value="">Sin especialidad específica</option>
              {especialidadesFiltradas.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                  {esp.descripcion && ` - ${esp.descripcion}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Duración y Capacidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Duración (minutos) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: parseInt(e.target.value) || 0 })}
              min="15"
              max="180"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Capacidad <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 0 })}
              min={clase.reservas_count}
              max="100"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
              required
            />
            {clase.reservas_count > 0 && (
              <p className="text-white/40 text-sm mt-2">
                Mínimo {clase.reservas_count} (reservas actuales)
              </p>
            )}
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-white font-medium mb-2">
            Nombre de la Clase <span className="text-white/40">(opcional)</span>
          </label>
          <input
            type="text"
            value={formData.nombre_clase}
            onChange={(e) => setFormData({ ...formData, nombre_clase: e.target.value })}
            placeholder="Ej: Upper Body Power"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-white font-medium mb-2">
            Descripción <span className="text-white/40">(opcional)</span>
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Agrega detalles sobre la clase..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 resize-none"
          />
        </div>

        {/* Notas Coach */}
        <div>
          <label className="block text-white font-medium mb-2">
            Notas para el Coach <span className="text-white/40">(opcional)</span>
          </label>
          <textarea
            value={formData.notas_coach}
            onChange={(e) => setFormData({ ...formData, notas_coach: e.target.value })}
            placeholder="Instrucciones especiales..."
            rows={2}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 resize-none"
          />
        </div>

        {/* Playlist */}
        <div>
          <label className="block text-white font-medium mb-2">
            URL de Playlist <span className="text-white/40">(opcional)</span>
          </label>
          <input
            type="url"
            value={formData.playlist_url}
            onChange={(e) => setFormData({ ...formData, playlist_url: e.target.value })}
            placeholder="https://open.spotify.com/playlist/..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/clases"
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}