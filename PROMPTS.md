# Bitácora de prompts

Herramientas: Claude Code en Visual Studio Code (desarrollo) y Claude en chat (planeación y redacción del contexto inicial).

Cada entrada documenta: el prompt, por qué lo escribí así, el análisis del resultado y lo que corregí manualmente. Los commits enlazan cada entrada con el código.

---

## P00 · Preparación del contexto (`CLAUDE.md`)
- **Herramienta:** Claude (chat), antes de abrir Claude Code.
- **Prompt (resumen):** analicé la prueba y las indicaciones adicionales, definí stack, arquitectura y reglas, y pedí ayuda para redactarlas en un `CLAUDE.md` que Claude Code lea en cada sesión.
- **Por qué:** dar el contexto una sola vez y por escrito evita repetir reglas en cada prompt y hace que el código generado sea consistente con mis decisiones.
- **Resultado:** `CLAUDE.md` con alcance, stack, estructura, reglas de arquitectura, negocio, nombres y forma de trabajo.
- **Revisión y correcciones manuales:**
  - Ajusté la propuesta de arquitectura inicial: quité `auth/`, `profile/` y pagos porque el reto no los pide (ver D10).
  - Corregí la idea de que TypeScript evita errores de cálculo: lo resuelven los centavos (D05).
  - Cambié "lazy load" de paginación de servidor a paginación en el cliente, porque la API no la soporta (D07).
- **Commit:** `docs: add project context for Claude Code`

---

## P01 · Verificar que la IA entendió el contexto y detectar riesgos
- **Herramienta:** Claude Code (VS Code), modo "Ask before edits".
- **Prompt:**
```
Lee CLAUDE.md completo. No escribas código todavía.
Resume en viñetas: 1) el alcance y lo que está fuera de alcance, 2) las reglas de arquitectura, 3) las reglas de dinero y validación, 4) cómo vas a evitar llamadas innecesarias a la API.
Luego dime qué parte de CLAUDE.md te parece ambigua o riesgosa para implementar con React Native CLI y la versión instalada en mobile/package.json.
```
- **Por qué lo escribí así:** antes de que la IA escriba código, quiero comprobar que entendió las reglas y que detecte riesgos contra las versiones reales instaladas, no contra lo que supone.
- **Resultado:** resumen correcto del alcance y las reglas, sin inventar funciones. Revisó `package.json`, Metro, Jest, TypeScript y Vite. Detectó riesgos reales:
  - Compatibilidad de Uniwind con RN 0.87.1 no confirmada.
  - Metro no lee los `paths` de TypeScript: el alias `@core` necesita Babel.
  - Zod solo existía como dependencia transitiva de otro paquete.
  - `Intl.NumberFormat` da resultados distintos entre plataformas.
  - Web no tenía `strict` ni incluía `core/`.
  - Faltaba una librería de íconos.
- **Análisis:** respuesta útil; encontró problemas que yo no había considerado (Zod transitivo, `Intl` en Hermes, alias en Metro).
- **Decisiones y correcciones mías:**
  - Rechacé su recomendación de no usar React en `core/` (D11).
  - Cambié `formatPrice` a un formato determinista (D12).
  - Elegí Lucide para íconos (D13).
  - Definí la excepción de colores en JS (D14), la confirmación por plataforma (D15), el alcance de deep links (D16) y la caché por sesión (D17).
  - Actualicé `CLAUDE.md` y `DECISIONS.md` con todo lo anterior antes de pedir el primer plan.
- **Verificación:** no generó archivos (era el objetivo).
- **Commit:** `docs: agrega contexto del proyecto, registro de decisiones y bitácora de prompts (P00-P01)`

---

## P02 · Resolver `core/` compartido en Metro, Vite, TypeScript y Jest
- **Herramienta:** Claude Code, Plan mode y luego "Ask before edits".
- **Prompt:**
```
Respondí tus preguntas del análisis anterior actualizando CLAUDE.md (secciones 2, 3, 4, 5 y 7) y DECISIONS.md (D11 a D18). Reléelos antes de seguir.

Resumen de mis decisiones:
- Uniwind: verifica compatibilidad con RN 0.87.1 y si su CSS puede importar ../design/tokens.css. Si no es compatible, detente y dame evidencia y alternativas.
- Íconos: react-native-svg + lucide-react-native en móvil, lucide-react en web.
- Dependencias de soporte aprobadas (sección 2). Zod declarado en ambas apps con la misma versión exacta.
- core/ SÍ puede usar @reduxjs/toolkit/query/react (D11). No acepto la recomendación de generar hooks por app: duplica createApi y complica el store.
- formatPrice determinista sin Intl (D12).

Ahora haz el P02: configura la resolución de core/ y design/ en ambas apps (Metro con watchFolders, nodeModulesPaths y babel-plugin-module-resolver; Vite con alias y dedupe; tsconfig strict en ambas incluyendo ../core; core/tsconfig.json solo para el editor; Jest de mobile con roots en ../core) y el package.json de la raíz con lint, typecheck y test.
Como prueba de humo crea solo core/shared/money.ts con toCents, e impórtalo desde App.tsx de mobile y web mostrando toCents(109.95).
Primero dame el plan con archivos a crear o modificar y por qué. No instales Uniwind todavía; eso es el P03.
Al terminar corre typecheck en ambas apps y explícame cómo se resuelve un import de "zod" hecho desde un archivo dentro de core/.
```
- **Por qué lo escribí así:** compartir `core/` entre React Native CLI y Vite sin workspaces era el mayor riesgo técnico. Lo aislé con una prueba de humo mínima (`toCents`) antes de construir encima, y pedí el plan primero para revisarlo.
- **Revisión del plan:** lo aprobé con dos condiciones mías: lint de `core/` con límite de 15 minutos (si no, pasa al prompt de calidad) y un `.nvmrc` con Node 22, porque la IA detectó que RN 0.87 pide Node ≥ 22 y yo tenía Node 20.
- **Resultado:** Metro (`watchFolders`, `nodeModulesPaths`), Babel (alias `@core`), Jest (`roots`, `modulePaths`), Vite (alias, `dedupe`, `server.fs.allow`), `tsconfig` estricto en ambas apps, `core/tsconfig.json` para el editor y `package.json` raíz con `lint`, `typecheck` y `test`.
- **Análisis:**
  - Verificó cada herramienta por separado con archivos temporales que luego borró.
  - Encontró que `vite build` pasa sin `dedupe` pero el dev server falla: no confió solo en el build.
  - **Hallazgo clave:** el bundle de Metro falla con Zod 4 aunque Jest pase (D19). Lo reprodujo con la plantilla original para demostrar que no era culpa de la configuración y propuso un plugin en lugar de instalarlo sin permiso.
  - Detectó que la config de ESLint de RN no prohíbe `any` ni `@ts-ignore`, como pide `CLAUDE.md`.
- **Prompt de seguimiento:**
```
Apruebo @babel/plugin-transform-export-namespace-from@7.29.7 exacto como devDependency de mobile, agregado a plugins de babel.config.js. [...] Después de agregarlo, verifica de nuevo con un archivo temporal en core/ que importe zod que el bundle de Metro se genera sin error, y bórralo.
También aprueba borrar los archivos huérfanos de la plantilla [...]. npm audit: no lo toques; lo documento como deuda conocida. Las reglas de lint para any y @ts-ignore quedan para el prompt de calidad. Al terminar corre typecheck, lint y test otra vez y dame el resultado. No hagas commit.
```
- **Decisiones y correcciones mías:**
  - Aprobé el plugin de Babel con versión exacta y pedí verificarlo con el bundle real (D19).
  - Pedí borrar los archivos huérfanos de la plantilla.
  - Decidí no tocar `npm audit` (D20) y dejar las reglas de `any` y `@ts-ignore` para el prompt de calidad.
  - Le pedí no hacer commit, para revisar los cambios yo antes.
