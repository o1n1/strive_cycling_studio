// src/app/(dashboard)/admin/personal/[id]/revision/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  aprobarPersonal,
  rechazarPersonal,
  obtenerTodoPersonal
} from '@/lib/actions/personal-actions'
import {
  obtenerDocumentosPersonal,
  aprobarDocumento,
  rechazarDocumento
} from '@/lib/actions/documentos-actions'
import type { TipoPersonal } from '@/lib/types/personal.types'
import type { DocumentoPersonal } from '@/lib/types/database.types'
import type { TipoDisciplina } from '@/lib/types/enums'

interface PersonalData {
  id: string
  tipo: TipoPersonal
  nombre: string
  email: string
  telefono: string
  foto_url: string | null
  estado: string
  activo: boolean
  
  // Info personal
  curp: string | null
  rfc: string | null
  direccion_completa: string | null
  fecha_nacimiento?: string
  
  // Cuenta bancaria
  cuenta_bancaria_banco: string | null
  cuenta_bancaria_clabe: string | null
  cuenta_bancaria_beneficiario: string | null
  
  // Contacto emergencia
  contacto_emergencia_nombre: string | null
  contacto_emergencia_telefono: string | null
  contacto_emergencia_relacion: string | null
  
  // Coach específico
  disciplinas?: TipoDisciplina
  especialidades?: string[]
  biografia?: string
  anos_experiencia?: number
  pago_por_clase?: number
  pago_por_hora?: number
  
