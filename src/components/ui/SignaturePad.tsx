'use client'

import { useRef, useState, useEffect } from 'react'

interface SignaturePadProps {
  onFirmaCompleta?: (firmaBase64: string) => void
  onSave?: (firmaBase64: string) => void // Compatibilidad con registro existente
  firmaExistente?: string | null
  altura?: number
}

export function SignaturePad({
  onFirmaCompleta,
  onSave,
  firmaExistente,
  altura = 200
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dibujando, setDibujando] = useState(false)
  const [firmaGuardada, setFirmaGuardada] = useState(false)

  useEffect(() => {
    if (firmaExistente && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        setFirmaGuardada(true)
      }
      img.src = firmaExistente
    }
  }, [firmaExistente])

  const iniciarDibujo = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setDibujando(true)
    setFirmaGuardada(false)

    const x = 'touches' in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left
    const y = 'touches' in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const dibujar = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!dibujando) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = 'touches' in e
      ? e.touches[0].clientX - rect.left
      : e.clientX - rect.left
    const y = 'touches' in e
      ? e.touches[0].clientY - rect.top
      : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const finalizarDibujo = () => {
    setDibujando(false)
  }

  const limpiar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setFirmaGuardada(false)
  }

  const guardarFirma = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Verificar que hay contenido
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = imageData.data.some(channel => channel !== 0)

    if (!hasContent) {
      alert('Por favor, firma primero antes de guardar')
      return
    }

    const firmaBase64 = canvas.toDataURL('image/png')
    
    // Llamar ambas callbacks (compatibilidad)
    onFirmaCompleta?.(firmaBase64)
    onSave?.(firmaBase64)
    
    setFirmaGuardada(true)
  }

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={altura}
          className="w-full bg-white/10 rounded-lg cursor-crosshair touch-none"
          onMouseDown={iniciarDibujo}
          onMouseMove={dibujar}
          onMouseUp={finalizarDibujo}
          onMouseLeave={finalizarDibujo}
          onTouchStart={iniciarDibujo}
          onTouchMove={dibujar}
          onTouchEnd={finalizarDibujo}
        />
        <p className="text-white/40 text-sm mt-2 text-center">
          Firma con tu mouse, trackpad o dedo
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={limpiar}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl border border-white/10 transition-all duration-300"
        >
          Limpiar
        </button>

        <button
          type="button"
          onClick={guardarFirma}
          disabled={firmaGuardada}
          className="flex-1 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {firmaGuardada ? '✓ Firma Guardada' : 'Guardar Firma'}
        </button>
      </div>
    </div>
  )
}