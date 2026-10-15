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
- **✅ Validado en P02:** la misma función de `core/` se ejecuta en Android (Metro + Hermes) y en web (Vite), sin workspaces. No fue necesario el plan B. Detalle en `PROMPTS.md`, P02.
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
- **Decisión:** no se configura linking en móvil. `getProductById` existe como fallback porque en web se puede abrir `/producto/:id` directo (ruta en español desde P10, D43).

## D17 · Caché de catálogo por sesión
- **Decisión:** "una sola llamada" es por sesión. La caché de RTK Query no se persiste; no hay modo offline del catálogo.
- **Por qué:** el carrito sí se persiste porque es estado del usuario; el catálogo es estado del servidor y debe estar fresco al abrir la app.

## D18 · Configuración compartida de TypeScript y dependencias de soporte
- **Decisión:** `strict: true` en ambas apps, ambas incluyen `../core`; en `core/` se usa `import type` y no `enum`. Zod se declara en las dos apps con la misma versión exacta. Se aprueban `@react-navigation/*`, `react-native-screens`, `babel-plugin-module-resolver`, `@tailwindcss/vite` y una versión de React Native Testing Library compatible con React 19.
- **Por qué:** la IA detectó que Zod solo existía como dependencia transitiva de otro paquete y que web no era estricto ni revisaba `core/`.

## D19 · Plugin de Babel para que Metro empaquete Zod 4
- **Contexto:** al generar el bundle de Metro en P02, la IA encontró que Zod 4 publica código con `export * as ...` y que `@react-native/babel-preset@0.87.1` no lo transforma. Jest no lo detectaba porque transforma a CommonJS; solo fallaba el bundle real.
- **Evidencia:** el error se reproduce con el `babel.config.js` original de la plantilla, así que no lo causa nuestra configuración.
- **Decisión:** `@babel/plugin-transform-export-namespace-from@7.29.7` (versión exacta, la misma que ya llega por `@babel/preset-env`) en los plugins de Babel de mobile.
- **Lección:** pasar las pruebas no basta; hay que verificar el bundle real de la plataforma.
- **Propuso:** la IA, con evidencia; yo lo aprobé.

## D20 · `npm audit` de mobile como deuda conocida
- **Contexto:** `npm audit` reporta vulnerabilidades en mobile, todas en dependencias de la plantilla de React Native CLI (árbol de Jest y herramientas de desarrollo). Web reporta 0.
- **Decisión:** no forzar actualizaciones (`npm audit fix --force` rompería la compatibilidad de la plantilla). Ninguna viene de las dependencias que agregué.

## D21 · Sombras: `boxShadow` desde tokens, con respaldo para Android 7 y 8
- **Contexto:** la IA verificó que Uniwind traduce `shadow-card` a `boxShadow` de React Native con las dos capas del diseño, pero RN solo lo dibuja desde Android 9 (API 28). El `minSdk` es 24.
- **Decisión:** `boxShadow` como solución principal (sale directo de `design/tokens.css`, sin duplicar valores) y `getLegacyShadowStyle()` que aplica `elevation` solo en Android con `Platform.Version < 28`. Con prueba unitaria para Android 27, Android 28 e iOS.
- **Alternativas descartadas:** solo `boxShadow` (sin sombra en Android 7–8, que todavía usan equipos de gama baja); solo `elevation` (ignora los tokens del diseño); subir `minSdk` a 28 (decisión de negocio, no técnica).
- **Pendiente honesto:** el respaldo está cubierto por pruebas, pero no se probó visualmente en un emulador API 24–27.
- **Propuso:** la IA detectó el límite de API; la combinación es decisión mía.

## D22 · `--text-price` renombrado a `--text-price-md`
- **Contexto:** la IA detectó que `--text-price` (tamaño) y `--color-price` (color) generan la misma clase `text-price`, y Tailwind 4 aplica solo el color. Lo comprobó compilando.
- **Decisión:** renombrar el token de tamaño a `--text-price-md` en `design/tokens.css`. La escala queda `sm`, `md`, `lg`, `xl` y el choque desaparece desde la raíz.
- **Alternativas descartadas:** clases arbitrarias largas dentro del componente `Price` o un `@utility` propio en cada app: esconden el problema en lugar de resolverlo.
- **Nota:** es el único ajuste hecho al archivo exportado por Claude Design. `design/reference/16-Tokens.html` conserva el nombre original como registro de la exportación.
- **Propuso:** la IA detectó el choque y dio opciones; elegí renombrar.

