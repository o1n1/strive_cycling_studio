'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardBackground } from '@/components/ui/DashboardBackground'
import { EspaciosGrid } from '@/components/espacios/EspaciosGrid'
import type { EstadoEspacio } from '@/lib/types/enums'
import type { SalonData, EspacioData } from '@/lib/actions/espacios-actions'
import { 
  obtenerSalonPorId, 
  obtenerEspaciosPorSalon,
  crearEspacio
} from '@/lib/actions/espacios-actions'

interface Props {
  params: { id: string }
}

export default function GestionarEspaciosPage({ params }: Props) {
  const [salon, setSalon] = useState<SalonData | null>(null)
  const [espacios, setEspacios] = useState<EspacioData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nuevoEspacio, setNuevoEspacio] = useState({
    numero: 1,
    tipo_equipo: 'bici',
    marca_equipo: '',
    modelo_equipo: '',
    estado: 'disponible' as EstadoEspacio,
    usos_desde_mantenimiento: 0,
    usos_para_mantenimiento: 100
  })

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [resultadoSalon, resultadoEspacios] = await Promise.all([
      obtenerSalonPorId(params.id),
      obtenerEspaciosPorSalon(params.id)
    ])

    if (!resultadoSalon.success || !resultadoSalon.data) {
      setError('Error al cargar salón')
      setLoading(false)
      return
    }

    if (!resultadoEspacios.success) {
      setError('Error al cargar espacios')
      setLoading(false)
      return
    }

    setSalon(resultadoSalon.data)
    setEspacios(resultadoEspacios.data || [])
    
    const maxNumero = Math.max(0, ...(resultadoEspacios.data || []).map(e => e.numero))
    setNuevoEspacio(prev => ({ ...prev, numero: maxNumero + 1 }))
    
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleAgregarEspacio = async () => {
    setProcesando(true)
    setError(null)

    const resultado = await crearEspacio({
      ...nuevoEspacio,
      salon_id: params.id,
      ultimo_mantenimiento: null,
      proximo_mantenimiento: null,
      notas_mantenimiento: null
    })

    if (!resultado.success) {
      setError(resultado.error || 'Error al crear espacio')
      setProcesando(false)
      return
    }

    await cargarDatos()
    setShowModal(false)
    setProcesando(false)
    
    setNuevoEspacio({
      numero: espacios.length + 1,
      tipo_equipo: 'bici',
      marca_equipo: '',
      modelo_equipo: '',
      estado: 'disponible',
      usos_desde_mantenimiento: 0,
      usos_para_mantenimiento: 100
    })
  }

  if (loading) {
    return (
      <DashboardBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </DashboardBackground>
    )
  }

  return (
    <DashboardBackground>
      <div className="min-h-screen">
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
              <Link href="/admin/espacios" className="hover:text-white transition-colors">
                Espacios
              </Link>
              <span>/</span>
              <Link href={`/admin/espacios/${params.id}`} className="hover:text-white transition-colors">
                {salon?.nombre}
              </Link>
              <span>/</span>
              <span className="text-white">Gestionar Espacios</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {salon?.nombre}
                </h1>
                <p className="text-white/60">
                  Gestión de espacios ({espacios.length} / {salon?.capacidad_maxima || 0})
                </p>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                disabled={procesando || espacios.length >= (salon?.capacidad_maxima || 0)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-medium hover:shadow-lg hover:shadow-[#E84A27]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Espacio
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {espacios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <svg className="w-20 h-20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium mb-2">No hay espacios configurados</p>
              <p className="text-sm mb-6">Agrega el primer espacio para comenzar</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-medium"
              >
                Agregar Primer Espacio
              </button>
            </div>
          ) : (
            <EspaciosGrid
              espacios={espacios as (EspacioData & { id: string })[]}
              salonId={params.id}
              onEspaciosChange={cargarDatos}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-[#1A1814] border border-white/10 p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Agregar Nuevo Espacio</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">
                    Número del espacio *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={nuevoEspacio.numero}
                    onChange={(e) => setNuevoEspacio(prev => ({ ...prev, numero: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-[#E84A27] outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80 mb-2 block">
                    Tipo de equipo *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNuevoEspacio(prev => ({ ...prev, tipo_equipo: 'bici' }))}
                      className={`p-4 rounded-lg border transition-all ${
                        nuevoEspacio.tipo_equipo === 'bici'
                          ? 'border-[#E84A27] bg-[#E84A27]/20'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="text-3xl mb-2">🚴</div>
                      <div className="text-white font-medium">Bici</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoEspacio(prev => ({ ...prev, tipo_equipo: 'tapete' }))}
                      className={`p-4 rounded-lg border transition-all ${
                        nuevoEspacio.tipo_equipo === 'tapete'
                          ? 'border-[#E84A27] bg-[#E84A27]/20'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="text-3xl mb-2">🏋️</div>
                      <div className="text-white font-medium">Tapete</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={nuevoEspacio.marca_equipo}
                      onChange={(e) => setNuevoEspacio(prev => ({ ...prev, marca_equipo: e.target.value }))}
                      placeholder="Ej: Schwinn"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={nuevoEspacio.modelo_equipo}
                      onChange={(e) => setNuevoEspacio(prev => ({ ...prev, modelo_equipo: e.target.value }))}
                      placeholder="Ej: IC8"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-[#E84A27] outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={procesando}
                    className="flex-1 px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAgregarEspacio}
                    disabled={procesando}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white font-medium hover:shadow-lg disabled:opacity-50"
                  >
                    {procesando ? 'Agregando...' : 'Agregar Espacio'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardBackground>
  )
}