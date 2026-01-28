/**
 * Script de Migración de Expedientes desde CSV a Firestore
 * 
 * Uso:
 * 1. Coloca tu archivo CSV en: scripts/datos_expedientes.csv
 * 2. Ajusta el mapeo de columnas en la función mapearFilaAExpediente
 * 3. Ejecuta: node scripts/migrar-expedientes.js
 * 
 * Requisitos:
 * - npm install csv-parser firebase-admin
 */

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// ============================================
// CONFIGURACIÓN
// ============================================

// Ruta al archivo de credenciales de Firebase
// Descárgalo desde: Firebase Console > Project Settings > Service Accounts
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Ruta al archivo CSV
const csvFilePath = path.join(__dirname, 'datos_expedientes.csv');

// Tamaño del batch (Firestore permite máximo 500 operaciones por batch)
const BATCH_SIZE = 400;

// ============================================
// INICIALIZAR FIREBASE ADMIN
// ============================================

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: No se encuentra el archivo serviceAccountKey.json');
  console.log('📝 Descárgalo desde Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================================
// MAPEO DE COLUMNAS CSV A MODELO EXPEDIENTE
// ============================================

/**
 * Mapea las columnas del CSV a la estructura de Expediente en Firestore
 * 
 * Columnas del CSV:
 * - Id, RadicacionUnica, RadicadoInterno
 * - OriNombre (Origen), ClaNombre (Clase), EstNombre (Estado)
 * - DesNombre (Despacho), UbiNombre (Ubicación)
 * - DatosDemandante, DatosApoderadoDemandante
 * - DatosDemandado, DatosApoderadoDemandado
 * - Repositorio
 * 
 * @param {Object} row - Fila del CSV
 * @param {Object} catalogos - IDs de catálogos mapeados
 * @param {Object} usuarios - IDs de usuarios mapeados
 * @returns {Object} - Objeto Expediente para Firestore
 */
function mapearFilaAExpediente(row, catalogos, usuarios) {
  // Mapeo según las columnas del CSV proporcionadas
  return {
    // Campo obligatorio - Radicación única
    radicacionUnica: (row['RadicacionUnica'] || '').trim(),
    
    // Radicado interno (opcional)
    radicadoInterno: (row['RadicadoInterno'] || '').trim(),
    
    // IDs de catálogos (buscar por nombre en los catálogos precargados)
    claseId: catalogos.clases[(row['ClaNombre'] || '').trim()] || '',
    estadoId: catalogos.estados[(row['EstNombre'] || '').trim()] || catalogos.estados['Recibido'] || '',
    origenId: catalogos.origenes[(row['OriNombre'] || '').trim()] || '',
    despachoId: catalogos.despachos[(row['DesNombre'] || '').trim()] || '',
    ubicacionId: catalogos.ubicaciones[(row['UbiNombre'] || '').trim()] || catalogos.ubicaciones['Archivo Central'] || '',
    
    // Datos de las partes
    demandante: (row['DatosDemandante'] || '').trim(),
    apoderadoDemandante: (row['DatosApoderadoDemandante'] || '').trim(),
    demandado: (row['DatosDemandado'] || '').trim(),
    apoderadoDemandado: (row['DatosApoderadoDemandado'] || '').trim(),
    
    // Repositorio / URL
    repositorio: (row['Repositorio'] || '').trim(),
    
    // Prioridad por defecto (no viene en CSV)
    prioridad: 'Media',
    
    // Usuario responsable (usar el usuario por defecto)
    responsableUserId: usuarios['default'] || '',
    
    // Timestamps - usar fecha actual ya que no viene en el CSV
    creadoEl: admin.firestore.Timestamp.now(),
    creadoPorId: usuarios['default'] || '',
    modificadoEl: admin.firestore.Timestamp.now(),
    modificadoPorId: usuarios['default'] || '',
  };
}

/**
 * Parsear fecha desde diferentes formatos
 * @param {string} fechaStr - String de fecha
 * @returns {admin.firestore.Timestamp|null}
 */
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  
  try {
    // Intentar diferentes formatos
    let fecha;
    
    // Formato: DD/MM/YYYY
    if (fechaStr.includes('/')) {
      const [dia, mes, anio] = fechaStr.split('/');
      fecha = new Date(anio, parseInt(mes) - 1, dia);
    }
    // Formato: YYYY-MM-DD
    else if (fechaStr.includes('-')) {
      fecha = new Date(fechaStr);
    }
    // Formato timestamp
    else if (!isNaN(fechaStr)) {
      fecha = new Date(parseInt(fechaStr));
    }
    
    if (fecha && !isNaN(fecha.getTime())) {
      return admin.firestore.Timestamp.fromDate(fecha);
    }
  } catch (error) {
    console.warn(`⚠️  Fecha inválida: ${fechaStr}`);
  }
  
  return null;
}

// ============================================
// CARGAR CATÁLOGOS Y USUARIOS
// ============================================

async function cargarCatalogos() {
  console.log('📚 Cargando catálogos...');
  
  const catalogos = {
    clases: {},
    estados: {},
    origenes: {},
    despachos: {},
    ubicaciones: {}
  };
  
  for (const tipo of Object.keys(catalogos)) {
    const snapshot = await db.collection(tipo).get();
    snapshot.forEach(doc => {
      catalogos[tipo][doc.data().nombre] = doc.id;
    });
    console.log(`   ✓ ${tipo}: ${Object.keys(catalogos[tipo]).length} items`);
  }
  
  return catalogos;
}

