// src/lib/types/database.types.ts
// Tipos generados desde la base de datos de Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ====== ENUMS ======

export enum RolUsuario {
  ADMIN = 'admin',
  COACH = 'coach',
  STAFF = 'staff',
  CLIENTE = 'cliente'
}

export enum EstadoClase {
  PROGRAMADA = 'programada',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada'
}

export enum EstadoReserva {
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
  NO_SHOW = 'no_show'
}

export enum EstadoPersonal {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado'
}

export enum EstadoDocumento {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado'
}

export enum EstadoEspacio {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  MANTENIMIENTO = 'mantenimiento'
}

export enum TipoDisciplina {
  CYCLING = 'cycling',
  FUNCIONAL = 'funcional',
  AMBOS = 'ambos'
}

export enum TipoDocumento {
  INE = 'ine',
  COMPROBANTE_DOMICILIO = 'comprobante_domicilio',
  CONTRATO = 'contrato',
  RFC = 'rfc',
  CURP = 'curp',
  CERTIFICACION = 'certificacion',
  OTRO = 'otro'
}

export enum TipoTransaccion {
  COMPRA = 'compra',
  USO = 'uso',
  DEVOLUCION = 'devolucion',
  EXPIRACION = 'expiracion',
  BONIFICACION = 'bonificacion'
}

export enum TipoPenalizacion {
  NO_SHOW = 'no_show',
  CANCELACION_TARDIA = 'cancelacion_tardia'
}

export enum MetodoPago {
  MERCADO_PAGO = 'mercado_pago',
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  TERMINAL = 'terminal',
  CORTESIA = 'cortesia'
}

export enum MercadoPagoStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back'
}

// ====== TABLAS ======

export interface Profile {
  id: string
  email: string
  nombre_completo: string
  telefono: string | null
  foto_url: string | null
  fecha_nacimiento: string | null
  genero: string | null
  rol: RolUsuario
  activo: boolean
  onboarding_completo: boolean
  terminos_aceptados_at: string | null
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string // FK a profiles.id
  creditos_disponibles: number
  fecha_expiracion_creditos: string | null
  creditos_congelados: boolean
  fecha_inicio_congelamiento: string | null
  fecha_fin_congelamiento: string | null
  puntos_lealtad: number
  nivel_lealtad: string
  referido_por: string | null
  total_referidos: number
  creditos_por_referidos: number
  codigo_referido: string | null
  total_clases_asistidas: number
  total_no_shows: number
  racha_asistencia: number
  disciplina_preferida: TipoDisciplina | null
  horario_preferido: string | null
  notificaciones_email: boolean
  notificaciones_push: boolean
  notificaciones_telegram: boolean
  telegram_chat_id: string | null
  deslinde_medico_firmado: boolean
  deslinde_medico_at: string | null
  deslinde_medico_url: string | null
  terminos_firmado_url: string | null
  condiciones_medicas: string[] | null
  contacto_emergencia_nombre: string | null
  contacto_emergencia_telefono: string | null
  contacto_emergencia_relacion: string | null
  created_at: string
  updated_at: string
}

export interface Coach {
  id: string // FK a profiles.id
  disciplinas: TipoDisciplina
  especialidades: string[] | null
  certificaciones: string[] | null
  anos_experiencia: number
  biografia: string | null
  es_head_coach: boolean
  head_coach_de: TipoDisciplina | null
  estado: EstadoPersonal
  activo: boolean
  disponible_para_clases: boolean
  pago_por_clase: number
  pago_por_hora: number
  calificacion_promedio: number
  total_clases_impartidas: number
  documentos_completos: boolean
  contrato_firmado_at: string | null
  contrato_firmado_url: string | null
  cuenta_bancaria_banco: string | null
  cuenta_bancaria_clabe: string | null
  aprobado_por: string | null
  aprobado_at: string | null
  notas_admin: string | null
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string // FK a profiles.id
  estado: EstadoPersonal
  activo: boolean
  horario_entrada: string | null
  horario_salida: string | null
  dias_laborales: number[] | null
  salario_mensual: number
  permisos: {
    ventas: boolean
    checkin: boolean
    inventario: boolean
  }
  documentos_completos: boolean
  contrato_firmado_at: string | null
  contrato_firmado_url: string | null
  cuenta_bancaria_banco: string | null
  cuenta_bancaria_clabe: string | null
  aprobado_por: string | null
  aprobado_at: string | null
  notas_admin: string | null
  created_at: string
  updated_at: string
}

export interface Disciplina {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color_hex: string
  tipo: TipoDisciplina
  duracion_default: number
  activa: boolean
  orden_display: number
  created_at: string
  updated_at: string
}