- **Verificación propia:**
  - `typecheck`, `lint` y `test` en verde.
  - Reinicié Metro con `--reset-cache` (cambió la configuración de Babel) y recargué la app.
  - **Android (emulador, RN 0.87.1 + Hermes):** muestra `toCents(109.95) = 10995`.
  - **Web (Vite dev server, `localhost:5173`):** muestra `toCents(109.95) = 10995`.

> ### ✅ Hito: `core/` compartido validado en ambas plataformas
> La misma función de `core/shared/money.ts`, que vive **fuera** de `mobile/` y de `web/`, se ejecuta en Android y en el navegador. Con esto quedó probada la decisión de arquitectura más arriesgada del proyecto (D02): un solo dominio compartido entre React Native CLI y React + Vite, **sin npm workspaces**, resuelto en Metro, Babel, Jest, Vite y TypeScript.
> A partir de aquí, cualquier regla de negocio que se agregue a `core/` (carrito, validaciones, estado) llega a las dos apps sin duplicar código.

- **Commit:** `feat(core): configura core/ compartido en Metro, Vite, TypeScript y Jest (P02)`

---

## P-D · Diseño en Claude Design
- **Herramienta:** Claude Design.
- **Prompt (resumen):** brief con el contexto de la prueba, los datos reales de fakestoreapi (20 productos, 4 categorías, títulos largos, imágenes con fondo blanco), las 4 pantallas móviles con todos sus estados, 4 pantallas web, hoja de componentes con los nombres de `CLAUDE.md` y los nombres exactos de tokens para `@theme` de Tailwind 4. Pedí un estilo inspirado en tiendas de catálogo mexicanas **sin usar logo, nombre ni imágenes de ninguna marca real**.
- **Por qué:** diseñar primero y construir después; Claude Code traduce mejor un diseño definido que diseñar a ciegas. Los nombres de componentes y tokens coinciden con el código desde el inicio.
- **Resultado:** "Mi Surtido": 20 tableros (listado con cargando, cargando más, error y sin resultados; detalle y agregado; carrito, vacío y confirmación; checkout, error de campo, procesando y confirmado; 4 pantallas web; componentes; especificaciones; tokens) y `tokens.css` con contraste AA verificado.
- **Revisión y correcciones:**
  - El carrito mostraba el − deshabilitado en cantidad 1, contrario a D08. Pedí cambiarlo por el ícono de eliminar y agregar el tablero de confirmación.
  - Anoté tres riesgos para React Native: fuentes múltiples en `--font-sans`, sintaxis `rgb()` con espacios y `box-shadow`. Se verificaron en P03.
  - Las especificaciones fijan la tarjeta en 158 × 350 dp: permite `getItemLayout` en la FlatList.
- **Entregables en el repo:** `design/tokens.css`, `design/reference/` (código fuente de los 20 tableros, con medidas exactas) y `design/screens/` (capturas PNG).
- **Commit:** `design: agrega tokens, referencia de tableros y capturas de Claude Design`

---

## P03 · Estilos con Uniwind (móvil) y Tailwind 4 (web) desde tokens compartidos
- **Herramienta:** Claude Code, Plan mode.
- **Prompt:**
```
Reto técnico: lee CLAUDE.md y DECISIONS.md antes de empezar. Ya estoy en Node 22 (ver .nvmrc).

El diseño ya está en el repo (commit propio, hecho en Claude Design):
- design/tokens.css: tokens en formato @theme de Tailwind 4. Es la fuente de verdad visual.
- design/reference/: código fuente de los 20 tableros, con medidas y textos exactos. Lee primero design/reference/README.md, 15-Specs.html y 14-Componentes.html.
- design/screens/: capturas PNG de cada pantalla.

Tarea P03: configurar estilos en ambas apps leyendo design/tokens.css.
1. Mobile, Uniwind: ANTES de instalar, verifica compatibilidad con RN 0.87.1 y React Native CLI (sin Expo). Verifica que el CSS de mobile pueda importar ../design/tokens.css. Verifica en React Native: a) --font-sans con varias familias, b) sombras con rgb() y box-shadow de varias capas, c) escalas --text-*--font-weight y --line-height. Prueba cómo leer un token desde JS (D14) con un ActivityIndicator.
2. Web, Tailwind CSS 4 con @tailwindcss/vite: index.css con @import "tailwindcss" y el import de los tokens.
3. Prueba de humo en ambas App.tsx: tarjeta, título, precio y botón con clases de los tokens. Sin colores hardcodeados.
Primero dame el plan. No instales nada sin mi aprobación. Al terminar: typecheck, lint y test, y dime qué debo ver para comparar con design/screens/m1-listado.png. No hagas commit.
```
- **Por qué lo escribí así:** verificar compatibilidad **antes** de instalar una librería joven, y convertir los tres riesgos del diseño en preguntas concretas para que la IA las pruebe con evidencia en lugar de suponer.
- **Preguntas de la IA durante el plan y mis respuestas:**
  - Sombras: detectó que `boxShadow` no se dibuja en Android < 9 y el `minSdk` es 24. Decidí `boxShadow` + respaldo con `elevation` para API < 28 (D21).
  - Ubicación: `App.tsx` y `global.css` pasaron a `mobile/src/app/`, como dice `CLAUDE.md`, con `@source` para escanear todo `src/`.
- **Resultado:** Uniwind 1.12.2 y Tailwind 4.3.3 con versiones exactas. `--font-sans` sobrescrito por plataforma en móvil. Uniwind traduce `shadow-card` a `boxShadow` con las dos capas. Las dos formas de leer color desde JS funcionan.
- **Hallazgos de la IA:**
  - **Choque de nombres** `text-price`: el token de tamaño y el de color generan la misma clase, y Tailwind aplica solo el color. Lo comprobó compilando (D22).
  - TypeScript 6 exige declarar los `import './global.css'`; Uniwind publica TypeScript sin compilar y Jest necesita transformarlo.
- **Problema en la verificación visual:** la web se veía igual al diseño, pero Android mostraba **pantalla negra**.
  - Le pedí diagnosticar antes de cambiar nada. Con `adb exec-out screencap`, `uiautomator dump` y `logcat` demostró que React no había dibujado ninguna vista (no era texto negro sobre negro) y encontró `Unable to dispatch touch events to JS as the React instance has not been attached`.
  - Descartó con evidencia un bundle viejo en `android/` y el modo oscuro.
  - Causa más probable: una instancia de React rota tras un error de resolución anterior al reinicio de Metro. Se resolvió con un reinicio en frío de la app (`am force-stop`), **sin cambiar código**. Fue honesta en que es la causa más probable, no confirmada.
- **Correcciones mías:**
  - Renombrar `--text-price` a `--text-price-md` (D22).
  - Exigir el respaldo de `elevation` que había quedado fuera (D21), con prueba unitaria.
- **Verificación propia:**
  - `typecheck`, `lint`, `test` (4/4) y build de web en verde.
  - **Web:** fondo, tarjeta con sombra, precio naranja grande y botón azul, igual que `design/screens/m1-listado.png`.
  - **Android (API 35):** el mismo resultado, con `boxShadow` visible y los dos spinners azules.
- **Commit:** `feat(ui): configura Uniwind y Tailwind 4 con tokens de diseño compartidos (P03)`

---

