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
