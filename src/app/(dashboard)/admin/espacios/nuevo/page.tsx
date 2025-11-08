import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { SalonForm } from '@/components/espacios/SalonForm'
import Link from 'next/link'

export default function NuevoSalonPage() {
  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/admin/espacios" className="hover:text-white transition-colors">
              Espacios
            </Link>
            <span>/</span>
            <span className="text-white">Nuevo Salón</span>
          </div>

          {/* Card del formulario */}
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Crear Nuevo Salón
              </h1>
              <p className="text-white/60">
                Configura un nuevo salón para tu estudio
              </p>
            </div>

            <SalonForm modo="crear" />
          </div>
        </div>
      </div>
    </DashboardBackground>
  )
}