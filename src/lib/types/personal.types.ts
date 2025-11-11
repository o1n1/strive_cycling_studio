// src/lib/types/personal.types.ts
// ============== TIPOS PARA MÓDULO DE PERSONAL ==============

import type { TipoDisciplina, EstadoPersonal, EstadoDocumento, TipoDocumento } from './enums'

// ============== INVITACIONES ==============

export type TipoPersonal = 'coach' | 'staff'
export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'expirada'

export interface InvitacionPersonal {
  id: string
  email: string
  rol: TipoPersonal
  disciplinas: TipoDisciplina[] | null
  mensaje_personalizado: string | null
  token: string
  estado: EstadoInvitacion
  invitado_por: string
  expira_at: string
  aceptada_at: string | null
  created_at: string
  updated_at: string
}

export interface DatosInvitacionCoach {
  tipo: 'coach'
  email: string
  nombre_completo: string
  telefono: string
  disciplinas: TipoDisciplina
  especialidades: string[]
  anos_experiencia: number
  pago_por_clase: number
  pago_por_hora: number
  mensaje_invitacion?: string
}

export interface DatosInvitacionStaff {
  tipo: 'staff'
  email: string
  nombre_completo: string
  telefono: string
  horario_entrada: string
  horario_salida: string
  dias_laborales: number[]
  salario_mensual: number
  permisos: PermisosStaff
  mensaje_invitacion?: string
}

export type DatosInvitacion = DatosInvitacionCoach | DatosInvitacionStaff

export interface PermisosStaff {
  ventas: boolean
  checkin: boolean
  inventario: boolean
}

// ============== COACHES ==============

export interface Coach {
  id: string
  
  // Info básica
  disciplinas: TipoDisciplina
  especialidades: string[] | null
  biografia: string | null
  anos_experiencia: number
  
  // Pagos
  pago_por_clase: number
  pago_por_hora: number
  
  // Estado y aprobación
  estado: EstadoPersonal
  activo: boolean
  onboarding_completo: boolean
  documentos_completos: boolean
  aprobado_por: string | null
  aprobado_at: string | null
  notas_rechazo: string | null
  notas_admin: string | null
  
  // Head Coach
  es_head_coach: boolean
  head_coach_de: TipoDisciplina | null
  
  // Disponibilidad
  disponible_para_clases: boolean
  disponibilidad_semanal: DisponibilidadSemanal
  
  // Documentos personales
  curp: string | null
  rfc: string | null
  direccion_completa: string | null
  
  // Cuenta bancaria
  cuenta_bancaria_banco: string | null
  cuenta_bancaria_clabe: string | null
  cuenta_bancaria_beneficiario: string | null
  
  // Contacto emergencia
  contacto_emergencia_nombre: string | null
  contacto_emergencia_telefono: string | null
  contacto_emergencia_relacion: string | null
  
  // Contrato
  contrato_firmado_url: string | null
  contrato_firmado_at: string | null
  
  // Estadísticas
  total_clases_impartidas: number
  calificacion_promedio: number
  
  // Relaciones
  invitacion_id: string | null
  
  // Auditoría
  created_at: string
  updated_at: string
}

export interface DisponibilidadSemanal {
  lunes?: string[]
  martes?: string[]
  miercoles?: string[]
  jueves?: string[]
  viernes?: string[]
  sabado?: string[]
  domingo?: string[]
}

// ============== STAFF ==============

export interface Staff {
  id: string
  
  // Estado y aprobación
  estado: EstadoPersonal
  activo: boolean
  onboarding_completo: boolean
  documentos_completos: boolean
  aprobado_por: string | null
  aprobado_at: string | null
  notas_rechazo: string | null
  notas_admin: string | null
  
  // Horario
  horario_entrada: string | null
  horario_salida: string | null
  dias_laborales: number[] | null
  
  // Pagos
  salario_mensual: number
  
  // Permisos
  permisos: PermisosStaff
  
  // Documentos personales
  curp: string | null
  rfc: string | null
  direccion_completa: string | null
  
  // Cuenta bancaria
  cuenta_bancaria_banco: string | null
  cuenta_bancaria_clabe: string | null
  cuenta_bancaria_beneficiario: string | null
  