  // Staff específico
  horario_entrada?: string
  horario_salida?: string
  dias_laborales?: number[]
  salario_mensual?: number
  permisos?: {
    ventas: boolean
    checkin: boolean
    inventario: boolean
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function RevisionPage({ params }: PageProps) {
  const router = useRouter()
  const [personal, setPersonal] = useState<PersonalData | null>(null)
  const [documentos, setDocumentos] = useState<DocumentoPersonal[]>([])
  const [tab, setTab] = useState<'info' | 'documentos'>('info')
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false)
  const [idParam, setIdParam] = useState<string>('')

  useEffect(() => {
    params.then(p => setIdParam(p.id))
  }, [params])

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    
    // Cargar personal
    const resultPersonal = await obtenerTodoPersonal()
    if (resultPersonal.success && resultPersonal.data) {
      const persona = resultPersonal.data.find(p => p.id === idParam)
      if (persona) {
        setPersonal(persona as PersonalData)
        
        // Cargar documentos
        const resultDocs = await obtenerDocumentosPersonal(persona.id, persona.tipo)
        if (resultDocs.success && resultDocs.data) {
          setDocumentos(resultDocs.data as DocumentoPersonal[])
        }
      }
    }
    
    setCargando(false)
  }, [idParam])

  useEffect(() => {
    if (idParam) cargarDatos()
  }, [idParam, cargarDatos])

  const handleAprobar = async () => {
    if (!personal) return
    
    setProcesando(true)
    const resultado = await aprobarPersonal(personal.id, personal.tipo)
    setProcesando(false)
    
    if (resultado.success) {
      toast.success('Personal aprobado correctamente')
      router.push('/admin/personal')
    } else {
      toast.error(resultado.error)
    }
  }

  const handleRechazar = async () => {
    if (!personal || !motivoRechazo.trim()) {
      toast.error('Debes proporcionar un motivo')
      return
    }
    
    setProcesando(true)
    const resultado = await rechazarPersonal(personal.id, personal.tipo, motivoRechazo)
    setProcesando(false)
    
    if (resultado.success) {
      toast.success('Personal rechazado')
      setMostrarModalRechazo(false)
      router.push('/admin/personal')
    } else {
      toast.error(resultado.error)
    }
  }

  const handleAprobarDocumento = async (docId: string) => {
    setProcesando(true)
    const resultado = await aprobarDocumento(docId)
    setProcesando(false)
    
    if (resultado.success) {
      toast.success('Documento aprobado')
      cargarDatos()
    } else {
      toast.error(resultado.error)
    }
  }

  const handleRechazarDocumento = async (docId: string, comentario: string) => {
    if (!comentario.trim()) {
      toast.error('Debes proporcionar un comentario')
      return
    }
    
    setProcesando(true)
    const resultado = await rechazarDocumento(docId, comentario)
    setProcesando(false)
    
    if (resultado.success) {
      toast.success('Documento rechazado')
      cargarDatos()
    } else {
      toast.error(resultado.error)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!personal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6 flex items-center justify-center">
        <div className="text-white">Personal no encontrado</div>
      </div>
    )
  }

  const esCoach = personal.tipo === 'coach'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/personal"
            className="text-white/60 hover:text-white transition-colors text-sm mb-4 inline-block"
          >
            ← Volver a Personal
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Revisión de {personal.nombre}
              </h1>
              <p className="text-white/60">
                {esCoach ? '🚴 Coach' : '👥 Staff'} · {personal.email}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              personal.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-300' :
              personal.estado === 'aprobado' ? 'bg-green-500/20 text-green-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {personal.estado === 'pendiente' && '⏳ Pendiente'}
              {personal.estado === 'aprobado' && '✅ Aprobado'}
              {personal.estado === 'rechazado' && '❌ Rechazado'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-6 flex gap-2">
          <button
            onClick={() => setTab('info')}
            className={`flex-1 px-4 py-3 rounded-lg transition-all ${
              tab === 'info'
                ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            📋 Información
          </button>
          <button
            onClick={() => setTab('documentos')}
            className={`flex-1 px-4 py-3 rounded-lg transition-all ${
              tab === 'documentos'
                ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            📄 Documentos ({documentos.length})
          </button>
        </div>

        {/* Contenido */}
        {tab === 'info' && (
          <div className="space-y-6">
            {/* Info Personal */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 mb-1">Teléfono</p>
                  <p className="text-white">{personal.telefono || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">CURP</p>
                  <p className="text-white">{personal.curp || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">RFC</p>
                  <p className="text-white">{personal.rfc || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Dirección</p>
                  <p className="text-white">{personal.direccion_completa || 'No proporcionada'}</p>
                </div>
              </div>
            </div>

            {/* Cuenta Bancaria */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Datos Bancarios</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 mb-1">Banco</p>
                  <p className="text-white">{personal.cuenta_bancaria_banco || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">CLABE</p>
                  <p className="text-white">{personal.cuenta_bancaria_clabe || 'No proporcionada'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/40 mb-1">Beneficiario</p>
                  <p className="text-white">{personal.cuenta_bancaria_beneficiario || 'No proporcionado'}</p>
                </div>
              </div>
            </div>

            {/* Contacto Emergencia */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contacto de Emergencia</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40 mb-1">Nombre</p>
                  <p className="text-white">{personal.contacto_emergencia_nombre || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Teléfono</p>
                  <p className="text-white">{personal.contacto_emergencia_telefono || 'No proporcionado'}</p>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Relación</p>
                  <p className="text-white">{personal.contacto_emergencia_relacion || 'No proporcionada'}</p>
                </div>
              </div>
            </div>

            {/* Info específica Coach */}
            {esCoach && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Información de Coach</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-white/40 mb-1">Disciplinas</p>
                    <p className="text-white capitalize">{personal.disciplinas || 'No especificadas'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Especialidades</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {personal.especialidades?.map((esp, i) => (
                        <span key={i} className="px-3 py-1 bg-[#E84A27]/20 text-[#FF6B35] rounded-full text-xs">
                          {esp}
                        </span>
                      )) || <span className="text-white/60">No especificadas</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Biografía</p>
                    <p className="text-white">{personal.biografia || 'No proporcionada'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-white/40 mb-1">Experiencia</p>
                      <p className="text-white">{personal.anos_experiencia || 0} años</p>
                    </div>
                    <div>
                      <p className="text-white/40 mb-1">Pago por Clase</p>
                      <p className="text-white">${personal.pago_por_clase || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/40 mb-1">Pago por Hora</p>
                      <p className="text-white">${personal.pago_por_hora || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info específica Staff */}
            {!esCoach && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Información de Staff</h3>
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 mb-1">Horario Entrada</p>
                      <p className="text-white">{personal.horario_entrada || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 mb-1">Horario Salida</p>
                      <p className="text-white">{personal.horario_salida || 'No especificado'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Días Laborales</p>
                    <div className="flex gap-2 mt-2">
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, i) => (
                        <span
                          key={i}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                            personal.dias_laborales?.includes(i + 1)
                              ? 'bg-[#E84A27] text-white'
                              : 'bg-white/5 text-white/40'
                          }`}
                        >
                          {dia}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Salario Mensual</p>
                    <p className="text-white">${personal.salario_mensual || 0}</p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Permisos</p>
                    <div className="flex gap-2 mt-2">
                      {personal.permisos?.ventas && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                          💳 Ventas
                        </span>
                      )}
                      {personal.permisos?.checkin && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          ✅ Check-in
                        </span>
                      )}
                      {personal.permisos?.inventario && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          📦 Inventario
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'documentos' && (
          <div className="space-y-4">
            {documentos.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/60">No hay documentos subidos</p>
              </div>
            ) : (
              documentos.map((doc) => (
                <div key={doc.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold capitalize mb-1">
                        {(doc.tipo_documento as string).replace(/_/g, ' ')}
                      </h4>
                      <p className="text-white/40 text-sm">{doc.nombre_archivo}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      doc.estado === 'pendiente' ? 'bg-yellow-500/20 text-yellow-300' :
                      doc.estado === 'aprobado' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {doc.estado}
                    </div>
                  </div>
                  
                  {doc.url_archivo && (
                    <a
                      href={doc.url_archivo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:text-[#E84A27] text-sm mb-4 inline-block"
                    >
                      Ver documento →
                    </a>
                  )}

                  {doc.comentarios_admin && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                      <p className="text-red-300 text-sm">{doc.comentarios_admin}</p>
                    </div>
                  )}

                  {doc.estado === 'pendiente' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAprobarDocumento(doc.id)}
                        disabled={procesando}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => {
                          const comentario = prompt('Motivo del rechazo:')
                          if (comentario) handleRechazarDocumento(doc.id, comentario)
                        }}
                        disabled={procesando}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-all disabled:opacity-50"
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Acciones finales */}
        {personal.estado === 'pendiente' && (
          <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Decisión Final</h3>
            <div className="flex gap-4">
              <button
                onClick={handleAprobar}
                disabled={procesando}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                ✅ Aprobar Personal
              </button>
              <button
                onClick={() => setMostrarModalRechazo(true)}
                disabled={procesando}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                ❌ Rechazar Personal
              </button>
            </div>
          </div>
        )}

        {/* Modal Rechazo */}
        {mostrarModalRechazo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1814] border border-white/20 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Motivo de Rechazo</h3>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Explica por qué rechazas a este personal..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalRechazo(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  disabled={procesando}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}