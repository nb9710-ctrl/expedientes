import { z } from 'zod';
import { Prioridad } from '../types';

// Regex para radicación única (ejemplo: 11001-31-03-001-2024-00001-00)
export const RADICACION_REGEX = /^\d{5}-\d{2}-\d{2}-\d{3}-\d{4}-\d{5}-\d{2}$/;

export const expedienteSchema = z.object({
  radicacionUnica: z
    .string()
    .min(1, 'La radicación única es obligatoria')
    .regex(RADICACION_REGEX, 'Formato de radicación inválido (ej: 11001-31-03-001-2024-00001-00)'),
  radicadoInterno: z.string().optional(),
  claseId: z.string().min(1, 'La clase es obligatoria'),
  estadoId: z.string().min(1, 'El estado es obligatorio'),
  origenId: z.string().min(1, 'El origen es obligatorio'),
  despachoId: z.string().min(1, 'El despacho es obligatorio'),
  ubicacionId: z.string().min(1, 'La ubicación es obligatoria'),
  repositorio: z.string().url('URL inválida').optional().or(z.literal('')),
  demandante: z.string().optional(),
  apoderadoDemandante: z.string().optional(),
  demandado: z.string().optional(),
  apoderadoDemandado: z.string().optional(),
  prioridad: z.enum(['Alta', 'Media', 'Baja'] as const),
  responsableUserId: z.string().min(1, 'El responsable es obligatorio'),
});

export type ExpedienteSchemaType = z.infer<typeof expedienteSchema>;

export const actuacionSchema = z.object({
  fecha: z.date({
    required_error: 'La fecha es obligatoria',
    invalid_type_error: 'Fecha inválida',
  }),
  anotacion: z
    .string()
    .min(4, 'La anotación debe tener al menos 4 caracteres')
    .max(2000, 'La anotación no puede exceder 2000 caracteres'),
  tipo: z.string().optional(),
  adjuntos: z.array(z.instanceof(File)).optional(),
});

export type ActuacionSchemaType = z.infer<typeof actuacionSchema>;

export const catalogoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  activo: z.boolean(),
});

export type CatalogoSchemaType = z.infer<typeof catalogoSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  displayName: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  rol: z.enum(['admin', 'gestor', 'lectura'] as const),
  equipo: z.string().optional(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
