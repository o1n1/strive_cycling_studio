// src/components/onboarding/FirmaDigital.tsx
'use client'

import { useRef, useState, useEffect } from 'react'

interface FirmaDigitalProps {
  onFirmaGuardada: (firmaBase64: string) => void
  disabled?: boolean
}

export function FirmaDigital({ onFirmaGuardada, disabled }: FirmaDigitalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dibujando, setDibujando] = useState(false)
  const [firmado, setFirmado] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const iniciarDibujo = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setDibujando(true)
    setFirmado(true)

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const dibujar = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!dibujando || disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const terminarDibujo = () => {
    if (!dibujando) return
    setDibujando(false)

    const canvas = canvasRef.current
    if (!canvas) return

    const firmaBase64 = canvas.toDataURL('image/png')
    onFirmaGuardada(firmaBase64)
  }

  const limpiar = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setFirmado(false)
    onFirmaGuardada('')
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onMouseDown={iniciarDibujo}
          onMouseMove={dibujar}
          onMouseUp={terminarDibujo}
          onMouseLeave={terminarDibujo}
          onTouchStart={iniciarDibujo}
          onTouchMove={dibujar}
          onTouchEnd={terminarDibujo}
          className={`w-full h-[200px] border-2 border-dashed rounded-lg cursor-crosshair touch-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'border-white/20'
          }`}
          style={{ touchAction: 'none' }}
        />
        {!firmado && !disabled && (
          <p className="text-white/40 text-sm text-center mt-2">
            Firma aquí con tu mouse o dedo
          </p>
        )}
      </div>

      {firmado && (
        <button
          type="button"
          onClick={limpiar}
          disabled={disabled}
          className="text-sm text-white/60 hover:text-white transition-colors disabled:opacity-50"
        >
          Limpiar firma
        </button>
      )}
    </div>
  )
}