## P04 + P05 · Dominio, estado y persistencia en `core/`
- **Herramienta:** Claude Code, Plan mode.
- **Por qué los junté:** son lógica pura con pruebas y sin interfaz; el riesgo de hacerlos juntos es bajo y ahorra una ronda de revisión.
- **Prompt (resumen; texto completo en el historial de la sesión):**
```
P04+P05: dominio, estado y persistencia en core/, sin UI. Sigue CLAUDE.md (secciones 4, 5 y 6) y DECISIONS.md.
1. Datos reales primero: obtén con curl una muestra real de la API y guarda 3 productos como fixture. Los schemas se escriben contra esa respuesta real.
2. Dominio (funciones puras): money (formatPrice sin Intl), product.schema, categoryLabels ("jewelery" mal escrito en la API: solo cambia la etiqueta), catalog.selectors (filtro sin mayúsculas ni acentos), cart.schema con version, cart.rules (1..99), checkout.schema.
3. Estado: RTK y react-redux exactos; baseApi + catalogApi con getProducts y getProductById; cartSlice que delega en cart.rules; checkoutSlice con confirmOrder (retraso y número de orden inyectables); createAppStore(storageAdapter); cartPersistence con listener que rehidrata validando con Zod.
4. Pruebas: money, rules, selectors, filtro, schemas con respuestas inválidas, persistencia y checkout con timers falsos.
5. Verificación: bundle de Metro importando el store completo desde core/, y build de web.
Primero el plan con la lista de casos de prueba. No hagas commit.
```
- **Por qué lo escribí así:**
  - **"Datos reales primero":** que los schemas se escriban contra la respuesta real de la API, no contra lo que la IA supone que devuelve.
  - **Retraso y número de orden inyectables:** que el checkout se pueda probar sin esperas reales ni números aleatorios.
  - **Bundle real de Metro:** después de lo de Zod en P02, pasar las pruebas ya no basta como verificación.
- **Hallazgos de la IA en el plan:**
  - `/products/999` responde `200` con cuerpo vacío, no 404: se trata como `PRODUCT_NOT_FOUND`.
  - Validar con `parse` dentro de `transformResponse` produce un error no manejado en RTK: propuso `rawResponseSchema` (D24).
  - El tablero de compra confirmada necesita datos que se pierden al vaciar el carrito (D25).
  - `core/` no puede detectar el entorno en ambas plataformas (D26).
- **Mis decisiones:** aprobé A, B y C; elegí RTK 2.12.0 en lugar de 2.13.0 por ser más probada (D27).
- **Resultado:** **109 pruebas en 13 archivos** (105 nuevas en `core/`). Typecheck y lint en verde. Bundle de Metro de 721 KB con el store completo. Build de web de 390 KB con un import temporal del store (el build normal no importaba `core/` todavía, así que no probaba nada; la IA lo detectó y lo corrigió).
- **Bug encontrado por las pruebas:** las reglas del carrito devolvían arreglos nuevos sin cambios reales, lo que provocaba escrituras innecesarias en el storage y renders de más. Corregido y probado con `toBe` (D28).
- **Otros ajustes de la IA:** `immer` y `react-redux` agregados a `transformIgnorePatterns` de Jest (el preset de RN resuelve su versión ESM), y timers falsos en las pruebas de RTK Query para evitar avisos al cerrar el entorno.
- **Revisión mía:**
  - Acepté el riesgo documentado: si se agrega un producto antes de terminar de leer el carrito guardado, este lo reemplaza. En la práctica, leer el storage local termina mucho antes de que cargue el catálogo.
  - Revisé los textos de validación: "Ingresa un correo válido" y el del teléfono vienen del diseño; "Ingresa tu nombre" y el máximo de 80 caracteres los propuso la IA y los acepté.
- **Verificación propia:** corrí `npm test` y vi las 109 pruebas en verde.
- **Commit:** `feat(core): agrega dominio, estado y persistencia del carrito con pruebas (P04-P05)`

---

## P06 · Dependencias nativas, store y componentes atómicos de móvil
- **Herramienta:** Claude Code, Plan mode.
- **Prompt (resumen):**
```
P06: dependencias nativas, store y componentes atómicos de mobile. Sigue CLAUDE.md (secciones 7, 8 y 9) y DECISIONS.md.
1. Dependencias nativas, todas juntas para recompilar Android una sola vez (versión exacta, compatibles con RN 0.87.1 y Nueva Arquitectura; verifica peerDependencies antes): react-native-svg, lucide-react-native, async-storage, react-navigation (native + native-stack), react-native-screens, y RNTL compatible con React 19.2.
2. Store: src/app/store.ts con createAppStore(asyncStorageAdapter, { isDevelopment: __DEV__ }), adaptador de AsyncStorage y hooks tipados. Provider + SafeAreaProvider.
3. Componentes según design/reference/14-Componentes.html, 15-Specs.html y la captura de la hoja de componentes: atoms (Button, AppText, Price, Badge, IconButton, Spinner, ProductImage, TextField) y molecules (QuantityStepper con eliminar en cantidad 1, SearchBar, CategoryChips, ErrorState, EmptyState, ProductCardSkeleton).
4. Pantalla temporal ComponentGallery para comparar con el diseño.
5. Pruebas RNTL: QuantityStepper, ErrorState y Button.
Primero el plan con versiones exactas. No hagas commit.
```
- **Por qué lo escribí así:** todas las dependencias nativas en un solo prompt para **recompilar Android una sola vez**. Y una galería temporal para validar visualmente cada componente contra el diseño **antes** de armar pantallas.
- **Preguntas de la IA y mis respuestas:**
  - AsyncStorage: 3.1.1 mantenida vs 2.2.0 sin cambios en Gradle → elegí 3.1.1 (D29).
  - RNTL: 13.3.3 vs 14.0.1 → 13.3.3 (D30).
- **Resultado:** 8 atoms y 6 molecules; store con AsyncStorage conectado; **119 pruebas en 16 archivos** (10 nuevas de RNTL). Bundles de Metro para Android **y para iOS** compilan.
- **Hallazgos de la IA durante la implementación:**
  - La documentación de AsyncStorage 3 estaba desactualizada: el artefacto ya está en Maven Central, sin tocar Gradle (D29).
  - react-native-screens 4.28 cambió la configuración de `MainActivity` (`RNScreensFragmentFactory`); la aplicó según su README actual.
  - Lucide publica `.mjs` que Jest no transforma: se mapeó a su build CommonJS.
  - Los colores del diseño que no son tokens se resolvieron con tokens y opacidades (D31).
- **Pendiente para P07:** el diseño de ErrorState y EmptyState difiere entre la hoja de componentes (botón md, título 16) y las pantallas 04 y 05 (botón lg, título 18).
- **Verificación propia:** recompilé Android y comparé la galería con `design/screens/hoja-de-componentes.png`.
- **Commit:** `feat(mobile): agrega componentes atómicos, store y dependencias nativas (P06)`

---

## P07 · Navegación, listado y detalle en móvil
- **Herramienta:** Claude Code, Plan mode.
- **Prompt (resumen; texto completo en el historial de la sesión):**
```
P07: navegación, listado y detalle de mobile. Sigue CLAUDE.md y DECISIONS.md, y el diseño de design/reference (listado, cargando, error, vacío, detalle, agregado).
Native stack tipado, header propio con botón de carrito y badge. Listado en FlatList de 2 columnas con paginación del lado del cliente sobre la caché, filtro por categoría y búsqueda con debounce. Detalle que lea el producto de la caché sin otra petición. Estados de cargando (skeleton), error con Reintentar y vacío. Pruebas de los hooks y de la tarjeta.
Primero el plan. No hagas commit.
```
- **Prompt de aprobación del plan (textual):**
```
Apruebo el plan completo y todos los puntos ⚠️:
- Tipos de navegación en shared/navigation (respeta la regla de dependencias).
- useQueryState en el detalle para solo leer la caché, con la prueba de fetch = 1 llamada.
- Header dentro de la lista con alto fijo de 148 para getItemLayout exacto.
- Ancho de tarjeta con useWindowDimensions.
- Pie "Cargando más" mientras hasMore, sin espera falsa.
- Colores del snackbar con tokens existentes (bg-text, text-primary-soft, shadow-card) y sin sombra en el header.
Procede. No hagas commit. Al terminar: typecheck, lint, test con número de pruebas, y cómo verifico yo en React Native DevTools que /products se llama una sola vez y que el detalle no hace otra petición.
```
- **Por qué lo escribí así:** el requisito "evitar llamadas innecesarias" no se cumple solo con decirlo, así que pedí **una prueba automatizada** (fetch = 1 llamada) **y** las instrucciones para comprobarlo yo en DevTools. Además, revisé uno por uno los puntos que la IA marcó con ⚠️ antes de aprobar.
- **Resultado:**
  - **Navegación:** native stack tipado (`shared/navigation/types.ts`), `AppHeader` propio y `CartHeaderButton` en `features/cart`. Carrito y checkout quedaron como pantallas temporales para P08.
  - **Listado:** `useProductListing` (query, categorías derivadas, filtro con `useMemo`, debounce de 300 ms) y `usePaginatedProducts` (genérico, 8 por página, se reinicia sin `useEffect`). `FlatList` de 2 columnas con `getItemLayout`, `initialNumToRender` 4, `windowSize` 5 y `removeClippedSubviews` solo en Android.
  - **Detalle:** `useQueryState` lee la caché; `getProductById` queda con `skip` y solo corre como respaldo (por ejemplo, un id que no está en la caché). Tiene estados de cargando, error con Reintentar y `notFound`; "Agregado ✓" 1.5 s y snackbar de 3 s.
  - **`core/`:** `hasApiErrorCode()`, para que la web no repita ese código.
  - **130 pruebas en 20 suites** (11 nuevas). Typecheck y lint en verde. El bundle de release de Android compila.
