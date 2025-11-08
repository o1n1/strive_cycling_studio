// src/app/(dashboard)/cliente/page.tsx
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function ClienteDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1814] mb-2">
          ¡Bienvenido a STRIVE!
        </h1>
        <p className="text-gray-600">
          Tu transformación comienza aquí. Explora nuestras clases y reserva tu lugar.
        </p>
      </div>

      {/* Bienvenida */}
      <Card padding="lg" shadow="md" className="mb-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#AE3F21] to-[#9C7A5E] rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1A1814] mb-3">
            ¡Tu cuenta está lista!
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Has verificado tu email exitosamente. Ahora puedes empezar a disfrutar de todas las funcionalidades de STRIVE.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE3F21]/10 text-[#AE3F21] rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">
              El módulo de reservas estará disponible próximamente
            </span>
          </div>
        </div>
      </Card>

      {/* Próximas funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg" shadow="sm">
          <CardHeader>
            <div className="w-12 h-12 bg-[#AE3F21]/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#AE3F21]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1814]">
              Reservar Clases
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Explora nuestro calendario y reserva tus clases favoritas de cycling y funcional.
            </p>
          </CardContent>
        </Card>

        <Card padding="lg" shadow="sm">
          <CardHeader>
            <div className="w-12 h-12 bg-[#9C7A5E]/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#9C7A5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1814]">
              Mi Perfil
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Gestiona tu información personal, preferencias y configuración de cuenta.
            </p>
          </CardContent>
        </Card>

        <Card padding="lg" shadow="sm">
          <CardHeader>
            <div className="w-12 h-12 bg-[#B39A72]/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#B39A72]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1A1814]">
              Mis Créditos
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Consulta tu saldo de créditos, historial de compras y paquetes disponibles.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información de desarrollo */}
      <Card padding="lg" shadow="sm" className="mt-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🚧</div>
          <div>
            <h3 className="font-semibold text-[#1A1814] mb-2">
              Desarrollo en Progreso - FASE 1 Completada
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Has completado exitosamente el registro y verificación de email. 
              Los módulos de reservas, paquetes y más funcionalidades se habilitarán en las siguientes fases.
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>✅ Registro y autenticación completos</p>
              <p>✅ Verificación de email activa</p>
              <p>✅ Perfil de cliente creado</p>
              <p>🔄 Siguiente: FASE 6 - Sistema de Reservas</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}