## D23 · Uniwind 1.12.2
- **Contexto:** compatible con RN ≥ 0.81 y React ≥ 19, con guía oficial para React Native CLI sin Expo. La versión 1.12.2 tenía 9 días de publicada.
- **Decisión:** usarla con versión exacta (sin `^`) para que una actualización no rompa el proyecto. Tailwind 4.3.3 exacto en ambas apps.
- **Riesgo aceptado:** librería joven; el plan B era NativeWind o `StyleSheet` con tokens en TypeScript.

## D24 · Validar la API con `rawResponseSchema`, no dentro de `transformResponse`
- **Contexto:** la IA encontró que si un `parse` de Zod falla dentro de `transformResponse`, RTK Query lo trata como error no manejado: escribe `console.error` y la pantalla recibe un error sin estructura. RTK 2.x ya trae validación con schemas (`rawResponseSchema` y `catchSchemaFailure`), compatible con Zod 4.
- **Decisión:** validar con `rawResponseSchema: ProductListSchema` y devolver un error controlado (`CUSTOM_ERROR`, "Respuesta inválida del servidor") con `catchSchemaFailure`. `transformResponse` solo convierte a `CatalogProduct`. Una prueba confirma que no aparece el `console.error` de RTK.
- **Cambio sobre `CLAUDE.md`:** el plan original decía "valida en `transformResponse`"; lo actualicé con la razón técnica.
- **Propuso:** la IA; lo aprobé.

## D25 · La orden confirmada guarda su propio resumen
- **Contexto:** la IA leyó el tablero de compra confirmada en `design/reference/` y detectó que muestra nombre, correo, número de orden, cantidad de productos y total, datos que se pierden al vaciar el carrito.
- **Decisión:** `checkoutSlice` guarda `confirmedOrder: { orderNumber, contact, totalItems, totalInCents }`, tomado **antes** de limpiar el carrito. `confirmOrder` vuelve a validar el contacto con Zod y usa `condition` para no correr con el carrito vacío ni dos veces seguidas (evita el doble envío). Número de orden `MS-` + 5 dígitos, como en el diseño.
- **Propuso:** la IA, a partir del diseño; lo aprobé.

## D26 · `createAppStore(storage, options)` con entorno y checkout inyectados
- **Contexto:** `core/` no puede saber si está en desarrollo: `__DEV__` solo existe en React Native, `process.env` no existe en Vite dev e `import.meta.env` no existe en Metro.
- **Decisión:** cada app pasa `isDevelopment` (`__DEV__` en móvil, `import.meta.env.DEV` en web), y el checkout recibe `delayMs` y `generateOrderNumber` como `extraArgument` del thunk. Así las pruebas no esperan 1.5 s reales ni dependen de números aleatorios.
- **Por qué:** es la misma inversión de dependencias del `StorageAdapter`: `core/` define qué necesita y cada plataforma lo provee.
- **Propuso:** la IA; lo aprobé.

## D27 · `@reduxjs/toolkit` 2.12.0 en lugar de 2.13.0
- **Contexto:** la IA ofreció 2.13.0 (15 días publicada) o 2.12.0 (mayo). Ambas traen `rawResponseSchema`.
- **Decisión:** 2.12.0 exacta, con `react-redux` 9.3.0. Con Uniwind acepté una versión reciente porque no había alternativa; aquí sí la había, así que elegí la más probada.
- **Propuso:** yo.

## D28 · Las reglas del carrito devuelven la misma referencia si no cambian nada
- **Contexto:** las pruebas detectaron que `increaseQuantity` con un id inexistente, o con un producto ya en 99, devolvía un arreglo nuevo con el mismo contenido. La persistencia lo tomaba como un cambio y escribía en el storage, y los `React.memo` volverían a renderizar.
- **Decisión:** las reglas devuelven el mismo arreglo cuando nada cambia (probado con `toBe`); `CartState.items` es `readonly`.
- **Lección:** este bug lo encontraron las pruebas de una regla pura, no la UI. Es la razón de escribir el dominio con pruebas antes de las pantallas.
- **Propuso:** la IA lo detectó con las pruebas y lo corrigió.