- **Decisiones de la IA que revisé y acepté:** `@react-navigation` en `transformIgnorePatterns` (publica ESM); StatusBar `light-content`; bordes con opacidad de tokens (criterio de D31); "Limpiar búsqueda" también regresa a "Todas", porque el mensaje vacío menciona la categoría; la tarjeta no muestra confirmación al agregar (el diseño no la define, la señal es el badge); "Volver al catálogo" usa `popToTop`.
- **Análisis / observaciones:**
  - Se eliminó `ComponentGallery.tsx`: era una herramienta temporal de P06 para la validación visual, ya reemplazada por las pantallas reales. Aprobé el borrado de forma manual (no di permiso general para `git rm`).
  - Al abrir DevTools apareció un `TransformError` en `ProductCard.tsx`. **Era un error viejo:** Metro compiló el archivo mientras la IA lo escribía. Limpié la consola, recargué con `r` y no volvió a aparecer.
  - Metro muestra un `WARN` de `ReactNativeFeatureFlags` que es interno de RN 0.87 y no viene del código del proyecto.
  - Las pruebas de Jest muestran `console.warn` de Uniwind porque en Jest no se compila el CSS. No afecta los resultados.
- **Verificación propia (emulador Android API 35 + React Native DevTools, pestaña Network):**
  - Al arrancar: **1 request**, `GET /products` con 200.
  - Después de abrir varios detalles, cambiar de categoría, buscar y limpiar, hacer scroll hasta el final y agregar 9 productos: **sigue en 1 request**. Nunca aparece `/products/:id`.
  - Captura de evidencia: `docs/evidencia/network-1-request.png`.
- **Commit:** `feat(mobile): agrega navegación, listado y detalle con caché única de productos (P07)`

---

## P08 · Carrito, checkout y compra confirmada en móvil
- **Herramienta:** Claude Code, Plan mode, con aprobación manual de cada edición.
- **Prompt:**
```
P08: carrito y checkout de mobile. Sigue CLAUDE.md y DECISIONS.md (en especial D08, D24, D25 y D32-D35), y los tableros de carrito, carrito vacío, confirmar eliminación, checkout y compra confirmada en design/reference/.

1. Carrito (reemplaza la pantalla temporal):
   - Lista de productos con imagen, título, precio unitario, QuantityStepper y subtotal por línea.
   - En cantidad 1, el botón "−" ofrece eliminar con confirmación Alert.alert (D08). Botón eliminar por línea con la misma confirmación.
   - Resumen: total de artículos y total a pagar, con los selectores de core/ (centavos + formatPrice). Nada de cálculos en la pantalla.
   - EmptyState de carrito con botón para volver al catálogo (resuelve la diferencia de EmptyState pendiente de P06/P07).
   - Botón "Continuar al pago" deshabilitado si el carrito está vacío.
2. Checkout (reemplaza la pantalla temporal):
   - Resumen del pedido (artículos y total) y formulario con React Hook Form + checkout.schema de core/ vía zodResolver. Instala react-hook-form y @hookform/resolvers en versión exacta, compatibles con Zod 4.6.7 (verifica peerDependencies). Son solo JS: no requieren recompilar Android.
   - Teclados correctos por campo (email, phone-pad), "siguiente" entre campos, y que el teclado no tape el botón en Android.
   - "Confirmar compra" despacha confirmOrder de checkoutSlice: estado procesando, botón deshabilitado contra doble envío, y botón atrás de Android y gesto de regreso bloqueados mientras procesa.
3. Compra confirmada:
   - Pantalla que lee confirmedOrder (D25): número de orden, artículos y total. El carrito queda vacío y persistido vacío.
   - "Seguir comprando" regresa al catálogo con reset del stack, para que atrás no vuelva al checkout.
4. Pruebas RNTL: carrito (incrementar, decrementar, eliminar con confirmación, totales), validación del formulario, flujo de confirmación con timers falsos que deja el carrito vacío.

Primero el plan, con las versiones exactas y las preguntas que tengas. No hagas commit. Al terminar: typecheck, lint, test con número de pruebas y qué revisar en el emulador.
```
- **Por qué lo escribí así:**
  - **"Nada de cálculos en la pantalla":** todos los totales salen de `core/`, para que la web use exactamente los mismos.
  - **Bloquear atrás y el doble envío:** sin eso, el usuario podría salir a medio proceso o confirmar dos veces.
  - **Reset del stack:** sin él, atrás desde la confirmación regresaría al checkout de un carrito que ya no existe.
- **Preguntas de la IA y mis respuestas:**
  - **Textos:** la IA detectó que los textos de mi prompt ("Continuar al pago", "Seguir comprando", "Carrito") no coincidían con el diseño. Elegí los del diseño ("Ir a checkout", "Volver al catálogo", "Mi carrito"), porque el diseño es la fuente de verdad.
  - **react-hook-form:** 7.88.0 en lugar de 7.90.0 (3 días publicada), con `@hookform/resolvers` 5.9.1 (soporta Zod 4). Mismo criterio que D27 y D30 (D36).
  - **EmptyState del carrito:** la hoja de componentes y la pantalla 10 diferían. Elegí la pantalla (círculo de 96), con la regla "la pantalla gana sobre la hoja" (D37).
- **Revisión del plan (mi corrección):** detecté que al terminar `confirmOrder` el carrito se vacía **antes** de `navigation.reset`, así que el checkout podía mostrar "Productos 0 / $0.00" por un instante. Pedí verificarlo y cubrirlo con una prueba.
  - **Resultado:** el bug era real y más grave de lo que suponía: **el botón "Confirmar compra" también se volvía a habilitar** en ese instante, lo que abría la puerta a un doble envío.
  - **Corrección:** el checkout se considera ocupado en `processing` **y** `confirmed`, y `useOrderSummary` conserva el resumen tomado al enviar (D38).
- **Resultado:**
  - **`core/`:** `getLineTotalInCents`, para que el subtotal por línea tampoco se calcule en la pantalla.
  - **Carrito:** `useCart`, `useConfirmRemoveItem` (Alert.alert, D08), `CartItemRow` (memo) y `CartSummary`. Muestra un spinner mientras se lee el carrito guardado, para que no aparezca "vacío" por un instante.
  - **Checkout:** `useCheckoutForm` (RHF + `zodResolver(CheckoutContactSchema)`), `ContactForm` con teclados por campo y "siguiente" con `setFocus`, `KeyboardAvoidingView` y `useBlockBackWhileProcessing` (BackHandler + `gestureEnabled: false`).
  - **Compra confirmada:** lee `confirmedOrder`. El `reset` reutiliza la ruta del catálogo, que conserva búsqueda, filtro y scroll.
  - **147 pruebas en 23 suites** (17 nuevas). Typecheck y lint en verde. El bundle de release de Android compila con las librerías nuevas.
