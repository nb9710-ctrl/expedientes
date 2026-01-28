import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  DocumentSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Expediente, ExpedienteFormData, ExpedienteFilters } from '../types';
import { getPrefijoByOrigenNombre } from '../config/radicados';
import { crearNotificacionAsignacion } from './notificaciones';

/**
 * Genera el próximo número de radicación consecutivo de manera segura para concurrencia
 * Formato: 11001-31-03-001-YYYY-NNNNN-00
 * El componente NNNNN es el consecutivo que se incrementa automáticamente
 */
export const generarRadicacionConsecutiva = async (): Promise<string> => {
  const counterRef = doc(db, 'counters', 'radicacion');
  
  const radicacion = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    // Obtener el año actual
    const year = new Date().getFullYear();
    
    let consecutivo = 1;
    let lastYear = year;
    
    if (counterDoc.exists()) {
      const data = counterDoc.data();
      lastYear = data.year || year;
      consecutivo = data.consecutivo || 0;
      
      // Si cambió el año, reiniciar el consecutivo
      if (lastYear !== year) {
        consecutivo = 1;
      } else {
        consecutivo += 1;
      }
    }
    
    // Actualizar o crear el contador
    transaction.set(counterRef, {
      consecutivo,
      year,
      ultimaActualizacion: serverTimestamp(),
    });
    
    // Generar la radicación con formato: 11001-31-03-001-YYYY-NNNNN-00
    // 11001: Código ciudad (Bogotá)
    // 31: Código del tipo de despacho
    // 03: Código especialidad
    // 001: Número del despacho
    // YYYY: Año
    // NNNNN: Consecutivo (5 dígitos con padding)
    // 00: Código adicional
    const consecutivoStr = consecutivo.toString().padStart(5, '0');
    return `11001-31-03-001-${year}-${consecutivoStr}-00`;
  });
  
  return radicacion;
};

/**
 * Genera el radicado interno basado en el origen seleccionado
 * Formato: PREFIJO-CONSECUTIVO-AÑO (ej: PC-01-0001-2026)
 * @param origenNombre - Nombre del origen seleccionado
 * @returns Radicado interno generado
 */
export const generarRadicadoInterno = async (origenNombre: string): Promise<string> => {
  // Obtener el prefijo según el origen
  const prefijo = getPrefijoByOrigenNombre(origenNombre);
  
  if (!prefijo) {
    throw new Error('Origen no válido para generar radicado interno');
  }
  
  // Usar el prefijo como clave del contador
  const counterRef = doc(db, 'counters', `radicado_interno_${prefijo}`);
  
  const radicado = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    
    // Obtener el año actual
    const year = new Date().getFullYear();
    
    let consecutivo = 1;
    let lastYear = year;
    
    if (counterDoc.exists()) {
      const data = counterDoc.data();
      lastYear = data.year || year;
      consecutivo = data.consecutivo || 0;
      
      // Si cambió el año, reiniciar el consecutivo
      if (lastYear !== year) {
        consecutivo = 1;
      } else {
        consecutivo += 1;
      }
    }
    
    // Actualizar o crear el contador
    transaction.set(counterRef, {
      consecutivo,
      year,
      prefijo,
      origenNombre,
      ultimaActualizacion: serverTimestamp(),
    });
    
    // Generar el radicado interno: PREFIJO-CONSECUTIVO-AÑO
    const consecutivoStr = consecutivo.toString().padStart(4, '0');
    return `${prefijo}-${consecutivoStr}-${year}`;
  });
  
  return radicado;
};