async function cargarUsuarios() {
  console.log('👥 Cargando usuarios...');
  
  const usuarios = {};
  const snapshot = await db.collection('users').get();
  
  snapshot.forEach(doc => {
    const user = doc.data();
    // Mapear por email y por displayName
    usuarios[user.email] = doc.id;
    usuarios[user.displayName] = doc.id;
  });
  
  // Usuario por defecto (primer admin encontrado)
  const firstUser = snapshot.docs[0];
  if (firstUser) {
    usuarios['default'] = firstUser.id;
    console.log(`   ✓ Usuario por defecto: ${firstUser.data().displayName}`);
  }
  
  console.log(`   ✓ Total usuarios: ${snapshot.size}`);
  
  return usuarios;
}

// ============================================
// PROCESAMIENTO DEL CSV
// ============================================

async function procesarCSV() {
  console.log('\n🚀 Iniciando migración de expedientes...\n');
  console.log(`📄 Archivo CSV: ${csvFilePath}`);
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ ERROR: No se encuentra el archivo CSV');
    console.log('📝 Coloca tu archivo en: scripts/datos_expedientes.csv');
    process.exit(1);
  }
  
  // Cargar datos de referencia
  const catalogos = await cargarCatalogos();
  const usuarios = await cargarUsuarios();
  
  console.log('\n📊 Procesando CSV...\n');
  
  const filas = [];
  let lineNumber = 0;
  
  // Leer CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        lineNumber++;
        filas.push({ row, lineNumber });
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✓ Leídas ${filas.length} filas del CSV\n`);
  
  // Procesar en batches
  let totalProcesados = 0;
  let totalExitosos = 0;
  let totalErrores = 0;
  const errores = [];
  
  for (let i = 0; i < filas.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const filasDelBatch = filas.slice(i, i + BATCH_SIZE);
    
    console.log(`📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Procesando filas ${i + 1} a ${Math.min(i + BATCH_SIZE, filas.length)}...`);
    
    for (const { row, lineNumber } of filasDelBatch) {
      try {
        const expediente = mapearFilaAExpediente(row, catalogos, usuarios);
        
        // Validar campos obligatorios
        if (!expediente.radicacionUnica) {
          throw new Error('RadicacionUnica vacía');
        }
        if (!expediente.claseId) {
          throw new Error(`Clase no encontrada: "${(row['ClaNombre'] || '').trim()}"`);
        }
        if (!expediente.estadoId) {
          throw new Error(`Estado no encontrado: "${(row['EstNombre'] || '').trim()}"`);
        }
        if (!expediente.origenId) {
          throw new Error(`Origen no encontrado: "${(row['OriNombre'] || '').trim()}"`);
        }
        if (!expediente.despachoId) {
          throw new Error(`Despacho no encontrado: "${(row['DesNombre'] || '').trim()}"`);
        }
        if (!expediente.ubicacionId) {
          throw new Error(`Ubicación no encontrada: "${(row['UbiNombre'] || '').trim()}"`);
        }
        
        // Crear documento en Firestore
        const docRef = db.collection('expedientes').doc();
        batch.set(docRef, expediente);
        
        totalExitosos++;
      } catch (error) {
        totalErrores++;
        errores.push({
          linea: lineNumber,
          radicacion: row['RadicacionUnica'] || 'N/A',
          error: error.message
        });
      }
      
      totalProcesados++;
    }
    
    // Ejecutar batch
    try {
      await batch.commit();
      console.log(`   ✓ Batch guardado exitosamente`);
    } catch (error) {
      console.error(`   ❌ Error al guardar batch: ${error.message}`);
      totalErrores += filasDelBatch.length;
    }
    
    // Progreso
    const porcentaje = ((totalProcesados / filas.length) * 100).toFixed(1);
    console.log(`   📊 Progreso: ${totalProcesados}/${filas.length} (${porcentaje}%)\n`);
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos:     ${totalExitosos}`);
  console.log(`❌ Con errores:  ${totalErrores}`);
  console.log(`📝 Total:        ${totalProcesados}`);
  console.log('='.repeat(60));
  
  // Mostrar errores
  if (errores.length > 0) {
    console.log('\n⚠️  ERRORES ENCONTRADOS:\n');
    errores.slice(0, 20).forEach(err => {
      console.log(`   Línea ${err.linea} [${err.radicacion}]: ${err.error}`);
    });
    
    if (errores.length > 20) {
      console.log(`\n   ... y ${errores.length - 20} errores más`);
    }
    
    // Guardar log de errores
    const logPath = path.join(__dirname, 'errores_migracion.log');
    fs.writeFileSync(logPath, JSON.stringify(errores, null, 2));
    console.log(`\n💾 Log completo guardado en: ${logPath}`);
  }
  
  console.log('\n✨ Migración completada!\n');
}

// ============================================
// EJECUTAR MIGRACIÓN
// ============================================

procesarCSV()
  .then(() => {
    console.log('👋 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