- **Análisis de lo que hizo la IA:**
  - **Descartó `usePreventRemove`** porque su estado se actualiza en un efecto posterior y podía bloquear el `reset` justo al terminar la compra. BackHandler + `gestureEnabled` no interfieren.
  - **Mutation testing:** para las dos pruebas clave (resumen congelado y atrás bloqueado), quitó la protección a propósito, comprobó que las pruebas **fallaban** y luego la restauró. Así se demuestra que las pruebas detectan el problema.
  - **Cambio respecto al plan:** `resetCheckout` se despacha solo al desmontar la pantalla de confirmación, no al tocar el botón; si no, el contenido desaparecía durante la animación de salida. Lo acepté.
  - **Atrás de Android en Jest** (que corre como iOS): lo simuló con el mismo orden de listeners de Android.
  - `npm install` reporta un aviso de seguridad de `braces` (dependencia de desarrollo, no llega a la app). Se revisa en P11.
- **Verificación propia (emulador Android API 35):**
  - Flujo completo: agregar → carrito (+, −, eliminar con confirmación) → checkout → errores de validación → confirmar → compra confirmada.
  - El teclado no tapa "Confirmar compra" (sin la librería extra que estaba como riesgo).
  - "Procesando…" se ve con el resumen intacto, sin bajar a $0.00.
  - Atrás desde la confirmación lleva al catálogo.
  - Después de `adb shell am force-stop com.minishop` y reabrir, el carrito sigue vacío y el badge no muestra número.
- **Commit:** `feat(mobile): agrega carrito, checkout y compra confirmada con pruebas de flujo (P08)`

---

## P09 · Revisión final de Android y APK de release
- **Herramienta:** Claude Code, Plan mode.
- **Prompt:**
```
P09: revisión final de Android y APK de release. Sigue CLAUDE.md y DECISIONS.md (en especial D34 y su riesgo con la fuente agrandada).

1. Fuente del sistema agrandada:
   - Revisa todas las pantallas con font_scale 1.3 y 2.0 (adb shell settings put system font_scale X). Dame los comandos para que yo lo pruebe en el emulador.
   - Riesgo conocido: el header del listado tiene alto fijo de 148 para getItemLayout (D34). Propón cómo evitar que recorte texto sin perder getItemLayout exacto (por ejemplo, calcular el alto con PixelRatio.getFontScale() o limitar maxFontSizeMultiplier solo donde se justifique). No quiero desactivar el escalado de fuente en toda la app: es accesibilidad.
   - Revisa también la tarjeta del producto (alto fijo de 350) con la misma lógica.
2. Pantallas pequeñas: revisa que el listado, el carrito y el checkout funcionen en un ancho de 360 dp.
3. APK de release:
   - Genera un APK de release instalable (./gradlew assembleRelease). Explícame cómo se firma hoy (la plantilla usa el keystore de debug) y si eso es aceptable para una prueba técnica, documentándolo como decisión.
   - Revisa minificación/ProGuard, Hermes y el tamaño del APK; propón si conviene activar algo y por qué, sin agregar dependencias.
   - Confirma que el nombre de la app y el ícono son coherentes, sin cambiar el package com.minishop.
4. Dame los pasos para probar con el APK de release el estado de error con modo avión (en debug no se puede porque el modo avión corta la conexión con Metro) y el botón Reintentar.
5. Borrador de la sección Troubleshooting del README con los problemas reales que tuvimos: Metro en otro puerto o colgado, pantalla negra por instancia de React rota (adb shell am force-stop com.minishop), ejecutar Metro desde mobile/ y no desde la raíz, error viejo de TransformError tras ediciones, modo avión en debug, y el WARN de ReactNativeFeatureFlags. Guárdalo en docs/troubleshooting.md.

Primero el plan y tus preguntas. No hagas commit. Al terminar: typecheck, lint, test con número de pruebas y suites, ruta y tamaño del APK, y la lista de qué revisar en el emulador.
```
- **Por qué lo escribí así:**
  - **"No desactivar el escalado de fuente en toda la app":** es el atajo más común (`allowFontScaling={false}` global) y perjudica la accesibilidad.
  - **APK de release:** que el evaluador instale la app sin compilar nada, y poder probar el estado de error sin depender de Metro.
- **Antecedente:** intenté probar el estado de error con modo avión en debug y la app no arrancó ("Unable to load script"), porque el modo avión también corta la conexión con Metro. Por eso la prueba se movió al APK de release.
- **Preguntas de la IA y mis respuestas:**
  - **Tope de fuente en la tarjeta:** 1.3 (cubre el ajuste "Más grande" de Android antes de la 14). Solo en la tarjeta; detalle, carrito y checkout escalan sin límite.
  - **APK:** R8 + `shrinkResources` con **un solo APK universal**, para que el evaluador no tenga que elegir arquitectura.
  - **Marca:** elegí **"MiniShop"** en todos lados (el diseño decía "Mi Surtido"), para que coincida con el repo, el package y el launcher. Pedí buscar todas las apariciones antes de cambiarlas.
  - **Tarjeta a 2.0:** la IA descubrió que `maxFontSizeMultiplier` no limita el interlineado en RN 0.87/Fabric. Elegí escalar a mano solo en la tarjeta.
- **Condiciones de tiempo que agregué al aprobar:** máximo 2 intentos para resolver un crash de R8 (si no, desactivarlo y documentarlo); capturas de fuente solo de listado y checkout; dejar el emulador restaurado.
- **Resultado:**
  - **Header del listado medido con `onLayout`** en lugar de alto fijo; `getItemLayout` usa esa medida y sigue exacto.
  - **Tarjeta con alto calculado** según la escala de fuente (350 a 1.0, 380 desde 1.3), escalando sus textos con `allowFontScaling={false}` y tamaño del token × min(escala, 1.3) (`typography.ts`, prop `fixedFontScale`).
  - **Altos mínimos en lugar de fijos** en botones, badges, chips, buscador, campos, header y barras inferiores (a 1.0 miden igual). Subtotal y total del carrito bajan de línea si no caben.
  - **APK de release:** 78.0 MB → **72.6 MB con R8** (el código Java/Kotlin bajó de 17 a 3.2 MB; ~62 MB son librerías nativas de 4 arquitecturas). Bundle de Hermes en bytecode. Recorrido completo en release sin errores en logcat.
  - **Marca "MiniShop"** en header, prueba del checkout, comentario de `tokens.css` y `<title>` de la web. Ícono adaptativo vectorial con variante monocromática.
  - `docs/troubleshooting.md` y 6 capturas en `docs/evidencia/fuente/`.
  - **153 pruebas en 24 suites.** Typecheck y lint en verde.
- **Hallazgos al probar:**
  - **Crash de R8:** al cambiar el tamaño de fuente con la app abierta, Android recrea la Activity y la app se cerraba ("Screen fragments should never be restored"), porque R8 renombraba las clases de `react-native-screens`. Se resolvió **al primer intento** con una regla `-keepnames` en `proguard-rules.pro`, verificada en el archivo de mapeo.
  - **`maxFontSizeMultiplier` no limita el `lineHeight`** en RN 0.87 en Android: medido con uiautomator, a 2.0 el título y el botón "Agregar" se recortaban.
- **Corrección manual que pedí:** durante el error de red el contador decía "0 productos". Pedí ocultarlo en los estados de error y de carga.
- **Verificación propia:** estado de error con modo avión usando el APK de release: aparece "Reintentar" y, al volver la red, carga el listado. Revisé el ícono en el launcher.
- **Commit:** `feat(android): soporta fuente agrandada, APK de release con R8 y marca MiniShop (P09)`

---