export const getExpedientes = async (
  filters: ExpedienteFilters = {},
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot,
  userRole?: string,
  userId?: string
) => {
  console.log('📋 getExpedientes llamado con:', { userRole, userId, filters });
  
  const expedientesRef = collection(db, 'expedientes');
  const constraints: any[] = [orderBy('modificadoEl', 'desc'), limit(pageSize)];

  // CONTROL DE ACCESO: Filtrar por responsable según el rol
  // Solo admin y auditor pueden ver todos los expedientes
  if (userRole && userId && !['admin', 'auditor'].includes(userRole)) {
    // Gestores y lectores solo ven expedientes asignados a ellos
    console.log('🔒 Filtrando por responsableUserId:', userId);
    constraints.unshift(where('responsableUserId', '==', userId));
  } else {
    console.log('👑 Usuario admin/auditor - mostrando todos los expedientes');
  }

  // Aplicar filtros adicionales
  if (filters.estadoId) {
    constraints.unshift(where('estadoId', '==', filters.estadoId));
  }
  if (filters.ubicacionId) {
    constraints.unshift(where('ubicacionId', '==', filters.ubicacionId));
  }
  if (filters.despachoId) {
    constraints.unshift(where('despachoId', '==', filters.despachoId));
  }
  if (filters.claseId) {
    constraints.unshift(where('claseId', '==', filters.claseId));
  }
  if (filters.prioridad) {
    constraints.unshift(where('prioridad', '==', filters.prioridad));
  }
  if (filters.fechaDesde) {
    constraints.unshift(where('creadoEl', '>=', Timestamp.fromDate(filters.fechaDesde)));
  }
  if (filters.fechaHasta) {
    const endDate = new Date(filters.fechaHasta);
    endDate.setHours(23, 59, 59, 999);
    constraints.unshift(where('creadoEl', '<=', Timestamp.fromDate(endDate)));
  }

  if (lastDoc) {
    constraints.push(startAfter(lastDoc));
  }

  const q = query(expedientesRef, ...constraints);
  const snapshot = await getDocs(q);

  // Obtener expedientes con nombres de catálogos
  const expedientes = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const expedienteData = docSnap.data();
      
      // Obtener nombres de catálogos
      const [clase, estado, origen, despacho, ubicacion] = await Promise.all([
        expedienteData.claseId ? getDoc(doc(db, 'clases', expedienteData.claseId)) : null,
        expedienteData.estadoId ? getDoc(doc(db, 'estados', expedienteData.estadoId)) : null,
        expedienteData.origenId ? getDoc(doc(db, 'origenes', expedienteData.origenId)) : null,
        expedienteData.despachoId ? getDoc(doc(db, 'despachos', expedienteData.despachoId)) : null,
        expedienteData.ubicacionId ? getDoc(doc(db, 'ubicaciones', expedienteData.ubicacionId)) : null,
      ]);

      return {
        id: docSnap.id,
        ...expedienteData,
        claseNombre: clase?.exists() ? clase.data()?.nombre : undefined,
        estadoNombre: estado?.exists() ? estado.data()?.nombre : undefined,
        origenNombre: origen?.exists() ? origen.data()?.nombre : undefined,
        despachoNombre: despacho?.exists() ? despacho.data()?.nombre : undefined,
        ubicacionNombre: ubicacion?.exists() ? ubicacion.data()?.nombre : undefined,
      } as Expediente;
    })
  );

  console.log(`📊 Encontrados ${expedientes.length} expedientes para usuario ${userId}`);
  expedientes.forEach(exp => {
    console.log(`  - ${exp.radicacionUnica} (responsable: ${exp.responsableUserId})`);
  });

  return {
    expedientes,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
};

