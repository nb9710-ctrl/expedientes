/**
 * Script para analizar el CSV y mostrar información útil
 * Ejecuta esto primero para entender la estructura de tu CSV
 * 
 * Uso: node scripts/analizar-csv.js
 */

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvFilePath = path.join(__dirname, 'datos_expedientes.csv');

console.log('🔍 Analizando CSV...\n');

if (!fs.existsSync(csvFilePath)) {
  console.error('❌ No se encuentra el archivo: scripts/datos_expedientes.csv');
  process.exit(1);
}

const columnas = new Set();
const valoresUnicos = {};
let totalFilas = 0;
const muestras = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    totalFilas++;
    
    // Capturar nombres de columnas
    Object.keys(row).forEach(col => {
      columnas.add(col);
      
      // Recopilar valores únicos para columnas importantes
      if (['ClaNombre', 'EstNombre', 'OriNombre', 'DesNombre', 'UbiNombre'].includes(col)) {
        if (!valoresUnicos[col]) {
          valoresUnicos[col] = new Set();
        }
        if (row[col]) {
          valoresUnicos[col].add(row[col]);
        }
      }
    });
    
    // Guardar primeras 5 filas como muestra
    if (muestras.length < 5) {
      muestras.push(row);
    }
  })
  .on('end', () => {
    console.log('='.repeat(70));
    console.log('📊 ANÁLISIS DEL CSV');
    console.log('='.repeat(70));
    console.log(`\n📄 Total de filas: ${totalFilas.toLocaleString()}`);
    console.log(`📋 Total de columnas: ${columnas.size}\n`);
    
    console.log('📌 COLUMNAS ENCONTRADAS:\n');
    Array.from(columnas).forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🏷️  VALORES ÚNICOS EN COLUMNAS CLAVE');
    console.log('='.repeat(70));
    
    Object.keys(valoresUnicos).forEach(col => {
      const valores = Array.from(valoresUnicos[col]).sort();
      console.log(`\n${col} (${valores.length} valores únicos):`);
      valores.forEach(val => {
        console.log(`   • ${val}`);
      });
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('📝 MUESTRA DE DATOS (Primeras 3 filas)');
    console.log('='.repeat(70));
    
    muestras.slice(0, 3).forEach((fila, idx) => {
      console.log(`\n--- Fila ${idx + 1} ---`);
      Object.keys(fila).forEach(col => {
        const valor = fila[col] || '(vacío)';
        console.log(`${col}: ${valor.substring(0, 60)}${valor.length > 60 ? '...' : ''}`);
      });
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('💡 PRÓXIMOS PASOS:');
    console.log('='.repeat(70));
    console.log(`
1. ✅ Verifica que los valores de las columnas de catálogos coincidan:
   - ClaNombre, EstNombre, OriNombre, DesNombre, UbiNombre

2. 📋 Asegúrate de tener los catálogos creados en Firestore:
   - Ejecuta: node scripts/crear-catalogos-desde-csv.js

3. 🔑 Obtén las credenciales de Firebase:
   - Descarga serviceAccountKey.json desde Firebase Console
   - Colócalo en la carpeta scripts/

4. 🚀 Ejecuta la migración:
   - node scripts/migrar-expedientes.js
    `);
    
    console.log('✅ Análisis completado!\n');
  })
  .on('error', (error) => {
    console.error('❌ Error leyendo CSV:', error.message);
  });