  // Contacto emergencia
  contacto_emergencia_nombre: string | null
  contacto_emergencia_telefono: string | null
  contacto_emergencia_relacion: string | null
  
  // Contrato
  contrato_firmado_url: string | null
  contrato_firmado_at: string | null
  
  // Relaciones
  invitacion_id: string | null
  
  // Auditoría
  created_at: string
  updated_at: string
}

// ============== DOCUMENTOS ==============

export interface DocumentoPersonal {
  id: string
  coach_id: string | null
  staff_id: string | null
  tipo_documento: TipoDocumento
  nombre_archivo: string | null
  url_archivo: string | null
  estado: EstadoDocumento
  version: number
  documento_anterior_id: string | null
  comentarios_admin: string | null
  revisado_por: string | null
  revisado_at: string | null
  created_at: string
  updated_at: string
}

export interface DatosSubidaDocumento {
  tipo_documento: TipoDocumento
  archivo: File
}

export interface ResultadoRevisionDocumento {
  documento_id: string
  aprobado: boolean
  comentarios?: string
}

// ============== CALIFICACIONES ADMIN ==============

export interface CalificacionAdminCoach {
  id: string
  coach_id: string
  admin_id: string
  
  // Calificaciones individuales (1-5)
  calificacion_puntualidad: number
  calificacion_profesionalismo: number
  calificacion_energia: number
  calificacion_tecnica: number
  calificacion_liderazgo: number
  
  // Promedio automático
  calificacion_promedio: number
  
  // Información adicional
  comentarios: string | null
  fecha_evaluacion: string
  periodo_evaluacion: string | null
  
  created_at: string
  updated_at: string
}

export interface DatosCalificacionAdmin {
  coach_id: string
  calificacion_puntualidad: number
  calificacion_profesionalismo: number
  calificacion_energia: number
  calificacion_tecnica: number
  calificacion_liderazgo: number
  comentarios?: string
  fecha_evaluacion: string
  periodo_evaluacion?: string
}

// ============== ONBOARDING ==============

export interface DatosOnboardingPaso1 {
  // Info ya viene de la invitación
  token: string
}

export interface DatosOnboardingPaso2 {
  email: string // readonly
  password: string
  confirmar_password: string
}

export interface DatosOnboardingPaso3 {
  nombre_completo: string
  telefono: string
  fecha_nacimiento: string
  direccion_completa: string
  curp: string
  rfc: string
  
  // Cuenta bancaria
  cuenta_bancaria_banco: string
  cuenta_bancaria_clabe: string
  cuenta_bancaria_beneficiario: string
  
  // Contacto emergencia
  contacto_emergencia_nombre: string
  contacto_emergencia_telefono: string
  contacto_emergencia_relacion: string
}

export interface DatosOnboardingPaso4Coach {
  biografia: string
  disciplinas: TipoDisciplina
  especialidades: string[]
  certificaciones: string[]
  anos_experiencia: number
  foto_perfil: File | null
  disponibilidad_semanal: DisponibilidadSemanal
}

export interface DatosOnboardingPaso4Staff {
  foto_perfil: File | null
  horario_entrada: string
  horario_salida: string
  dias_laborales: number[]
}

export interface DatosOnboardingPaso5 {
  documentos: {
    tipo: TipoDocumento
    archivo: File
  }[]
}

export interface DatosOnboardingPaso6 {
  firma_base64: string
  acepta_terminos: boolean
}

// ============== REPORTE DE DESEMPEÑO ==============

export interface MetricasDesempenoCoach {
  // Período
  periodo: {
    inicio: string
    fin: string
  }
  
  // Clases
  total_clases_impartidas: number
  promedio_asistencia: number // % ocupación
  
  // Calificaciones
  calificacion_promedio_clientes: number
  calificacion_promedio_admin: number
  
  // Problemas
  total_no_shows: number
  
  // Solicitudes
  solicitudes_aceptadas: number
  solicitudes_rechazadas: number
  
  // Puntualidad
  llegadas_tarde: number
  llegadas_a_tiempo: number
}

// ============== RESPUESTAS DE SERVER ACTIONS ==============

export interface RespuestaExito<T = unknown> {
  success: true
  data: T
  mensaje?: string
}

export interface RespuestaError {
  success: false
  error: string
}

export type RespuestaAction<T = unknown> = RespuestaExito<T> | RespuestaError