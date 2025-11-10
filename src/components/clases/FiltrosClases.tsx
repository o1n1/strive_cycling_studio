'use client'

// src/components/clases/FiltrosClases.tsx
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function FiltrosClases() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filtros, setFiltros] = useState({
    salon: searchParams.get('salon') || '',
    disciplina: searchParams.get('disciplina') || '',
    estado: searchParams.get('estado') || '',
    coach: searchParams.get('coach') || ''
  })

  const aplicarFiltros = () => {
    const params = new URLSearchParams()
    
    if (filtros.salon) params.set('salon', filtros.salon)
    if (filtros.disciplina) params.set('disciplina', filtros.disciplina)
    if (filtros.estado) params.set('estado', filtros.estado)
    if (filtros.coach) params.set('coach', filtros.coach)

    router.push(`/admin/clases?${params.toString()}`)
  }

  const limpiarFiltros = () => {
    setFiltros({
      salon: '',
      disciplina: '',
      estado: '',
      coach: ''
    })
    router.push('/admin/clases')
  }

  const hayFiltrosActivos = Object.values(filtros).some(v => v !== '')

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Filtros</h3>
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="text-sm text-white/60 hover:text-white transition-colors duration-300"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Salón */}
        <div>
          <label className="block text-white/60 text-sm mb-2">
            Salón
          </label>
          <select
            value={filtros.salon}
            onChange={(e) => setFiltros({ ...filtros, salon: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          >
            <option value="">Todos los salones</option>
            <option value="cycling">Salón Cycling</option>
            <option value="funcional">Salón Funcional</option>
          </select>
        </div>

        {/* Disciplina */}
        <div>
          <label className="block text-white/60 text-sm mb-2">
            Disciplina
          </label>
          <select
            value={filtros.disciplina}
            onChange={(e) => setFiltros({ ...filtros, disciplina: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          >
            <option value="">Todas las disciplinas</option>
            <option value="cycling">Cycling</option>
            <option value="funcional">Funcional</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-white/60 text-sm mb-2">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          >
            <option value="">Todos los estados</option>
            <option value="programada">Programadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="completada">Completadas</option>
          </select>
        </div>

        {/* Coach */}
        <div>
          <label className="block text-white/60 text-sm mb-2">
            Coach
          </label>
          <select
            value={filtros.coach}
            onChange={(e) => setFiltros({ ...filtros, coach: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-[#E84A27]/50 focus:outline-none transition-all duration-300"
          >
            <option value="">Todos</option>
            <option value="asignado">Con coach asignado</option>
            <option value="sin_asignar">Sin asignar</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={aplicarFiltros}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#E84A27]/25"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  )
}