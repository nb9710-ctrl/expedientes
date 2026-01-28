/**
 * Script para crear catálogos en Firestore basados en valores únicos del CSV
 * Ejecuta esto ANTES de la migración principal
 * 
 * Uso: node scripts/crear-catalogos-desde-csv.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const csvFilePath = path.join(__dirname, 'datos_expedientes.csv');

// Verificar archivos
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Falta: serviceAccountKey.json');
  process.exit(1);
}

if (!fs.existsSync(csvFilePath)) {
  console.error('❌ Falta: datos_expedientes.csv');
  process.exit(1);
}

// Inicializar Firebase
const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Recopilar valores únicos
const valoresUnicos = {
  clases: new Set(),
  estados: new Set(),
  origenes: new Set(),
  despachos: new Set(),
  ubicaciones: new Set()
};

console.log('📊 Analizando CSV para extraer catálogos...\n');

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Mapeo según las columnas del CSV: ClaNombre, EstNombre, OriNombre, DesNombre, UbiNombre
    if (row['ClaNombre']) valoresUnicos.clases.add(row['ClaNombre'].trim());
    if (row['EstNombre']) valoresUnicos.estados.add(row['EstNombre'].trim());
    if (row['OriNombre']) valoresUnicos.origenes.add(row['OriNombre'].trim());
    if (row['DesNombre']) valoresUnicos.despachos.add(row['DesNombre'].trim());
    if (row['UbiNombre']) valoresUnicos.ubicaciones.add(row['UbiNombre'].trim());
  })
  .on('end', async () => {
    console.log('✓ Análisis completado\n');
    console.log('📝 Valores únicos encontrados:');
    Object.keys(valoresUnicos).forEach(tipo => {
      console.log(`   ${tipo}: ${valoresUnicos[tipo].size} valores`);
    });
    
    console.log('\n🔄 Creando catálogos en Firestore...\n');
    
    for (const [tipo, valores] of Object.entries(valoresUnicos)) {
      console.log(`📁 Procesando: ${tipo}`);
      
      const batch = db.batch();
      let contador = 0;
      
      for (const nombre of valores) {
        if (nombre) { // Ignorar valores vacíos
          const docRef = db.collection(tipo).doc();
          batch.set(docRef, {
            nombre: nombre,
            activo: true
          });
          contador++;
        }
      }
      
      await batch.commit();
      console.log(`   ✓ Creados ${contador} items en ${tipo}\n`);
    }
    
    console.log('✅ Catálogos creados exitosamente!\n');
    console.log('🚀 Ahora puedes ejecutar: node scripts/migrar-expedientes.js\n');
    
    process.exit(0);
  })
  .on('error', (error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