export const getExpedienteById = async (id: string): Promise<Expediente | null> => {
  const docRef = doc(db, 'expedientes', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const expedienteData = docSnap.data();
  
  // Obtener nombres de catálogos y usuarios
  const [clase, estado, origen, despacho, ubicacion, responsable, creadoPor, modificadoPor] = await Promise.all([
    expedienteData.claseId ? getDoc(doc(db, 'clases', expedienteData.claseId)) : null,
    expedienteData.estadoId ? getDoc(doc(db, 'estados', expedienteData.estadoId)) : null,
    expedienteData.origenId ? getDoc(doc(db, 'origenes', expedienteData.origenId)) : null,
    expedienteData.despachoId ? getDoc(doc(db, 'despachos', expedienteData.despachoId)) : null,
    expedienteData.ubicacionId ? getDoc(doc(db, 'ubicaciones', expedienteData.ubicacionId)) : null,
    expedienteData.responsableUserId ? getDoc(doc(db, 'users', expedienteData.responsableUserId)) : null,
    expedienteData.creadoPorId ? getDoc(doc(db, 'users', expedienteData.creadoPorId)) : null,
    expedienteData.modificadoPorId ? getDoc(doc(db, 'users', expedienteData.modificadoPorId)) : null,
  ]);

  return {
    id: docSnap.id,
    ...expedienteData,
    claseNombre: clase?.exists() ? clase.data()?.nombre : undefined,
    estadoNombre: estado?.exists() ? estado.data()?.nombre : undefined,
    origenNombre: origen?.exists() ? origen.data()?.nombre : undefined,
    despachoNombre: despacho?.exists() ? despacho.data()?.nombre : undefined,
    ubicacionNombre: ubicacion?.exists() ? ubicacion.data()?.nombre : undefined,
    responsableNombre: responsable?.exists() ? responsable.data()?.displayName : undefined,
    creadoPorNombre: creadoPor?.exists() ? creadoPor.data()?.displayName || creadoPor.data()?.email : undefined,
    modificadoPorNombre: modificadoPor?.exists() ? modificadoPor.data()?.displayName || modificadoPor.data()?.email : undefined,
  } as Expediente;
};

export const createExpediente = async (
  data: ExpedienteFormData,
  userId: string
): Promise<string> => {
  // Verificar que la radicación única no exista
  const q = query(
    collection(db, 'expedientes'),
    where('radicacionUnica', '==', data.radicacionUnica)
  );
  const existingDocs = await getDocs(q);

  if (!existingDocs.empty) {
    throw new Error('Ya existe un expediente con esta radicación única');
  }

  const docRef = await addDoc(collection(db, 'expedientes'), {
    ...data,
    creadoEl: serverTimestamp(),
    creadoPorId: userId,
    modificadoEl: serverTimestamp(),
    modificadoPorId: userId,
  });

  // Crear notificación para el responsable (si no es el mismo que lo creó)
  if (data.responsableUserId && data.responsableUserId !== userId) {
    await crearNotificacionAsignacion(
      data.responsableUserId,
      docRef.id,
      data.radicacionUnica,
      userId
    );
  }

  return docRef.id;
};

export const updateExpediente = async (
  id: string,
  data: Partial<ExpedienteFormData>,
  userId: string
): Promise<void> => {
  const docRef = doc(db, 'expedientes', id);
  
  // Si se está cambiando el responsable, obtener datos para notificación
  if (data.responsableUserId) {
    const expedienteSnap = await getDoc(docRef);
    if (expedienteSnap.exists()) {
      const expedienteData = expedienteSnap.data();
      const responsableAnterior = expedienteData.responsableUserId;
      
      // Solo notificar si es un cambio de responsable (no el mismo)
      if (responsableAnterior !== data.responsableUserId && data.responsableUserId !== userId) {
        await crearNotificacionAsignacion(
          data.responsableUserId,
          id,
          expedienteData.radicacionUnica,
          userId
        );
      }
    }
  }
  
  await updateDoc(docRef, {
    ...data,
    modificadoEl: serverTimestamp(),
    modificadoPorId: userId,
  });
};

export const reasignarExpediente = async (
  id: string,
  nuevoResponsableId: string,
  userId: string
): Promise<void> => {
  console.log('🔄 Reasignando expediente:', { id, nuevoResponsableId, userId });
  await updateExpediente(id, { responsableUserId: nuevoResponsableId }, userId);
  console.log('✅ Expediente reasignado correctamente');
};