## D29 · AsyncStorage 3.1.1, la versión mantenida
- **Contexto:** la 3.1.1 (mantenida, soporte declarado para RN ≥ 0.76) parecía exigir un repositorio Maven local en `android/build.gradle`; la 2.2.0 no tocaba Gradle, pero no documenta compatibilidad con RN 0.87 y Nueva Arquitectura.
- **Decisión:** 3.1.1, con `createAsyncStorage('minishop')` para un espacio de almacenamiento propio de la app.
- **Hallazgo al implementar:** la IA comprobó que el artefacto nativo ya está en Maven Central (respuesta 200), así que la documentación estaba desactualizada y no hizo falta tocar Gradle.
- **Por qué:** prefiero una configuración nativa explícita a una dependencia con compatibilidad no documentada.

## D30 · React Native Testing Library 13.3.3
- **Decisión:** 13.3.3, que usa el `react-test-renderer` 19.2.3 ya incluido en la plantilla. La 14 cambia a otro renderer (fuera de la tabla aprobada) y a una API de render asíncrono.
- **Criterio:** el mismo que en D27: si hay una versión probada que cubre lo necesario, no se adopta la más nueva.

## D31 · Colores del diseño que no son tokens
- **Contexto:** algunos estados del diseño usan colores que no existen en `tokens.css` (presionado de secondary, fondo de stepper deshabilitado, cargando de primary).
- **Decisión:** resolverlos con el token más cercano u opacidad sobre un token (`opacity-80`, `primary/70`, `bg-disabled`), sin agregar colores sueltos. `useTokenColor(token, opacity?)` entrega el color del token en JS para props como `android_ripple`.
- **Diferencias visuales aceptadas:** el skeleton pulsa la opacidad en lugar del degradado (evita otra librería) y el `TextField` no tiene anillo de foco de 3 px.
- **Nota técnica:** Uniwind solo expone a JS los tokens que aparecen en algún `className`; un token usado solo desde JS debe declararse en `@theme static`.

## D32 · El detalle lee el producto de la caché del listado
- **Contexto:** la API tiene `GET /products/:id`, pero el listado ya descargó todos los productos con `GET /products`.
- **Decisión:** el detalle usa `getProducts.useQueryState` con `selectFromResult` para leer el producto de la caché, **sin suscribirse ni volver a pedirlo**. `getProductById` queda con `skip` y solo corre como respaldo cuando el producto no está en la caché (por ejemplo, un id inexistente, que termina en `notFound`).
- **Por qué:** cumple "evitar llamadas innecesarias" y la navegación al detalle es instantánea.
- **Evidencia:** una prueba automatizada verifica que `fetch` se llama 1 vez, y en DevTools se ve 1 sola request después de navegar por toda la app.
- **Propuso:** la IA en el plan; lo aprobé y pedí la prueba.

## D33 · Paginación del lado del cliente sobre la caché
- **Contexto:** la API no pagina (devuelve los 20 productos de una vez), pero el reto pide pensar en optimización y lazy load.
- **Decisión:** `usePaginatedProducts` (genérico) muestra 8 productos por página y agrega más al llegar al final. Se reinicia cuando cambia la lista filtrada. El pie "Cargando más" se muestra mientras `hasMore`, sin espera artificial.
- **Por qué:** limita lo que se renderiza al inicio y deja lista la estructura si la API llegara a paginar: solo cambiaría la fuente de datos, no la pantalla.
- **Propuso:** yo (lazy load en los requisitos iniciales); la IA lo implementó como hook genérico.

## D34 · `FlatList` con `getItemLayout` y header de alto fijo
- **Decisión:** 2 columnas, ancho de tarjeta con `useWindowDimensions`, `getItemLayout` por fila (362) con el header (buscador y chips) **dentro** de la lista y con alto fijo de 148. Además `initialNumToRender` 4, `windowSize` 5 y `removeClippedSubviews` solo en Android. `ProductCard` con `React.memo`.
- **Por qué:** con `getItemLayout`, la lista no mide cada fila al hacer scroll. Al poner el header dentro de la lista, todo hace scroll junto, como en el diseño.
- **Riesgo aceptado:** con la fuente del sistema muy agrandada, el header de 148 podría recortar texto. Se revisa en P09.
- **Propuso:** la IA; aprobé el alto fijo después de revisarlo.

