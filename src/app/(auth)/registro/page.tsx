// src/app/(auth)/registro/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ValidatedInput } from '@/components/ui/ValidatedInput'
import { Modal } from '@/components/ui/Modal'
import { SignaturePad } from '@/components/ui/SignaturePad'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import MultiStepForm from '@/components/ui/auth/MultiStepForm'
import StepIndicator from '@/components/ui/auth/StepIndicator'
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter'
import { createClient } from '@/lib/supabase/client'
import { useMultiStepForm } from '@/hooks/useMultiStepForm'
import { useEmailValidation } from '@/hooks/useEmailValidation'
import { usePhoneValidation, formatPhoneMX } from '@/hooks/usePhoneValidation'
import type { TipoDisciplina } from '@/lib/types/enums'

interface RegistroFormData extends Record<string, string | boolean> {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  telefono: string
  fechaNacimiento: string
  genero: string
  password: string
  confirmPassword: string
  disciplinaPreferida: string
  horarioPreferido: string
  fuenteAdquisicion: string
  codigoReferido: string
  condicionesMedicas: string
  nombreEmergencia: string
  telefonoEmergencia: string
  relacionEmergencia: string
  terminosAceptados: boolean
}



export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarTerminos, setMostrarTerminos] = useState(false)
  const [mostrarDeslinde, setMostrarDeslinde] = useState(false)
  const [firmaTerminos, setFirmaTerminos] = useState<string | null>(null)
  const [firmaDeslinde, setFirmaDeslinde] = useState<string | null>(null)
  const [reenviandoEmail, setReenviandoEmail] = useState(false)
  const [mensajeReenvio, setMensajeReenvio] = useState<string | null>(null)
  const [cooldownReenvio, setCooldownReenvio] = useState(0)

  const {
    currentStep,
    formData,
    isFirstStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
  } = useMultiStepForm<RegistroFormData>({
    initialData: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      genero: '',
      password: '',
      confirmPassword: '',
      disciplinaPreferida: 'cycling',
      horarioPreferido: '',
      fuenteAdquisicion: '',
      codigoReferido: '',
      condicionesMedicas: '',
      nombreEmergencia: '',
      telefonoEmergencia: '',
      relacionEmergencia: '',
      terminosAceptados: false,
    },
    totalSteps: 5,
  })

  const reenviarEmailVerificacion = async () => {
    setReenviandoEmail(true)
    setMensajeReenvio(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      })

      if (error) throw error

      setMensajeReenvio('✅ Email reenviado exitosamente')
      setCooldownReenvio(60)
    } catch (err) {
      console.error('Error al reenviar email:', err)
      setMensajeReenvio('❌ Error al reenviar email. Intenta más tarde.')
    } finally {
      setReenviandoEmail(false)
    }
  }

  const irALogin = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ✅ NUEVO: Validaciones async solo en Step 1
  const emailValidation = useEmailValidation(formData.email, currentStep === 1)
  const phoneValidation = usePhoneValidation(formData.telefono, currentStep === 1)
  useEffect(() => {
    if (cooldownReenvio > 0) {
      const timer = setTimeout(() => setCooldownReenvio(cooldownReenvio - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownReenvio])

  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validarTelefono = (telefono: string) => /^[0-9]{10}$/.test(telefono)

  const validarStep1 = () => {
    if (!formData.nombre || formData.nombre.length < 2) {
      setError('El nombre es requerido')
      return false
    }
    if (!formData.apellidoPaterno || formData.apellidoPaterno.length < 2) {
      setError('El apellido paterno es requerido')
      return false
    }
    if (!formData.apellidoMaterno || formData.apellidoMaterno.length < 2) {
      setError('El apellido materno es requerido')
      return false
    }
    if (!validarEmail(formData.email)) {
      setError('Email inválido')
      return false
    }
    // ✅ NUEVO: Verificar email no duplicado
    if (emailValidation.isValid === false) {
      setError(emailValidation.message || 'Email ya registrado')
      return false
    }
    if (!validarTelefono(formData.telefono)) {
      setError('Teléfono debe ser exactamente 10 dígitos')
      return false
    }
    // ✅ NUEVO: Verificar teléfono no duplicado
    if (phoneValidation.isValid === false) {
      setError(phoneValidation.message || 'Teléfono ya registrado')
      return false
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (!formData.fechaNacimiento) {
      setError('Ingresa tu fecha de nacimiento')
      return false
    }
    if (!formData.genero) {
      setError('Selecciona tu género')
      return false
    }
    return true
  }

  const validarStep2 = () => {
    if (!formData.horarioPreferido) {
      setError('Selecciona tu horario preferido')
      return false
    }
    if (!formData.fuenteAdquisicion) {
      setError('Selecciona cómo nos conociste')
      return false
    }
    return true
  }

  const validarStep3 = () => {
    if (!formData.nombreEmergencia) {
      setError('Ingresa un contacto de emergencia')
      return false
    }
    if (!validarTelefono(formData.telefonoEmergencia)) {
      setError('Teléfono de emergencia inválido (debe ser 10 dígitos)')
      return false
    }
    if (!formData.relacionEmergencia) {
      setError('Indica la relación con el contacto de emergencia')
      return false
    }
    return true
  }

  const validarStep4 = () => {
    if (!firmaTerminos || !firmaDeslinde) {
      setError('Debes firmar ambos documentos')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError(null)
    if (currentStep === 1 && !validarStep1()) return
    if (currentStep === 2 && !validarStep2()) return
    if (currentStep === 3 && !validarStep3()) return
    if (currentStep === 4 && !validarStep4()) return
    goToNextStep()
  }

  const handleSubmit = async () => {
    if (cargando) return
    setError(null)
    setCargando(true)

    try {
      const nombreCompleto = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            telefono: formData.telefono,
            genero: formData.genero,
            fecha_nacimiento: formData.fechaNacimiento,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No se pudo crear el usuario')

      const userId = authData.user.id

      const codigoReferido = `${formData.nombre.toUpperCase()}${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`

      const condicionesMedicasArray = formData.condicionesMedicas
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)

      const { error: clienteError } = await supabase.from('clientes').insert({
        id: userId,
        disciplina_preferida: formData.disciplinaPreferida as TipoDisciplina,
        horario_preferido: formData.horarioPreferido,
        fuente_adquisicion: formData.fuenteAdquisicion,
        codigo_referido: codigoReferido,
        condiciones_medicas: condicionesMedicasArray.length > 0 ? condicionesMedicasArray : null,
        contacto_emergencia_nombre: formData.nombreEmergencia,
        contacto_emergencia_telefono: formData.telefonoEmergencia,
        contacto_emergencia_relacion: formData.relacionEmergencia,
        terminos_firmado_at: new Date().toISOString(),
        deslinde_medico_firmado: true,
        deslinde_medico_at: new Date().toISOString(),
        creditos_disponibles: 0,
        notificaciones_email: true,
        notificaciones_push: true,
        nivel_lealtad: 'bronze',
      })

      if (clienteError) throw clienteError

      // ✅ CAMBIO: NO redirigir automáticamente, mostrar Step 5
      goToNextStep()
      
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err instanceof Error ? err.message : 'Error al registrar')
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if ((name === 'telefono' || name === 'telefonoEmergencia') && value.length > 0) {
      if (!/^\d*$/.test(value)) return
      if (value.length > 10) return
    }
    
    updateFormData({ [name]: value })
  }

  const stepLabels = ['Información', 'Preferencias', 'Salud', 'Términos', 'Bienvenida']

  // SVG Icons
  const MailIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  const PhoneIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="glassmorphism-premium rounded-3xl shadow-2xl border border-white/10 p-8 md:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mb-6"
            >
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 50%, #FF006E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                STRIVE
              </h1>
              <p className="text-white/70 text-sm">No limits, just power</p>
            </motion.div>

            {currentStep < 5 && (
              <div className="mb-8">
                <StepIndicator
                  currentStep={currentStep}
                  totalSteps={5}
                  labels={stepLabels}
                  variant="numbered"
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake"
              >
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            <MultiStepForm currentStep={currentStep}>
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Nombre *</label>
                      <input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Juan"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Apellido Paterno *</label>
                      <input
                        name="apellidoPaterno"
                        value={formData.apellidoPaterno}
                        onChange={handleChange}
                        placeholder="García"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Apellido Materno *</label>
                      <input
                        name="apellidoMaterno"
                        value={formData.apellidoMaterno}
                        onChange={handleChange}
                        placeholder="López"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                  </div>

                  {/* ✅ NUEVO: Email con validación async */}
                  <ValidatedInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    disabled={cargando}
                    required
                    validation={emailValidation}
                    icon={<MailIcon />}
                  />

                  {/* ✅ NUEVO: Teléfono con validación async */}
                  <ValidatedInput
                    label="Teléfono (10 dígitos)"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="1234567890"
                    disabled={cargando}
                    maxLength={10}
                    required
                    validation={phoneValidation}
                    icon={<PhoneIcon />}
                  />
                  {formData.telefono && (
                    <p className="text-xs text-white/50 -mt-2">
                      {formatPhoneMX(formData.telefono)}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Fecha de Nacimiento *</label>
                      <input
                        name="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        disabled={cargando}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Género *</label>
                      <select
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        disabled={cargando}
                      >
                        <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                        <option value="masculino" className="bg-[#1A1814] text-white">Masculino</option>
                        <option value="femenino" className="bg-[#1A1814] text-white">Femenino</option>
                        <option value="otro" className="bg-[#1A1814] text-white">Otro</option>
                        <option value="no_decir" className="bg-[#1A1814] text-white">Prefiero no decir</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Contraseña *</label>
                      <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                      <PasswordStrengthMeter password={formData.password} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Confirmar Contraseña *</label>
                      <input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 - MANTIENE TODO EL CÓDIGO ORIGINAL */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">
                      ¿Qué disciplina te interesa? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['cycling', 'funcional', 'ambas'].map((disc) => (
                        <label
                          key={disc}
                          className={`flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.disciplinaPreferida === disc
                              ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="disciplinaPreferida"
                            value={disc}
                            checked={formData.disciplinaPreferida === disc}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-white font-medium capitalize">
                            {disc === 'ambas' ? 'Ambas' : disc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">Horario Preferido *</label>
                    <select
                      name="horarioPreferido"
                      value={formData.horarioPreferido}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      disabled={cargando}
                    >
                      <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                      <option value="manana" className="bg-[#1A1814] text-white">Mañana (6:00 - 12:00)</option>
                      <option value="tarde" className="bg-[#1A1814] text-white">Tarde (12:00 - 18:00)</option>
                      <option value="noche" className="bg-[#1A1814] text-white">Noche (18:00 - 22:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">¿Cómo nos conociste? *</label>
                    <select
                      name="fuenteAdquisicion"
                      value={formData.fuenteAdquisicion}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      disabled={cargando}
                    >
                      <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                      <option value="redes_sociales" className="bg-[#1A1814] text-white">Redes Sociales</option>
                      <option value="google" className="bg-[#1A1814] text-white">Google</option>
                      <option value="recomendacion" className="bg-[#1A1814] text-white">Recomendación</option>
                      <option value="anuncio" className="bg-[#1A1814] text-white">Anuncio</option>
                      <option value="caminando" className="bg-[#1A1814] text-white">Pasaba por aquí</option>
                      <option value="otro" className="bg-[#1A1814] text-white">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">
                      Código de Referido (opcional)
                    </label>
                    <input
                      name="codigoReferido"
                      value={formData.codigoReferido}
                      onChange={handleChange}
                      placeholder="JUAN1234"
                      disabled={cargando}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                    <p className="text-xs text-white/50 mt-1">Si alguien te recomendó, ingresa su código</p>
                  </div>
                </div>
              )}

              {/* STEP 3 - MANTIENE TODO EL CÓDIGO ORIGINAL */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 mb-4">
                    <p className="text-sm text-white/80">
                      💡 Esta información nos ayuda a brindarte un mejor servicio y garantizar tu seguridad.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1.5">
                      ¿Tienes condiciones médicas a considerar? (opcional)
                    </label>
                    <textarea
                      name="condicionesMedicas"
                      value={formData.condicionesMedicas}
                      onChange={handleChange}
                      placeholder="Diabetes, hipertensión, asma, etc."
                      disabled={cargando}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-3">Contacto de Emergencia</h3>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white/90 mb-1.5">Nombre Completo *</label>
                      <input
                        name="nombreEmergencia"
                        value={formData.nombreEmergencia}
                        onChange={handleChange}
                        placeholder="María García"
                        disabled={cargando}
                        className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1.5">Teléfono * (10 dígitos)</label>
                        <input
                          name="telefonoEmergencia"
                          type="tel"
                          value={formData.telefonoEmergencia}
                          onChange={handleChange}
                          placeholder="1234567890"
                          disabled={cargando}
                          maxLength={10}
                          className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                        <p className="text-xs text-white/50 mt-1">{formData.telefonoEmergencia.length}/10</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1.5">Relación *</label>
                        <select
                          name="relacionEmergencia"
                          value={formData.relacionEmergencia}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                          disabled={cargando}
                        >
                          <option value="" className="bg-[#1A1814] text-white">Selecciona...</option>
                          <option value="familiar" className="bg-[#1A1814] text-white">Familiar</option>
                          <option value="amigo" className="bg-[#1A1814] text-white">Amigo/a</option>
                          <option value="pareja" className="bg-[#1A1814] text-white">Pareja</option>
                          <option value="otro" className="bg-[#1A1814] text-white">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 - MANTIENE TODO EL CÓDIGO ORIGINAL */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-white/90 text-sm mb-6">
                    Para completar tu registro, necesitamos que firmes digitalmente los siguientes documentos:
                  </p>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white font-semibold mb-2">1. Términos y Condiciones</h3>
                    <p className="text-sm text-white/70 mb-3">Condiciones generales de uso del servicio</p>
                    <Button onClick={() => setMostrarTerminos(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      {firmaTerminos ? '✓ Firmado' : 'Firmar'}
                    </Button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-white font-semibold mb-2">2. Responsabilidad de Actividad Física</h3>
                    <p className="text-sm text-white/70 mb-3">Confirmo estar en condiciones para realizar actividad física</p>
                    <Button onClick={() => setMostrarDeslinde(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      {firmaDeslinde ? '✓ Firmado' : 'Firmar'}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5 - Bienvenida */}
              {currentStep === 5 && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-white mb-3"
                  >
                    ¡Cuenta Creada!
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/70 mb-6"
                  >
                    Tu cuenta ha sido creada exitosamente.
                    <br />
                    Ahora necesitas verificar tu email para continuar.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/10 rounded-lg p-4 mb-6"
                  >
                    <p className="text-xs text-white/60 mb-1">Email enviado a:</p>
                    <p className="text-white font-semibold break-all">{formData.email}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2 mb-6 text-sm text-white/80 text-left max-w-md mx-auto"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF6B35] mt-1">1.</span>
                      <p>Revisa tu bandeja de entrada (y spam)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF6B35] mt-1">2.</span>
                      <p>Haz clic en el enlace de verificación</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FF6B35] mt-1">3.</span>
                      <p>Serás redirigido automáticamente</p>
                    </div>
                  </motion.div>

                  {mensajeReenvio && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`mb-4 p-3 rounded-lg text-sm ${
                        mensajeReenvio.includes('✅')
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {mensajeReenvio}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3"
                  >
                    <Button
                      onClick={reenviarEmailVerificacion}
                      disabled={reenviandoEmail || cooldownReenvio > 0}
                      variant="primary"
                      className="w-full"
                      style={{ 
                        background: cooldownReenvio > 0 
                          ? 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)'
                          : 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)'
                      }}
                    >
                      {cooldownReenvio > 0
                        ? `Reenviar en ${cooldownReenvio}s`
                        : reenviandoEmail
                        ? 'Enviando...'
                        : 'Reenviar Correo'}
                    </Button>

                    <Button
                      onClick={irALogin}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Ir a Inicio de Sesión
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <p className="text-xs text-white/60">
                      💡 El link de verificación expira en 24 horas
                    </p>
                  </motion.div>
                </div>
              )}

              {currentStep < 5 && (
                <div className="flex gap-4 mt-8">
                  {!isFirstStep && (
                    <Button
                      onClick={goToPreviousStep}
                      variant="outline"
                      disabled={cargando}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Anterior
                    </Button>
                  )}

                  {currentStep < 4 && (
                    <Button
                      onClick={handleNext}
                      disabled={cargando}
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
                    >
                      Siguiente
                    </Button>
                  )}

                  {currentStep === 4 && (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={cargando}
                      className="flex-1"
                      style={{ background: 'linear-gradient(135deg, #E84A27 0%, #FF6B35 100%)' }}
                    >
                      {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  )}
                </div>
              )}

              {currentStep < 5 && (
                <div className="mt-6 text-center text-sm">
                  <span className="text-white/60">¿Ya tienes cuenta? </span>
                  <Link href="/login" className="text-[#FF6B35] font-semibold hover:text-[#E84A27] transition-colors">
                    Inicia sesión aquí
                  </Link>
                </div>
              )}
            </MultiStepForm>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={mostrarTerminos} onClose={() => setMostrarTerminos(false)} title="Términos y Condiciones" size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
          <p>Al utilizar STRIVE STUDIO, aceptas los siguientes términos...</p>
          <h3 className="font-semibold mt-4">1. Uso del Servicio</h3>
          <p className="text-sm text-gray-600">...</p>
        </div>
        <SignaturePad
          onSave={(signature) => {
            setFirmaTerminos(signature)
            setMostrarTerminos(false)
          }}
        />
      </Modal>

      <Modal isOpen={mostrarDeslinde} onClose={() => setMostrarDeslinde(false)} title="Responsabilidad de Actividad Física" size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
          <p>Confirmo que me encuentro en buen estado de salud...</p>
        </div>
        <SignaturePad
          onSave={(signature) => {
            setFirmaDeslinde(signature)
            setMostrarDeslinde(false)
          }}
        />
      </Modal>
    </AnimatedBackground>
  )
}