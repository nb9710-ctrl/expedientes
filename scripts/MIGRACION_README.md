# 📥 Guía de Migración de Expedientes desde CSV

## Pasos para migrar 9194 expedientes

### 1️⃣ Preparar el Entorno

```bash
# Instalar dependencias necesarias
npm install csv-parser firebase-admin
```

### 2️⃣ Obtener Credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **juzgados-7d669**
3. Ve a **Project Settings** (⚙️) > **Service Accounts**
4. Haz clic en **"Generate new private key"**
5. Descarga el archivo JSON
6. Renómbralo a `serviceAccountKey.json`
7. Colócalo en la carpeta `scripts/`

⚠️ **IMPORTANTE**: Este archivo contiene credenciales sensibles. NO lo subas a Git.

### 3️⃣ Preparar tu Archivo CSV

1. Coloca tu CSV en: `scripts/datos_expedientes.csv`
2. Asegúrate que tenga codificación UTF-8
3. Primera fila debe ser el encabezado con nombres de columnas

**Formato esperado del CSV:**
```csv
Id,RadicacionUnica,OriNombre,ClaNombre,EstNombre,Repositorio,RadicadoInterno,DatosDemandante,DatosApoderadoDemandante,DatosDemandado,DatosApoderadoDemandado,DesNombre,UbiNombre
1,11001-31-03-001-2024-00001-00,EJECUCIÓN MUNICIPAL,Civil,Recibido,https://...,PC-01-0001-2024,Juan Pérez,Dr. García,María López,Dra. Rodríguez,Juzgado 1,Archivo Central
```

### 4️⃣ Mapeo de Columnas

✅ **El script ya está configurado para tus columnas:**

| Columna CSV | Campo en Firestore | Tipo |
|-------------|-------------------|------|
| `Id` | (referencia) | - |
| `RadicacionUnica` | radicacionUnica | string |
| `RadicadoInterno` | radicadoInterno | string |
| `ClaNombre` | claseId | ref (catálogo) |
| `EstNombre` | estadoId | ref (catálogo) |
| `OriNombre` | origenId | ref (catálogo) |
| `DesNombre` | despachoId | ref (catálogo) |
| `UbiNombre` | ubicacionId | ref (catálogo) |
| `DatosDemandante` | demandante | string |
| `DatosApoderadoDemandante` | apoderadoDemandante | string |
| `DatosDemandado` | demandado | string |
| `DatosCrear Catálogos desde el CSV

**Primero, crea los catálogos automáticamente desde los valores del CSV:**

```bash
node scripts/crear-catalogos-desde-csv.js
```

Este script:
- ✅ Lee el CSV y extrae valores únicos de: ClaNombre, EstNombre, OriNombre, DesNombre, UbiNombre
- ✅ Crea las colecciones en Firestore: clases, estados, origenes, despachos, ubicaciones
- ✅ Evita duplicados

### 6️⃣ ApoderadoDemandado` | apoderadoDemandado | string |
| `Repositorio` | repositorio | string (URL) |

**Campos automáticos:**
- `prioridad`: "Media" (por defecto)
- `responsableUserId`: Usuario admin por defecto
- `creadoEl`, `modificadoEl`: Fecha actual
- `creadoPorId`, `modificadoPorId`: Usuario admin por defecto

### 5️⃣ Ejecutar la Migración

```bash
cd scripts
node migrar-expedientes.js
```

El script mostrará el progreso en tiempo real:

```
🚀 Iniciando migración de expedientes...

📚 Cargando catálogos...
   ✓ clases: 5 items
   ✓ estados: 7 items
   ✓ origenes: 23 items
   ✓ despachos: 5 items
   ✓ ubicaciones: 5 items

👥 Cargando usuarios...
   ✓ Usuario por defecto: Admin
   ✓ Total usuarios: 3

📊 Procesando CSV...

✓ Leídas 9194 filas del CSV

📦 Batch 1: Procesando filas 1 a 400...
   ✓ Batch guardado exitosamente
   📊 Progreso: 400/9194 (4.4%)

📦 Batch 2: Procesando filas 401 a 800...
   ✓ Batch guardado exitosamente
   📊 Progreso: 800/9194 (8.7%)

...

============================================================
📊 RESUMEN DE MIGRACIÓN
============================================================
✅ Exitosos:     9120
❌ Con errores:  74
📝 Total:        9194
============================================================

✨ Migración completada!
```

### 6️⃣ Validar Resultados

1. Ve a Firebase Console > Firestore
2. Revisa la colección `expedientes`
3. Verifica algunos registros manualmente

Si hubo errores, revisa el archivo: `scripts/errores_migracion.log`

---

## 🔍 Troubleshooting

### Error: "No se encuentra el archivo CSV"
- Verifica que el archivo esté en: `scripts/datos_expedientes.csv`
- Verifica que el nombre sea exacto

### Error: "Radicación única vacía"
- Tu CSV debe tener una columna con radicaciones únicas
- Ajusta `row['Radicacion']` en el script según tu columna

### Error: "Faltan catálogos obligatorios"
- Verifica que los nombres en tu CSV coincidan con los de Firestore
- Ejemplo: CSV dice "Civil" → Firestore debe tener un catálogo "Civil"
- Crea los catálogos faltantes antes de migrar

### Muchos errores en Clase/Estado/Origen
- Los nombres en el CSV deben coincidir **exactamente** con Firestore
- Haz un mapeo manual si los nombres difieren:

```javascript
// En la función mapearFilaAExpediente
claseId: mapearClase(row['Clase'], catalogos.clases),

// Nueva función de mapeo
function mapearClase(nombreCSV, catalogos) {
  const mapeo = {
    'CIVIL': catalogos['Civil'],
    'LABORAL': catalogos['Laboral'],
    // ... etc
  };
  return mapeo[nombreCSV] || '';
}
```

---

## 📝 Checklist Pre-Migración

- [ ] Tengo el archivo `serviceAccountKey.json` en `scripts/`
- [ ] Mi CSV está en `scripts/datos_expedientes.csv`
- [ ] El CSV tiene codificación UTF-8
- [ ] He revisado las columnas del CSV
- [ ] He ajustado la función `mapearFilaAExpediente()`
- [ ] He creado todos los catálogos necesarios en Firestore
- [ ] He creado al menos un usuario en Firestore
- [ ] He hecho un backup de Firestore (por si acaso)

---

## ⚡ Optimizaciones

El script procesa **400 expedientes por batch** (de los 500 máximos de Firestore) para mayor seguridad.

**Tiempo estimado**: 
- ~23 batches para 9194 expedientes
- ~2-5 minutos total (depende de tu conexión)

---

## 🆘 ¿Necesitas Ayuda?

**Dime:**
1. ¿Qué columnas tiene tu CSV? (nombres exactos)
2. ¿Tienes una muestra de 3-5 filas?
3. ¿Ya creaste los catálogos en Firestore?

Y te genero el mapeo exacto para tu caso.
