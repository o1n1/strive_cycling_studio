// src/app/onboarding/[token]/OnboardingForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { FirmaDigital } from '@/components/onboarding/FirmaDigital'
import { DocumentosUpload } from '@/components/onboarding/DocumentosUpload'
import {
  crearCuentaOnboarding,
  guardarInfoPersonal,
  guardarInfoCoach,
  guardarInfoStaff,
  completarOnboarding
} from '@/lib/actions/onboarding-actions'
import type { InvitacionPersonal } from '@/lib/types/personal.types'
import type { TipoDocumento } from '@/lib/types/enums'

interface OnboardingFormProps {
  invitacion: InvitacionPersonal
}

export function OnboardingForm({ invitacion }: OnboardingFormProps) {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Paso 2: Crear cuenta
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  // Paso 3: Info personal
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [direccionCompleta, setDireccionCompleta] = useState('')
  const [curp, setCurp] = useState('')
  const [rfc, setRfc] = useState('')
  const [cuentaBanco, setCuentaBanco] = useState('')
  const [cuentaClabe, setCuentaClabe] = useState('')
  const [cuentaBeneficiario, setCuentaBeneficiario] = useState('')
  const [emergenciaNombre, setEmergenciaNombre] = useState('')
  const [emergenciaTelefono, setEmergenciaTelefono] = useState('')
  const [emergenciaRelacion, setEmergenciaRelacion] = useState('')

  // Paso 4 Coach: Info específica
  const [biografia, setBiografia] = useState('')
  const [anosExperiencia, setAnosExperiencia] = useState(0)
  const [certificaciones, setCertificaciones] = useState<string[]>([])
  const [certificacionInput, setCertificacionInput] = useState('')

  // Paso 4 Staff: Horarios
  const [horarioEntrada, setHorarioEntrada] = useState('09:00')
  const [horarioSalida, setHorarioSalida] = useState('18:00')
  const [diasLaborales, setDiasLaborales] = useState<number[]>([1, 2, 3, 4, 5])

  // Paso 5: Documentos
  const [documentosUrls, setDocumentosUrls] = useState<{ tipo: TipoDocumento; url: string }[]>([])

  // Paso 6: Firma
  const [firmaBase64, setFirmaBase64] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const esCoach = invitacion.rol === 'coach'

  // Handler Paso 2: Crear cuenta
  const handlePaso2 = async () => {
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmarPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setCargando(true)
    const resultado = await crearCuentaOnboarding(
      { email: invitacion.email, password, confirmar_password: confirmarPassword },
      invitacion.id
    )
    setCargando(false)

    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }

    setUserId(resultado.data.userId)
    setPaso(3)
    toast.success('Cuenta creada correctamente')
  }

  // Handler Paso 3: Info personal
  const handlePaso3 = async () => {
    if (!userId) return

    setCargando(true)
    const resultado = await guardarInfoPersonal(
      {
        nombre_completo: nombreCompleto,
        telefono,
        fecha_nacimiento: fechaNacimiento,
        direccion_completa: direccionCompleta,
        curp,
        rfc,
        cuenta_bancaria_banco: cuentaBanco,
        cuenta_bancaria_clabe: cuentaClabe,
        cuenta_bancaria_beneficiario: cuentaBeneficiario,
        contacto_emergencia_nombre: emergenciaNombre,
        contacto_emergencia_telefono: emergenciaTelefono,
        contacto_emergencia_relacion: emergenciaRelacion
      },
      userId,
      invitacion.rol
    )
    setCargando(false)

    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }

    setPaso(4)
    toast.success('Información guardada')
  }

  // Handler Paso 4: Info específica
  const handlePaso4 = async () => {
    if (!userId) return

    setCargando(true)

    if (esCoach) {
      const resultado = await guardarInfoCoach(userId, {
        biografia,
        anos_experiencia: anosExperiencia,
        certificaciones,
        disponibilidad_semanal: {}
      })

      if (!resultado.success) {
        setCargando(false)
        toast.error(resultado.error)
        return
      }
    } else {
      const resultado = await guardarInfoStaff(userId, {
        horario_entrada: horarioEntrada,
        horario_salida: horarioSalida,
        dias_laborales: diasLaborales
      })

      if (!resultado.success) {
        setCargando(false)
        toast.error(resultado.error)
        return
      }
    }

    setCargando(false)
    setPaso(5)
    toast.success('Información guardada')
  }

  // Handler Paso 5: Documentos
  const handlePaso5 = () => {
    if (documentosUrls.length < 4) {
      toast.error('Debes subir todos los documentos requeridos')
      return
    }
    setPaso(6)
  }

  // Handler Paso 6: Completar
  const handleCompletar = async () => {
    if (!userId) return
    if (!firmaBase64) {
      toast.error('Debes firmar el contrato')
      return
    }
    if (!aceptaTerminos) {
      toast.error('Debes aceptar los términos y condiciones')
      return
    }

    setCargando(true)
    const resultado = await completarOnboarding(userId, invitacion.rol, invitacion.id)
    setCargando(false)

    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }

    toast.success('¡Onboarding completado! Tu solicitud está en revisión')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  const agregarCertificacion = () => {
    if (certificacionInput.trim()) {
      setCertificaciones([...certificaciones, certificacionInput.trim()])
      setCertificacionInput('')
    }
  }

  const toggleDiaLaboral = (dia: number) => {
    setDiasLaborales(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia].sort()
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Paso {paso} de 6</span>
            <span className="text-white/60 text-sm">{Math.round((paso / 6) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#E84A27] to-[#FF6B35]"
              initial={{ width: 0 }}
              animate={{ width: `${(paso / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* PASO 1: Bienvenida */}
          {paso === 1 && (
            <motion.div
              key="paso1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#E84A27] to-[#FF6B35] flex items-center justify-center">
                <span className="text-4xl">{esCoach ? '🚴' : '👥'}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                ¡Bienvenido a Strive Studio!
              </h1>
              <p className="text-white/60 mb-2">
                Has sido invitado como <strong className="text-white">{esCoach ? 'Coach' : 'Staff'}</strong>
              </p>
              <p className="text-white/40 text-sm mb-8">
                Email: {invitacion.email}
              </p>
              {invitacion.mensaje_personalizado && (
                <div className="bg-[#E84A27]/10 border border-[#E84A27]/20 rounded-lg p-4 mb-8">
                  <p className="text-white/80 text-sm italic">
                    &quot;{invitacion.mensaje_personalizado}&quot;
                  </p>
                </div>
              )}
              <button
                onClick={() => setPaso(2)}
                className="px-8 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all"
              >
                Comenzar Onboarding
              </button>
            </motion.div>
          )}

          {/* PASO 2: Crear Cuenta */}
          {paso === 2 && (
            <motion.div
              key="paso2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Crea tu Cuenta</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Email</label>
                  <input
                    type="email"
                    value={invitacion.email}
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white/60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Contraseña *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/80 block mb-2">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setPaso(1)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePaso2}
                  disabled={cargando}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {cargando ? 'Creando...' : 'Continuar'}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Info Personal */}
          {paso === 3 && (
            <motion.div
              key="paso3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Información Personal</h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Nombre completo *"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Teléfono *"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                />
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                />
                <textarea
                  value={direccionCompleta}
                  onChange={(e) => setDireccionCompleta(e.target.value)}
                  placeholder="Dirección completa *"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none resize-none"
                />
                <input
                  type="text"
                  value={curp}
                  onChange={(e) => setCurp(e.target.value)}
                  placeholder="CURP *"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                />
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  placeholder="RFC *"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                />
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-white font-semibold mb-3">Datos Bancarios</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={cuentaBanco}
                      onChange={(e) => setCuentaBanco(e.target.value)}
                      placeholder="Banco *"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                    <input
                      type="text"
                      value={cuentaClabe}
                      onChange={(e) => setCuentaClabe(e.target.value)}
                      placeholder="CLABE (18 dígitos) *"
                      maxLength={18}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                    <input
                      type="text"
                      value={cuentaBeneficiario}
                      onChange={(e) => setCuentaBeneficiario(e.target.value)}
                      placeholder="Nombre del beneficiario *"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-white font-semibold mb-3">Contacto de Emergencia</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={emergenciaNombre}
                      onChange={(e) => setEmergenciaNombre(e.target.value)}
                      placeholder="Nombre *"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                    <input
                      type="tel"
                      value={emergenciaTelefono}
                      onChange={(e) => setEmergenciaTelefono(e.target.value)}
                      placeholder="Teléfono *"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                    <input
                      type="text"
                      value={emergenciaRelacion}
                      onChange={(e) => setEmergenciaRelacion(e.target.value)}
                      placeholder="Relación (ej: Madre, Esposo) *"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setPaso(2)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePaso3}
                  disabled={cargando}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : 'Continuar'}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: Info Específica */}
          {paso === 4 && (
            <motion.div
              key="paso4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {esCoach ? 'Información de Coach' : 'Información de Staff'}
              </h2>
              <div className="space-y-4">
                {esCoach ? (
                  <>
                    <textarea
                      value={biografia}
                      onChange={(e) => setBiografia(e.target.value)}
                      placeholder="Cuéntanos sobre ti y tu experiencia..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none resize-none"
                    />
                    <input
                      type="number"
                      value={anosExperiencia}
                      onChange={(e) => setAnosExperiencia(Number(e.target.value))}
                      placeholder="Años de experiencia"
                      min={0}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                    />
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Certificaciones</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={certificacionInput}
                          onChange={(e) => setCertificacionInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && agregarCertificacion()}
                          placeholder="Ej: ACE Personal Trainer"
                          className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                        />
                        <button
                          type="button"
                          onClick={agregarCertificacion}
                          className="px-4 py-3 bg-[#E84A27] text-white rounded-lg"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {certificaciones.map((cert, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white/10 text-white text-sm rounded-full flex items-center gap-2"
                          >
                            {cert}
                            <button
                              onClick={() => setCertificaciones(certificaciones.filter((_, idx) => idx !== i))}
                              className="text-white/60 hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Horario Entrada</label>
                        <input
                          type="time"
                          value={horarioEntrada}
                          onChange={(e) => setHorarioEntrada(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-white/80 mb-2 block">Horario Salida</label>
                        <input
                          type="time"
                          value={horarioSalida}
                          onChange={(e) => setHorarioSalida(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-2 block">Días Laborales</label>
                      <div className="grid grid-cols-7 gap-2">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleDiaLaboral(i + 1)}
                            className={`aspect-square rounded-lg border transition-all ${
                              diasLaborales.includes(i + 1)
                                ? 'bg-[#E84A27] border-[#E84A27] text-white'
                                : 'bg-white/5 border-white/10 text-white/60'
                            }`}
                          >
                            {dia}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setPaso(3)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePaso4}
                  disabled={cargando}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : 'Continuar'}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 5: Documentos */}
          {paso === 5 && userId && (
            <motion.div
              key="paso5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Documentos Requeridos</h2>
              <DocumentosUpload
                userId={userId}
                tipoPersonal={invitacion.rol}
                onDocumentosSubidos={setDocumentosUrls}
              />
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setPaso(4)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePaso5}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 6: Firma */}
          {paso === 6 && (
            <motion.div
              key="paso6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Firma de Contrato</h2>
              <div className="bg-white/5 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto">
                <p className="text-white/80 text-sm">
                  Al firmar este documento, aceptas formar parte del equipo de Strive Studio
                  bajo los términos y condiciones establecidos en el contrato laboral.
                </p>
              </div>
              <FirmaDigital onFirmaGuardada={setFirmaBase64} />
              <label className="flex items-center gap-3 mt-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-white/80 text-sm">
                  Acepto los términos y condiciones
                </span>
              </label>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setPaso(5)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handleCompletar}
                  disabled={cargando}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {cargando ? 'Finalizando...' : 'Completar Onboarding'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}