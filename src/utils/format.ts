import { format, formatDistance, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { Prioridad } from '../types';

export const formatDate = (date: Date | Timestamp | string): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatDateTime = (date: Date | Timestamp | string): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const formatRelativeTime = (date: Date | Timestamp | string): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

export const getPrioridadColor = (prioridad: Prioridad): string => {
  const colors = {
    Alta: 'bg-red-100 text-red-800',
    Media: 'bg-yellow-100 text-yellow-800',
    Baja: 'bg-green-100 text-green-800',
  };
  return colors[prioridad] || 'bg-gray-100 text-gray-800';
};

export const getPrioridadLabel = (prioridad: Prioridad): string => {
  const labels = {
    Alta: 'Alta',
    Media: 'Media',
    Baja: 'Baja',
  };
  return labels[prioridad] || prioridad;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
