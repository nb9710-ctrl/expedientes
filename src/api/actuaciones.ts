import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Actuacion, ActuacionFormData, Adjunto } from '../types';

export const getActuaciones = async (
  expedienteId: string,
  pageSize: number = 50
): Promise<Actuacion[]> => {
  const actuacionesRef = collection(db, 'expedientes', expedienteId, 'actuaciones');
  const q = query(actuacionesRef, orderBy('fecha', 'desc'), limit(pageSize));
  const snapshot = await getDocs(q);

  // Obtener actuaciones con nombres de usuario
  const actuaciones = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const actuacionData = docSnap.data();
      
      // Obtener nombre del usuario
      let usuarioNombre = 'Usuario desconocido';
      if (actuacionData.usuarioId) {
        const userDoc = await getDoc(doc(db, 'users', actuacionData.usuarioId));
        if (userDoc.exists()) {
          usuarioNombre = userDoc.data()?.displayName || userDoc.data()?.email || 'Usuario desconocido';
        }
      }

      return {
        id: docSnap.id,
        expedienteId,
        ...actuacionData,
        usuarioNombre,
      } as Actuacion;
    })
  );

  return actuaciones;
};

// Obtener fecha de última actuación de un expediente
export const getUltimaActuacionFecha = async (
  expedienteId: string
): Promise<Date | null> => {
  const actuacionesRef = collection(db, 'expedientes', expedienteId, 'actuaciones');
  const q = query(actuacionesRef, orderBy('fecha', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const ultimaActuacion = snapshot.docs[0].data();
  return ultimaActuacion.fecha?.toDate() || null;
};

export const createActuacion = async (
  expedienteId: string,
  data: ActuacionFormData,
  userId: string
): Promise<string> => {
  const adjuntos: Adjunto[] = [];

  // Subir archivos adjuntos a Firebase Storage
  if (data.adjuntos && data.adjuntos.length > 0) {
    for (const file of data.adjuntos) {
      const timestamp = Date.now();
      const storageRef = ref(
        storage,
        `expedientes/${expedienteId}/actuaciones/${timestamp}_${file.name}`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      adjuntos.push({
        nombre: file.name,
        url,
        size: file.size,
        contentType: file.type,
      });
    }
  }

  const actuacionesRef = collection(db, 'expedientes', expedienteId, 'actuaciones');
  const docRef = await addDoc(actuacionesRef, {
    fecha: Timestamp.fromDate(data.fecha),
    anotacion: data.anotacion,
    tipo: data.tipo || null,
    usuarioId: userId,
    adjuntos: adjuntos.length > 0 ? adjuntos : null,
    creadoEl: serverTimestamp(),
  });

  return docRef.id;
};

export const createActuacionEscalamiento = async (
  expedienteId: string,
  nivel: string,
  nuevoResponsableId: string,
  motivo: string,
  userId: string
): Promise<void> => {
  const anotacion = `Expediente escalado a ${nivel}. Nuevo responsable: ${nuevoResponsableId}. Motivo: ${motivo}`;

  await createActuacion(
    expedienteId,
    {
      fecha: new Date(),
      anotacion,
      tipo: 'Escalamiento',
    },
    userId
  );
};
