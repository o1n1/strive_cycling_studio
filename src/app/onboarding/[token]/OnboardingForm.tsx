'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { InvitacionPersonal } from '@/lib/types/personal.types'
import { SignaturePad } from '@/components/ui/SignaturePad'
import { DocumentoUpload } from '@/components/personal/DocumentoUpload'

interface OnboardingFormProps {
  invitacion: InvitacionPersonal
}

export function OnboardingForm({ invitacion }: OnboardingFormProps) {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(1)
  const [personalId, setPersonalId] = useState<string>('')
  const [cargando, setCargando] = useState(false)

  // Estados de cada paso
  const [datosPassword, setDatosPassword] = useState({ password: '', confirmar: '' })
  const [datosPersonales, setDatosPersonales] = useState({
    nombre_completo: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion_completa: '',
    curp: '',
    rfc: '',
    cuenta_bancaria_banco: '',
    cuenta_bancaria_clabe: '',
    cuenta_bancaria_beneficiario: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
  })
  const [datosEspecificos, setDatosEspecificos] = useState<Record<string, string | number>>({})
  const [documentosSubidos, setDocumentosSubidos] = useState<string[]>([])
  const [firma, setFirma] = useState<string>('')

  const esCoach = invitacion.rol === 'coach'
  const totalPasos = 6

  // ============ PASO 1: BIENVENIDA ============
  const renderPaso1 = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">
        ¡Felicidades, has sido invitado!
      </h2>

      <p className="text-white/60 mb-6">
        Estás a punto de unirte al equipo de Strive Studio como{' '}
        <span className="text-[#E84A27] font-semibold">
          {esCoach ? 'Coach' : 'Staff'}
        </span>
      </p>

      {esCoach && invitacion.disciplinas && invitacion.disciplinas.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-white/40 text-sm mb-2">Disciplinas:</p>
          <p className="text-white font-medium">
            {invitacion.disciplinas.join(', ')}
          </p>
        </div>
      )}

      {invitacion.mensaje_personalizado && (
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <p className="text-white/40 text-sm mb-2">Mensaje del equipo:</p>
          <p className="text-white/80 italic">
            &ldquo;{invitacion.mensaje_personalizado}&rdquo;
          </p>
        </div>
      )}

      <p className="text-white/60 text-sm">
        Completaremos tu registro en {totalPasos} pasos simples
      </p>
    </div>
  )

  // ============ PASO 2: CREAR CUENTA ============
  const handlePaso2 = async () => {
    if (datosPassword.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (datosPassword.password !== datosPassword.confirmar) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setCargando(true)

    try {
      const response = await fetch('/api/onboarding/crear-cuenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitacion.email,
          password: datosPassword.password,
          nombre_completo: '',
          rol: invitacion.rol,
          token: invitacion.token
        })
      })

      const data = await response.json()

      if (data.success) {
        setPersonalId(data.userId)
        setPasoActual(3)
        toast.success('Cuenta creada correctamente')
      } else {
        toast.error(data.error || 'Error al crear cuenta')
      }
    } catch {
      toast.error('Error al crear cuenta')
    } finally {
      setCargando(false)
    }
  }

  const renderPaso2 = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Crea tu cuenta</h2>

      <div className="space-y-4">
        {/* Email (readonly) */}
        <div>
          <label className="block text-white/60 text-sm mb-2">Email</label>
          <input
            type="email"
            value={invitacion.email}
            disabled
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/40"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-white/60 text-sm mb-2">Contraseña *</label>
          <input
            type="password"
            value={datosPassword.password}
            onChange={(e) => setDatosPassword({ ...datosPassword, password: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>

        {/* Confirmar Password */}
        <div>
          <label className="block text-white/60 text-sm mb-2">Confirmar Contraseña *</label>
          <input
            type="password"
            value={datosPassword.confirmar}
            onChange={(e) => setDatosPassword({ ...datosPassword, confirmar: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            placeholder="Repite tu contraseña"
            required
          />
        </div>
      </div>
    </div>
  )

  // ============ PASO 3: INFO PERSONAL ============
  const handlePaso3 = async () => {
    // Validar campos requeridos
    const camposRequeridos = [
      'nombre_completo',
      'telefono',
      'fecha_nacimiento',
      'direccion_completa',
      'curp',
      'rfc'
    ]

    for (const campo of camposRequeridos) {
      if (!datosPersonales[campo as keyof typeof datosPersonales]) {
        toast.error('Completa todos los campos requeridos')
        return
      }
    }

    setCargando(true)

    try {
      const response = await fetch('/api/onboarding/datos-personales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_id: personalId,
          tipo_personal: invitacion.rol,
          ...datosPersonales
        })
      })

      const data = await response.json()

      if (data.success) {
        setPasoActual(4)
        toast.success('Información guardada')
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar información')
    } finally {
      setCargando(false)
    }
  }

  const renderPaso3 = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Información Personal</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Completo */}
        <div className="md:col-span-2">
          <label className="block text-white/60 text-sm mb-2">Nombre Completo *</label>
          <input
            type="text"
            value={datosPersonales.nombre_completo}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, nombre_completo: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            required
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-white/60 text-sm mb-2">Teléfono *</label>
          <input
            type="tel"
            value={datosPersonales.telefono}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, telefono: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            required
          />
        </div>

        {/* Fecha Nacimiento */}
        <div>
          <label className="block text-white/60 text-sm mb-2">Fecha de Nacimiento *</label>
          <input
            type="date"
            value={datosPersonales.fecha_nacimiento}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, fecha_nacimiento: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            required
          />
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-white/60 text-sm mb-2">Dirección Completa *</label>
          <textarea
            value={datosPersonales.direccion_completa}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, direccion_completa: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            rows={2}
            required
          />
        </div>

        {/* CURP */}
        <div>
          <label className="block text-white/60 text-sm mb-2">CURP *</label>
          <input
            type="text"
            value={datosPersonales.curp}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, curp: e.target.value.toUpperCase() })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none uppercase"
            maxLength={18}
            required
          />
        </div>

        {/* RFC */}
        <div>
          <label className="block text-white/60 text-sm mb-2">RFC *</label>
          <input
            type="text"
            value={datosPersonales.rfc}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, rfc: e.target.value.toUpperCase() })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none uppercase"
            maxLength={13}
            required
          />
        </div>

        {/* Datos Bancarios */}
        <div className="md:col-span-2">
          <h3 className="text-white font-medium mb-3 mt-4">Datos Bancarios</h3>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Banco</label>
          <input
            type="text"
            value={datosPersonales.cuenta_bancaria_banco}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, cuenta_bancaria_banco: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">CLABE</label>
          <input
            type="text"
            value={datosPersonales.cuenta_bancaria_clabe}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, cuenta_bancaria_clabe: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            maxLength={18}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/60 text-sm mb-2">Beneficiario</label>
          <input
            type="text"
            value={datosPersonales.cuenta_bancaria_beneficiario}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, cuenta_bancaria_beneficiario: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
          />
        </div>

        {/* Contacto de Emergencia */}
        <div className="md:col-span-2">
          <h3 className="text-white font-medium mb-3 mt-4">Contacto de Emergencia</h3>
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Nombre</label>
          <input
            type="text"
            value={datosPersonales.contacto_emergencia_nombre}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, contacto_emergencia_nombre: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Teléfono</label>
          <input
            type="tel"
            value={datosPersonales.contacto_emergencia_telefono}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, contacto_emergencia_telefono: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/60 text-sm mb-2">Relación</label>
          <input
            type="text"
            value={datosPersonales.contacto_emergencia_relacion}
            onChange={(e) => setDatosPersonales({ ...datosPersonales, contacto_emergencia_relacion: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            placeholder="Ej: Madre, Padre, Esposo/a, etc."
          />
        </div>
      </div>
    </div>
  )

  // ============ PASO 4: INFO ESPECÍFICA ============
  const renderPaso4Coach = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Información de Coach</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white/60 text-sm mb-2">Biografía</label>
          <textarea
            value={String(datosEspecificos.biografia || '')}
            onChange={(e) => setDatosEspecificos({ ...datosEspecificos, biografia: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            rows={4}
            placeholder="Cuéntanos sobre ti y tu experiencia..."
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Años de Experiencia</label>
          <input
            type="number"
            value={datosEspecificos.anos_experiencia || ''}
            onChange={(e) => setDatosEspecificos({ ...datosEspecificos, anos_experiencia: parseInt(e.target.value) })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
            min={0}
          />
        </div>
      </div>
    </div>
  )

  const renderPaso4Staff = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Información de Staff</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/60 text-sm mb-2">Horario de Entrada</label>
          <input
            type="time"
            value={String(datosEspecificos.horario_entrada || '')}
            onChange={(e) => setDatosEspecificos({ ...datosEspecificos, horario_entrada: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-white/60 text-sm mb-2">Horario de Salida</label>
          <input
            type="time"
            value={String(datosEspecificos.horario_salida || '')}
            onChange={(e) => setDatosEspecificos({ ...datosEspecificos, horario_salida: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#E84A27] focus:outline-none"
          />
        </div>
      </div>
    </div>
  )

  // ============ PASO 5: DOCUMENTOS ============
  const renderPaso5 = () => {
    const documentosRequeridos = esCoach
      ? ['ine', 'curp', 'rfc', 'comprobante_domicilio', 'certificacion']
      : ['ine', 'curp', 'rfc', 'comprobante_domicilio']

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-6">Documentos Requeridos</h2>

        {documentosRequeridos.map((tipo) => (
          <DocumentoUpload
            key={tipo}
            personalId={personalId}
            tipoPersonal={invitacion.rol}
            tipoDocumento={tipo as TipoDocumento}
            titulo={tipo.replace(/_/g, ' ').toUpperCase()}
            onUploadCompleto={() => {
              if (!documentosSubidos.includes(tipo)) {
                setDocumentosSubidos([...documentosSubidos, tipo])
              }
            }}
          />
        ))}
      </div>
    )
  }

  // ============ PASO 6: FIRMA ============
  const handleFinalizar = async () => {
    if (!firma) {
      toast.error('Debes firmar el contrato')
      return
    }

    setCargando(true)

    try {
      const response = await fetch('/api/onboarding/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_id: personalId,
          tipo_personal: invitacion.rol,
          firma_base64: firma,
          token: invitacion.token
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('¡Onboarding completado!')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        toast.error(data.error || 'Error al finalizar')
      }
    } catch {
      toast.error('Error al finalizar onboarding')
    } finally {
      setCargando(false)
    }
  }

  const renderPaso6 = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Firma del Contrato</h2>

      {/* Contrato (simplificado) */}
      <div className="bg-white/5 rounded-lg p-6 mb-6 max-h-64 overflow-y-auto">
        <h3 className="text-white font-medium mb-4">Contrato de {esCoach ? 'Coach' : 'Staff'}</h3>
        <div className="text-white/60 text-sm space-y-2">
          <p>Por medio del presente, yo {datosPersonales.nombre_completo} acepto los términos y condiciones establecidos por Strive Studio.</p>
          <p>• Cumpliré con los horarios asignados</p>
          <p>• Mantendré profesionalismo en todo momento</p>
          <p>• Seguiré los protocolos de seguridad</p>
          <p>• Respetaré la confidencialidad de la información</p>
        </div>
      </div>

      {/* Firma */}
      <SignaturePad onFirmaCompleta={setFirma} />

      {/* Checkbox términos */}
      <label className="flex items-start gap-3 mt-6 cursor-pointer">
        <input
          type="checkbox"
          required
          className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-[#E84A27] focus:ring-[#E84A27]"
        />
        <span className="text-white/60 text-sm">
          Acepto los términos y condiciones del contrato y confirmo que la información proporcionada es correcta
        </span>
      </label>
    </div>
  )

  // ============ NAVEGACIÓN ============
  const handleSiguiente = () => {
    if (pasoActual === 2) {
      handlePaso2()
    } else if (pasoActual === 3) {
      handlePaso3()
    } else if (pasoActual === 6) {
      handleFinalizar()
    } else {
      setPasoActual(pasoActual + 1)
    }
  }

  const handleAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalPasos }).map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                i + 1 <= pasoActual
                  ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {i + 1}
            </div>
            {i < totalPasos - 1 && (
              <div className={`h-1 flex-1 mx-2 ${i + 1 < pasoActual ? 'bg-[#E84A27]' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="mb-8">
        {pasoActual === 1 && renderPaso1()}
        {pasoActual === 2 && renderPaso2()}
        {pasoActual === 3 && renderPaso3()}
        {pasoActual === 4 && (esCoach ? renderPaso4Coach() : renderPaso4Staff())}
        {pasoActual === 5 && renderPaso5()}
        {pasoActual === 6 && renderPaso6()}
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        {pasoActual > 1 && (
          <button
            onClick={handleAnterior}
            disabled={cargando}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/10 transition-all duration-300 disabled:opacity-50"
          >
            Anterior
          </button>
        )}

        <button
          onClick={handleSiguiente}
          disabled={cargando}
          className="flex-1 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all duration-300 disabled:opacity-50"
        >
          {cargando ? 'Cargando...' : pasoActual === totalPasos ? 'Finalizar' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}

// Agregado import faltante
import type { TipoDocumento } from '@/lib/types/enums'