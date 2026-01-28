/**
 * Script para verificar y corregir IDs de usuarios en Firestore
 * 
 * Ejecuta: node scripts/verificar-usuarios.js
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!require('fs').existsSync(serviceAccountPath)) {
  console.error('❌ No se encuentra serviceAccountKey.json');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function verificarUsuarios() {
  console.log('🔍 Verificando usuarios...\n');
  
  // Obtener usuarios de Authentication
  const authUsers = await auth.listUsers();
  console.log(`📧 Usuarios en Authentication: ${authUsers.users.length}`);
  authUsers.users.forEach(u => {
    console.log(`  - ${u.email} (UID: ${u.uid})`);
  });
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Obtener usuarios de Firestore
  const firestoreUsers = await db.collection('users').get();
  console.log(`📄 Usuarios en Firestore: ${firestoreUsers.size}`);
  firestoreUsers.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.email} (Doc ID: ${doc.id}) - ${data.displayName} - ${data.rol}`);
  });
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Verificar discrepancias
  console.log('🔎 Verificando discrepancias...\n');
  
  const authEmails = new Map(authUsers.users.map(u => [u.email, u.uid]));
  const firestoreEmails = new Map();
  
  firestoreUsers.forEach(doc => {
    const data = doc.data();
    firestoreEmails.set(data.email, doc.id);
  });
  
  let problemasEncontrados = false;
  
  // Verificar si los IDs coinciden
  for (const [email, authUid] of authEmails.entries()) {
    const firestoreUid = firestoreEmails.get(email);
    
    if (firestoreUid && authUid !== firestoreUid) {
      console.log(`⚠️  PROBLEMA: ${email}`);
      console.log(`   - UID en Authentication: ${authUid}`);
      console.log(`   - Doc ID en Firestore:   ${firestoreUid}`);
      console.log(`   - ¡LOS IDs NO COINCIDEN!\n`);
      problemasEncontrados = true;
    } else if (!firestoreUid) {
      console.log(`⚠️  Usuario ${email} existe en Auth pero NO en Firestore\n`);
      problemasEncontrados = true;
    }
  }
  
  // Verificar usuarios en Firestore que no existen en Auth
  for (const [email, firestoreUid] of firestoreEmails.entries()) {
    if (!authEmails.has(email)) {
      console.log(`⚠️  Usuario ${email} (${firestoreUid}) existe en Firestore pero NO en Auth\n`);
      problemasEncontrados = true;
    }
  }
  
  if (!problemasEncontrados) {
    console.log('✅ No se encontraron problemas. Todos los IDs coinciden.\n');
  } else {
    console.log('='.repeat(70));
    console.log('\n💡 SOLUCIÓN:');
    console.log('1. Elimina el documento incorrecto en Firestore');
    console.log('2. O ejecuta el script de corrección (corregir-usuarios.js)\n');
  }
  
  // Verificar expedientes
  console.log('='.repeat(70));
  console.log('\n📋 Verificando expedientes...\n');
  
  const expedientes = await db.collection('expedientes').get();
  console.log(`Total de expedientes: ${expedientes.size}\n`);
  
  const responsablesUnicos = new Set();
  expedientes.forEach(doc => {
    const data = doc.data();
    if (data.responsableUserId) {
      responsablesUnicos.add(data.responsableUserId);
    }
  });
  
  console.log(`Responsables únicos en expedientes: ${responsablesUnicos.size}`);
  for (const responsableId of responsablesUnicos) {
    const userExists = firestoreEmails.values();
    const existeEnFirestore = Array.from(firestoreEmails.values()).includes(responsableId);
    const existeEnAuth = Array.from(authEmails.values()).includes(responsableId);
    
    if (!existeEnFirestore && !existeEnAuth) {
      console.log(`  ⚠️  ${responsableId} - NO EXISTE en Auth ni Firestore`);
    } else if (!existeEnAuth) {
      console.log(`  ⚠️  ${responsableId} - NO EXISTE en Auth`);
    } else if (!existeEnFirestore) {
      console.log(`  ⚠️  ${responsableId} - NO EXISTE en Firestore`);
    } else {
      // Encontrar el email
      let email = 'unknown';
      for (const [e, uid] of authEmails.entries()) {
        if (uid === responsableId) {
          email = e;
          break;
        }
      }
      console.log(`  ✅ ${responsableId} - ${email}`);
    }
  }
}

verificarUsuarios()
  .then(() => {
    console.log('\n✨ Verificación completada');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
  });