export interface Especialidad {
  id: string
  disciplina_id: string
  nombre: string
  descripcion: string | null
  nivel: string | null
  activa: boolean
  created_at: string
  updated_at: string
}

export interface Salon {
  id: string
  nombre: string
  descripcion: string | null
  tipo: TipoDisciplina
  capacidad_maxima: number
  activo: boolean
  orden_display: number
  created_at: string
  updated_at: string
}

export interface Espacio {
  id: string
  salon_id: string
  numero: number
  tipo_equipo: string | null
  marca_equipo: string | null
  modelo_equipo: string | null
  estado: EstadoEspacio
  ultimo_mantenimiento: string | null
  proximo_mantenimiento: string | null
  usos_desde_mantenimiento: number
  usos_para_mantenimiento: number
  notas_mantenimiento: string | null
  created_at: string
  updated_at: string
}

export interface Clase {
  id: string
  nombre_clase: string | null
  disciplina_id: string
  especialidad_id: string | null
  coach_id: string | null
  salon_id: string | null
  fecha_hora: string
  duracion: number
  capacidad: number
  reservas_count: number
  estado: EstadoClase
  es_recurrente: boolean
  recurrencia_id: string | null
  descripcion: string | null
  playlist_url: string | null
  notas_coach: string | null
  asignada_por: string | null
  asignada_at: string | null
  created_at: string
  updated_at: string
}

export interface Reserva {
  id: string
  clase_id: string
  cliente_id: string
  espacio_id: string | null
  estado: EstadoReserva
  creditos_usados: number
  check_in_at: string | null
  check_in_por: string | null
  check_out_at: string | null
  cancelada_at: string | null
  cancelada_tardia: boolean
  razon_cancelacion: string | null
  created_at: string
  updated_at: string
}

export interface Asistencia {
  id: string
  reserva_id: string
  check_in_at: string
  check_in_por: string
  check_out_at: string | null
  duracion_minutos: number | null
  created_at: string
}

export interface ListaEspera {
  id: string
  clase_id: string
  cliente_id: string
  posicion: number
  notificado: boolean
  notificado_at: string | null
  expira_at: string | null
  created_at: string
  updated_at: string
}

export interface Calificacion {
  id: string
  clase_id: string
  cliente_id: string
  coach_id: string
  calificacion: number
  comentario: string | null
  anonimo: boolean
  created_at: string
  updated_at: string
}

export interface Paquete {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  color_hex: string
  creditos: number
  precio: number
  precio_original: number | null
  descuento_porcentaje: number
  dias_vigencia: number
  es_promocion: boolean
  destacado: boolean
  solo_nuevos_clientes: boolean
  max_compras_por_cliente: number | null
  activo: boolean
  orden_display: number
  created_at: string
  updated_at: string
}

export interface Compra {
  id: string
  cliente_id: string
  paquete_id: string
  monto_pagado: number
  metodo_pago: MetodoPago
  mp_payment_id: string | null
  mp_status: MercadoPagoStatus | null
  mp_status_detail: string | null
  mp_payment_method_id: string | null
  codigo_descuento: string | null
  descuento_aplicado: number
  creditos_otorgados: number
  fecha_expiracion_creditos: string | null
  procesada: boolean
  procesada_at: string | null
  created_at: string
  updated_at: string
}

export interface Transaccion {
  id: string
  cliente_id: string
  tipo: TipoTransaccion
  creditos: number
  saldo_anterior: number
  saldo_nuevo: number
  descripcion: string | null
  reserva_id: string | null
  compra_id: string | null
  created_at: string
}

export interface Penalizacion {
  id: string
  cliente_id: string
  reserva_id: string | null
  tipo: TipoPenalizacion
  creditos_penalizados: number
  descripcion: string | null
  aplicada_at: string
  activa: boolean
  revertida: boolean
  revertida_at: string | null
  revertida_por: string | null
  razon_reversion: string | null
  created_at: string
}

export interface Notificacion {
  id: string
  destinatario_id: string
  tipo: string | null
  titulo: string | null
  mensaje: string | null
  icono: string | null
  url_accion: string | null
  data: Json
  leida: boolean
  leida_at: string | null
  expira_at: string | null
  created_at: string
}

export interface Sugerencia {
  id: string
  cliente_id: string
  tipo: string | null
  contenido: string | null
  estado: EstadoPersonal
  respondida_por: string | null
  respondida_at: string | null
  respuesta: string | null
  created_at: string
  updated_at: string
}

export interface Referido {
  id: string
  referidor_id: string
  referido_id: string
  codigo_usado: string | null
  estado: string
  creditos_otorgados: number
  fecha_completado: string | null
  created_at: string
  updated_at: string
}

