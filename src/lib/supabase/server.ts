// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

/**
 * Cliente de Supabase para Server Components y Server Actions
 * 
 * IMPORTANTE: Solo usar en:
 * - Server Components (por defecto en App Router)
 * - Server Actions (funciones con 'use server')
 * - Route Handlers (app/api/*)
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Error al setear cookies en Server Component
            // Esto es esperado durante el render inicial
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Error al remover cookies en Server Component
          }
        },
      },
    }
  )
}

/**
 * Obtener sesión del usuario actual
 * 
 * @returns Usuario autenticado o null
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Obtener perfil completo del usuario actual
 * Incluye datos de la tabla profiles
 */
export async function getUserProfile() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export async function hasRole(role: string) {
  const profile = await getUserProfile()
  return profile?.rol === role
}