## P10 · App web reutilizando `core/`
- **Herramienta:** Claude Code, Plan mode.
- **Prompt:**
```
P10: app web en web/ (Vite + React + Tailwind 4) reutilizando core/. Sigue CLAUDE.md y DECISIONS.md, y los tableros web de design/reference/ (Web-*). La marca es "MiniShop" (D42).

0. Reutilización (lo primero del plan): revisa los hooks de mobile/src (useProductListing, usePaginatedProducts, useDebouncedValue, useOrderSummary, useProductDetail y los de cart/checkout). Los que sean React puro (sin react-native ni react-navigation) propón moverlos a core/ para que web y mobile usen el mismo código; los que dependan de la plataforma, sepáralos en una parte compartida y un adaptador por plataforma. Dime cuáles mueves, cuáles no y por qué. Las pruebas existentes de mobile deben seguir pasando.

1. Store: createAppStore(localStorageAdapter, { isDevelopment: import.meta.env.DEV }). El adaptador de localStorage implementa StorageAdapter de core/ y maneja errores (modo privado, cuota llena) sin romper la app.

2. Rutas con React Router (versión exacta, verifica compatibilidad con React 19): / (listado), /producto/:id (detalle), /carrito, /checkout y /compra-confirmada.
   - El detalle por URL directa (sin caché) usa el respaldo getProductById (D32) y muestra notFound si no existe.
   - /checkout con el carrito vacío redirige a /carrito.
   - /compra-confirmada sin confirmedOrder (por ejemplo, al recargar) redirige a /.
   - 404 para rutas desconocidas.

3. Pantallas según los tableros web: listado con grid responsivo (columnas según el ancho), búsqueda, chips de categoría, skeleton, error con Reintentar y vacío; detalle; carrito con ConfirmDialog accesible para eliminar (role="dialog", foco atrapado, Esc cierra, el foco regresa al botón que lo abrió); checkout con React Hook Form + zodResolver usando checkout.schema de core/ (mismas versiones exactas que mobile: react-hook-form 7.88.0 y @hookform/resolvers 5.9.1); compra confirmada.
   - Mismas reglas que mobile: D08 (eliminar en cantidad 1 con confirmación), D38 (resumen congelado mientras procesa) y doble envío bloqueado.

4. Optimización: "cargar más" con IntersectionObserver sobre usePaginatedProducts, imágenes con loading="lazy", width/height explícitos para evitar saltos de layout, y una sola petición a /products (verificable en la pestaña Network).

5. Accesibilidad básica: HTML semántico (header, main, nav, button reales), labels en los inputs, foco visible y alt en las imágenes.

6. Pruebas: propón si agregar Vitest + Testing Library con pocas pruebas clave (ConfirmDialog y flujo de checkout). Si la configuración es costosa, dímelo y lo decidimos.

Primero el plan, con versiones exactas y tus preguntas. No hagas commit. Al terminar: typecheck, lint, test con número de pruebas y suites, build de producción con su tamaño, y cómo verifico en Chrome DevTools que /products se llama una sola vez.
```
- **Por qué lo escribí así:**
  - **El punto 0 va primero** porque define cuánto código nuevo hay que escribir: es la prueba real de la arquitectura.
  - **URL directa y recarga:** son casos que solo existen en web; pensarlos demuestra que no se copió la app móvil.
  - **Mismas versiones y reglas que mobile** (D08, D38): las dos plataformas deben comportarse igual.
- **Plan de la IA:** casi todos los hooks pasan a `core/`; solo se quedan por plataforma la confirmación (`Alert` / `ConfirmDialog`) y el bloqueo de navegación (`BackHandler` / `useBlocker`). Además anticipó dos bugs propios de web: el guard de `/checkout` que, sin esperar la hidratación ni revisar `status`, sacaría al usuario al recargar o durante el estado intermedio de D38; y el `IntersectionObserver` que en pantallas anchas no vuelve a disparar si no se reconecta.
- **Mis respuestas:**
  - Rutas en español (`/producto/:id`, como `/carrito`). `CLAUDE.md` y `DECISIONS.md` los actualicé yo (D43).
  - Aprobé mover los hooks a `core/`, incluido `useCheckoutForm` (D44).
  - `ConfirmDialog` propio en lugar de `<dialog>` nativo, porque jsdom no implementa `showModal()` y la prueba del foco no probaría nada real (D45).
  - Vitest sí, y versiones de web fijadas a las instaladas.
  - **Orden para reducir riesgo:** primero mover los hooks y confirmar que las pruebas de mobile y el bundle de Metro siguen en verde; después construir la web.
- **Problema durante la implementación:** npm 10.9.9 truena (`TypeError: edgesOut`) al instalar Vitest 4.1.11, por el peer opcional `@vitejs/devtools` de Vite 8. La IA lo reprodujo en una copia aislada antes de proponer nada. Elegí resolver el lockfile **una sola vez con npm 11.6.2**: con ese lockfile, npm 10 hace `npm ci` y `npm install` sin error, sin `--force` ni `--legacy-peer-deps`, y conservando la versión aprobada.
- **Resultado:**
  - **Web completa** con React Router 7.18.4 (data router), Tailwind 4 con los mismos tokens, `lucide-react` 1.48.0 y RHF con el schema de `core/`.
  - Grid de 4/3/2 columnas, skeleton, error con Reintentar, vacío, "cargar más" con `IntersectionObserver`, imágenes `lazy` con tamaño explícito (la del detalle `eager`, porque es el LCP).
  - Accesibilidad: HTML semántico, labels, `aria-invalid`, `aria-live`, foco visible de 3 px, "Saltar al contenido", `<title>` por página, `lang="es"`, tarjetas no focusables (sus acciones sí).
  - **Pruebas:** mobile 26 suites y 159 pruebas (las 156 de antes + 3 de `getFirstName`); web 5 archivos y 15 pruebas. Bundle de Metro en verde después de mover los hooks.
- **Decisiones de la IA al implementar que revisé:**
  - ✅ Reinicio del checkout al salir de `/compra-confirmada` por cualquier camino (header, atrás), para no dejar el siguiente checkout bloqueado.
  - ✅ `useBlocker` + `beforeunload` solo en `processing`, así la navegación a la confirmación nunca se detiene.
  - ✅ Sin selector de cantidad en el detalle web (el tablero lo muestra): mobile tampoco lo tiene y `core/` no tiene `addItem` con cantidad. Queda como mejora documentada.
  - ✅ Tarjetas no focusables aunque el tablero les pone `tabindex="0"`: un `article` focusable sin acción es una trampa para el teclado.
  - 🔧 `role="dialog"` → pedí **`alertdialog`**, como en el tablero 09: es el rol correcto para confirmar una acción destructiva.
  - 🔧 Al volver del detalle se perdían la búsqueda y la categoría. Pedí guardarlas en la URL (`?q=&categoria=`).
- **Prompt de ajustes:**
```
Ajustes al P10:
1. ConfirmDialog: cambia role="dialog" por role="alertdialog", como en el tablero 09. Ajusta la prueba.
2. Búsqueda y categoría en la URL (?q=&categoria=) en la web, para que se conserven al volver del detalle, al recargar y al compartir el link. useProductListing de core/ no debe depender de React Router: haz que acepte el estado de forma controlada (valor + setter) con un default interno, para que mobile siga igual sin cambios de comportamiento. El debounce sigue aplicando a la búsqueda. Usa replace para no llenar el historial con cada tecla. Agrega una prueba.
3. Code splitting: carga con lazy() las rutas de checkout y compra confirmada (con un fallback de carga), para que react-hook-form solo se descargue al llegar ahí. Reporta los tamaños del build antes y después.
No hagas commit. Al terminar: typecheck, lint, test (mobile y web, con números) y tamaños del build.
```
- **Resultado de los ajustes:**
  - `useProductListing` acepta `{ filters, setFilters }` opcional; sin él usa su propio `useState`, así que **mobile no cambió**. Un solo `setFilters` con el objeto completo, porque con dos setters "Limpiar búsqueda" haría dos `setSearchParams` y el segundo pisaría al primero.
  - Búsqueda y categoría con `replace` (atrás no recorre cada tecla ni cada chip). "Volver al catálogo" hace `navigate(-1)` si vienes del listado (conserva filtros y scroll) o va a `/` si abriste el detalle por link directo.
  - Prueba nueva: link compartido llega filtrado, `REPLACE` al escribir, volver del detalle conserva los filtros con una sola petición. **Se comprobó que falla sin `replace`.**
  - **Code splitting:** JS inicial de 178.9 a **164.9 KB gzip (−7.8 %)**; `CheckoutScreen` (14 KB gzip) y `OrderConfirmedScreen` en chunks aparte. Se verificó que RHF solo está en el chunk del checkout.
  - Web: 6 archivos y **17 pruebas**; mobile sin cambios (159).
