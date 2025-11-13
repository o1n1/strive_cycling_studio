// src/components/onboarding/DocumentosUpload.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TipoDocumento } from '@/lib/types/enums'

interface DocumentoSubido {
  tipo: TipoDocumento
  archivo: File
  url?: string
  subiendo?: boolean
}

interface DocumentosUploadProps {
  userId: string
  tipoPersonal: 'coach' | 'staff'
  onDocumentosSubidos: (urls: { tipo: TipoDocumento; url: string }[]) => void
}

const DOCUMENTOS_REQUERIDOS: { tipo: TipoDocumento; label: string }[] = [
  { tipo: 'ine', label: 'INE (ambos lados)' },
  { tipo: 'comprobante_domicilio', label: 'Comprobante de domicilio' },
  { tipo: 'rfc', label: 'RFC' },
  { tipo: 'curp', label: 'CURP' }
]

export function DocumentosUpload({ userId, tipoPersonal, onDocumentosSubidos }: DocumentosUploadProps) {
  const [documentos, setDocumentos] = useState<DocumentoSubido[]>([])
  const [subiendo, setSubiendo] = useState(false)
  const supabase = createClient()

  const handleFileSelect = async (tipo: TipoDocumento, file: File) => {
    // Validar tamaño (5MB máx)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar 5MB')
      return
    }

    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!tiposPermitidos.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG o PDF')
      return
    }

    setSubiendo(true)

    try {
      // Generar nombre único
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const nombreArchivo = `${tipo}_${timestamp}.${extension}`
      const rutaArchivo = `${tipoPersonal}/${userId}/${nombreArchivo}`

      // Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from('documentos-personal')
        .upload(rutaArchivo, file)

      if (uploadError) {
        console.error('Error al subir:', uploadError)
        alert('Error al subir el documento')
        return
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('documentos-personal')
        .getPublicUrl(rutaArchivo)

      const url = urlData.publicUrl

      // Agregar a lista
      setDocumentos(prev => {
        const nuevos = prev.filter(d => d.tipo !== tipo)
        return [...nuevos, { tipo, archivo: file, url }]
      })

    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el documento')
    } finally {
      setSubiendo(false)
    }
  }

  const handleRemove = (tipo: TipoDocumento) => {
    setDocumentos(prev => prev.filter(d => d.tipo !== tipo))
  }

  // Actualizar callback cuando cambian documentos
  useState(() => {
    const urlsSubidas = documentos
      .filter(d => d.url)
      .map(d => ({ tipo: d.tipo, url: d.url! }))
    onDocumentosSubidos(urlsSubidas)
  })

  return (
    <div className="space-y-4">
      {DOCUMENTOS_REQUERIDOS.map(({ tipo, label }) => {
        const doc = documentos.find(d => d.tipo === tipo)

        return (
          <div key={tipo} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white/80">{label}</label>
              {doc && (
                <span className="text-xs text-green-400">✓ Subido</span>
              )}
            </div>

            {!doc ? (
              <label className="block">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(tipo, file)
                  }}
                  disabled={subiendo}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-[#E84A27] transition-colors">
                  <div className="text-white/60 text-sm">
                    Click para seleccionar archivo
                    <br />
                    <span className="text-xs text-white/40">JPG, PNG o PDF (máx 5MB)</span>
                  </div>
                </div>
              </label>
            ) : (
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E84A27]/20 rounded flex items-center justify-center">
                    <span className="text-[#E84A27]">📄</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">{doc.archivo.name}</p>
                    <p className="text-white/40 text-xs">
                      {(doc.archivo.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(tipo)}
                  className="text-white/60 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )
      })}

      {subiendo && (
        <div className="text-center text-white/60 text-sm">
          Subiendo documento...
        </div>
      )}
    </div>
  )
}