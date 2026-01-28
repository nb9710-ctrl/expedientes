# ✅ Checklist de Migración

## Pre-requisitos

- [ ] Node.js instalado
- [ ] Proyecto Firebase creado
- [ ] Credenciales de Firebase descargadas

## Preparación

### 1. Instalar dependencias
```bash
npm install csv-parser firebase-admin
```
- [ ] Dependencias instaladas sin errores

### 2. Configurar Firebase
- [ ] Descargar `serviceAccountKey.json` desde Firebase Console
- [ ] Colocar en `scripts/serviceAccountKey.json`
- [ ] Verificar que NO esté en Git (debe estar en .gitignore)

### 3. Preparar CSV
- [ ] Archivo CSV con codificación UTF-8
- [ ] Colocar en `scripts/datos_expedientes.csv`
- [ ] Primera fila tiene los encabezados:
  - Id
  - RadicacionUnica
  - OriNombre
  - ClaNombre
  - EstNombre
  - Repositorio
  - RadicadoInterno
  - DatosDemandante
  - DatosApoderadoDemandante
  - DatosDemandado
  - DatosApoderadoDemandado
  - DesNombre
  - UbiNombre

## Ejecución

### Paso 1: Analizar CSV (Opcional)
```bash
node scripts/analizar-csv.js
```
- [ ] Script ejecutado sin errores
- [ ] Revisar valores únicos de catálogos
- [ ] Verificar muestra de datos

**Qué revisar:**
- Total de filas coincide con lo esperado
- Columnas se leen correctamente
- Valores de ClaNombre, EstNombre, etc. son correctos

### Paso 2: Crear Catálogos
```bash
node scripts/crear-catalogos-desde-csv.js
```
- [ ] Script ejecutado sin errores
- [ ] Catálogos creados:
  - [ ] clases (desde ClaNombre)
  - [ ] estados (desde EstNombre)
  - [ ] origenes (desde OriNombre)
  - [ ] despachos (desde DesNombre)
  - [ ] ubicaciones (desde UbiNombre)

**Verificar en Firebase Console:**
- [ ] Abrir Firestore Database
- [ ] Ver colecciones creadas
- [ ] Verificar que los documentos tienen `nombre` y `activo`

### Paso 3: Migrar Expedientes
```bash
node scripts/migrar-expedientes.js
```
- [ ] Script iniciado
- [ ] Catálogos cargados correctamente
- [ ] Usuarios cargados
- [ ] CSV procesándose

**Durante la ejecución:**
- [ ] Ver progreso en tiempo real
- [ ] Batches guardándose exitosamente
- [ ] Sin errores críticos

**Al finalizar:**
- [ ] Resumen mostrado
- [ ] Total exitosos > 90%
- [ ] Si hay errores, revisar `errores_migracion.log`

## Verificación Post-Migración

### En Firebase Console
- [ ] Abrir colección `expedientes`
- [ ] Verificar cantidad de documentos
- [ ] Abrir un expediente de muestra y verificar:
  - [ ] radicacionUnica tiene valor
  - [ ] claseId, estadoId, origenId tienen valores
  - [ ] demandante, demandado tienen valores (si aplica)
  - [ ] creadoEl es un Timestamp
  - [ ] responsableUserId apunta a un usuario

### En la aplicación
- [ ] Abrir aplicación React
- [ ] Iniciar sesión
- [ ] Ir a "Expedientes"
- [ ] Ver lista de expedientes cargados
- [ ] Abrir un expediente
- [ ] Verificar que todos los campos se muestran correctamente

## Solución de Errores

### Si "serviceAccountKey.json not found"
- [ ] Descargar credenciales nuevamente
- [ ] Verificar nombre exacto del archivo
- [ ] Verificar ubicación: `scripts/serviceAccountKey.json`

### Si "datos_expedientes.csv not found"
- [ ] Verificar nombre exacto del archivo
- [ ] Verificar ubicación: `scripts/datos_expedientes.csv`
- [ ] Verificar que no esté en subcarpeta

### Si muchos errores "Clase no encontrada"
- [ ] Ejecutar de nuevo `crear-catalogos-desde-csv.js`
- [ ] Verificar en Firebase que existan los catálogos
- [ ] Verificar que los nombres en CSV coincidan exactamente (mayúsculas, espacios)

### Si expedientes sin catálogos
- [ ] Ver `errores_migracion.log` para detalles
- [ ] Crear manualmente los catálogos faltantes en Firestore
- [ ] Re-ejecutar migración (o migrar solo los fallidos)

## Limpieza

### Si necesitas reiniciar
- [ ] Eliminar colección `expedientes` en Firestore
- [ ] Eliminar colecciones de catálogos si quieres recrearlos
- [ ] Re-ejecutar desde el Paso 2

### Archivos generados
- [ ] `scripts/errores_migracion.log` - Revisar y guardar si es necesario
- [ ] Estos archivos NO se suben a Git

## Resumen Final

```
✅ Total de expedientes en CSV: _______
✅ Migrados exitosamente:      _______
❌ Con errores:                _______
📊 Porcentaje éxito:           _______%

✅ Catálogos creados:
   - Clases:       ___
   - Estados:      ___
   - Orígenes:     ___
   - Despachos:    ___
   - Ubicaciones:  ___
```

---

## 🎉 ¡Migración Completada!

Próximos pasos:
1. [ ] Verificar datos en la aplicación
2. [ ] Asignar expedientes a usuarios reales
3. [ ] Comenzar a usar el sistema
4. [ ] Capacitar usuarios

**Recuerda:** Los datos migrados tienen valores por defecto en:
- Prioridad: "Media"
- Responsable: Usuario admin
- Fechas: Fecha actual de migración

Puedes actualizar estos valores desde la aplicación según sea necesario.