- **Limitaciones aceptadas:** al volver al listado, la paginación regresa a la página 1 (no está en la URL). El JS principal sigue arriba de 500 KB por `react-dom`, `react-router`, Zod y RTK.
- **Revisión visual mía en Chrome (encontré 2 problemas):**
  1. Los botones de la tarjeta se cortaban ("Ver det...", "Agre...") con 4 columnas y DevTools abierto.
  2. En el checkout angosto, el resumen con "Confirmar compra" quedaba **arriba** del formulario: el usuario veía el botón antes de llenar sus datos (en mobile el orden es el correcto).
- **Prompt de corrección visual:**
```
Dos ajustes visuales en la web:

1. Tarjeta del listado: los botones se cortan ("Ver det...", "Agre...") con 4 columnas a ~1450 px de ancho de ventana (DevTools abierto). Los textos de los botones nunca deben truncarse. Revisa el tablero web del listado y resuélvelo sin cambiar los textos: por ejemplo, apilar los botones cuando la tarjeta es angosta (container query de Tailwind 4 sobre la tarjeta, no media query de la ventana), o ajustar padding/gap.

2. Checkout: cuando las columnas se apilan (pantalla angosta), el resumen con el botón "Confirmar compra" queda ARRIBA del formulario, así que el usuario ve el botón antes de llenar sus datos. El orden en una columna debe ser igual que en mobile: primero "Datos de contacto", después "Resumen del pedido" y al final "Confirmar compra". En dos columnas (pantalla ancha) respeta el tablero web 20 (formulario a la izquierda, resumen a la derecha con el botón). Conserva el orden del DOM coherente con el orden visual (accesibilidad: el orden de Tab debe seguir lo que se ve), así que no lo resuelvas solo con la propiedad CSS order.

Revisa ambos a 1440, 1280, 1024, 800 y 375 px. No hagas commit. Al terminar: typecheck, lint y test web con número de pruebas.
```
- **Por qué container query y no media query:** el ancho de la tarjeta depende del número de columnas, no del ancho de la ventana. **Por qué no CSS `order`:** movería el botón visualmente, pero Tab seguiría el HTML y llegaría a "Confirmar compra" antes que a los campos.
- **Resultado de la corrección:**
  - El problema era más amplio: los botones se cortaban en **tres rangos** (1030–1170 px, 650–870 px y 320 px). Ahora la tarjeta es `@container` y los botones van lado a lado solo si la tarjeta mide ≥ 272 px; si no, se apilan. `Button` usa `whitespace-nowrap` en lugar de `truncate` en toda la web.
  - La IA lo **midió en Chrome real de 10 en 10 px, de 320 a 1600 px**: ningún botón se trunca ni se desborda (con "Agregar" y "Agregado"). Usó `puppeteer-core` solo en su scratchpad, sin agregarlo al proyecto.
  - En el checkout, el DOM ya estaba en orden; lo subía un `order-first` copiado del tablero 20. Se quitó: el orden visual y el del DOM coinciden, y Tab va Nombre → Correo → Teléfono → Confirmar compra en todos los anchos (D49).
- **Verificación propia (Chrome):**
  - Network (Fetch/XHR): **una sola petición a `products`** al recorrer listado, detalle, carrito y checkout.
  - Flujo completo: búsqueda, agregar, eliminar con diálogo de confirmación y compra confirmada.
  - Revisé los botones de las tarjetas y el orden del checkout después de la corrección.
- **Commit:** `feat(web): agrega app web reutilizando dominio, estado y hooks de core (P10)`

---

## P11 · Calidad automatizada: ESLint con reglas de arquitectura y CI
- **Herramienta:** Claude Code, Plan mode.
- **Prompt:**
```
P11: calidad automatizada. Sigue CLAUDE.md y DECISIONS.md.

1. ESLint (mobile y web, sin agregar plugins nuevos si las reglas ya existen en lo instalado):
   - Error en any explícito (@typescript-eslint/no-explicit-any) y en @ts-ignore/@ts-nocheck (@typescript-eslint/ban-ts-comment; permite @ts-expect-error solo con descripción).
   - Reglas de arquitectura con no-restricted-imports (o la regla equivalente ya instalada):
     - core/ no puede importar react-native, react-dom, react-router, react-navigation ni nada de mobile/ o web/.
     - features/ no puede importar de app/.
     - Un feature no importa archivos internos de otro feature, solo su index.ts.
   - Corrige el aviso "React version was set to detect" del lint sobre core/.
   - Si aparecen violaciones, muéstramelas antes de corregirlas.
2. CI con GitHub Actions (.github/workflows/ci.yml), en push y pull_request a main:
   - Node desde .nvmrc, caché de npm, npm ci en mobile/ y web/ (con el npm que trae Node 22; el lockfile de web ya funciona con npm 10, D45).
   - typecheck, lint, test (mobile y web) y build de producción de web.
   - Sin build de Android en CI (tarda mucho y el APK va en el Release); explícalo en un comentario.
3. Revisa el aviso de seguridad de braces de npm audit (P08): dime de dónde viene, si llega al bundle de la app y si conviene actuar.
4. Agrega el badge del CI al README (solo la línea del badge; el README completo lo hacemos en P12).

Primero el plan y tus preguntas. No hagas commit. Al terminar: typecheck, lint y test con números, y cómo verifico que el CI corre en GitHub.
```
- **Por qué lo escribí así:** hasta aquí, las reglas de arquitectura ("`core/` no conoce la plataforma", "features → shared → core") solo estaban escritas en `CLAUDE.md`. Con ESLint **la máquina las hace cumplir**, y con el CI se revisan en cada push.
- **Preguntas de la IA y mis respuestas:**
  - **Badge:** crear `README.md` en la raíz (no existía); el contenido completo llega en P12.
  - **Reglas extra que no pedí:** aprobé las dos: globals prohibidos en `core/` (`window`, `document`, `__DEV__`) y `shared/` sin importar de `features/` ni `app/`. Con ellas, **todas** las reglas de arquitectura de `CLAUDE.md` quedan verificadas por ESLint.
  - **CI:** dos jobs en paralelo (mobile y web): más rápido y se ve cuál app falló.
- **Ajuste al aprobar:** pedí **no** simular el CI en local borrando `node_modules` (en mobile tarda varios minutos y podía afectar el entorno de Android antes del APK final). La prueba real es el CI en GitHub.
- **Resultado:**
  - `mobile/.eslintrc.js`: sin `any`, sin `@ts-ignore`/`@ts-nocheck` (`@ts-expect-error` solo con descripción), features sin importar `app/` ni internos de otro feature, `shared/` sin importar `features/` ni `app/`. Reglas generadas desde una lista `FEATURES`.
  - `mobile/.eslintrc.core.js` (nuevo, porque ESLint 8 no acepta `..` en los overrides): `core/` sin React Native, react-dom, React Router, React Navigation, `mobile/`, `web/`, `window`, `document` ni `__DEV__`.
  - `web/eslint.config.js`: las mismas reglas con la misma lista `FEATURES`.
  - **Aviso de React resuelto:** el plugin buscaba `react` desde `core/`, que no tiene `node_modules`; ahora la versión se lee de la instalada en mobile.
  - `.github/workflows/ci.yml`: jobs `mobile` (typecheck, lint, test) y `web` (typecheck, lint, test, build), Node desde `.nvmrc`, caché de npm, `npm ci`, `permissions: contents: read` y `concurrency`.
  - `README.md` con el título y el badge.
  - **Violaciones en el código existente: ninguna.**
  - Jest 26 suites / 159 pruebas; Vitest 6 archivos / 17 pruebas; build de web en verde.
