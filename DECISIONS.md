# Decisiones técnicas

Cada decisión indica el contexto, la opción elegida, las alternativas consideradas y quién la propuso (yo o la IA). Las decisiones que tomó la IA y acepté también están aquí, con mi justificación.

---

## D01 · React Native CLI en lugar de Expo
- **Contexto:** la indicación pide usar CLI en la medida de lo posible, con enfoque en Android. Confirmado por correo.
- **Decisión:** proyecto móvil con React Native CLI.
- **Por qué:** control directo de `android/` (Gradle, manifest, firma) y del bundler Metro, como en un proyecto empresarial.
- **Alternativa:** Expo (la uso en mi app Mi Devocional). Habría acelerado builds, pero oculta la capa nativa que el equipo quiere evaluar.
- **Propuso:** requisito del cliente.

## D02 · Un repositorio, dos apps y un `core/` compartido
- **Decisión:** `mobile/` y `web/` independientes; `core/` con dominio, validaciones, estado y API; `design/tokens.css` compartido.
- **Por qué:** comparto lo que cambia por razones de negocio (reglas del carrito, validaciones, tipos, estado) para que un cambio aplique a ambas plataformas. No comparto componentes de UI porque móvil y web tienen primitivas y patrones de interacción distintos.
- **Alternativas:**
  - `react-native-web`: una sola UI, pero con riesgo alto de configuración con React Native CLI y una experiencia web limitada.
  - Repositorios separados: duplicación de lógica y riesgo de desalinear reglas.
- **Sin npm workspaces:** el hoisting de dependencias rompe el autolinking de React Native CLI. `core/` se resuelve con `watchFolders`/`nodeModulesPaths` en Metro, alias y `dedupe` en Vite, y `paths` en TypeScript.
- **Plan B documentado:** si la resolución de `core/` hubiera bloqueado más de una hora, copiarlo dentro de cada app.
- **Propuso:** yo.

## D03 · Redux Toolkit + RTK Query
- **Decisión:** Redux Toolkit para el estado del cliente (carrito, checkout) y RTK Query para el catálogo.
- **Por qué:** la vacante menciona Redux primero y es el estándar en apps React Native empresariales. RTK Query da caché por endpoint y deduplica peticiones, lo que cubre el requisito de evitar llamadas innecesarias sin otra librería. Un solo store y Redux DevTools.
- **Alternativa:** Zustand + TanStack Query, más ligera; es lo que uso en Mi Devocional. Como la lógica vive en funciones puras de `core/`, cambiar de gestor de estado solo afectaría una capa.
- **Propuso:** yo.

## D04 · Zod como fuente única de tipos y validación
- **Decisión:** schemas de Zod centralizados en `core/`; los tipos se derivan con `z.infer`.
- **Dónde valida:** respuesta de la API, carrito rehidratado del storage y formulario de checkout.
- **Por qué:** TypeScript solo valida en compilación; los datos externos (API, storage) llegan en tiempo de ejecución y pueden venir mal.
- **Propuso:** yo.

## D05 · Dinero en centavos enteros
- **Decisión:** convertir el precio a centavos al entrar (`Math.round(price * 100)`), calcular siempre en enteros y formatear solo al mostrar.
- **Por qué:** TypeScript garantiza que el precio sea `number`, pero no evita errores de punto flotante (`0.1 + 0.2 !== 0.3`). Con enteros, los totales son exactos.
- **Propuso:** yo.

## D06 · Detalle sin llamada extra a la API
- **Decisión:** el detalle lee el producto de la caché del listado con `selectFromResult`. Solo si no está en caché se llama a `/products/:id`.
- **Por qué:** el usuario siempre llega al detalle desde el listado; pedirlo otra vez es una llamada innecesaria.
- **Propuso:** yo.

## D07 · Lazy load con paginación en el cliente
- **Contexto:** la API devuelve 20 productos y no soporta paginación del servidor (solo `?limit`, sin offset).
- **Decisión:** una sola petición en caché, paginada en el cliente con `usePaginatedProducts` (8 por página), sobre una FlatList virtualizada. En web, `IntersectionObserver` e imágenes `loading="lazy"`.
- **Por qué:** no simular una paginación de servidor que la API no tiene. El hook aísla la estrategia: si la API paginara, solo cambia el hook.
- **Propuso:** yo.

## D08 · En cantidad 1, el − se convierte en Eliminar con confirmación
- **Decisión:** la cantidad mínima es 1. Cuando llega a 1, el botón − se reemplaza por un ícono de eliminar que pide confirmación. El botón Eliminar de la fila sigue disponible.
- **Por qué:** el usuario ve claramente que el siguiente toque quita el producto, y la confirmación evita borrados accidentales al tocar − varias veces. Es un patrón común en apps de compra.
- **Alternativas:** deshabilitar el − en 1 (más seguro, pero obliga a buscar otro botón) o eliminar sin confirmar (rápido, pero propenso a errores).
- **Regla de dominio:** `decreaseQuantity` nunca baja de 1; la eliminación siempre es una acción explícita (`removeItem`). La UI decide qué botón mostrar; el dominio no cambia.
- **Propuso:** yo.

