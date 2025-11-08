// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CRÍTICO: /auth/confirm NO debe consumir el token
  if (pathname.startsWith('/auth/confirm')) {
    return NextResponse.next()
  }

  // Rutas públicas
  const rutasPublicas = [
    '/',
    '/login',
    '/registro',
    '/recuperar-password',
    '/restablecer-password',
    '/verificar-email',
    '/email-confirmado'
  ]

  const esRutaPublica = pathname === '/' || rutasPublicas.slice(1).some(ruta => pathname.startsWith(ruta))

  if (esRutaPublica) {
    return NextResponse.next()
  }

  // Rutas protegidas
  const response = await updateSession(request)

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!user.email_confirmed_at && pathname !== '/verificar-email') {
    return NextResponse.redirect(new URL('/verificar-email', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, activo')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!profile.activo) {
    return NextResponse.redirect(new URL('/cuenta-desactivada', request.url))
  }

  const rutaBase = pathname.split('/')[1]

  if (rutaBase !== profile.rol && ['admin', 'coach', 'staff', 'cliente'].includes(rutaBase)) {
    const dashboardUrl = getDashboardUrlByRole(profile.rol)
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  return response
}

function getDashboardUrlByRole(rol: string): string {
  const dashboards: Record<string, string> = {
    admin: '/admin',
    coach: '/coach',
    staff: '/staff',
    cliente: '/cliente',
  }
  return dashboards[rol] || '/login'
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}