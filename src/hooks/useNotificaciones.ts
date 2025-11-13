// src/hooks/useNotificaciones.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacion } from '@/lib/actions/notificaciones-actions'

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(true)

  const cargarNotificaciones = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('destinatario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setNotificaciones(data as Notificacion[])
      setNoLeidas(data.filter(n => !n.leida).length)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let canal: ReturnType<typeof supabase.channel> | null = null

    const inicializar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await cargarNotificaciones()

        // Suscripción realtime
        canal = supabase
          .channel(`notificaciones-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notificaciones',
              filter: `destinatario_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const nueva = payload.new as Notificacion
                setNotificaciones(prev => [nueva, ...prev])
                setNoLeidas(prev => prev + 1)
              } else if (payload.eventType === 'UPDATE') {
                const actualizada = payload.new as Notificacion
                setNotificaciones(prev =>
                  prev.map(n => n.id === actualizada.id ? actualizada : n)
                )
                if (actualizada.leida) {
                  setNoLeidas(prev => Math.max(0, prev - 1))
                }
              } else if (payload.eventType === 'DELETE') {
                const eliminada = payload.old as Notificacion
                setNotificaciones(prev => prev.filter(n => n.id !== eliminada.id))
                if (!eliminada.leida) {
                  setNoLeidas(prev => Math.max(0, prev - 1))
                }
              }
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Error en useNotificaciones:', error)
      } finally {
        setCargando(false)
      }
    }

    inicializar()

    return () => {
      if (canal) {
        supabase.removeChannel(canal)
      }
    }
  }, [cargarNotificaciones])

  return { notificaciones, noLeidas, cargando, recargar: cargarNotificaciones }
}