## D35 · Tipos de navegación en `shared/navigation`
- **Decisión:** `RootParamList` vive en `shared/navigation/types.ts`, no en `app/`.
- **Por qué:** las pantallas de `features/` necesitan esos tipos, y la regla de dependencias (`features → shared → core`) no permite que importen de `app/`.
- **Propuso:** la IA lo marcó con ⚠️; lo aprobé.

## D36 · react-hook-form 7.88.0 + @hookform/resolvers 5.9.1
- **Contexto:** el checkout necesita validar el formulario con el mismo `checkout.schema` de `core/`.
- **Decisión:** React Hook Form con `zodResolver`. Elegí 7.88.0 en lugar de 7.90.0 (3 días publicada), con el mismo criterio de D27 y D30: la versión más probada que cubre lo necesario. Ambas librerías son solo JS y no requieren recompilar Android.
- **Por qué RHF:** inputs no controlados (menos renders al escribir), enfoca el primer campo con error y se integra con Zod sin duplicar reglas: **las validaciones viven una sola vez en `core/`** y la web usará el mismo schema.
- **Alternativa:** `useState` con validación manual (duplica reglas y más código) o Formik (más pesado, más renders).
- **Propuso:** yo (requisitos iniciales); la versión, con el criterio de siempre.

## D37 · Si la hoja de componentes y una pantalla difieren, gana la pantalla
- **Contexto:** el EmptyState del carrito medía 72/34 en la hoja de componentes y 96/44 en la pantalla 10.
- **Decisión:** se sigue la pantalla, porque es lo que ve el usuario. El cambio se aplica solo a la variante afectada (`cart`), sin tocar `search` ni `notFound`.
- **Propuso:** la IA lo preguntó; la regla la fijé yo y se aplicó igual en P07 y P08.

## D38 · El checkout conserva el resumen hasta navegar a la confirmación
- **Contexto:** `confirmOrder` vacía el carrito y pasa a `confirmed` antes de que la pantalla navegue. Por un instante, el checkout mostraba "0 / $0.00" y **el botón "Confirmar compra" se volvía a habilitar**.
- **Decisión:** el checkout se considera ocupado en `processing` y en `confirmed` (mantiene "Procesando…", los campos deshabilitados y atrás bloqueado), y `useOrderSummary` conserva el resumen tomado al enviar.
- **Evidencia:** una prueba reproduce el estado intermedio. Se comprobó que falla sin la corrección.
- **Propuso:** yo lo detecté al revisar el plan; la IA lo confirmó y lo corrigió.

## D39 · Atrás bloqueado mientras procesa: BackHandler + `gestureEnabled`
- **Decisión:** mientras se confirma la compra, `BackHandler` (con `useFocusEffect`) anula el botón atrás de Android y `gestureEnabled: false` bloquea el gesto en iOS. La flecha del header se deshabilita.
- **Por qué no `usePreventRemove`:** su estado se actualiza en un efecto posterior y podría bloquear el `navigation.reset` que corre justo al terminar `confirmOrder`.
- **Navegación final:** `reset` a `[catálogo, confirmación]` reutilizando la ruta existente del catálogo (no se vuelve a montar y conserva búsqueda, filtro y scroll); atrás desde la confirmación nunca regresa al checkout.
- **Propuso:** la IA; lo aprobé.

## D40 · APK de release firmado con el keystore de debug, con R8
- **Contexto:** la plantilla de React Native firma `release` con `debug.keystore`, que es una clave pública.
- **Decisión:** se mantiene. El APK es para instalarlo con `adb` o descargándolo, no para Play Store.
- **Por qué:** cualquier evaluador lo instala sin configurar nada, y reemplaza la versión de debug sin desinstalarla (misma firma).
- **Riesgo:** no sirve para publicar, porque cualquiera podría firmar una "actualización". En producción: keystore propio fuera del repo, con contraseñas en `~/.gradle/gradle.properties` o en el CI, o Play App Signing.
- **También en release:** R8 y `shrinkResources` activados: el APK pasa de 78.0 a 72.6 MB (el código Java/Kotlin de 17 a 3.2 MB). Se agregó una regla `-keepnames` para los fragments de `react-native-screens`: sin ella, la app truena cuando Android recrea la Activity (se encontró al cambiar el tamaño de fuente con la app abierta).
- **Alternativa no aplicada:** APKs por arquitectura (el de arm64 pesaría ~25 MB), pero habría que elegir qué archivo instalar.
- **Propuso:** la IA. Aprobé R8 con un límite de 2 intentos para resolver crashes; se resolvió al primero.