- **Prueba de que las reglas funcionan:** la IA creó archivos temporales con 10 violaciones distintas y **cada una falló con su mensaje** (por ejemplo, `core/ no lee el entorno: recibe isDevelopment en createAppStore (D26)`); lo permitido (`../../catalog`, `@core/...`, `@ts-expect-error` con descripción) no dio error. Después los borró.
- **Análisis de `braces` (GHSA-vfj7-8cjw-p6xm, alta, DoS por glob anidado):**
  - Llega por `jest → micromatch` (desarrollo) y por `uniwind → metro → micromatch`. **La IA corrigió su propio plan:** había dicho que `--omit=dev` saldría vacío y no fue así.
  - **No llega al APK:** revisó el sourcemap del bundle de release (3,136 módulos) y no aparecen `braces`, `micromatch`, `metro` ni `jest`. Solo corre en Node, durante el desarrollo.
  - **No hay versión corregida publicada**, y `npm audit fix --force` bajaría Jest a 25 y la CLI de RN a 13 (rompe la plantilla). Decisión: no actuar y revisarlo cuando salga una versión corregida (D52).
  - Web tiene 0 vulnerabilidades.
- **Verificación propia:** el CI corrió en GitHub (pestaña Actions) y **pasó en verde a la primera ejecución, en 1 min 9 s**, con los dos jobs (mobile y web). Confirma que el proyecto se instala desde cero en un entorno limpio, incluido el lockfile de web resuelto con npm 11 (D45).
- **Commit:** `ci: agrega reglas de arquitectura en ESLint y GitHub Actions para mobile y web (P11)`

---

## P12 · Entrega final: auditoría, README, capturas y APK
- **Herramienta:** Claude Code, Plan mode.
- **Prompt:**
```
P12: entrega final. Sigue CLAUDE.md y DECISIONS.md. No edites PROMPTS.md ni DECISIONS.md (los mantengo yo), pero léelos completos: son la fuente para el README.

1. Auditoría contra el reto: lee los requisitos del reto (listado, detalle, carrito con +/−/eliminar y totales, checkout simulado con resumen/confirmar/vaciar, loader, error con reintentar, evitar llamadas innecesarias; bonus: filtro por categoría, búsqueda, persistencia; uso de IA documentado; CLI; Android; web en React). Arma una tabla requisito → dónde está en mobile → dónde está en web → prueba que lo cubre → evidencia. Si algo falta o está incompleto, dímelo antes de seguir.

2. README.md completo en la raíz (en español, conserva el badge):
   - Qué es y capturas (mobile y web) al inicio.
   - Stack con versiones y por qué (enlaza a las decisiones D##).
   - Arquitectura: diagrama Mermaid de mobile/ + web/ + core/ + design/, y la regla features → shared → core verificada por ESLint (D50). Destaca qué comparte core/ (dominio, estado, persistencia, validaciones y hooks, D44) y qué pone cada plataforma.
   - Cómo correrlo: requisitos (Node 22 con nvm, JDK, Android SDK, emulador), comandos de mobile y web desde cero, pruebas, lint y typecheck.
   - Instalar el APK sin compilar (enlace al Release).
   - Cómo se cumple cada requisito (versión corta de la tabla de auditoría).
   - Uso de IA: cómo trabajé (CLAUDE.md como contexto, Plan mode, aprobación de cada plan, verificación propia en emulador y navegador), enlace a PROMPTS.md y 4-5 ejemplos concretos donde corregí o mejoré lo que propuso la IA (tómalos de PROMPTS.md).
   - Decisiones clave (resumen de 8-10 con enlace a DECISIONS.md), limitaciones conocidas y siguientes pasos.
   - Enlace a docs/troubleshooting.md.

3. Capturas en docs/screenshots/: mobile (listado, detalle con snackbar, carrito, checkout con error de validación, compra confirmada, error con Reintentar usando el APK de release en modo avión) con adb; web (listado ancho, detalle, carrito con diálogo, checkout, compra confirmada) con la herramienta que usaste en P10 desde tu scratchpad, sin agregarla al proyecto. Restaura el emulador al terminar.

4. APK final: regenera el APK de release con el código actual y dime su ruta y tamaño. Dame el comando exacto para crear el GitHub Release v1.0.0 con el APK adjunto (lo ejecuto yo).

5. Limpia lo que quedó de plantilla: mobile/README.md y web/README.md (reemplázalos por 3-4 líneas que apunten al README raíz).

Primero el plan y la tabla de auditoría. No hagas commit.
```
- **Por qué lo escribí así:**
  - **La auditoría va primero:** antes de escribir "cumple todo" en el README, se comprueba requisito por requisito con archivo, prueba y evidencia.
  - **El README sale de `PROMPTS.md` y `DECISIONS.md`:** el uso de IA y las decisiones ya estaban documentados; solo había que resumirlos.
  - **El Release lo creo yo:** publicar es una acción pública.
- **Resultado de la auditoría:** todos los requisitos y bonus cubiertos en mobile y web. Faltantes encontrados: el APK era anterior a P10/P11, no existía el Release, **ninguna prueba renderizaba el listado fallando y pulsaba Reintentar** (solo se probaba `ErrorState` aislado) y faltaba la captura web del error.
- **Mis respuestas al aprobar:**
  - Agregar la prueba de pantalla de error con Reintentar en ambas apps **antes** de regenerar el APK ("error con reintentar" es un requisito explícito).
  - Agregar la captura web del error.
  - Agregar al README una sección **"Cómo agregaría…"** con 3 ejemplos sobre la arquitectura actual (selector de cantidad, paginación del servidor, nueva feature o plataforma), porque en la sesión de revisión preguntarán cómo implementar cosas nuevas.
- **Resultado:**
  - **Pruebas de error con Reintentar** (mobile nueva, web un caso más): la API falla → aparece el error → Reintentar → carga el listado, con 2 llamadas en total. **Se comprobó rompiendo `retry` a propósito: las dos fallaron**; luego se restauró.
  - **Jest 27 suites / 160 pruebas; Vitest 6 archivos / 18 pruebas.** Typecheck y lint en verde; JS inicial de web 164.9 KB gzip.
  - **APK final:** 72.6 MB, SHA-256 `3eef313dd655df6fb2cf6e73051bd51a286b0a435bab9d641248546c4a60ad98`. Recorrido completo sin `FATAL EXCEPTION` en logcat.
  - **12 capturas** en `docs/screenshots/`: 6 de mobile (APK de release, barra de estado limpia con demo mode, incluida la de error en modo avión) y 6 de web (1440×900, incluida la de error bloqueando la API).
  - **README completo** con capturas, stack con versiones, diagrama Mermaid, cómo correrlo, APK, requisitos, uso de IA con 5 ejemplos, decisiones clave, limitaciones, "Cómo agregaría…" y troubleshooting. La IA verificó con un script que todos los enlaces y las 30+ anclas a `DECISIONS.md` existen.
  - `mobile/README.md` y `web/README.md` reducidos a 3-4 líneas que apuntan al README raíz.
- **Hallazgo:** la barra flotante del teclado (Gboard) del emulador tapaba el formulario en la captura del checkout; se desactivó solo durante esa toma y se restauró.
- **Verificación propia:** revisé el README y las capturas en GitHub, y descargué el APK del Release.
- **Commit:** `docs: agrega README final, capturas y prueba de error con reintentar (P12)`
- **Release:** `v1.0.0` con `MiniShop-v1.0.0.apk`.

---

<!-- Plantilla
## PXX · Título
- **Prompt:**
```
(pega el prompt exacto)
```
- **Por qué lo escribí así:**
- **Resultado:** qué generó (archivos, enfoque).
- **Análisis:** qué estuvo bien, qué estuvo mal o incompleto.
- **Correcciones manuales:** qué cambié y por qué.
- **Verificación:** typecheck / lint / tests / prueba en emulador.
- **Commit:**
-->
