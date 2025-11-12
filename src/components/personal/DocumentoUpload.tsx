'use client'

import { useState } from 'react'
import Image from 'next/image'
import { uploadDocumento, type DocumentoPersonal } from '@/lib/actions/documentos-actions'
import type { TipoDocumento } from '@/lib/types/enums'
import { toast } from 'sonner'

interface DocumentoUploadProps {
  personalId: string
  tipoPersonal: 'coach' | 'staff'
  tipoDocumento: TipoDocumento
  titulo: string
  descripcion?: string
  documentoExistente?: DocumentoPersonal | null
  onUploadCompleto?: (documento: DocumentoPersonal) => void
}

export function DocumentoUpload({
  personalId,
  tipoPersonal,
  tipoDocumento,
  titulo,
  descripcion,
  documentoExistente,
  onUploadCompleto
}: DocumentoUploadProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no puede superar 5MB')
      return
    }

    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos PDF o imágenes')
      return
    }

    setArchivo(file)

    // Generar previsualización si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPrevisualizacion(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPrevisualizacion(null)
    }
  }

  const handleSubir = async () => {
    if (!archivo) {
      toast.error('Selecciona un archivo primero')
      return
    }

    setCargando(true)

    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      formData.append('tipo_documento', tipoDocumento)
      formData.append('personal_id', personalId)
      formData.append('tipo_personal', tipoPersonal)

      const resultado = await uploadDocumento(formData)

      if (resultado.success) {
        toast.success(resultado.mensaje || 'Documento subido correctamente')
        setArchivo(null)
        setPrevisualizacion(null)
        onUploadCompleto?.(resultado.data)
      } else {
        toast.error(resultado.error)
      }
    } catch {
      toast.error('Error al subir el documento')
    } finally {
      setCargando(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rechazado':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return '✓ Aprobado'
      case 'rechazado':
        return '✗ Rechazado'
      default:
        return '⏳ Pendiente'
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-medium text-lg">{titulo}</h3>
          {descripcion && (
            <p className="text-white/60 text-sm mt-1">{descripcion}</p>
          )}
        </div>

        {documentoExistente && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
              documentoExistente.estado
            )}`}
          >
            {getEstadoTexto(documentoExistente.estado)}
          </span>
        )}
      </div>

      {/* Documento existente rechazado */}
      {documentoExistente?.estado === 'rechazado' && documentoExistente.comentarios_admin && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm font-medium mb-1">
            Motivo del rechazo:
          </p>
          <p className="text-red-400/80 text-sm">
            {documentoExistente.comentarios_admin}
          </p>
        </div>
      )}

      {/* Upload area */}
      {!documentoExistente || documentoExistente.estado === 'rechazado' ? (
        <div>
          {/* Input file */}
          <label
            htmlFor={`file-${tipoDocumento}`}
            className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 cursor-pointer hover:border-[#E84A27]/50 hover:bg-white/5 transition-all duration-300"
          >
            <svg
              className="w-12 h-12 text-white/40 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-white font-medium mb-1">
              {archivo ? archivo.name : 'Seleccionar archivo'}
            </p>
            <p className="text-white/40 text-sm">
              PDF o imagen • Máx 5MB
            </p>
          </label>

          <input
            id={`file-${tipoDocumento}`}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleArchivoChange}
            disabled={cargando}
          />

          {/* Previsualización */}
          {previsualizacion && (
            <div className="mt-4">
              <Image
                src={previsualizacion}
                alt="Preview"
                width={600}
                height={192}
                className="w-full h-48 object-cover rounded-lg border border-white/10"
              />
            </div>
          )}

          {/* Botón subir */}
          {archivo && (
            <button
              onClick={handleSubir}
              disabled={cargando}
              className="w-full mt-4 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {cargando ? 'Subiendo...' : 'Subir Documento'}
            </button>
          )}
        </div>
      ) : (
        // Documento aprobado o pendiente
        <div className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
            {documentoExistente.url_archivo.endsWith('.pdf') ? (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <p className="text-white font-medium text-sm">
              {documentoExistente.nombre_archivo}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Subido el {new Date(documentoExistente.created_at).toLocaleDateString()}
            </p>
          </div>

          <a
            href={documentoExistente.url_archivo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E84A27] hover:text-[#FF6B35] text-sm font-medium transition-colors"
          >
            Ver →
          </a>
        </div>
      )}
    </div>
  )
}