# 🔒 Protección de Código y Base de Datos

## ✅ Protecciones Implementadas

### 1. **Protección de Dominio mediante API**
- ✅ API endpoint `/api/validate-domain.js` que valida dominios autorizados
- ✅ Solo permite acceso desde dominios pre-autorizados
- ✅ Genera tokens de sesión temporales (válidos por 1 hora)
- ✅ Valida dominio antes de cada acceso a la base de datos

### 2. **Protección de Consola (DevTools)**
- ✅ Bloquea apertura de DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J)
- ✅ Detecta cuando DevTools está abierto y bloquea el sitio
- ✅ Deshabilita todos los métodos de console
- ✅ Bloquea acceso a `window.console`

### 3. **Protección Contra Copia**
- ✅ Bloquea selección de texto (`user-select: none`)
- ✅ Bloquea right-click (menú contextual)
- ✅ Bloquea atajos de teclado:
  - Ctrl+C (copiar)
  - Ctrl+V (pegar)
  - Ctrl+X (cortar)
  - Ctrl+A (seleccionar todo)
  - Ctrl+S (guardar página)
  - Ctrl+U (ver código fuente)
  - Ctrl+P (imprimir)
- ✅ Bloquea drag and drop
- ✅ Intercepta eventos de copia/corte

### 4. **Protección de Base de Datos**
- ✅ Función `secureSupabaseFetch()` que valida dominio antes de cada petición
- ✅ Verifica sesión válida antes de acceder a Supabase
- ✅ Muestra error "Acceso Denegado" si el dominio no está autorizado
- ✅ Todas las peticiones a Supabase pasan por validación

### 5. **Protección de Código Copiado**
- ✅ Detecta si el código se ejecuta fuera del dominio autorizado
- ✅ Deshabilita funcionalidad si se ejecuta en dominio no autorizado
- ✅ Verifica integridad del código periódicamente
- ✅ Muestra mensaje de advertencia si el código fue modificado

## 🌐 Dominios Autorizados

Los siguientes dominios están autorizados para acceder al sitio:

- `repshub1.vercel.app`
- `www.repshub1.vercel.app`
- `repshub.vercel.app`
- `www.repshub.vercel.app`
- `fashionreps.vercel.app`
- `www.fashionreps.vercel.app`
- `localhost` (solo desarrollo)
- `127.0.0.1` (solo desarrollo)

## 🔧 Cómo Funciona

### Validación de Dominio
1. Al cargar la página, se valida el dominio mediante API
2. Si el dominio es válido, se genera un token de sesión
3. El token es válido por 1 hora
4. Todas las peticiones a Supabase incluyen el token de sesión

### Protección de Consola
1. Detecta cuando DevTools se abre (por tamaño de ventana)
2. Bloquea todos los métodos de console
3. Previene acceso a `window.console`
4. Bloquea atajos de teclado relacionados

### Protección Contra Copia
1. CSS `user-select: none` previene selección
2. Event listeners bloquean right-click y atajos
3. Intercepta eventos de clipboard
4. Bloquea drag and drop

## ⚠️ Limitaciones

**IMPORTANTE:** Estas protecciones son del lado del cliente y pueden ser deshabilitadas por usuarios avanzados. Para protección real:

1. **Base de Datos:** Configura Row Level Security (RLS) en Supabase
2. **API:** Implementa autenticación del lado del servidor
3. **Código:** Si está en GitHub público, cualquiera puede verlo y copiarlo

## 📝 Notas

- El código en GitHub puede ser visto pero no funcionará fuera de dominios autorizados
- Las protecciones están diseñadas para usuarios promedio, no para expertos
- La protección más efectiva es la validación de dominio mediante API
- Los tokens de sesión expiran después de 1 hora para seguridad adicional

## 🚀 Próximos Pasos Recomendados

1. Configurar RLS en Supabase Dashboard
2. Implementar autenticación del lado del servidor
3. Considerar hacer el repositorio privado si es necesario
4. Monitorear accesos no autorizados en logs
