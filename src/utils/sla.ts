import { Expediente, Prioridad } from '../types';
import { differenceInDays, differenceInMonths } from 'date-fns';

// Configuración SLA por prioridad (días para resolución)
export const SLA_CONFIG = {
  Alta: {
    tiempoResolucion: 30, // días
    alertaProxima: 25,    // días (alerta antes de vencer)
    color: 'red'
  },
  Media: {
    tiempoResolucion: 60,
    alertaProxima: 50,
    color: 'yellow'
  },
  Baja: {
    tiempoResolucion: 90,
    alertaProxima: 75,
    color: 'green'
  }
};

// Configuración de alertas por inactividad
export const INACTIVIDAD_CONFIG = {
  ALERTA_6_MESES: 180,  // días (6 meses)
  ALERTA_2_AÑOS: 730,   // días (2 años)
};

export type EstadoSLA = 'normal' | 'proximo' | 'vencido';
export type EstadoInactividad = 'activo' | 'inactivo_6m' | 'inactivo_2a';

// Calcular estado SLA basado en prioridad y fecha de creación
export const calcularEstadoSLA = (expediente: Expediente): {
  estado: EstadoSLA;
  diasTranscurridos: number;
  diasLimite: number;
  mensaje: string;
} => {
  if (!expediente.creadoEl) {
    return {
      estado: 'normal',
      diasTranscurridos: 0,
      diasLimite: 0,
      mensaje: 'Sin fecha de creación'
    };
  }

  const fechaCreacion = expediente.creadoEl.toDate();
  const hoy = new Date();
  const diasTranscurridos = differenceInDays(hoy, fechaCreacion);
  
  const config = SLA_CONFIG[expediente.prioridad as Prioridad];
  const diasLimite = config.tiempoResolucion;
  const diasAlerta = config.alertaProxima;

  let estado: EstadoSLA = 'normal';
  let mensaje = 'Dentro del tiempo';

  if (diasTranscurridos >= diasLimite) {
    estado = 'vencido';
    mensaje = `Vencido (${diasTranscurridos - diasLimite} días)`;
  } else if (diasTranscurridos >= diasAlerta) {
    estado = 'proximo';
    mensaje = `Próximo a vencer (${diasLimite - diasTranscurridos} días)`;
  }

  return {
    estado,
    diasTranscurridos,
    diasLimite,
    mensaje
  };
};

// Calcular estado de inactividad basado en última actuación
export const calcularEstadoInactividad = (
  fechaUltimaActuacion: Date | null,
  fechaCreacion: Date
): {
  estado: EstadoInactividad;
  diasSinActuacion: number;
  mesesSinActuacion: number;
  mensaje: string;
} => {
  const hoy = new Date();
  const fechaReferencia = fechaUltimaActuacion || fechaCreacion;
  
  const diasSinActuacion = differenceInDays(hoy, fechaReferencia);
  const mesesSinActuacion = differenceInMonths(hoy, fechaReferencia);

  let estado: EstadoInactividad = 'activo';
  let mensaje = 'Expediente activo';

  if (diasSinActuacion >= INACTIVIDAD_CONFIG.ALERTA_2_AÑOS) {
    estado = 'inactivo_2a';
    mensaje = `Sin actuaciones por ${Math.floor(diasSinActuacion / 365)} años`;
  } else if (diasSinActuacion >= INACTIVIDAD_CONFIG.ALERTA_6_MESES) {
    estado = 'inactivo_6m';
    mensaje = `Sin actuaciones por ${mesesSinActuacion} meses`;
  } else if (diasSinActuacion > 0) {
    mensaje = `Última actuación hace ${diasSinActuacion} días`;
  } else {
    mensaje = 'Sin actuaciones';
  }

  return {
    estado,
    diasSinActuacion,
    mesesSinActuacion,
    mensaje
  };
};

// Obtener color según estado SLA
export const getColorEstadoSLA = (estado: EstadoSLA): string => {
  switch (estado) {
    case 'vencido':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'proximo':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-green-100 text-green-800 border-green-300';
  }
};

// Obtener color según estado de inactividad
export const getColorInactividad = (estado: EstadoInactividad): string => {
  switch (estado) {
    case 'inactivo_2a':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'inactivo_6m':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
};

// Obtener ícono según estado de inactividad
export const getIconoInactividad = (estado: EstadoInactividad): string => {
  switch (estado) {
    case 'inactivo_2a':
      return '🔴'; // Crítico
    case 'inactivo_6m':
      return '🟡'; // Advertencia
    default:
      return '🟢'; // Normal
  }
};

// Determinar si un expediente debe mostrarse en alertas
export const requiereAtencion = (
  estadoSLA: EstadoSLA,
  estadoInactividad: EstadoInactividad
): boolean => {
  return (
    estadoSLA === 'vencido' ||
    estadoSLA === 'proximo' ||
    estadoInactividad === 'inactivo_6m' ||
    estadoInactividad === 'inactivo_2a'
  );
};
