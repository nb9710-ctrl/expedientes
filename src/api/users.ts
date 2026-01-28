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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { db, auth } from '../firebase';
import { User, UserRole } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), orderBy('displayName'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data,
      activo: data.activo !== undefined ? data.activo : true, // Por defecto activo
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

export const updateUserRole = async (
  uid: string,
  rol: User['rol']
): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { rol });
};

export const createUser = async (
  email: string,
  password: string,
  displayName: string,
  rol: UserRole
): Promise<void> => {
  // Generar un ID único para la instancia secundaria
  const secondaryAppId = `SecondaryApp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Crear una instancia secundaria de Firebase para crear el usuario sin afectar la sesión actual
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
    // Crear usuario con la instancia secundaria
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;

    // Crear documento en Firestore
    const userDoc: Omit<User, 'uid'> = {
      displayName,
      email,
      rol,
      creadoEl: serverTimestamp() as any,
      activo: true,
    };

    await setDoc(doc(db, 'users', uid), userDoc);

    // Cerrar sesión en la instancia secundaria
    await secondaryAuth.signOut();
    
    // Éxito: no arrojar ningún error
    console.log('Usuario creado exitosamente:', { uid, email, displayName, rol });
  } catch (error: any) {
    console.error('Error detallado al crear usuario:', error);
    
    // Reabrir errores específicos de Firebase
    if (error?.code === 'auth/email-already-in-use') {
      throw new Error('DUPLICATE_EMAIL');
    } else if (error?.code === 'auth/weak-password') {
      throw new Error('WEAK_PASSWORD');
    } else {
      // Para otros errores, verificar si realmente falló la creación
      throw error;
    }
  } finally {
    // Limpiar la instancia secundaria de forma segura
    try {
      await secondaryApp.delete();
    } catch (cleanupError) {
      console.warn('Error al limpiar instancia secundaria:', cleanupError);
      // No arrojar error de limpieza
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
  // Nota: Solo elimina el documento de Firestore
  // La cuenta de Authentication debe eliminarse desde Firebase Console o Cloud Functions
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    eliminado: true,
    eliminadoEl: serverTimestamp()
  });
};