export interface SolicitudClase {
  id: string
  coach_id: string
  clase_id: string
  mensaje: string | null
  estado: EstadoPersonal
  respondida_por: string | null
  respondida_at: string | null
  notas_respuesta: string | null
  created_at: string
  updated_at: string
}

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
  revisado_por: string | null
  revisado_at: string | null
  comentarios_admin: string | null
  created_at: string
  updated_at: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  sku: string | null
  precio: number
  costo: number | null
  stock_actual: number
  stock_minimo: number
  imagen_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface MovimientoInventario {
  id: string
  producto_id: string
  tipo: string | null
  cantidad: number
  precio_unitario: number | null
  realizado_por: string | null
  notas: string | null
  created_at: string
}

export interface PlantillaEmail {
  id: string
  codigo: string | null
  nombre: string | null
  asunto: string | null
  html_template: string | null
  variables_requeridas: string[] | null
  activa: boolean
  created_at: string
  updated_at: string
}

// ====== TIPOS DE BASE DE DATOS ======

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      clientes: {
        Row: Cliente
        Insert: Omit<Cliente, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Cliente, 'id'>>
      }
      coaches: {
        Row: Coach
        Insert: Omit<Coach, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Coach, 'id'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Staff, 'id'>>
      }
      disciplinas: {
        Row: Disciplina
        Insert: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Disciplina, 'id'>>
      }
      especialidades: {
        Row: Especialidad
        Insert: Omit<Especialidad, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Especialidad, 'id'>>
      }
      salones: {
        Row: Salon
        Insert: Omit<Salon, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Salon, 'id'>>
      }
      espacios: {
        Row: Espacio
        Insert: Omit<Espacio, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Espacio, 'id'>>
      }
      clases: {
        Row: Clase
        Insert: Omit<Clase, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Clase, 'id'>>
      }
      reservas: {
        Row: Reserva
        Insert: Omit<Reserva, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Reserva, 'id'>>
      }
      asistencias: {
        Row: Asistencia
        Insert: Omit<Asistencia, 'id' | 'created_at'>
        Update: Partial<Omit<Asistencia, 'id'>>
      }
      lista_espera: {
        Row: ListaEspera
        Insert: Omit<ListaEspera, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ListaEspera, 'id'>>
      }
      calificaciones: {
        Row: Calificacion
        Insert: Omit<Calificacion, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Calificacion, 'id'>>
      }
      paquetes: {
        Row: Paquete
        Insert: Omit<Paquete, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Paquete, 'id'>>
      }
      compras: {
        Row: Compra
        Insert: Omit<Compra, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Compra, 'id'>>
      }
      transacciones: {
        Row: Transaccion
        Insert: Omit<Transaccion, 'id' | 'created_at'>
        Update: Partial<Omit<Transaccion, 'id'>>
      }
      penalizaciones: {
        Row: Penalizacion
        Insert: Omit<Penalizacion, 'id' | 'created_at'>
        Update: Partial<Omit<Penalizacion, 'id'>>
      }
      notificaciones: {
        Row: Notificacion
        Insert: Omit<Notificacion, 'id' | 'created_at'>
        Update: Partial<Omit<Notificacion, 'id'>>
      }
      sugerencias: {
        Row: Sugerencia
        Insert: Omit<Sugerencia, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Sugerencia, 'id'>>
      }
      referidos: {
        Row: Referido
        Insert: Omit<Referido, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Referido, 'id'>>
      }
      solicitudes_clases: {
        Row: SolicitudClase
        Insert: Omit<SolicitudClase, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SolicitudClase, 'id'>>
      }
      documentos_personal: {
        Row: DocumentoPersonal
        Insert: Omit<DocumentoPersonal, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DocumentoPersonal, 'id'>>
      }
      productos: {
        Row: Producto
        Insert: Omit<Producto, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Producto, 'id'>>
      }
      movimientos_inventario: {
        Row: MovimientoInventario
        Insert: Omit<MovimientoInventario, 'id' | 'created_at'>
        Update: Partial<Omit<MovimientoInventario, 'id'>>
      }
      plantillas_email: {
        Row: PlantillaEmail
        Insert: Omit<PlantillaEmail, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PlantillaEmail, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: {
      es_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      es_coach: {
        Args: Record<string, never>
        Returns: boolean
      }
      es_staff: {
        Args: Record<string, never>
        Returns: boolean
      }
      es_cliente: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      rol_usuario: RolUsuario
      estado_clase: EstadoClase
      estado_reserva: EstadoReserva
      estado_personal: EstadoPersonal
      estado_documento: EstadoDocumento
      estado_espacio: EstadoEspacio
      tipo_disciplina: TipoDisciplina
      tipo_documento: TipoDocumento
      tipo_transaccion: TipoTransaccion
      tipo_penalizacion: TipoPenalizacion
      metodo_pago: MetodoPago
      mp_status: MercadoPagoStatus
    }
  }
}