## D41 · Fuente del sistema agrandada sin perder `getItemLayout` exacto (cierra el riesgo de D34)
- **Decisión:**
  - El header del listado se mide con `onLayout` en lugar de tener alto fijo.
  - La tarjeta tiene un alto calculado según la escala de fuente: 350 a 1.0 y 380 desde 1.3. Su texto escala hasta 1.3 como máximo, calculado por la propia tarjeta (`allowFontScaling={false}` y tamaño del token × escala).
  - El resto de la app escala sin límite, con altos mínimos en lugar de altos fijos donde hay texto.
- **Por qué:** `getItemLayout` sigue exacto porque cada tarjeta tiene un alto explícito igual al que reporta. La tarjeta mide 158 dp de ancho y funciona como vista previa: el texto completo, sin límite de escala, se lee en el detalle.
- **Hallazgo:** en RN 0.87 en Android, `maxFontSizeMultiplier` limita el tamaño de la fuente pero no el interlineado. Medido con uiautomator: a 2.0 el título y el botón "Agregar" se recortaban.
- **Alternativa descartada:** `allowFontScaling={false}` en toda la app (rompe la accesibilidad).
- **Propuso:** la IA. El tope de 1.3 y la escala manual los elegí yo.

## D42 · La marca es "MiniShop"; ícono adaptativo
- **Contexto:** el diseño decía "Mi Surtido", pero el repo, el package (`com.minishop`) y el launcher ya decían "MiniShop".
- **Decisión:** "MiniShop" en el launcher, el header y el `<title>` de la web. Ícono adaptativo vectorial (la casa de Lucide sobre `--color-primary`), con variante monocromática para Android 13+.
- **Excepción:** el color está escrito en `colors.xml`, porque los recursos de Android no pueden leer `tokens.css`.
- **Limitación:** en API 24 y 25 se quedan los PNG de la plantilla.
- **Sin cambios:** `design/reference/` se conserva como la exportación original del diseño.
- **Propuso:** yo. Es una de las pocas decisiones en las que me aparto del diseño, y fue por coherencia de marca.

## D43 · Rutas web en español
- **Decisión:** `/`, `/producto/:id`, `/carrito`, `/checkout`, `/compra-confirmada` y una página 404. React Router 7.18.4 (exacta) en modo data router (`createBrowserRouter`), necesario para `useBlocker`.
- **Guards:**
  - `/checkout` redirige a `/carrito` solo si el carrito ya se leyó del storage (`isHydrated`), está vacío y no hay compra en curso (`status === 'idle'`). Sin esas dos condiciones, recargar la página o el estado intermedio de D38 mandarían al usuario al carrito por error.
  - `/compra-confirmada` sin `confirmedOrder` (por ejemplo, al recargar) redirige a `/`.
- **Por qué 7.18.4 y no 8.x:** la 8 exige `react >=19.2.7` y lleva menos tiempo en uso; mismo criterio que D27, D30 y D36.
- **Propuso:** las rutas en español, yo; los guards, la IA.

