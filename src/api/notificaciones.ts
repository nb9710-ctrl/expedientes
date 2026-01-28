import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notificacion } from '../types';

/**
 * Crear notificación cuando se asigna un expediente
 */
export const crearNotificacionAsignacion = async (
  userId: string,
  expedienteId: string,
  radicacionUnica: string,
  asignadoPor: string
) => {
  try {
    await addDoc(collection(db, 'notificaciones'), {
      userId,
      tipo: 'asignacion',
      expedienteId,
      radicacionUnica,
      titulo: 'Nuevo expediente asignado',
      mensaje: `Se te ha asignado el expediente ${radicacionUnica}`,
      leida: false,
      creadoEl: serverTimestamp(),
      asignadoPorId: asignadoPor,
    });
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};

/**
 * Crear notificación de escalamiento
 */
export const crearNotificacionEscalamiento = async (
  userId: string,
  expedienteId: string,
  radicacionUnica: string,
  motivo: string,
  escaladoPor: string
) => {
  try {
    await addDoc(collection(db, 'notificaciones'), {
      userId,
      tipo: 'escalamiento',
      expedienteId,
      radicacionUnica,
      titulo: 'Expediente escalado',
      mensaje: `El expediente ${radicacionUnica} ha sido escalado. Motivo: ${motivo}`,
      leida: false,
      creadoEl: serverTimestamp(),
      escaladoPorId: escaladoPor,
    });
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};

/**
 * Obtener notificaciones de un usuario
 */
export const getNotificaciones = async (
  userId: string,
  limitCount: number = 20,
  soloNoLeidas: boolean = false
) => {
  try {
    const notificacionesRef = collection(db, 'notificaciones');
    const constraints: any[] = [
      where('userId', '==', userId),
      orderBy('creadoEl', 'desc'),
      limit(limitCount),
    ];

    if (soloNoLeidas) {
      constraints.unshift(where('leida', '==', false));
    }

    const q = query(notificacionesRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notificacion[];
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return [];
  }
};

/**
 * Marcar notificación como leída
 */
export const marcarComoLeida = async (notificacionId: string) => {
  try {
    const notifRef = doc(db, 'notificaciones', notificacionId);
    await updateDoc(notifRef, {
      leida: true,
      leidaEl: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
  }
};

/**
 * Marcar todas las notificaciones de un usuario como leídas
 */
export const marcarTodasComoLeidas = async (userId: string) => {
  try {
    const notificacionesRef = collection(db, 'notificaciones');
    const q = query(
      notificacionesRef,
      where('userId', '==', userId),
      where('leida', '==', false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        leida: true,
        leidaEl: serverTimestamp(),
      })
    );

    await Promise.all(updates);
  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
  }
};

/**
 * Contar notificaciones no leídas
 */
export const contarNoLeidas = async (userId: string): Promise<number> => {
  try {
    const notificacionesRef = collection(db, 'notificaciones');
    const q = query(
      notificacionesRef,
      where('userId', '==', userId),
      where('leida', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error contando notificaciones:', error);
    return 0;
  }
};
