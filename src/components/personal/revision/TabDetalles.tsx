// src/components/personal/revision/TabDetalles.tsx
'use client'

import { useState } from 'react'
import type { Coach, Staff } from '@/lib/types/personal.types'
import { designarHeadCoach } from '@/lib/actions/personal-actions'
import { createClient } from '@/lib/supabase/client'

interface TabDetallesProps {
  personal: Coach | Staff
  profile: {
    nombre_completo: string
    email: string
    telefono: string | null
    fecha_nacimiento: string | null
    genero: string | null
  }
  tipoPersonal: 'coach' | 'staff'
  onActualizar: () => void
}

export default function TabDetalles({ personal, profile, tipoPersonal, onActualizar }: TabDetallesProps) {
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [notasAdmin, setNotasAdmin] = useState(personal.notas_admin || '')
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null)

  const esCoach = tipoPersonal === 'coach'
  const coach = esCoach ? (personal as Coach) : null
  const staff = !esCoach ? (personal as Staff) : null

  const handleGuardarNotas = async () => {
    try {
      setGuardando(true)
      setMensaje(null)

      const supabase = createClient()
      const tabla = tipoPersonal === 'coach' ? 'coaches' : 'staff'

      const { error } = await supabase
        .from(tabla)
        .update({ notas_admin: notasAdmin })
        .eq('id', personal.id)

      if (error) {
        setMensaje({ tipo: 'error', texto: 'Error al guardar notas' })
        return
      }

      setMensaje({ tipo: 'success', texto: 'Notas guardadas correctamente' })
      setEditando(false)
      onActualizar()
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setGuardando(false)
    }
  }

  const handleDesignarHeadCoach = async () => {
    if (!coach) return

    const nuevoEstado = !coach.es_head_coach
    let disciplina: 'cycling' | 'funcional' | undefined

    if (nuevoEstado) {
      if (coach.disciplinas === 'cycling') {
        disciplina = 'cycling'
      } else if (coach.disciplinas === 'funcional') {
        disciplina = 'funcional'
      } else {
        const seleccion = window.confirm('¿Head Coach de Cycling (Aceptar) o Funcional (Cancelar)?')
        disciplina = seleccion ? 'cycling' : 'funcional'
      }
    }

    try {
      setGuardando(true)
      const resultado = await designarHeadCoach(personal.id, nuevoEstado, disciplina)

      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: resultado.mensaje || 'Actualizado correctamente' })
        onActualizar()
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error || 'Error al actualizar' })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error inesperado' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de feedback */}
      {mensaje && (
        <div
          className={`
            p-4 rounded-xl border backdrop-blur-xl
            ${mensaje.tipo === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
            }
          `}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Información Personal */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40 mb-1">Nombre completo</p>
            <p className="text-white">{profile.nombre_completo}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Email</p>
            <p className="text-white">{profile.email}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Teléfono</p>
            <p className="text-white">{profile.telefono || 'No proporcionado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Fecha de nacimiento</p>
            <p className="text-white">
              {profile.fecha_nacimiento
                ? new Date(profile.fecha_nacimiento).toLocaleDateString('es-MX')
                : 'No proporcionada'}
            </p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Género</p>
            <p className="text-white capitalize">{profile.genero || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">CURP</p>
            <p className="text-white">{personal.curp || 'No proporcionado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">RFC</p>
            <p className="text-white">{personal.rfc || 'No proporcionado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Dirección</p>
            <p className="text-white">{personal.direccion_completa || 'No proporcionada'}</p>
          </div>
        </div>
      </div>

      {/* Info específica Coach */}
      {esCoach && coach && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Información de Coach</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-white/40 mb-1">Disciplinas</p>
              <p className="text-white capitalize">{coach.disciplinas || 'No especificadas'}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Especialidades</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {coach.especialidades?.map((esp, i) => (
                  <span key={i} className="px-3 py-1 bg-[#E84A27]/20 text-[#FF6B35] rounded-full text-xs">
                    {esp}
                  </span>
                )) || <span className="text-white/60">No especificadas</span>}
              </div>
            </div>
            <div>
              <p className="text-white/40 mb-1">Biografía</p>
              <p className="text-white">{coach.biografia || 'No proporcionada'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/40 mb-1">Experiencia</p>
                <p className="text-white">{coach.anos_experiencia || 0} años</p>
              </div>
              <div>
                <p className="text-white/40 mb-1">Pago por Clase</p>
                <p className="text-white">${coach.pago_por_clase || 0}</p>
              </div>
              <div>
                <p className="text-white/40 mb-1">Pago por Hora</p>
                <p className="text-white">${coach.pago_por_hora || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 mb-1">Clases Impartidas</p>
                <p className="text-white">{coach.total_clases_impartidas || 0}</p>
              </div>
              <div>
                <p className="text-white/40 mb-1">Calificación Promedio</p>
                <div className="flex items-center gap-2">
                  <span className="text-white">{coach.calificacion_promedio || 5.0}</span>
                  <span className="text-yellow-400">⭐</span>
                </div>
              </div>
            </div>
            
            {/* Head Coach */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 mb-1">Head Coach</p>
                  <p className="text-white">
                    {coach.es_head_coach
                      ? `Sí - ${coach.head_coach_de || 'Sin disciplina'}`
                      : 'No'}
                  </p>
                </div>
                <button
                  onClick={handleDesignarHeadCoach}
                  disabled={guardando}
                  className="px-4 py-2 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all duration-300 disabled:opacity-50"
                >
                  {coach.es_head_coach ? 'Remover Head Coach' : 'Designar Head Coach'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info específica Staff */}
      {!esCoach && staff && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Información de Staff</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/40 mb-1">Horario de Entrada</p>
              <p className="text-white">{staff.horario_entrada || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Horario de Salida</p>
              <p className="text-white">{staff.horario_salida || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Salario Mensual</p>
              <p className="text-white">${staff.salario_mensual || 0}</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Días Laborales</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(staff.dias_laborales || []).map((dia: number) => (
                  <span key={dia} className="px-2 py-1 bg-[#E84A27]/20 text-[#FF6B35] rounded-lg text-xs">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dia]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cuenta Bancaria */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cuenta Bancaria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/40 mb-1">Banco</p>
            <p className="text-white">{personal.cuenta_bancaria_banco || 'No proporcionado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">CLABE</p>
            <p className="text-white">{personal.cuenta_bancaria_clabe || 'No proporcionada'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Beneficiario</p>
            <p className="text-white">{personal.cuenta_bancaria_beneficiario || 'No proporcionado'}</p>
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contacto de Emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-white/40 mb-1">Nombre</p>
            <p className="text-white">{personal.contacto_emergencia_nombre || 'No proporcionado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Teléfono</p>
            <p className="text-white">{personal.contacto_emergencia_telefono || 'No proporcionado'}</p>
          </div>
          <div>
            <p className="text-white/40 mb-1">Relación</p>
            <p className="text-white">{personal.contacto_emergencia_relacion || 'No proporcionada'}</p>
          </div>
        </div>
      </div>

      {/* Notas de Admin */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Notas Administrativas</h3>
          {!editando ? (
            <button
              onClick={() => setEditando(true)}
              className="px-4 py-2 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              ✏️ Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditando(false)
                  setNotasAdmin(personal.notas_admin || '')
                }}
                disabled={guardando}
                className="px-4 py-2 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarNotas}
                disabled={guardando}
                className="px-4 py-2 bg-gradient-to-r from-[#E84A27] to-[#FF6B35] text-white rounded-xl hover:shadow-lg hover:shadow-[#E84A27]/20 transition-all duration-300 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>
        
        {editando ? (
          <textarea
            value={notasAdmin}
            onChange={(e) => setNotasAdmin(e.target.value)}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#E84A27]/50 resize-none"
            placeholder="Agregar notas administrativas sobre este personal..."
          />
        ) : (
          <p className="text-white/60">
            {personal.notas_admin || 'Sin notas administrativas'}
          </p>
        )}
      </div>

      {/* Estados del Sistema */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Estados del Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${personal.activo ? 'bg-green-400' : 'bg-red-400'}`} />
            <div>
              <p className="text-white/40 text-xs">Activo</p>
              <p className="text-white text-sm">{personal.activo ? 'Sí' : 'No'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${personal.onboarding_completo ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <div>
              <p className="text-white/40 text-xs">Onboarding</p>
              <p className="text-white text-sm">{personal.onboarding_completo ? 'Completo' : 'Pendiente'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${personal.documentos_completos ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <div>
              <p className="text-white/40 text-xs">Documentos</p>
              <p className="text-white text-sm">{personal.documentos_completos ? 'Completos' : 'Pendientes'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${personal.contrato_firmado_at ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <div>
              <p className="text-white/40 text-xs">Contrato</p>
              <p className="text-white text-sm">{personal.contrato_firmado_at ? 'Firmado' : 'Pendiente'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}