// src/app/(dashboard)/admin/personal/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { obtenerTodoPersonal } from '@/lib/actions/personal-actions'
import { EstadisticasPersonal } from '@/components/personal/EstadisticasPersonal'
import { FiltrosPersonal } from '@/components/personal/FiltrosPersonal'
import { PersonalCard } from '@/components/personal/PersonalCard'
import type { TipoPersonal } from '@/lib/types/personal.types'
import type { EstadoPersonal, TipoDisciplina } from '@/lib/types/enums'

interface PersonalItem {
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

export default function PersonalPage() {
  const [personal, setPersonal] = useState<PersonalItem[]>([])
  const [personalFiltrado, setPersonalFiltrado] = useState<PersonalItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState<{
    tipo?: TipoPersonal
    estado?: EstadoPersonal
    busqueda?: string
  }>({})

  // Cargar personal
  useEffect(() => {
    cargarPersonal()
  }, [])

  const aplicarFiltros = useCallback(() => {
    let resultado = [...personal]

    // Filtro por tipo
    if (filtros.tipo) {
      resultado = resultado.filter((p) => p.tipo === filtros.tipo)
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter((p) => p.estado === filtros.estado)
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busquedaLower = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busquedaLower) ||
          p.email.toLowerCase().includes(busquedaLower)
      )
    }

    setPersonalFiltrado(resultado)
  }, [filtros, personal])

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros()
  }, [aplicarFiltros])

  const cargarPersonal = async () => {
    setCargando(true)
    const resultado = await obtenerTodoPersonal()
    if (resultado.success && resultado.data) {
      setPersonal(resultado.data)
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0E0D] to-[#1A1814] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">
              Gestión de Personal
            </h1>

            <Link
              href="/admin/personal/invitar"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#E84A27] text-white font-semibold transition-all duration-300 shadow-[0_4px_16px_rgba(232,74,39,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,53,0.4)] hover:scale-105"
            >
              ➕ Invitar Personal
            </Link>
          </div>
          
          <p className="text-white/60">
            Administra coaches y staff de Strive Studio
          </p>
        </div>

        {/* Estadísticas */}
        <EstadisticasPersonal />

        {/* Filtros */}
        <FiltrosPersonal filtros={filtros} onCambiarFiltros={setFiltros} />

        {/* Lista de Personal */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : personalFiltrado.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">
              No se encontró personal
            </h3>
            <p className="text-white/60 mb-6">
              {personal.length === 0
                ? 'Aún no has invitado a ningún miembro del personal.'
                : 'No hay resultados con los filtros seleccionados.'}
            </p>
            {personal.length === 0 ? (
              <Link
                href="/admin/personal/invitar"
                className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#E84A27] text-white font-semibold transition-all duration-300"
              >
                ➕ Invitar Primer Miembro
              </Link>
            ) : (
              <button
                onClick={() => setFiltros({})}
                className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contador de resultados */}
            <div className="mb-4 text-white/60">
              Mostrando {personalFiltrado.length} de {personal.length}{' '}
              {personal.length === 1 ? 'persona' : 'personas'}
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalFiltrado.map((persona) => (
                <PersonalCard
                  key={persona.id}
                  persona={persona}
                  onActualizar={cargarPersonal}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}