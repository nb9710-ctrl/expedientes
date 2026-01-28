import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Catalogo } from '../types';

export const useCatalogo = (nombreColeccion: string) => {
  return useQuery<Catalogo[]>({
    queryKey: ['catalogo', nombreColeccion],
    queryFn: async () => {
      const q = query(
        collection(db, nombreColeccion),
        where('activo', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Catalogo[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - los catálogos cambian poco
  });
};
