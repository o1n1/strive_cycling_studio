// src/app/onboarding/[token]/page.tsx
import { redirect } from 'next/navigation'
import { obtenerInvitacionPorToken } from '@/lib/actions/personal-actions'
import { OnboardingForm } from './OnboardingForm'

interface PageProps {
  params: { token: string }
}

export default async function OnboardingPage({ params }: PageProps) {
  const { token } = params

  // Verificar invitación válida
  const resultado = await obtenerInvitacionPorToken(token)

  if (!resultado.success) {
    redirect('/login?error=invitacion_invalida')
  }

  const invitacion = resultado.data

  // Verificar que no esté ya aceptada
  if (invitacion.estado === 'aceptada') {
    redirect('/login?mensaje=onboarding_completado')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenido a <span className="bg-gradient-to-r from-[#E84A27] to-[#FF6B35] bg-clip-text text-transparent">Strive Studio</span>
          </h1>
          <p className="text-white/60 text-lg">
            Completa tu registro para comenzar tu journey con nosotros
          </p>
        </div>

        {/* Form */}
        <OnboardingForm invitacion={invitacion} />
      </div>
    </div>
  )
}