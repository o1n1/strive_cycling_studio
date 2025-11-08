// src/app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AE3F21] via-[#9C7A5E] to-[#1A1814]">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              STRIVE
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              Studio de Fitness
            </p>
          </div>

          {/* Descripción */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-12 px-4">
            Bienvenido al sistema de gestión de STRIVE Studio. 
            La plataforma completa para administrar clases, reservas y tu experiencia fitness.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button 
                variant="primary" 
                size="lg"
                className="bg-white text-[#AE3F21] hover:bg-gray-100 w-full sm:w-auto"
              >
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#AE3F21] w-full sm:w-auto"
              >
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Características */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="text-3xl mb-3">🚴</div>
              <h3 className="text-lg font-semibold mb-2">Cycling</h3>
              <p className="text-sm text-white/80">
                Clases de alto rendimiento con los mejores coaches
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="text-lg font-semibold mb-2">Funcional</h3>
              <p className="text-sm text-white/80">
                Entrenamientos completos para todo tu cuerpo
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">Gestión Digital</h3>
              <p className="text-sm text-white/80">
                Reserva, cancela y gestiona tus clases fácilmente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/60 text-sm">
        <p>© {new Date().getFullYear()} STRIVE Studio. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}