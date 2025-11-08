// src/app/(dashboard)/staff/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function StaffDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1814] mb-2">
          Dashboard de Staff
        </h1>
        <p className="text-gray-600">
          Herramientas para operaciones diarias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Check-in de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="primary" size="lg" className="w-full mb-4">
              Iniciar Check-in
            </Button>
            <div className="text-sm text-gray-600 space-y-2">
              <p>✅ Escanear código QR</p>
              <p>✅ Buscar por nombre o teléfono</p>
              <p>✅ Ver reservas del día</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas de Paquetes</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="lg" className="w-full mb-4">
              Vender Paquete
            </Button>
            <div className="text-sm text-gray-600 space-y-2">
              <p>💳 Procesar pagos</p>
              <p>🎁 Aplicar descuentos</p>
              <p>📊 Ver ventas del día</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clases de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-[#1A1814]">Cycling - Salón A</p>
                  <p className="text-sm text-gray-600">07:00 - 07:50</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  En curso
                </span>
              </div>
              <p className="text-sm text-gray-600">Coach: María González</p>
              <p className="text-sm text-gray-600">Reservas: 18/20</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-[#1A1814]">Funcional - Salón B</p>
                  <p className="text-sm text-gray-600">09:00 - 09:50</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Próxima
                </span>
              </div>
              <p className="text-sm text-gray-600">Coach: Carlos Ruiz</p>
              <p className="text-sm text-gray-600">Reservas: 12/15</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}