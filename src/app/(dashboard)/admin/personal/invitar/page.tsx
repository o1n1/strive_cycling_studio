// src/app/(dashboard)/admin/personal/invitar/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { invitarPersonal } from '@/lib/actions/personal-actions'
import type { TipoDisciplina } from '@/lib/types/enums'
import type { TipoPersonal, DatosInvitacionCoach, DatosInvitacionStaff } from '@/lib/types/personal.types'

// ============================================================================
// COMPONENT
// ============================================================================

export default function InvitarPersonalPage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [linkGenerado, setLinkGenerado] = useState<string | null>(null)

  // Estado del formulario
  const [tipoPersonal, setTipoPersonal] = useState<TipoPersonal>('coach')
  
  // Campos comunes
  const [email, setEmail] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensajeInvitacion, setMensajeInvitacion] = useState('')

  // Campos específicos de coach
  const [disciplinas, setDisciplinas] = useState<TipoDisciplina>('cycling')
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [anosExperiencia, setAnosExperiencia] = useState(0)
  const [pagoPorClase, setPagoPorClase] = useState(0)
  const [pagoPorHora, setPagoPorHora] = useState(0)

  // Campos específicos de staff
  const [horarioEntrada, setHorarioEntrada] = useState('09:00')
  const [horarioSalida, setHorarioSalida] = useState('18:00')
  const [diasLaborales, setDiasLaborales] = useState<number[]>([1, 2, 3, 4, 5]) // Lunes a viernes
  const [salarioMensual, setSalarioMensual] = useState(0)
  const [permisos, setPermisos] = useState({
    ventas: true,
    checkin: true,
    inventario: false
  })

  // Especialidades disponibles por disciplina
  const especialidadesDisponibles = {
    cycling: ['HIIT', 'Endurance', 'Strength', 'Recovery'],
    funcional: ['CrossFit', 'Mobility', 'Strength', 'Cardio'],
    ambos: ['HIIT', 'Endurance', 'Strength', 'CrossFit', 'Mobility']
  }

  // Handler para toggle de especialidades
  const toggleEspecialidad = (esp: string) => {
    setEspecialidades(prev =>
      prev.includes(esp)
        ? prev.filter(e => e !== esp)
        : [...prev, esp]
    )
  }

  // Handler para toggle de días laborales
  const toggleDiaLaboral = (dia: number) => {
    setDiasLaborales(prev =>
      prev.includes(dia)
        ? prev.filter(d => d !== dia)
        : [...prev, dia].sort()
    )
  }

  // Handler de submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      // Preparar datos según el tipo
      let datos: DatosInvitacionCoach | DatosInvitacionStaff

      if (tipoPersonal === 'coach') {
        // Validar especialidades
        if (especialidades.length === 0) {
          toast.error('Selecciona al menos una especialidad')
          setCargando(false)
          return
        }

        datos = {
          tipo: 'coach',
          email,
          nombre_completo: nombreCompleto,
          telefono,
          disciplinas,
          especialidades,
          anos_experiencia: anosExperiencia,
          pago_por_clase: pagoPorClase,
          pago_por_hora: pagoPorHora,
          mensaje_invitacion: mensajeInvitacion || undefined
        }
      } else {
        // Validar días laborales
        if (diasLaborales.length === 0) {
          toast.error('Selecciona al menos un día laboral')
          setCargando(false)
          return
        }

        datos = {
          tipo: 'staff',
          email,
          nombre_completo: nombreCompleto,
          telefono,
          horario_entrada: horarioEntrada,
          horario_salida: horarioSalida,
          dias_laborales: diasLaborales,
          salario_mensual: salarioMensual,
          permisos,
          mensaje_invitacion: mensajeInvitacion || undefined
        }
      }

      // Enviar invitación
      const resultado = await invitarPersonal(datos)

      if (!resultado.success) {
        toast.error(resultado.error || 'Error al enviar invitación')
        return
      }

      // Generar link de onboarding
      const baseUrl = window.location.origin
      const link = `${baseUrl}/onboarding/${resultado.data.token}`
      setLinkGenerado(link)

      toast.success('¡Invitación enviada correctamente!')

    } catch (error) {
      console.error('Error al invitar:', error)
      toast.error('Error inesperado al enviar invitación')
    } finally {
      setCargando(false)
    }
  }

  // Copiar link al portapapeles
  const copiarLink = () => {
    if (linkGenerado) {
      navigator.clipboard.writeText(linkGenerado)
      toast.success('Link copiado al portapapeles')
    }
  }

  // Si ya se generó el link, mostrar pantalla de éxito
  if (linkGenerado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/personal"
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              ← Volver a Personal
            </Link>
          </div>

          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
          >
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#E84A27] to-[#FF6B35] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Invitación Enviada!
            </h2>
            <p className="text-white/60 mb-8">
              Se ha generado el link de onboarding para <strong className="text-white">{email}</strong>
            </p>

            {/* Link generado */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-xs text-white/40 mb-2">Link de Onboarding:</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={linkGenerado}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm font-mono"
                />
                <button
                  onClick={copiarLink}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Nota */}
            <div className="bg-[#E84A27]/10 border border-[#E84A27]/20 rounded-lg p-4 mb-8">
              <p className="text-[#FF6B35] text-sm">
                <strong>Nota:</strong> Este link expira en 7 días. Compártelo con {nombreCompleto} para que complete su onboarding.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setLinkGenerado(null)
                  setEmail('')
                  setNombreCompleto('')
                  setTelefono('')
                  setMensajeInvitacion('')
                  setEspecialidades([])
                }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
              >
                Invitar a Otra Persona
              </button>
              <button
                onClick={() => router.push('/admin/personal')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all"
              >
                Ver Todo el Personal
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/personal"
            className="text-white/60 hover:text-white transition-colors text-sm mb-4 inline-block"
          >
            ← Volver a Personal
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Invitar Nuevo Personal
          </h1>
          <p className="text-white/60">
            Genera una invitación para que un nuevo miembro complete su onboarding
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle Tipo de Personal */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Tipo de Personal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoPersonal('coach')}
                className={`
                  relative overflow-hidden p-4 rounded-lg border transition-all duration-300
                  ${tipoPersonal === 'coach'
                    ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] border-transparent text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }
                `}
              >
                <div className="text-2xl mb-2">🚴</div>
                <div className="font-semibold">Coach</div>
              </button>
              <button
                type="button"
                onClick={() => setTipoPersonal('staff')}
                className={`
                  relative overflow-hidden p-4 rounded-lg border transition-all duration-300
                  ${tipoPersonal === 'staff'
                    ? 'bg-gradient-to-r from-[#FF006E] to-[#9D4EDD] border-transparent text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }
                `}
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Staff</div>
              </button>
            </div>
          </div>

          {/* Información Básica */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@ejemplo.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
              />
            </div>

            {/* Nombre Completo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Juan Pérez García"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Teléfono *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="55 1234 5678"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
              />
            </div>
          </div>

          {/* Campos específicos de Coach */}
          <AnimatePresence mode="wait">
            {tipoPersonal === 'coach' && (
              <motion.div
                key="coach"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Información de Coach</h3>

                {/* Disciplinas */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Disciplinas *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['cycling', 'funcional', 'ambos'] as const).map((disc) => (
                      <button
                        key={disc}
                        type="button"
                        onClick={() => setDisciplinas(disc)}
                        className={`
                          p-3 rounded-lg border transition-all duration-300 text-sm
                          ${disciplinas === disc
                            ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] border-transparent text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }
                        `}
                      >
                        {disc === 'cycling' && '🚴 Cycling'}
                        {disc === 'funcional' && '🏋️ Funcional'}
                        {disc === 'ambos' && '⚡ Ambos'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Especialidades */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Especialidades * (Selecciona al menos una)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {especialidadesDisponibles[disciplinas].map((esp) => (
                      <button
                        key={esp}
                        type="button"
                        onClick={() => toggleEspecialidad(esp)}
                        className={`
                          px-3 py-2 rounded-lg border transition-all duration-300 text-sm
                          ${especialidades.includes(esp)
                            ? 'bg-[#E84A27]/20 border-[#E84A27] text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }
                        `}
                      >
                        {esp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Años de Experiencia */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Años de Experiencia *
                  </label>
                  <input
                    type="number"
                    value={anosExperiencia}
                    onChange={(e) => setAnosExperiencia(Number(e.target.value))}
                    min={0}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
                  />
                </div>

                {/* Pago */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Pago por Clase *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        type="number"
                        value={pagoPorClase}
                        onChange={(e) => setPagoPorClase(Number(e.target.value))}
                        min={0}
                        step={0.01}
                        required
                        className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Pago por Hora *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        type="number"
                        value={pagoPorHora}
                        onChange={(e) => setPagoPorHora(Number(e.target.value))}
                        min={0}
                        step={0.01}
                        required
                        className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Campos específicos de Staff */}
            {tipoPersonal === 'staff' && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Información de Staff</h3>

                {/* Horarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Horario de Entrada *
                    </label>
                    <input
                      type="time"
                      value={horarioEntrada}
                      onChange={(e) => setHorarioEntrada(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      Horario de Salida *
                    </label>
                    <input
                      type="time"
                      value={horarioSalida}
                      onChange={(e) => setHorarioSalida(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
                    />
                  </div>
                </div>

                {/* Días Laborales */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Días Laborales * (Selecciona al menos uno)
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDiaLaboral(index + 1)}
                        className={`
                          aspect-square rounded-lg border transition-all duration-300 text-sm font-semibold
                          ${diasLaborales.includes(index + 1)
                            ? 'bg-gradient-to-r from-[#FF006E] to-[#9D4EDD] border-transparent text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }
                        `}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Salario Mensual */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Salario Mensual *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                    <input
                      type="number"
                      value={salarioMensual}
                      onChange={(e) => setSalarioMensual(Number(e.target.value))}
                      min={0}
                      step={0.01}
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none"
                    />
                  </div>
                </div>

                {/* Permisos */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Permisos
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'ventas', label: 'Ventas', icon: '💳' },
                      { key: 'checkin', label: 'Check-in', icon: '✅' },
                      { key: 'inventario', label: 'Inventario', icon: '📦' }
                    ].map((permiso) => (
                      <button
                        key={permiso.key}
                        type="button"
                        onClick={() => setPermisos(prev => ({
                          ...prev,
                          [permiso.key]: !prev[permiso.key as keyof typeof permisos]
                        }))}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                          ${permisos[permiso.key as keyof typeof permisos]
                            ? 'bg-[#9D4EDD]/20 border-[#9D4EDD] text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }
                        `}
                      >
                        <span className="text-xl">{permiso.icon}</span>
                        <span className="font-medium">{permiso.label}</span>
                        <div className={`
                          ml-auto w-5 h-5 rounded border-2 flex items-center justify-center
                          ${permisos[permiso.key as keyof typeof permisos]
                            ? 'border-[#9D4EDD] bg-[#9D4EDD]'
                            : 'border-white/20'
                          }
                        `}>
                          {permisos[permiso.key as keyof typeof permisos] && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensaje Personalizado */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Mensaje Personalizado (Opcional)</h3>
            <textarea
              value={mensajeInvitacion}
              onChange={(e) => setMensajeInvitacion(e.target.value)}
              placeholder="Escribe un mensaje de bienvenida para el nuevo miembro del equipo..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] focus:bg-white/10 transition-all duration-300 outline-none resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/personal')}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}