// src/lib/types/enums.ts
// ====== TIPOS ENUM DE SUPABASE ======
// Basados en /mnt/project/enums_definidos.sql

export type RolUsuario = 'admin' | 'coach' | 'staff' | 'cliente'

export type TipoDisciplina = 'cycling' | 'funcional' | 'ambos'

export type EstadoClase = 'programada' | 'en_curso' | 'completada' | 'cancelada'

export type EstadoReserva = 'confirmada' | 'cancelada' | 'completada' | 'no_show'

export type EstadoPersonal = 'pendiente' | 'aprobado' | 'rechazado'

export type EstadoDocumento = 'pendiente' | 'aprobado' | 'rechazado'

export type EstadoEspacio = 'disponible' | 'ocupado' | 'mantenimiento'

export type MetodoPago = 'mercado_pago' | 'efectivo' | 'transferencia' | 'terminal' | 'cortesia'

export type MercadoPagoStatus = 
  | 'pending' 
  | 'approved' 
  | 'authorized' 
  | 'in_process' 
  | 'in_mediation' 
  | 'rejected' 
  | 'cancelled' 
  | 'refunded' 
  | 'charged_back'

  export type TipoDocumento = 
  | 'ine' 
  | 'comprobante_domicilio' 
  | 'contrato' 
  | 'rfc' 
  | 'curp' 
  | 'certificacion' 
  | 'otro'
  | 'certificado_estudios'
  | 'certificaciones_fitness'
  | 'antecedentes_penales'
  | 'foto_profesional'

export type TipoPenalizacion = 'no_show' | 'cancelacion_tardia'

export type TipoTransaccion = 'compra' | 'uso' | 'devolucion' | 'expiracion' | 'bonificacion'

// ====== INTERFACES PRINCIPALES ======

export interface Profile {
  id: string
  email: string
  nombre_completo: string
  telefono: string | null
  foto_url: string | null
  genero: string | null
  fecha_nacimiento: string | null
  rol: RolUsuario
  activo: boolean
  onboarding_completo: boolean
  terminos_aceptados_at: string | null
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  disciplina_preferida: TipoDisciplina
  creditos_disponibles: number
  creditos_congelados: boolean
  fecha_inicio_congelamiento: string | null
  fecha_fin_congelamiento: string | null
  fecha_expiracion_creditos: string | null
  notificaciones_email: boolean
  notificaciones_push: boolean
  notificaciones_telegram: boolean
  telegram_chat_id: string | null
  horario_preferido: string | null
  nivel_lealtad: string
  puntos_lealtad: number
  total_clases_asistidas: number
  total_no_shows: number
  racha_asistencia: number
  referido_por: string | null
  codigo_referido: string | null
  total_referidos: number
  creditos_por_referidos: number
  terminos_firmado_at: string | null
  terminos_firmado_url: string | null
  deslinde_medico_firmado: boolean
  deslinde_medico_at: string | null
  deslinde_medico_url: string | null
  contacto_emergencia_nombre: string | null
  contacto_emergencia_telefono: string | null
  contacto_emergencia_relacion: string | null
  condiciones_medicas: string[] | null
  created_at: string
  updated_at: string
}

// ====== UTILIDADES ======

export const ROLES: Record<RolUsuario, string> = {
  admin: 'Administrador',
  coach: 'Coach',
  staff: 'Staff',
  cliente: 'Cliente',
}

export const DISCIPLINAS: Record<TipoDisciplina, string> = {
  cycling: 'Indoor Cycling',
  funcional: 'Funcional',
  ambos: 'Ambos',
}

export const DASHBOARD_ROUTES: Record<RolUsuario, string> = {
  admin: '/admin',
  coach: '/coach',
  staff: '/staff',
  cliente: '/cliente',
}