import { Expediente, Actuacion, User } from '../types';
import { format, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calcularEstadoSLA, calcularEstadoInactividad } from './sla';
import { getUltimaActuacionFecha } from '../api/actuaciones';

// Obtener todos los expedientes
export const getAllExpedientes = async (): Promise<Expediente[]> => {
  const snapshot = await getDocs(collection(db, 'expedientes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expediente[];
};

// Obtener todas las actuaciones
export const getAllActuaciones = async (): Promise<any[]> => {
  const expedientes = await getDocs(collection(db, 'expedientes'));
  const todasActuaciones: any[] = [];
  
  for (const expDoc of expedientes.docs) {
    const actuacionesSnapshot = await getDocs(
      collection(db, 'expedientes', expDoc.id, 'actuaciones')
    );
    actuacionesSnapshot.docs.forEach(actDoc => {
      todasActuaciones.push({
        id: actDoc.id,
        expedienteId: expDoc.id,
        radicacionUnica: expDoc.data().radicacionUnica,
        ...actDoc.data(),
      });
    });
  }
  
  return todasActuaciones;
};

// Obtener todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
};

// 1. REPORTE DE PRODUCTIVIDAD
export const generateProductividadReport = async () => {
  const expedientes = await getAllExpedientes();
  const users = await getAllUsers();
  
  const productividadPorUsuario = users.map(user => {
    const expedientesCreados = expedientes.filter(
      exp => exp.creadoPorId === user.uid
    ).length;
    
    const expedientesResueltos = expedientes.filter(
      exp => exp.responsableUserId === user.uid && 
           exp.estadoNombre?.toLowerCase().includes('resuelto')
    ).length;
    
    const expedientesAsignados = expedientes.filter(
      exp => exp.responsableUserId === user.uid
    ).length;
    
    return {
      'Usuario': user.displayName,
      'Email': user.email,
      'Rol': user.rol,
      'Expedientes Creados': expedientesCreados,
      'Expedientes Asignados': expedientesAsignados,
      'Expedientes Resueltos': expedientesResueltos,
      'Tasa Resolución (%)': expedientesAsignados > 0 
        ? ((expedientesResueltos / expedientesAsignados) * 100).toFixed(1)
        : '0',
    };
  });
  
  return productividadPorUsuario;
};

// 2. REPORTE DE ACTUACIONES
export const generateActuacionesReport = async () => {
  const actuaciones = await getAllActuaciones();
  
  return actuaciones.map(act => ({
    'Expediente': act.radicacionUnica || '-',
    'Fecha': act.fecha ? format(act.fecha.toDate(), 'dd/MM/yyyy HH:mm') : '-',
    'Tipo': act.tipo || '-',
    'Anotación': act.anotacion || '-',
    'Usuario': act.usuarioNombre || '-',
    'Adjuntos': act.adjuntos?.length || 0,
  }));
};

// 3. REPORTE DE ALERTAS Y SLA
export const generateAlertasReport = async () => {
  const expedientes = await getAllExpedientes();
  
  const alertas = await Promise.all(
    expedientes
      .filter(exp => {
        const esAbierto = !exp.estadoNombre?.toLowerCase().includes('cerrado') &&
                         !exp.estadoNombre?.toLowerCase().includes('resuelto') &&
                         !exp.estadoNombre?.toLowerCase().includes('archivado');
        return esAbierto;
      })
      .map(async exp => {
        // Calcular estado SLA por prioridad
        const estadoSLA = calcularEstadoSLA(exp);
        
        // Obtener fecha de última actuación
        const fechaUltimaActuacion = await getUltimaActuacionFecha(exp.id);
        const fechaCreacion = exp.creadoEl?.toDate() || new Date();
        
        // Calcular estado de inactividad
        const estadoInactividad = calcularEstadoInactividad(
          fechaUltimaActuacion,
          fechaCreacion
        );
        
        // Determinar tipo de alerta
        let tipoAlerta = '';
        if (estadoInactividad.estado === 'inactivo_2a') {
          tipoAlerta = '🔴 Inactivo 2 años';
        } else if (estadoInactividad.estado === 'inactivo_6m') {
          tipoAlerta = '🟡 Inactivo 6 meses';
        } else if (estadoSLA.estado === 'vencido') {
          tipoAlerta = '⏰ SLA Vencido';
        } else if (estadoSLA.estado === 'proximo') {
          tipoAlerta = '⚠️ SLA Próximo';
        }
        
        return {
          'Radicación': exp.radicacionUnica,
          'Prioridad': exp.prioridad,
          'Estado': exp.estadoNombre || '-',
          'Tipo Alerta': tipoAlerta,
          'Días desde creación': estadoSLA.diasTranscurridos,
          'Días sin actuación': estadoInactividad.diasSinActuacion,
          'Última actuación': fechaUltimaActuacion 
            ? format(fechaUltimaActuacion, 'dd/MM/yyyy')
            : 'Sin actuaciones',
          'Estado SLA': estadoSLA.mensaje,
          'Estado Inactividad': estadoInactividad.mensaje,
          'Responsable': exp.responsableNombre || '-',
          'Fecha Creación': exp.creadoEl ? format(exp.creadoEl.toDate(), 'dd/MM/yyyy') : '-',
        };
      })
  );
  
  // Filtrar solo expedientes con alertas
  return alertas
    .filter(exp => exp['Tipo Alerta'] !== '')
    .sort((a, b) => {
      // Ordenar por criticidad: 2 años > 6 meses > SLA vencido > SLA próximo
      const orden: { [key: string]: number } = {
        '🔴 Inactivo 2 años': 1,
        '🟡 Inactivo 6 meses': 2,
        '⏰ SLA Vencido': 3,
        '⚠️ SLA Próximo': 4,
      };
      return (orden[a['Tipo Alerta']] || 5) - (orden[b['Tipo Alerta']] || 5);
    });
};

// 4. REPORTE DE GESTIÓN POR USUARIO
export const generateGestionUsuarioReport = async () => {
  const expedientes = await getAllExpedientes();
  const users = await getAllUsers();
  
  return users.map(user => {
    const expedientesAsignados = expedientes.filter(
      exp => exp.responsableUserId === user.uid
    );
    
    const abiertos = expedientesAsignados.filter(
      exp => !exp.estadoNombre?.toLowerCase().includes('cerrado') &&
             !exp.estadoNombre?.toLowerCase().includes('resuelto')
    ).length;
    
    const altaPrioridad = expedientesAsignados.filter(
      exp => exp.prioridad === 'Alta'
    ).length;
    
    return {
      'Usuario': user.displayName,
      'Rol': user.rol,
      'Equipo': user.equipo || '-',
      'Total Asignados': expedientesAsignados.length,
      'Abiertos': abiertos,
      'Alta Prioridad': altaPrioridad,
      'Carga (%)': expedientesAsignados.length > 0 
        ? ((abiertos / expedientesAsignados.length) * 100).toFixed(1)
        : '0',
    };
  });
};

// 5. REPORTE POR PERÍODO
export const generatePeriodoReport = async (inicio: Date, fin: Date) => {
  const expedientes = await getAllExpedientes();
  
  const enPeriodo = expedientes.filter(exp => {
    if (!exp.creadoEl) return false;
    const fecha = exp.creadoEl.toDate();
    return fecha >= inicio && fecha <= fin;
  });
  
  const porEstado: { [key: string]: number } = {};
  const porPrioridad: { [key: string]: number } = {};
  const porDespacho: { [key: string]: number } = {};
  
  enPeriodo.forEach(exp => {
    const estado = exp.estadoNombre || 'Sin estado';
    const prioridad = exp.prioridad || 'Sin prioridad';
    const despacho = exp.despachoNombre || 'Sin despacho';
    
    porEstado[estado] = (porEstado[estado] || 0) + 1;
    porPrioridad[prioridad] = (porPrioridad[prioridad] || 0) + 1;
    porDespacho[despacho] = (porDespacho[despacho] || 0) + 1;
  });
  
  const resultado: any[] = [
    { 'Métrica': 'Total Expedientes', 'Valor': enPeriodo.length, 'Detalle': '-' },
  ];
  
  Object.entries(porEstado).forEach(([estado, cantidad]) => {
    resultado.push({
      'Métrica': 'Por Estado',
      'Valor': cantidad,
      'Detalle': estado,
    });
  });
  
  Object.entries(porPrioridad).forEach(([prioridad, cantidad]) => {
    resultado.push({
      'Métrica': 'Por Prioridad',
      'Valor': cantidad,
      'Detalle': prioridad,
    });
  });
  
  Object.entries(porDespacho).forEach(([despacho, cantidad]) => {
    resultado.push({
      'Métrica': 'Por Despacho',
      'Valor': cantidad,
      'Detalle': despacho,
    });
  });
  
  return resultado;
};

// 6. REPORTE POR DESPACHO/CLASE
export const generateDespachoClaseReport = async () => {
  const expedientes = await getAllExpedientes();
  
  const agrupado: { [key: string]: any } = {};
  
  expedientes.forEach(exp => {
    const despacho = exp.despachoNombre || 'Sin despacho';
    const clase = exp.claseNombre || 'Sin clase';
    const key = `${despacho}|${clase}`;
    
    if (!agrupado[key]) {
      agrupado[key] = {
        'Despacho': despacho,
        'Clase': clase,
        'Total': 0,
        'Abiertos': 0,
        'Alta Prioridad': 0,
      };
    }
    
    agrupado[key]['Total']++;
    
    if (!exp.estadoNombre?.toLowerCase().includes('cerrado') &&
        !exp.estadoNombre?.toLowerCase().includes('resuelto')) {
      agrupado[key]['Abiertos']++;
    }
    
    if (exp.prioridad === 'Alta') {
      agrupado[key]['Alta Prioridad']++;
    }
  });
  
  return Object.values(agrupado);
};

// 7. REPORTE MENSUAL COMPLETO
export const generateReporteMensual = async (mes: Date) => {
  const inicio = startOfMonth(mes);
  const fin = endOfMonth(mes);
  
  return await generatePeriodoReport(inicio, fin);
};

// 8. REPORTE PERSONALIZADO
export const generateReportePersonalizado = async (camposSeleccionados: string[]) => {
  const expedientes = await getAllExpedientes();
  
  const camposDisponibles: { [key: string]: (exp: Expediente) => any } = {
    'radicacionUnica': (exp) => exp.radicacionUnica,
    'radicadoInterno': (exp) => exp.radicadoInterno || '-',
    'clase': (exp) => exp.claseNombre || '-',
    'estado': (exp) => exp.estadoNombre || '-',
    'origen': (exp) => exp.origenNombre || '-',
    'despacho': (exp) => exp.despachoNombre || '-',
    'ubicacion': (exp) => exp.ubicacionNombre || '-',
    'prioridad': (exp) => exp.prioridad,
    'demandante': (exp) => exp.demandante || '-',
    'apoderadoDemandante': (exp) => exp.apoderadoDemandante || '-',
    'demandado': (exp) => exp.demandado || '-',
    'apoderadoDemandado': (exp) => exp.apoderadoDemandado || '-',
    'responsable': (exp) => exp.responsableNombre || '-',
    'fechaCreacion': (exp) => exp.creadoEl ? format(exp.creadoEl.toDate(), 'dd/MM/yyyy') : '-',
    'fechaModificacion': (exp) => exp.modificadoEl ? format(exp.modificadoEl.toDate(), 'dd/MM/yyyy HH:mm') : '-',
    'creadoPor': (exp) => exp.creadoPorNombre || '-',
    'modificadoPor': (exp) => exp.modificadoPorNombre || '-',
  };
  
  const nombresColumnas: { [key: string]: string } = {
    'radicacionUnica': 'Radicación Única',
    'radicadoInterno': 'Radicado Interno',
    'clase': 'Clase',
    'estado': 'Estado',
    'origen': 'Origen',
    'despacho': 'Despacho',
    'ubicacion': 'Ubicación',
    'prioridad': 'Prioridad',
    'demandante': 'Demandante',
    'apoderadoDemandante': 'Apoderado Demandante',
    'demandado': 'Demandado',
    'apoderadoDemandado': 'Apoderado Demandado',
    'responsable': 'Responsable',
    'fechaCreacion': 'Fecha Creación',
    'fechaModificacion': 'Fecha Modificación',
    'creadoPor': 'Creado Por',
    'modificadoPor': 'Modificado Por',
  };
  
  return expedientes.map(exp => {
    const fila: any = {};
    camposSeleccionados.forEach(campo => {
      if (camposDisponibles[campo]) {
        fila[nombresColumnas[campo]] = camposDisponibles[campo](exp);
      }
    });
    return fila;
  });
};
