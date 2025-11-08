// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

/**
 * Validar variables de entorno antes de crear cliente
 */
function validateEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '❌ Faltan variables de Supabase en .env.local:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return { url, key }
}

/**
 * Cliente de Supabase para componentes del lado del cliente (Client Components)
 * 
 * IMPORTANTE: Solo usar en componentes marcados con 'use client'
 * Para Server Components, usar createServerClient de server.ts
 * 
 * ⚠️ Llamar en cada componente - NO usar instancia global
 */
export function createClient() {
  const { url, key } = validateEnv()
  return createBrowserClient<Database>(url, key)
}

// ❌ REMOVIDO POR SEGURIDAD - No usar instancia global compartida
// Cada componente debe llamar createClient() para evitar mezcla de sesiones