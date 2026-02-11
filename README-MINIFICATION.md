# Guía de Minificación de CSS y JS

## ✅ Minificación Completada

Los archivos CSS y JS han sido minificados automáticamente usando el script `minify.js`.

### Archivos Minificados:
- ✅ `style.css` → `style.min.css`
- ✅ `script.js` → `script.min.js`

### Re-minificar (si haces cambios):

Ejecuta el script de minificación:
```bash
node minify.js
```

O si prefieres usar herramientas más avanzadas:

1. **Usando herramientas online:**
   - CSS: https://cssminifier.com/
   - JS: https://javascript-minifier.com/

2. **Usando Node.js con herramientas profesionales:**
   ```bash
   npm install -g clean-css-cli terser
   cleancss -o style.min.css style.css
   terser script.js -o script.min.js -c -m
   ```

### HTML Actualizado:
El HTML ya está configurado para usar las versiones minificadas:
```html
<link rel="stylesheet" href="style.min.css?v=4">
<script defer src="script.min.js"></script>
```

## Optimizaciones Aplicadas:

✅ CSS cargado asíncronamente
✅ Scripts con defer
✅ Lazy loading en imágenes
✅ Preload de recursos críticos
✅ Google Analytics con defer
✅ Optimización de fuentes
✅ Archivos minificados para mejor rendimiento
✅ Cache headers optimizados en vercel.json
