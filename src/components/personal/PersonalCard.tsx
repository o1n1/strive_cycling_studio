// src/components/personal/PersonalCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { aprobarPersonal, rechazarPersonal, eliminarPersonal } from '@/lib/actions/personal-actions'
import type { TipoPersonal } from '@/lib/types/personal.types'
import type { EstadoPersonal, TipoDisciplina } from '@/lib/types/enums'

interface PersonalCardProps {
  persona: {
    id: string
    tipo: TipoPersonal
    nombre: string
    email: string
    telefono: string | null
    foto_url: string | null
    estado: EstadoPersonal
    activo: boolean
    disciplinas?: TipoDisciplina
    especialidades?: string[]
    es_head_coach?: boolean
    head_coach_de?: TipoDisciplina | null
    permisos?: {
      ventas: boolean
      checkin: boolean
      inventario: boolean
    }
    created_at: string
  }
  onActualizar: () => void
}

export function PersonalCard({ persona, onActualizar }: PersonalCardProps) {
  const [cargando, setCargando] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [accionConfirmacion, setAccionConfirmacion] = useState<'aprobar' | 'rechazar' | 'eliminar' | null>(null)
  const [razonRechazo, setRazonRechazo] = useState('')

  const handleAprobar = async () => {
    setCargando(true)
    const resultado = await aprobarPersonal(persona.id, persona.tipo)
    setCargando(false)
    
    if (resultado.success) {
      onActualizar()
    }
    
    setMostrarConfirmacion(false)
  }

  const handleRechazar = async () => {
    if (!razonRechazo.trim()) {
      alert('Debes proporcionar una razón para el rechazo')
      return
    }

    setCargando(true)
    const resultado = await rechazarPersonal(persona.id, persona.tipo, razonRechazo)
    setCargando(false)
    
    if (resultado.success) {
      onActualizar()
    }
    
    setMostrarConfirmacion(false)
    setRazonRechazo('')
  }

  const handleEliminar = async () => {
    setCargando(true)
    const resultado = await eliminarPersonal(persona.id, persona.tipo)
    setCargando(false)
    
    if (resultado.success) {
      onActualizar()
    }
    
    setMostrarConfirmacion(false)
  }

  const abrirConfirmacion = (accion: 'aprobar' | 'rechazar' | 'eliminar') => {
    setAccionConfirmacion(accion)
    setMostrarConfirmacion(true)
  }

  // Badge de estado
  const estadoBadge = {
    pendiente: {
      texto: 'Pendiente',
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    },
    aprobado: {
      texto: 'Aprobado',
      color: 'bg-green-500/20 text-green-300 border-green-500/30'
    },
    rechazado: {
      texto: 'Rechazado',
      color: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
  }

  const badge = estadoBadge[persona.estado]

  return (
    <>
      <div
        className={`
          bg-white/5 backdrop-blur-xl border border-white/10
          rounded-2xl p-6
          hover:bg-white/10 hover:border-[#E84A27]/50
          transition-all duration-300
          hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(232,74,39,0.2)]
        `}
      >
        {/* Header: Foto, Nombre y Estado */}
        <div className="flex items-start gap-4 mb-4">
          {/* Foto */}
          <div className="relative">
            {persona.foto_url ? (
              <Image
                src={persona.foto_url}
                alt={persona.nombre}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E84A27] to-[#FF6B35] flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20">
                {persona.nombre.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Badge Head Coach */}
            {persona.es_head_coach && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full p-1">
                <span className="text-xs">👑</span>
              </div>
            )}
          </div>

          {/* Nombre, Email y Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white truncate">
                {persona.nombre}
              </h3>
              
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color} whitespace-nowrap`}>
                {badge.texto}
              </span>
            </div>

            <p className="text-sm text-white/60 truncate mb-1">
              {persona.email}
            </p>

            {persona.telefono && (
              <p className="text-xs text-white/50">
                {persona.telefono}
              </p>
            )}
          </div>
        </div>

        {/* Tipo y Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Tipo */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] text-white">
            {persona.tipo === 'coach' ? '🏋️ Coach' : '👔 Staff'}
          </span>

          {/* Disciplinas (solo coaches) */}
          {persona.tipo === 'coach' && persona.disciplinas && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/20">
              {persona.disciplinas === 'cycling' ? '🚴 Cycling' : 
               persona.disciplinas === 'funcional' ? '💪 Funcional' : 
               '🔥 Ambos'}
            </span>
          )}

          {/* Head Coach */}
          {persona.es_head_coach && persona.head_coach_de && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black">
              👑 Head Coach {persona.head_coach_de}
            </span>
          )}

          {/* Activo/Inactivo */}
          {!persona.activo && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/50 border border-white/20">
              Inactivo
            </span>
          )}
        </div>

        {/* Especialidades (solo coaches) */}
        {persona.tipo === 'coach' && persona.especialidades && persona.especialidades.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-white/50 mb-2">Especialidades:</p>
            <div className="flex flex-wrap gap-2">
              {persona.especialidades.slice(0, 3).map((esp, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-lg text-xs bg-white/5 text-white/70 border border-white/10"
                >
                  {esp}
                </span>
              ))}
              {persona.especialidades.length > 3 && (
                <span className="px-2 py-1 rounded-lg text-xs bg-white/5 text-white/70 border border-white/10">
                  +{persona.especialidades.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Permisos (solo staff) */}
        {persona.tipo === 'staff' && persona.permisos && (
          <div className="mb-4">
            <p className="text-xs text-white/50 mb-2">Permisos:</p>
            <div className="flex flex-wrap gap-2">
              {persona.permisos.ventas && (
                <span className="px-2 py-1 rounded-lg text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                  💰 Ventas
                </span>
              )}
              {persona.permisos.checkin && (
                <span className="px-2 py-1 rounded-lg text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ✅ Check-in
                </span>
              )}
              {persona.permisos.inventario && (
                <span className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  📦 Inventario
                </span>
              )}
            </div>
          </div>
        )}

        {/* Fecha de registro */}
        <div className="text-xs text-white/40 mb-4">
          Registrado: {new Date(persona.created_at).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap gap-2">
          {/* Ver Detalle */}
          <Link
            href={`/admin/personal/${persona.id}/revision`}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all duration-200 text-center border border-white/20 hover:border-[#E84A27]/50"
          >
            👁️ Ver Detalle
          </Link>

          {/* Aprobar (solo si está pendiente) */}
          {persona.estado === 'pendiente' && (
            <button
              onClick={() => abrirConfirmacion('aprobar')}
              disabled={cargando}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Aprobar
            </button>
          )}

          {/* Rechazar (solo si está pendiente) */}
          {persona.estado === 'pendiente' && (
            <button
              onClick={() => abrirConfirmacion('rechazar')}
              disabled={cargando}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Rechazar
            </button>
          )}

          {/* Eliminar */}
          <button
            onClick={() => abrirConfirmacion('eliminar')}
            disabled={cargando}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-semibold transition-all duration-200 border border-white/10 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1814] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-[0_8px_32px_rgba(232,74,39,0.3)]">
            <h3 className="text-xl font-bold text-white mb-4">
              {accionConfirmacion === 'aprobar' && '✅ Confirmar Aprobación'}
              {accionConfirmacion === 'rechazar' && '❌ Confirmar Rechazo'}
              {accionConfirmacion === 'eliminar' && '🗑️ Confirmar Eliminación'}
            </h3>

            <p className="text-white/70 mb-4">
              {accionConfirmacion === 'aprobar' && 
                `¿Estás seguro de aprobar a ${persona.nombre}? El personal será activado y podrá comenzar a trabajar.`
              }
              {accionConfirmacion === 'rechazar' && 
                `¿Estás seguro de rechazar a ${persona.nombre}? Debes proporcionar una razón.`
              }
              {accionConfirmacion === 'eliminar' && 
                `¿Estás seguro de eliminar a ${persona.nombre}? Esta acción no se puede deshacer.`
              }
            </p>

            {/* Campo de razón (solo para rechazo) */}
            {accionConfirmacion === 'rechazar' && (
              <textarea
                value={razonRechazo}
                onChange={(e) => setRazonRechazo(e.target.value)}
                placeholder="Razón del rechazo..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#E84A27] focus:outline-none focus:ring-2 focus:ring-[#E84A27]/20 transition-all mb-4"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarConfirmacion(false)
                  setRazonRechazo('')
                  setAccionConfirmacion(null)
                }}
                disabled={cargando}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={() => {
                  if (accionConfirmacion === 'aprobar') handleAprobar()
                  if (accionConfirmacion === 'rechazar') handleRechazar()
                  if (accionConfirmacion === 'eliminar') handleEliminar()
                }}
                disabled={cargando}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50
                  ${accionConfirmacion === 'aprobar' ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' : ''}
                  ${accionConfirmacion === 'rechazar' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' : ''}
                  ${accionConfirmacion === 'eliminar' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' : ''}
                `}
              >
                {cargando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}