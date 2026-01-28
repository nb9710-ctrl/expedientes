// Script para poblar Firestore con datos de prueba
// Ejecutar desde la consola de Firebase o como Cloud Function

// Catálogos de ejemplo
const clases = [
  { nombre: 'Civil', activo: true },
  { nombre: 'Laboral', activo: true },
  { nombre: 'Penal', activo: true },
  { nombre: 'Administrativo', activo: true },
  { nombre: 'Familia', activo: true },
];

const estados = [
  { nombre: 'Recibido', activo: true },
  { nombre: 'En trámite', activo: true },
  { nombre: 'En revisión', activo: true },
  { nombre: 'Pendiente de documentación', activo: true },
  { nombre: 'Resuelto', activo: true },
  { nombre: 'Cerrado', activo: true },
  { nombre: 'Archivado', activo: true },
];

const origenes = [
  { nombre: 'Demanda', activo: true },
  { nombre: 'Tutela', activo: true },
  { nombre: 'Recurso', activo: true },
  { nombre: 'Apelación', activo: true },
  { nombre: 'Consulta', activo: true },
];

const despachos = [
  { nombre: 'Juzgado 1 Civil del Circuito', activo: true },
  { nombre: 'Juzgado 2 Civil del Circuito', activo: true },
  { nombre: 'Juzgado 1 Laboral', activo: true },
  { nombre: 'Juzgado 2 Laboral', activo: true },
  { nombre: 'Tribunal Superior', activo: true },
];

const ubicaciones = [
  { nombre: 'Archivo Central', activo: true },
  { nombre: 'Oficina Legal', activo: true },
  { nombre: 'En custodia del abogado', activo: true },
  { nombre: 'En juzgado', activo: true },
  { nombre: 'Digitalizado', activo: true },
];

// Función para agregar documentos a una colección
async function poblarCatalogo(db, nombreColeccion, datos) {
  const batch = db.batch();
  const colRef = db.collection(nombreColeccion);
  
  datos.forEach((item) => {
    const docRef = colRef.doc();
    batch.set(docRef, item);
  });
  
  await batch.commit();
  console.log(`✅ ${nombreColeccion} poblado con ${datos.length} items`);
}

// Función principal
async function poblarBaseDatos(db) {
  try {
    await poblarCatalogo(db, 'clases', clases);
    await poblarCatalogo(db, 'estados', estados);
    await poblarCatalogo(db, 'origenes', origenes);
    await poblarCatalogo(db, 'despachos', despachos);
    await poblarCatalogo(db, 'ubicaciones', ubicaciones);
    
    console.log('🎉 Base de datos poblada exitosamente');
  } catch (error) {
    console.error('❌ Error poblando base de datos:', error);
  }
}

// Para ejecutar desde Node.js (requiere firebase-admin):
/*
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
poblarBaseDatos(db);
*/

// Para ejecutar desde la consola de Firestore (copiar y pegar):
/*
const db = firebase.firestore();
// Copiar y pegar las constantes y funciones de arriba
poblarBaseDatos(db);
*/

export { poblarBaseDatos, clases, estados, origenes, despachos, ubicaciones };