## D44 · Los hooks de React puro viven en `core/` (amplía D11)
- **Contexto:** con la web en marcha, varios hooks de móvil resultaron ser React puro, sin `react-native` ni `react-navigation`.
- **Decisión:** se mueven a `core/`: `useAppDispatch`/`useAppSelector`, `useDebouncedValue`, `usePaginatedProducts`, `useProductListing`, `useProductDetail`, `useAddToCart(Feedback)`, `useCart`, `useOrderSummary` (regla D38), `useCheckoutForm` (RHF + Zod, con `isBusy` de D38) y `getFirstName`.
- **Se quedan en cada plataforma:** `useConfirmRemoveItem` (`Alert.alert` en móvil, `ConfirmDialog` en web) y el bloqueo de navegación mientras procesa (`BackHandler` en móvil, `useBlocker` + `beforeunload` en web). La parte compartida es una sola línea (`dispatch(removeItem(id))`) y un adaptador sería sobreingeniería.
- **Resultado:** web y móvil comparten dominio, estado, persistencia, validaciones **y la lógica de la UI**. Cada plataforma pone las pantallas, los componentes y 2 adaptadores.
- **Costo:** `core/` depende de `react` y `react-hook-form` (resueltos desde cada app con `paths` y `dedupe`). Las pruebas de hooks que usan RNTL se quedan en móvil, para que `core/` no dependa de `react-native` en sus pruebas.
- **Verificación:** se movieron primero y se confirmó que las pruebas de móvil y el bundle de Metro seguían en verde antes de construir la web.
- **Propuso:** yo pedí evaluarlo; la IA hizo el inventario y separó lo que depende de la plataforma.

## D45 · Pruebas web con Vitest y `ConfirmDialog` propio
- **Vitest 4.1.11** + Testing Library + jsdom, configurado en `vite.config.ts` (reutiliza el alias `@core` y `dedupe`). `npm test` en la raíz ejecuta móvil y web.
- **`ConfirmDialog` propio** (portal, `role="dialog"`, `aria-modal`, `inert` en el resto, ciclo de Tab, Esc cierra, el foco regresa al botón que lo abrió o al `<h1>` si la fila se eliminó) en lugar de `<dialog>` nativo: jsdom no implementa `showModal()`, así que la prueba del foco atrapado no probaría nada real.
- **Versiones de web fijadas** a las instaladas, como en móvil. React queda en 19.3.1 en web y 19.2.3 en móvil: no es problema porque cada app resuelve su propio React, y `core/` usa el de la app que lo consume.
- **Instalación:** npm 10.9.9 truena (`TypeError: edgesOut`) al resolver el peer opcional `@vitejs/devtools` de Vite 8. El lockfile se resolvió una vez con npm 11.6.2; con él, npm 10 hace `npm ci` y `npm install` sin error, sin `--force` ni `--legacy-peer-deps`.
- **Rol del diálogo:** `alertdialog` (tablero 09), el rol correcto para confirmar una acción destructiva.
- **Propuso:** la IA; lo aprobé.

## D46 · Filtros del listado en la URL (solo web)
- **Contexto:** al volver del detalle, la web perdía la búsqueda y la categoría (en móvil se conservan porque el catálogo sigue montado en el stack).
- **Decisión:** `?q=&categoria=` con `replace`. `useProductListing` (en `core/`) acepta el estado de forma **controlada y opcional**: la web lo conecta a la URL y móvil sigue con su `useState` interno, sin cambios.
- **Por qué:** en web la URL es el lugar natural para ese estado: sobrevive a recargar, se puede compartir y funciona con el botón atrás. `core/` no depende de React Router.
- **Limitación:** la página de paginación no está en la URL; al volver se muestra desde la página 1.
- **Propuso:** yo, al revisar el resultado; la IA lo implementó con un solo setter para evitar que dos actualizaciones de URL seguidas se pisen.

## D47 · Code splitting de checkout y compra confirmada
- **Decisión:** `lazy()` para esas dos rutas, con fallback de carga. React Hook Form solo se descarga al llegar al checkout.
- **Resultado:** JS inicial de 178.9 a 164.9 KB gzip (−7.8 %).
- **Por qué no más:** el resto del peso es `react-dom`, `react-router`, Zod (necesario para validar la API en `core/`) y RTK, que se usan desde la primera pantalla.
- **Propuso:** yo, a partir del aviso de Vite.

## D48 · Sin selector de cantidad en el detalle
- **Contexto:** el tablero web 18 muestra un selector de cantidad en el detalle.
- **Decisión:** no se implementa: "Agregar al carrito" suma de uno en uno, igual que en móvil, y la cantidad se ajusta en el carrito.
- **Cómo se agregaría:** una regla `addItem(product, quantity)` en `cart.rules.ts` con su prueba (respetando el tope de 99), y el `QuantityStepper` existente en el detalle de ambas plataformas.
- **Propuso:** la IA lo señaló; decidí mantener la coherencia entre plataformas.

