// src/components/notificaciones/NotificationCenter.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { marcarComoLeida, marcarTodasComoLeidas, eliminarNotificacion } from '@/lib/actions/notificaciones-actions'

export default function NotificationCenter() {
  const router = useRouter()
  const { notificaciones, noLeidas, cargando, recargar } = useNotificaciones()
  const [mostrar, setMostrar] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        botonRef.current &&
        !botonRef.current.contains(event.target as Node)
      ) {
        setMostrar(false)
      }
    }

    if (mostrar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mostrar])

  const handleMarcarLeida = async (id: string) => {
    await marcarComoLeida(id)
    await recargar()
  }

  const handleMarcarTodasLeidas = async () => {
    setProcesando(true)
    await marcarTodasComoLeidas()
    await recargar()
    setProcesando(false)
  }

  const handleEliminar = async (id: string) => {
    await eliminarNotificacion(id)
    await recargar()
  }

  const handleClickNotificacion = async (notificacion: typeof notificaciones[0]) => {
    if (!notificacion.leida) {
      await handleMarcarLeida(notificacion.id)
    }
    if (notificacion.url_accion) {
      router.push(notificacion.url_accion)
    }
    setMostrar(false)
  }

  const getIconoDefault = (tipo: string) => {
    const iconos: Record<string, string> = {
      aprobacion_personal: '🎉',
      rechazo_personal: '❌',
      documento_rechazado: '📄',
      nueva_calificacion_admin: '⭐',
      solicitud_clase: '📅',
      clase_asignada: '✅',
      clase_rechazada: '❌',
      reserva_confirmada: '✅',
      reserva_cancelada: '❌',
      paquete_comprado: '💳',
      paquete_por_vencer: '⏰',
      recordatorio_clase: '🔔'
    }
    return iconos[tipo] || '🔔'
  }

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date()
    const fechaNotif = new Date(fecha)
    const diff = ahora.getTime() - fechaNotif.getTime()
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return 'Ahora'
    if (minutos < 60) return `Hace ${minutos}m`
    if (horas < 24) return `Hace ${horas}h`
    if (dias < 7) return `Hace ${dias}d`
    return fechaNotif.toLocaleDateString('es-MX')
  }

  return (
    <div className="relative">
      {/* Botón campana */}
      <button
        ref={botonRef}
        onClick={() => setMostrar(!mostrar)}
        className="relative p-2.5 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
        aria-label="Notificaciones"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge contador */}
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-[#E84A27] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel notificaciones */}
      {mostrar && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-96 max-h-[600px] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Notificaciones</h3>
              {notificaciones.length > 0 && (
                <button
                  onClick={handleMarcarTodasLeidas}
                  disabled={procesando || noLeidas === 0}
                  className="text-xs text-[#E84A27] hover:text-[#FF6B35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Marcar todas
                </button>
              )}
            </div>
            <p className="text-sm text-white/40">
              {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
            </p>
          </div>

          {/* Lista notificaciones */}
          <div className="max-h-[500px] overflow-y-auto">
            {cargando ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-[#E84A27] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-white/40 text-sm">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-white/60 font-medium mb-1">Sin notificaciones</p>
                <p className="text-white/40 text-sm">Te notificaremos aquí</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`
                    border-b border-white/5 p-4 transition-all duration-200 cursor-pointer
                    ${!notif.leida ? 'bg-white/5' : 'hover:bg-white/5'}
                  `}
                  onClick={() => handleClickNotificacion(notif)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#E84A27] to-[#FF6B35] flex items-center justify-center text-lg">
                      {notif.icono || getIconoDefault(notif.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white line-clamp-1">
                          {notif.titulo}
                        </h4>
                        {!notif.leida && (
                          <div className="flex-shrink-0 w-2 h-2 bg-[#E84A27] rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-white/60 mt-1 line-clamp-2">
                        {notif.mensaje}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/40">
                          {formatearTiempo(notif.created_at)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEliminar(notif.id)
                          }}
                          className="text-xs text-white/40 hover:text-red-400 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}