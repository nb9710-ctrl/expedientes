import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Catalogo } from '../types';

export const getCatalogos = async (nombreColeccion: string): Promise<Catalogo[]> => {
  const q = query(collection(db, nombreColeccion), orderBy('nombre'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Catalogo[];
};

export const createCatalogo = async (
  nombreColeccion: string,
  data: Omit<Catalogo, 'id'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, nombreColeccion), data);
  return docRef.id;
};

export const updateCatalogo = async (
  nombreColeccion: string,
  id: string,
  data: Partial<Omit<Catalogo, 'id'>>
): Promise<void> => {
  const docRef = doc(db, nombreColeccion, id);
  await updateDoc(docRef, data);
};

export const deleteCatalogo = async (
  nombreColeccion: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, nombreColeccion, id);
  await deleteDoc(docRef);
};
