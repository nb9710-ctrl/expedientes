import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'gestor' | 'lectura';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  rol: UserRole;
  equipo?: string;
  creadoEl?: Timestamp;
  activo?: boolean;
  deshabilitadoEl?: Timestamp;
  eliminado?: boolean;
  eliminadoEl?: Timestamp;
}

export type Prioridad = 'Alta' | 'Media' | 'Baja';

export interface Expediente {
  id: string;
  radicacionUnica: string;
  radicadoInterno?: string;
  claseId: string;
  estadoId: string;
  origenId: string;
  despachoId: string;
  ubicacionId: string;
  repositorio?: string;
  demandante?: string;
  apoderadoDemandante?: string;
  demandado?: string;
  apoderadoDemandado?: string;
  prioridad: Prioridad;
  responsableUserId: string;
  creadoEl: Timestamp;
  creadoPorId: string;
  modificadoEl: Timestamp;
  modificadoPorId: string;
  // Nombres calculados (no en Firestore)
  creadoPorNombre?: string;
  modificadoPorNombre?: string;
  responsableNombre?: string;
  claseNombre?: string;
  estadoNombre?: string;
  origenNombre?: string;
  despachoNombre?: string;
  ubicacionNombre?: string;
}

export interface Adjunto {
  nombre: string;
  url: string;
  size: number;
  contentType: string;
}

export interface Actuacion {
  id: string;
  expedienteId: string;
  fecha: Timestamp;
  anotacion: string;
  tipo?: string;
  usuarioId: string;
  adjuntos?: Adjunto[];
  creadoEl: Timestamp;
  // Nombres calculados (no en Firestore)
  usuarioNombre?: string;
}

export interface Catalogo {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface ExpedienteFormData {
  radicacionUnica: string;
  radicadoInterno?: string;
  claseId: string;
  estadoId: string;
  origenId: string;
  despachoId: string;
  ubicacionId: string;
  repositorio?: string;
  demandante?: string;
  apoderadoDemandante?: string;
  demandado?: string;
  apoderadoDemandado?: string;
  prioridad: Prioridad;
  responsableUserId: string;
}

export interface ActuacionFormData {
  fecha: Date;
  anotacion: string;
  tipo?: string;
  adjuntos?: File[];
}

export interface ExpedienteFilters {
  estadoId?: string;
  ubicacionId?: string;
  despachoId?: string;
  claseId?: string;
  prioridad?: Prioridad;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface DashboardKPIs {
  totalAbiertos: number;
  totalVencidos: number;
  porEstado: { [key: string]: number };
  porPrioridad: { alta: number; media: number; baja: number };
}

export interface Notificacion {
  id: string;
  userId: string;
  tipo: 'asignacion' | 'escalamiento' | 'actualizacion' | 'vencimiento';
  expedienteId: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creadoEl: Timestamp;
  radicacionUnica?: string;
}
