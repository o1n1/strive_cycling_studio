'use client'

// src/components/clases/ToggleFuturas.tsx
import { useRouter } from 'next/navigation'

interface Props {
  soloFuturasInicial: boolean
}

export function ToggleFuturas({ soloFuturasInicial }: Props) {
  const router = useRouter()

  const cambiarModo = (soloFuturas: boolean) => {
    if (soloFuturas) {
      router.push('/admin/clases')
    } else {
      router.push('/admin/clases?solo_futuras=false')
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🗓️</div>
          <div>
            <p className="text-white font-medium">Modo de visualización</p>
            <p className="text-white/60 text-sm">
              {soloFuturasInicial 
                ? 'Mostrando solo clases futuras' 
                : 'Mostrando todas las clases (incluyendo pasadas)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cambiarModo(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              soloFuturasInicial
                ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            Solo Futuras
          </button>
          <button
            onClick={() => cambiarModo(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              !soloFuturasInicial
                ? 'bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            Ver Todas
          </button>
        </div>
      </div>
    </div>
  )
}