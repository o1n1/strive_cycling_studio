'use client'

// src/components/clases/FormularioClase.tsx
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearClase } from '@/lib/actions/clases-actions'
import type { CrearClaseInput } from '@/lib/actions/clases-actions'

interface Salon {
  id: string
  nombre: string
  tipo: string
  capacidad_maxima: number
}

interface Disciplina {
  id: string
  nombre: string
  tipo: string
  duracion_default: number
}

interface Especialidad {
  id: string
  nombre: string
  descripcion: string | null
  disciplina_id: string
}

interface Props {
  salones: Salon[]
  disciplinas: Disciplina[]
  especialidades: Especialidad[]
}

export function FormularioClase({ salones, disciplinas, especialidades }: Props) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    duracion: 50,
    salon_id: '',
    disciplina_id: '',
    especialidad_id: '',
    capacidad: 0,
    nombre_clase: '',
    descripcion: ''
  })

  // Filtrar especialidades según disciplina seleccionada
  const especialidadesFiltradas = useMemo(() => {
    if (!formData.disciplina_id) return []
    return especialidades.filter(e => e.disciplina_id === formData.disciplina_id)
  }, [formData.disciplina_id, especialidades])

  // Auto-completar capacidad cuando selecciona salón
  const manejarCambioSalon = (salonId: string) => {
    const salon = salones.find(s => s.id === salonId)
    setFormData({
      ...formData,
      salon_id: salonId,
      capacidad: salon?.capacidad_maxima || 0
    })
  }

  // Auto-completar duración cuando selecciona disciplina
  const manejarCambioDisciplina = (disciplinaId: string) => {
    const disciplina = disciplinas.find(d => d.id === disciplinaId)
    setFormData({
      ...formData,
      disciplina_id: disciplinaId,
      duracion: disciplina?.duracion_default || 50,
      especialidad_id: '' // Resetear especialidad
    })
  }

  const validarFormulario = (): string | null => {
    if (!formData.fecha) return 'Selecciona una fecha'
    if (!formData.hora) return 'Selecciona una hora'
    if (!formData.salon_id) return 'Selecciona un salón'
    if (!formData.disciplina_id) return 'Selecciona una disciplina'
    if (formData.capacidad <= 0) return 'La capacidad debe ser mayor a 0'
    if (formData.duracion <= 0) return 'La duración debe ser mayor a 0'

    // Validar que la fecha sea futura
    const fechaHora = new Date(`${formData.fecha}T${formData.hora}`)
    if (fechaHora < new Date()) {
      return 'La fecha y hora deben ser futuras'
    }

    return null
  }

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar
    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setCargando(true)

    try {
      // Combinar fecha y hora en ISO string
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}`)
      
      const datos: CrearClaseInput = {
        fecha_hora: fechaHora.toISOString(),
        duracion: formData.duracion,
        salon_id: formData.salon_id,
        disciplina_id: formData.disciplina_id,
        especialidad_id: formData.especialidad_id || null,
        capacidad: formData.capacidad,
        nombre_clase: formData.nombre_clase || null,
        descripcion: formData.descripcion || null
      }

      const resultado = await crearClase(datos)

      if (resultado.success) {
        router.push('/admin/clases')
        router.refresh()
      } else {
        setError(resultado.error)
      }
    } catch {
      setError('Error al crear la clase')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="space-y-6">
      {/* Card principal */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

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
              min={new Date().toISOString().split('T')[0]}
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

        {/* Salón y Disciplina */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white font-medium mb-2">
              Salón <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.salon_id}
              onChange={(e) => manejarCambioSalon(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:bg-white"
              required
            >
              <option value="">Selecciona un salón</option>
              {salones.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.nombre} (Cap. {salon.capacidad_maxima})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Disciplina <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.disciplina_id}
              onChange={(e) => manejarCambioDisciplina(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:bg-white"
              required
            >
              <option value="">Selecciona una disciplina</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Especialidad (opcional) */}
        {especialidadesFiltradas.length > 0 && (
          <div>
            <label className="block text-white font-medium mb-2">
              Especialidad <span className="text-white/40">(opcional)</span>
            </label>
            <select
              value={formData.especialidad_id}
              onChange={(e) => setFormData({ ...formData, especialidad_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:bg-white"
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
              min="1"
              max="100"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
              required
            />
          </div>
        </div>

        {/* Nombre de la clase (opcional) */}
        <div>
          <label className="block text-white font-medium mb-2">
            Nombre de la Clase <span className="text-white/40">(opcional)</span>
          </label>
          <input
            type="text"
            value={formData.nombre_clase}
            onChange={(e) => setFormData({ ...formData, nombre_clase: e.target.value })}
            placeholder="Ej: Power Ride, Core Blast..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Descripción (opcional) */}
        <div>
          <label className="block text-white font-medium mb-2">
            Descripción <span className="text-white/40">(opcional)</span>
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe el enfoque de la clase..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300 resize-none"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-4 justify-end">
        <Link
          href="/admin/clases"
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-white/5 hover:bg-white/10 text-white border border-white/10"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25 disabled:opacity-50"
        >
          {cargando ? 'Creando...' : 'Crear Clase'}
        </button>
      </div>
    </form>
  )
}