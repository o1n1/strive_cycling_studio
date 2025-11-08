// src/app/(dashboard)/admin/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1814] mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600">
          Bienvenido al panel de administración de STRIVE Studio
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clientes Activos</p>
                <p className="text-3xl font-bold text-[#AE3F21]">245</p>
                <p className="text-xs text-green-600 mt-1">+12% este mes</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clases Hoy</p>
                <p className="text-3xl font-bold text-[#AE3F21]">12</p>
                <p className="text-xs text-gray-500 mt-1">8 de cycling, 4 funcional</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ocupación Promedio</p>
                <p className="text-3xl font-bold text-[#AE3F21]">87%</p>
                <p className="text-xs text-green-600 mt-1">+5% vs semana anterior</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-[#AE3F21]">$158K</p>
                <p className="text-xs text-green-600 mt-1">+18% vs mes anterior</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Tareas administrativas frecuentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-[#AE3F21] text-white rounded-lg hover:bg-[#8f3319] transition-colors">
                <div className="flex items-center justify-between">
                  <span>📅 Crear Nueva Clase</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              
              <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span>👥 Gestionar Personal</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span>🏢 Administrar Espacios</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span>📈 Ver Reportes</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones Pendientes</CardTitle>
            <CardDescription>Requieren tu atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    3 solicitudes de clase pendientes
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Coaches esperando aprobación
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-xl">📄</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    2 documentos por revisar
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Certificaciones de nuevos coaches
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="text-xl">💳</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    15 pagos recibidos hoy
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Todos los pagos procesados correctamente
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nota informativa */}
      <div className="mt-8">
        <Card padding="lg" shadow="sm">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="font-semibold text-[#1A1814] mb-2">
                Sistema en Desarrollo - FASE 0.1 Completada
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Has completado exitosamente la configuración inicial del proyecto. 
                Los módulos adicionales se irán habilitando en las siguientes fases del roadmap.
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✅ Autenticación y roles configurados</p>
                <p>✅ Base de datos Supabase conectada</p>
                <p>✅ Middleware de protección de rutas activo</p>
                <p>🔄 Siguiente: FASE 0.2 - Sistema de diseño y componentes UI</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}