## D09 · Uniwind con tokens compartidos
- **Decisión:** Uniwind en móvil y Tailwind 4 en web, ambos leyendo `design/tokens.css`.
- **Por qué:** mismo lenguaje de utilidades en las dos apps y consistencia visual desde una sola fuente de tokens.
- **Propuso:** yo.

## D10 · Fuera de alcance: autenticación y perfil
- **Decisión:** no crear `auth/`, `profile/` ni pagos.
- **Por qué:** el reto no los pide; carpetas vacías serían código muerto.
- **Cómo lo agregaría:** `features/auth` con `authSlice` y `authApi` (inyectado en `baseApi` con `injectEndpoints`), token en almacenamiento seguro (Keychain/Keystore en móvil) y `prepareHeaders` en `baseApi` para el Bearer.
- **Propuso:** yo.

## Decisiones tomadas tras la revisión de riesgos de la IA (P01)

En P01, Claude Code revisó `CLAUDE.md` contra las versiones instaladas y señaló riesgos y ambigüedades. Estas son mis decisiones sobre cada uno.

## D11 · `core/` puede usar `@reduxjs/toolkit/query/react`
- **Contexto:** la regla 1 prohíbe React Native y DOM en `core/`, pero los hooks de RTK Query vienen de `@reduxjs/toolkit/query/react`.
- **Decisión:** permitirlo. `core/` sigue sin `react-native`, `react-dom`, JSX, `window` ni `document`.
- **Por qué:** React es agnóstico de plataforma y ambas apps son React. Generar los hooks una vez evita duplicar `createApi` en cada app y mantiene un solo store.
- **Alternativa (propuesta por la IA):** `createApi` sin React en `core/` y hooks generados en cada app. La descarté porque duplica la definición de la API y complica `createAppStore` sin ganar independencia real.
- **Propuso:** la IA planteó la pregunta; la decisión es mía y contraria a su recomendación.

## D12 · `formatPrice` determinista, sin `Intl`
- **Contexto:** la IA detectó que `Intl.NumberFormat('es-MX', { currency: 'USD' })` puede dar "USD 10.00" y variar entre Hermes, Node y navegadores.
- **Decisión:** formatear con aritmética entera: `$1,234.56`.
- **Por qué:** resultado idéntico en todas las plataformas y pruebas confiables.
- **Propuso:** riesgo detectado por la IA; solución mía.

## D13 · Íconos con Lucide
- **Decisión:** `react-native-svg` + `lucide-react-native` en móvil y `lucide-react` en web.
- **Por qué:** el mismo set de íconos en ambas plataformas, accesibles y ligeros. Era una dependencia faltante detectada por la IA.
- **Propuso:** la IA señaló la falta; yo elegí la librería.

## D14 · Colores que exigen string en JS
- **Decisión:** las props que requieren un color como string (`android_ripple`, `ActivityIndicator`, `shadowColor`, íconos) leen el valor del token desde JS; nunca un hex escrito a mano.
- **Propuso:** la IA detectó el conflicto con la regla de "nada de colores hardcodeados".

## D15 · Confirmación de eliminar por plataforma
- **Decisión:** `Alert.alert` nativo en móvil (hook `useConfirmRemoveItem`) y `ConfirmDialog` propio en web.
- **Por qué:** coherente con D02, que no comparte UI. En móvil, el diálogo nativo es accesible y familiar para el usuario.

## D16 · Sin deep links en móvil; fallback del detalle para web
- **Decisión:** no se configura linking en móvil. `getProductById` existe como fallback porque en web se puede abrir `/product/:id` directo.

## D17 · Caché de catálogo por sesión
- **Decisión:** "una sola llamada" es por sesión. La caché de RTK Query no se persiste; no hay modo offline del catálogo.
- **Por qué:** el carrito sí se persiste porque es estado del usuario; el catálogo es estado del servidor y debe estar fresco al abrir la app.

## D18 · Configuración compartida de TypeScript y dependencias de soporte
- **Decisión:** `strict: true` en ambas apps, ambas incluyen `../core`; en `core/` se usa `import type` y no `enum`. Zod se declara en las dos apps con la misma versión exacta. Se aprueban `@react-navigation/*`, `react-native-screens`, `babel-plugin-module-resolver`, `@tailwindcss/vite` y una versión de React Native Testing Library compatible con React 19.
- **Por qué:** la IA detectó que Zod solo existía como dependencia transitiva de otro paquete y que web no era estricto ni revisaba `core/`.

---

<!-- Plantilla para nuevas decisiones
## DXX · Título
- **Contexto:**
- **Decisión:**
- **Por qué:**
- **Alternativa:**
- **Propuso:** yo / IA (y por qué la acepté o la modifiqué)
-->
