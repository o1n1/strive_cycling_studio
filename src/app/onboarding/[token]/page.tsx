// src/app/onboarding/[token]/page.tsx

import { notFound, redirect } from 'next/navigation'
import { obtenerInvitacionPorToken } from '@/lib/actions/personal-actions'
import { OnboardingForm } from './OnboardingForm'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function OnboardingPage({ params }: PageProps) {
  const { token } = await params

  // Validar token y obtener invitación
  const resultado = await obtenerInvitacionPorToken(token)

  if (!resultado.success || !resultado.data) {
    notFound()
  }

  const invitacion = resultado.data

  // Si ya fue aceptada, redirigir
  if (invitacion.estado === 'aceptada') {
    redirect('/login')
  }

  return <OnboardingForm invitacion={invitacion} />
}