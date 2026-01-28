import { Expediente } from '../types';
import { format } from 'date-fns';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Obtener las columnas del primer objeto
  const headers = Object.keys(data[0]);
  
  // Crear encabezados CSV
  const csvHeaders = headers.join(',');
  
  // Crear filas CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      
      // Escapar valores que contengan comas, comillas o saltos de línea
      if (value === null || value === undefined) {
        return '';
      }
      
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  // Unir todo
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const prepareExpedientesForCSV = (expedientes: Expediente[]) => {
  return expedientes.map(exp => ({
    'Radicación Única': exp.radicacionUnica,
    'Radicado Interno': exp.radicadoInterno || '',
    'Clase': exp.claseNombre || '',
    'Estado': exp.estadoNombre || '',
    'Origen': exp.origenNombre || '',
    'Despacho': exp.despachoNombre || '',
    'Ubicación': exp.ubicacionNombre || '',
    'Prioridad': exp.prioridad,
    'Demandante': exp.demandante || '',
    'Demandado': exp.demandado || '',
    'Fecha Creación': exp.creadoEl ? format(exp.creadoEl.toDate(), 'dd/MM/yyyy') : '',
    'Responsable': exp.responsableNombre || '',
  }));
};
