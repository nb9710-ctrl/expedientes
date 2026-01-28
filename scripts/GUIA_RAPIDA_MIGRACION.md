# 🚀 Guía Rápida de Migración

## Tu CSV tiene estas columnas:
- `Id`, `RadicacionUnica`, `RadicadoInterno`
- `OriNombre` (Origen), `ClaNombre` (Clase), `EstNombre` (Estado)
- `DesNombre` (Despacho), `UbiNombre` (Ubicación)
- `DatosDemandante`, `DatosApoderadoDemandante`
- `DatosDemandado`, `DatosApoderadoDemandado`
- `Repositorio`

## ✅ Los scripts ya están configurados

Todos los scripts de migración están listos para tus columnas específicas.

## 📋 Pasos para migrar

### 1. Instalar dependencias
```bash
npm install csv-parser firebase-admin
```

### 2. Obtener credenciales de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. **Project Settings** (⚙️) > **Service Accounts**
4. **"Generate new private key"**
5. Renombra el archivo a `serviceAccountKey.json`
6. Colócalo en `scripts/serviceAccountKey.json`

⚠️ **Importante:** NO subas este archivo a Git (ya está en .gitignore)

### 3. Preparar el CSV
1. Coloca tu CSV en: `scripts/datos_expedientes.csv`
2. Asegúrate que tenga codificación UTF-8
3. Primera fila = encabezado con nombres de columnas

### 4. Analizar el CSV (Opcional)
```bash
node scripts/analizar-csv.js
```

Esto te mostrará:
- Total de filas
- Columnas encontradas
- Valores únicos en ClaNombre, EstNombre, OriNombre, etc.
- Muestra de datos

### 5. Crear catálogos
```bash
node scripts/crear-catalogos-desde-csv.js
```

Este comando:
- ✅ Lee el CSV
- ✅ Extrae valores únicos de las columnas de catálogos
- ✅ Crea las colecciones en Firestore:
  - `clases` (desde ClaNombre)
  - `estados` (desde EstNombre)
  - `origenes` (desde OriNombre)
  - `despachos` (desde DesNombre)
  - `ubicaciones` (desde UbiNombre)

### 6. Ejecutar migración de expedientes
```bash
node scripts/migrar-expedientes.js
```

Verás el progreso en tiempo real:
```
🚀 Iniciando migración de expedientes...

📚 Cargando catálogos...
   ✓ clases: 5 items
   ✓ estados: 7 items
   ...

📦 Batch 1: Procesando filas 1 a 400...
   ✓ Batch guardado exitosamente
   📊 Progreso: 400/9194 (4.4%)

...

============================================================
📊 RESUMEN DE MIGRACIÓN
============================================================
✅ Exitosos:     9120
❌ Con errores:  74
📝 Total:        9194
============================================================
```

## 🔍 Verificar resultados

Si hay errores, se guardan en: `scripts/errores_migracion.log`

Errores comunes:
- **"RadicacionUnica vacía"** → Fila sin radicación
- **"Clase no encontrada"** → Valor en ClaNombre no está en el catálogo
- **"Estado no encontrado"** → Valor en EstNombre no está en el catálogo

## 📊 Mapeo de datos

| CSV | Firestore | Notas |
|-----|-----------|-------|
| RadicacionUnica | radicacionUnica | Obligatorio |
| RadicadoInterno | radicadoInterno | Opcional |
| ClaNombre | claseId | Busca en catálogo `clases` |
| EstNombre | estadoId | Busca en catálogo `estados` |
| OriNombre | origenId | Busca en catálogo `origenes` |
| DesNombre | despachoId | Busca en catálogo `despachos` |
| UbiNombre | ubicacionId | Busca en catálogo `ubicaciones` |
| DatosDemandante | demandante | Opcional |
| DatosApoderadoDemandante | apoderadoDemandante | Opcional |
| DatosDemandado | demandado | Opcional |
| DatosApoderadoDemandado | apoderadoDemandado | Opcional |
| Repositorio | repositorio | Opcional (URL) |

**Campos automáticos:**
- `prioridad`: "Media"
- `responsableUserId`: Primer usuario admin
- `creadoEl`: Fecha actual
- `creadoPorId`: Primer usuario admin
- `modificadoEl`: Fecha actual
- `modificadoPorId`: Primer usuario admin

## ⚡ Comandos rápidos

```bash
# Todo en secuencia
npm install csv-parser firebase-admin
node scripts/analizar-csv.js
node scripts/crear-catalogos-desde-csv.js
node scripts/migrar-expedientes.js
```

## 🆘 Solución de problemas

### Error: No se encuentra serviceAccountKey.json
- Descarga las credenciales desde Firebase Console
- Colócalas en `scripts/serviceAccountKey.json`

### Error: No se encuentra datos_expedientes.csv
- Coloca tu CSV en `scripts/datos_expedientes.csv`

### Error: "Clase no encontrada"
- Ejecuta primero `crear-catalogos-desde-csv.js`
- Verifica que los nombres en el CSV coincidan exactamente

### Muchos errores en la migración
1. Revisa `scripts/errores_migracion.log`
2. Verifica que los catálogos se crearon correctamente
3. Asegúrate que todas las radicaciones sean únicas

## 📞 Contacto

Si necesitas ayuda, revisa:
- [MIGRACION_README.md](./MIGRACION_README.md) - Guía detallada
- [README.md](../README.md) - Documentación del proyecto
