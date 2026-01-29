import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app'; 
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { User, UserRole } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), orderBy('displayName'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
    };
  }) as User[];
};

export const getUserById = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

// Se agregó el parámetro equipo para que acepte los 3 argumentos enviados desde el componente
export const updateUserRole = async (
  uid: string,
  rol: User['rol'],
  equipo?: string
): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { 
    rol, 
    equipo: equipo || null 
  });
};

export const createUser = async (
  email: string,
  password: string,
  displayName: string,
  rol: UserRole
): Promise<void> => {
  const secondaryAppId = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const secondaryApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }, secondaryAppId);
  
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;

    const userDoc: Omit<User, 'uid'> = {
      displayName,
      email,
      rol,
      creadoEl: serverTimestamp() as any,
      activo: true,
    };

    await setDoc(doc(db, 'users', uid), userDoc);
    await secondaryAuth.signOut();
    
    console.log('Usuario creado:', { uid, email, displayName, rol });
  } catch (error: any) {
    if (error?.code === 'auth/email-already-in-use') {
      throw new Error('DUPLICATE_EMAIL');
    } else if (error?.code === 'auth/weak-password') {
      throw new Error('WEAK_PASSWORD');
    } else {
      throw error;
    }
  } finally {
    try {
      // Uso correcto de deleteApp en Firebase v10+
      await deleteApp(secondaryApp);
    } catch (cleanupError) {
      console.warn('Error al limpiar instancia:', cleanupError);
    }
  }
};

export const disableUser = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { 
    activo: false,
    deshabilitadoEl: serverTimestamp()
  });
};

export const enableUser = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { 
    activo: true,
    deshabilitadoEl: null
  });
};

export const deleteUser = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    eliminado: true,
    eliminadoEl: serverTimestamp()
  });
};
