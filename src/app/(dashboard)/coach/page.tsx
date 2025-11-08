// src/app/(dashboard)/coach/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export default function CoachDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1814] mb-2">
          Dashboard de Coach
        </h1>
        <p className="text-gray-600">
          Gestiona tus clases y revisa tu desempeño
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Clases Este Mes</p>
              <p className="text-4xl font-bold text-[#AE3F21]">24</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Calificación Promedio</p>
              <p className="text-4xl font-bold text-[#AE3F21]">4.8</p>
              <p className="text-xs text-gray-500 mt-1">⭐⭐⭐⭐⭐</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Próxima Clase</p>
              <p className="text-2xl font-bold text-[#AE3F21]">Hoy</p>
              <p className="text-sm text-gray-500 mt-1">18:00 - Cycling</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades disponibles próximamente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>📅 Ver y gestionar tu calendario de clases</p>
            <p>👥 Ver lista de asistentes a tus clases</p>
            <p>⭐ Revisar calificaciones y comentarios</p>
            <p>📝 Solicitar clases adicionales</p>
            <p>💰 Ver tu historial de pagos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}