// src/components/personal/revision/TabDocumentos.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { obtenerDocumentosPersonal, aprobarDocumento, rechazarDocumento } from '@/lib/actions/documentos-actions'
import type { DocumentoPersonal } from '@/lib/actions/documentos-actions'
import { aprobarPersonal, rechazarPersonal } from '@/lib/actions/personal-actions'

interface TabDocumentosProps {
  personalId: string
  tipoPersonal: 'coach' | 'staff'
  estadoPersonal: string
  onActualizar: () => void
}

export default function TabDocumentos({ personalId, tipoPersonal, estadoPersonal, onActualizar }: TabDocumentosProps) {
  const [documentos, setDocumentos] = useState<DocumentoPersonal[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoPersonal | null>(null)
  const [modalRechazo, setModalRechazo] = useState(false)
  const [razonRechazo, setRazonRechazo] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const cargarDocumentos = useCallback(async () => {
    try {
      setCargando(true)
      setMensaje(null)

      const resultado = await obtenerDocumentosPersonal(personalId, tipoPersonal)

      if (resultado.success) {
        setDocumentos(resultado.data)
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al cargar documentos' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado al cargar documentos' })
    } finally {
      setCargando(false)
    }
  }, [personalId, tipoPersonal])

  useEffect(() => {
    cargarDocumentos()
  }, [cargarDocumentos])

  const handleAprobarDocumento = async (documentoId: string) => {
    try {
      setProcesando(true)
      const resultado = await aprobarDocumento(documentoId)

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: 'Documento aprobado correctamente' })
        cargarDocumentos()
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al aprobar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazarDocumento = async () => {
    if (!documentoSeleccionado || !razonRechazo.trim()) {
      setMensaje({ tipo: 'error', texto: 'Debes proporcionar una razón' })
      return
    }

    try {
      setProcesando(true)
      const resultado = await rechazarDocumento(documentoSeleccionado.id, razonRechazo)

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: 'Documento rechazado. Coach notificado.' })
        setModalRechazo(false)
        setDocumentoSeleccionado(null)
        setRazonRechazo('')
        cargarDocumentos()
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al rechazar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setProcesando(false)
    }
  }

  const handleAprobarPersonal = async () => {
    if (!window.confirm('¿Estás seguro de aprobar a este personal? Esta acción habilitará su cuenta.')) {
      return
    }

    try {
      setProcesando(true)
      const resultado = await aprobarPersonal(personalId, tipoPersonal)

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: 'Personal aprobado correctamente' })
        onActualizar()
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al aprobar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setProcesando(false)
    }
  }

  const handleRechazarPersonal = async () => {
    const razon = window.prompt('Indica la razón del rechazo (será notificado al personal):')
    if (!razon?.trim()) return

    try {
      setProcesando(true)
      const resultado = await rechazarPersonal(personalId, tipoPersonal, razon)

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: 'Personal rechazado. Notificación enviada.' })
        onActualizar()
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al rechazar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setProcesando(false)
    }
  }

  const todosAprobados = documentos.every(doc => doc.estado === 'aprobado')
  const hayRechazados = documentos.some(doc => doc.estado === 'rechazado')

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rechazado': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const getIconoTipo = (tipo: string) => {
    const iconos: Record<string, string> = {
      identificacion: '🪪',
      comprobante_domicilio: '🏠',
      certificado_nacimiento: '👶',
      certificaciones: '📜',
      constancia_fiscal: '📋',
      titulo_profesional: '🎓',
      curriculum: '📄',
      foto_perfil: '📸',
      contrato: '📝',
      otros: '📎'
    }
    return iconos[tipo] || '📄'
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#E84A27] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          className={`
            p-4 rounded-xl border backdrop-blur-xl
            ${mensaje.tipo === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
            }
          `}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Acciones globales */}
      {estadoPersonal === 'pendiente' && documentos.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Revisión de Personal</h3>
              <p className="text-white/60 text-sm">
                {todosAprobados
                  ? '✅ Todos los documentos están aprobados. Puedes aprobar al personal.'
                  : hayRechazados
                  ? '⚠️ Hay documentos rechazados. El personal debe resubir documentos.'
                  : '📋 Revisa y aprueba/rechaza cada documento antes de aprobar al personal.'
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRechazarPersonal}
                disabled={procesando}
                className="px-6 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 border border-red-500/30 disabled:opacity-50"
              >
                ✗ Rechazar Personal
              </button>
              <button
                onClick={handleAprobarPersonal}
                disabled={procesando || !todosAprobados}
                className="px-6 py-2.5 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300 border border-green-500/30 disabled:opacity-50"
              >
                ✓ Aprobar Personal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-white mb-2">Sin documentos</h3>
          <p className="text-white/60">Este personal aún no ha subido documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{getIconoTipo(doc.tipo_documento)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white capitalize">
                        {doc.tipo_documento.replace(/_/g, ' ')}
                      </h4>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getEstadoColor(doc.estado)}`}>
                        {doc.estado}
                      </span>
                      <span className="text-white/40 text-sm">v{doc.version}</span>
                    </div>
                    
                    <p className="text-white/60 text-sm mb-2">{doc.nombre_archivo}</p>
                    
                    {doc.comentarios_admin && (
                      <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-white/40 text-xs mb-1">Comentarios del admin:</p>
                        <p className="text-white/80 text-sm">{doc.comentarios_admin}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                      <span>Subido: {new Date(doc.created_at).toLocaleDateString('es-MX')}</span>
                      {doc.revisado_at && (
                        <span>Revisado: {new Date(doc.revisado_at).toLocaleDateString('es-MX')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={doc.url_archivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-300 text-sm text-center"
                  >
                    👁️ Ver
                  </a>
                  
                  {doc.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleAprobarDocumento(doc.id)}
                        disabled={procesando}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300 text-sm disabled:opacity-50"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setDocumentoSeleccionado(doc)
                          setModalRechazo(true)
                        }}
                        disabled={procesando}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 text-sm disabled:opacity-50"
                      >
                        ✗ Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {modalRechazo && documentoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Rechazar Documento</h3>
            <p className="text-white/60 text-sm mb-4">
              Indica la razón del rechazo. El personal será notificado y podrá subir una nueva versión.
            </p>
            
            <textarea
              value={razonRechazo}
              onChange={(e) => setRazonRechazo(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#E84A27]/50 resize-none mb-4"
              placeholder="Ej: La imagen está borrosa, por favor sube una foto más clara..."
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalRechazo(false)
                  setDocumentoSeleccionado(null)
                  setRazonRechazo('')
                }}
                disabled={procesando}
                className="flex-1 px-4 py-2.5 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazarDocumento}
                disabled={procesando || !razonRechazo.trim()}
                className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 border border-red-500/30 disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}