## D49 · Web: botones de la tarjeta con container query y checkout en orden de lectura
- **Tarjeta:** `@container` en la tarjeta; los botones van lado a lado si mide ≥ 272 px y se apilan si es más angosta. Los botones nunca truncan su texto (`whitespace-nowrap` en lugar de `truncate`).
- **Por qué container query:** el ancho de la tarjeta depende de cuántas columnas hay (4/3/2), no del ancho de la ventana. Con media queries se cortaban en tres rangos distintos.
- **Checkout en una columna:** primero "Datos de contacto", después el resumen y al final "Confirmar compra", igual que en móvil. **Desviación del tablero 20**, que ponía el resumen primero con `order: -1`.
- **Por qué:** el usuario no debe ver el botón de confirmar antes de llenar sus datos, y el orden de Tab debe seguir el orden visual (por eso no se usa CSS `order`).
- **Propuso:** yo, al revisar la web en Chrome; la IA encontró los otros rangos afectados y la causa (`order-first`).

## D50 · Las reglas de arquitectura las hace cumplir ESLint
- **Decisión:** `no-restricted-imports` y `no-restricted-globals` codifican las reglas de `CLAUDE.md` §4:
  - `core/` no importa React Native, react-dom, React Router, React Navigation, `mobile/` ni `web/`, y no usa `window`, `document` ni `__DEV__`.
  - Un feature no importa de `app/` ni archivos internos de otro feature (solo su `index.ts`).
  - `shared/` no importa de `features/` ni de `app/`.
  - Sin `any` explícito; sin `@ts-ignore`/`@ts-nocheck`; `@ts-expect-error` solo con descripción.
- **Por qué:** una regla escrita se puede olvidar; una regla en el lint falla en el CI. Los mensajes de error explican la regla y citan la decisión (por ejemplo, D26).
- **Evidencia:** 10 archivos con violaciones a propósito fallaron con su mensaje; los imports permitidos no dieron error.
- **Sin plugins nuevos:** se usaron reglas que ya traían los presets instalados.
- **Propuso:** yo; la IA agregó (con mi aprobación) los globals de `core/` y la regla de `shared/`.

## D51 · CI en GitHub Actions sin build de Android
- **Decisión:** dos jobs en paralelo en cada push y PR a `main`: `mobile` (typecheck, lint, Jest) y `web` (typecheck, lint, Vitest, build). Node desde `.nvmrc`, `npm ci` con caché, `permissions: contents: read` y `concurrency`.
- **Por qué no se compila Android:** Gradle, NDK y Hermes tardan mucho y gastan minutos de CI; el APK de release se genera localmente y se adjunta al Release (D40), y la lógica compartida ya se prueba en el CI.
- **Alternativa:** un job de Android con caché de Gradle, o EAS/Bitrise para builds firmados, si el proyecto fuera a producción.
- **Propuso:** yo; los dos jobs en paralelo, la IA.

## D52 · Aviso de `braces` en mobile: no se actúa
- **Contexto:** `npm audit` en mobile reporta GHSA-vfj7-8cjw-p6xm (alta, DoS por patrones glob anidados) en `braces <=3.0.3`, vía `micromatch` (Jest y Metro, este último por `uniwind`).
- **Decisión:** no actuar.
- **Por qué:**
  - No llega al APK: el sourcemap del bundle de release (3,136 módulos) no incluye `braces`, `micromatch`, `metro` ni `jest`. Solo corre en Node durante el desarrollo, con patrones que define quien configura el proyecto.
  - No hay versión corregida publicada, y `npm audit fix --force` bajaría Jest a 25 y la CLI de React Native a 13, rompiendo la plantilla (D20).
- **Seguimiento:** revisar cuando salga `braces` 3.0.4 o React Native suba Metro. Web tiene 0 vulnerabilidades.
- **Propuso:** la IA hizo el análisis; la decisión es mía.

---

<!-- Plantilla para nuevas decisiones
## DXX · Título
- **Contexto:**
- **Decisión:**
- **Por qué:**
- **Alternativa:**
- **Propuso:** yo / IA (y por qué la acepté o la modifiqué)
-->
