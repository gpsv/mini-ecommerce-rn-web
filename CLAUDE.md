# CLAUDE.md — Mini e-commerce (React Native CLI + React Web)

Contexto para Claude Code. Léelo completo antes de proponer o escribir código.

## 1. Qué estamos construyendo

Prueba técnica: un mini módulo de e-commerce que consume `GET https://fakestoreapi.com/products`.

- **App principal:** móvil con **React Native CLI** (no Expo), enfocada en **Android**. iOS no se compila, pero el código debe quedar listo para soportarlo.
- **App secundaria:** **web en React** (Vite) que reutiliza el mismo dominio.
- Se evalúa el **criterio técnico**: cada decisión debe poder justificarse. Si propones una alternativa a lo que dice este archivo, explícala y espera aprobación; no la apliques sola.

### Funcionalidades obligatorias
1. **Listado:** imagen, título, precio, categoría. Acciones: ver detalle, agregar al carrito.
2. **Detalle:** imagen, título, precio, categoría, descripción. Acciones: agregar al carrito, regresar.
3. **Carrito:** por producto: aumentar (+), disminuir (−), eliminar. Mostrar cantidad total de productos y precio total.
4. **Checkout simulado:** resumen del carrito → confirmar (simulado) → limpiar carrito.
5. **Loader** mientras carga la API. **Error** con mensaje y botón **Reintentar**.
6. **Optimización:** evitar llamadas innecesarias a la API.

### Bonus (sí se implementan)
- Filtro por categoría.
- Búsqueda por nombre.
- Persistencia del carrito (AsyncStorage en móvil, localStorage en web).

### Fuera de alcance (no crear carpetas ni código para esto)
Autenticación, perfil, historial de órdenes, pagos reales, direcciones de envío.

## 2. Stack

| Capa | Móvil (`mobile/`) | Web (`web/`) |
|---|---|---|
| Base | React Native CLI, TypeScript, Hermes, Nueva Arquitectura | React + Vite + TypeScript |
| Navegación | React Navigation (native stack) | React Router |
| Estado | Redux Toolkit + RTK Query (desde `core/`) | Redux Toolkit + RTK Query (desde `core/`) |
| Validación | Zod (desde `core/`) | Zod (desde `core/`) |
| Formularios | React Hook Form + `@hookform/resolvers/zod` | React Hook Form + `@hookform/resolvers/zod` |
| Estilos | Uniwind (Tailwind 4 para RN) | Tailwind CSS 4 |
| Tokens de diseño | `design/tokens.css` | `design/tokens.css` |
| Persistencia | `@react-native-async-storage/async-storage` | `localStorage` |
| Íconos | `react-native-svg` + `lucide-react-native` | `lucide-react` |
| Pruebas | Jest + React Native Testing Library (versión compatible con React 19) | (las de `core/` cubren la lógica) |

**Dependencias de soporte aprobadas:** `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `babel-plugin-module-resolver` (alias `@core` en Metro), `@babel/plugin-transform-export-namespace-from` (Zod 4 en Metro, ver D19), `@tailwindcss/vite`. **Zod se declara en `mobile/` y en `web/` con la misma versión exacta.**

No agregues dependencias fuera de esta tabla sin preguntar y justificar. Nunca instales con `--force` ni `--legacy-peer-deps` sin aprobación.

## 3. Estructura del repositorio

Repositorio único, **sin npm workspaces** (evita problemas de hoisting con el autolinking de React Native CLI). Cada app tiene su propio `package.json` y `node_modules`.

```
/
├── core/                       Dominio y datos. Sin React Native ni DOM.
│   ├── catalog/
│   │   ├── product.schema.ts       ProductSchema, ProductListSchema; type Product = z.infer
│   │   ├── catalogApi.ts           RTK Query: getProducts (valida con rawResponseSchema, D24) y getProductById
│   │   └── catalog.selectors.ts    selectCategories, filterProducts (categoría + búsqueda)
│   ├── cart/
│   │   ├── cart.schema.ts          CartItemSchema, PersistedCartSchema
│   │   ├── cart.rules.ts           addItem, increaseQuantity, decreaseQuantity, removeItem (puras)
│   │   ├── cartSlice.ts            reducers que delegan en cart.rules
│   │   └── cart.selectors.ts       selectCartItems, selectTotalItems, selectTotalInCents
│   ├── checkout/
│   │   ├── checkout.schema.ts      CheckoutContactSchema (nombre, correo, teléfono)
│   │   └── checkoutSlice.ts        status: idle | processing | confirmed; confirmedOrder; thunk confirmOrder simulado
│   ├── store/
│   │   ├── baseApi.ts              createApi con baseUrl y tags
│   │   ├── createAppStore.ts       createAppStore(storage, options) → store tipado (D26)
│   │   └── cartPersistence.ts      listener middleware: guarda el carrito y lo rehidrata validando con Zod
│   ├── shared/
│   │   ├── money.ts                toCents, multiplyCents, sumCents, formatPrice
│   │   └── storage.types.ts        interface StorageAdapter { getItem; setItem; removeItem }
│   └── __tests__/
├── mobile/                     React Native CLI
│   ├── android/  ios/
│   └── src/
│       ├── app/                    App.tsx, providers/, navigation/, store.ts, global.css
│       ├── features/
│       │   ├── catalog/            screens/, components/, hooks/, index.ts
│       │   ├── cart/               screens/, components/, index.ts
│       │   └── checkout/           screens/, components/, index.ts
│       └── shared/
│           ├── components/atoms/       Button, AppText, Price, Badge, IconButton, Spinner, ProductImage
│           ├── components/molecules/   ErrorState, EmptyState, LoadingState, QuantityStepper
│           ├── hooks/                  useAppDispatch, useAppSelector, useDebouncedValue
│           └── platform/               helpers con Platform.select
├── web/                        React + Vite (misma organización por features que mobile/src)
├── design/tokens.css           Colores, tipografía, radios y espaciados compartidos
├── CLAUDE.md · PROMPTS.md · DECISIONS.md · README.md
└── .github/workflows/ci.yml
```

### Resolución de `core/`
`core/` no tiene `package.json` ni `node_modules`. Sus imports (`zod`, `@reduxjs/toolkit`) se resuelven desde la app que lo consume:
- **Metro:** `watchFolders: [<ruta a core>, <ruta a design>]` y `resolver.nodeModulesPaths: [<mobile>/node_modules]`.
- **Vite:** alias `@core` y `resolve.dedupe` para `react`, `react-redux`, `@reduxjs/toolkit`, `zod`, `react-hook-form` y `@hookform/resolvers`.
- **TypeScript:** `paths` con `@core/*` en el `tsconfig` de cada app, más `paths` hacia los `node_modules` de esa app para las dependencias que usa `core/`. `core/tsconfig.json` existe solo para el editor.
- **Babel (móvil):** `babel-plugin-module-resolver` con el alias `@core`, porque Metro no lee los `paths` de TypeScript.
- **Jest (móvil):** `roots` incluye `../core`, con `moduleNameMapper` para `@core` y transformación de los archivos de `core/`.
- **TypeScript igual en ambas apps:** `strict: true` en web y móvil, y las dos incluyen `../core`. En `core/` se usa `import type` y no se usan `enum` (compatibilidad con `verbatimModuleSyntax` y `erasableSyntaxOnly` de web).
- Debe existir **una sola copia** de `react` y `react-redux` en tiempo de ejecución.
- **Scripts:** `package.json` mínimo en la raíz, sin workspaces, con `lint`, `typecheck` y `test` que delegan con `--prefix`. Cada app conserva su propia configuración de ESLint.

## 4. Reglas de arquitectura (Feature-Driven + Clean)

1. **`core/` es independiente de la plataforma:** nunca importa `react-native`, `react-dom`, componentes, JSX, `window` ni `document`. Las dependencias de plataforma entran por interfaces (por ejemplo, `StorageAdapter`). **Sí puede usar `@reduxjs/toolkit/query/react`** para generar los hooks de RTK Query una sola vez: React es agnóstico de plataforma y ambas apps son React. **También contiene los hooks de React puro** que usan ambas apps (`core/*/hooks/`: listado, paginación, detalle, carrito, checkout con `react-hook-form`). Lo que depende de la plataforma (`Alert`, `BackHandler`, diálogos del DOM, `useBlocker`) se queda en cada app (D44).
2. **Dirección de dependencias:** `features → shared → core`. `core` no conoce a nadie.
3. **Los features no se importan entre sí**, salvo por su `index.ts` público.
4. **Las pantallas componen.** La lógica vive en hooks, selectores o `core/`. Una pantalla no hace cálculos ni llamadas directas.
5. **Las reglas de negocio son funciones puras** en `*.rules.ts`, con prueba. Los slices solo delegan.
6. **Una sola fuente de verdad de tipos:** los tipos de dominio salen de los schemas de Zod con `z.infer`. No dupliques interfaces.

## 5. Reglas de negocio y datos

- **Dinero en centavos enteros.** Convierte con `toCents` al entrar desde la API (`Math.round(price * 100)`). Todas las sumas y multiplicaciones se hacen en enteros. Nunca `toFixed` para calcular.
- **`formatPrice(cents)` es determinista y no usa `Intl`:** se arma con aritmética entera (dólares = `Math.floor(cents / 100)`, centavos con dos dígitos, separador de miles con coma). Resultado: `$1,234.56`. Así da lo mismo en Hermes, Node y navegadores, y las pruebas son confiables.
- **Validación en la frontera:** toda respuesta de la API y todo dato leído del storage pasa por un schema de Zod. Si el storage es inválido, se descarta y se registra un `console.warn` en desarrollo.
- **Carrito guardado:** cada item guarda un snapshot (`id`, `title`, `priceInCents`, `image`, `category`) y `quantity`, para renderizar el carrito aunque el catálogo no haya cargado.
- **Cantidad:** mínimo 1, máximo 99. `decreaseQuantity` nunca baja de 1. Agregar un producto existente incrementa su cantidad.
- **Eliminar desde el stepper:** cuando la cantidad es 1, el botón **−** del `QuantityStepper` se reemplaza por un ícono de **eliminar** (color `danger`, `accessibilityLabel` "Eliminar producto"). Al tocarlo se pide **confirmación** antes de llamar a `removeItem`. El botón **Eliminar** de la fila sigue disponible en cualquier cantidad y también confirma.
- **Confirmación por plataforma:** en móvil, `Alert.alert` nativo encapsulado en el hook `useConfirmRemoveItem`; en web, un componente `ConfirmDialog` propio. No se comparte UI entre plataformas.
- **Caché por sesión:** "una sola llamada" significa una por sesión de la app. La caché de RTK Query no se persiste; no hay modo offline del catálogo.
- **Deep links:** no se configura linking en móvil. El fallback `getProductById` existe porque en **web** sí se puede abrir `/producto/:id` directamente. Rutas web en español: `/`, `/producto/:id`, `/carrito`, `/checkout`, `/compra-confirmada` (D43).
- **Checkout:** formulario de contacto validado con Zod → resumen → `confirmOrder` simula una espera de ~1.5 s → estado `confirmed` con `confirmedOrder` (`orderNumber` `MS-` + 5 dígitos, `contact`, `totalItems`, `totalInCents`, tomados antes de limpiar) → limpia el carrito. `condition` evita el doble envío y la compra con carrito vacío (D25).
- **Validación de la API:** `rawResponseSchema` + `catchSchemaFailure` de RTK Query, que devuelven un error controlado; `transformResponse` solo convierte a `CatalogProduct` (D24). `/products/:id` responde `200` con cuerpo vacío si no existe: se trata como `PRODUCT_NOT_FOUND`.
- **Entorno:** `core/` no usa `__DEV__`, `process.env` ni `import.meta.env`. Cada app pasa `isDevelopment` a `createAppStore` (`__DEV__` en móvil, `import.meta.env.DEV` en web) (D26).
- **Reglas sin cambios devuelven la misma referencia:** si una regla del carrito no cambia nada, devuelve el mismo arreglo, para no disparar persistencia ni renders de más (D28).

## 6. Optimización de llamadas (requisito explícito)

- `getProducts` se pide **una vez** y queda en caché de RTK Query (`keepUnusedDataFor` alto). Sin `refetchOnFocus` ni `refetchOnMountOrArgChange`.
- **El detalle no llama a `/products/:id`:** lee el producto del listado en caché (`selectFromResult`). Solo si no está en caché (por ejemplo, deep link directo) se pide el detalle. Documenta este fallback.
- **Las categorías se derivan** de los productos cargados; no se llama a `/products/categories`.
- **Filtro y búsqueda en el cliente** con `useMemo`; la búsqueda con debounce de 300 ms.
- **Lazy load:** la API devuelve 20 productos sin paginación del servidor. Se pagina en el cliente con `usePaginatedProducts` (8 por página, siguiente en `onEndReached`), sobre una FlatList virtualizada (`keyExtractor`, `getItemLayout` si la altura es fija, items con `React.memo`, `initialNumToRender` y `windowSize` ajustados). En web: `IntersectionObserver` e imágenes con `loading="lazy"`. El hook debe poder cambiarse a paginación de servidor sin tocar las pantallas.

## 7. Componentes (atómicos y reutilizables)

- **Atoms:** sin lógica de negocio ni acceso al store. Reciben todo por props.
- **Molecules:** combinan atoms y siguen sin acceso al store.
- **Componentes de feature:** pueden usar hooks del feature. Las pantallas los componen.
- Un componente por archivo. Props tipadas con `interface NombreComponenteProps`.
- Variantes por props (`variant`, `size`), no componentes duplicados.
- Estilos solo con clases de Uniwind/Tailwind basadas en los tokens. Nada de colores hardcodeados. `StyleSheet` solo si Uniwind no puede expresarlo, y comentado.
- **Excepción de color en JS:** las props que exigen un string de color (`android_ripple`, `ActivityIndicator`, `shadowColor`, color de íconos) leen el valor del token desde JS (hook de Uniwind para variables CSS, o un objeto de tema generado a partir de los tokens). Nunca un hex escrito a mano en un componente.
- **Uniwind 1.12.2 verificado (P03):** compatible con RN 0.87.1 sin Expo; `mobile/src/app/global.css` importa `../../../design/tokens.css`. En móvil, `--font-sans` se sobrescribe por plataforma (Roboto en Android, System en iOS).
- **Tamaño del precio:** usa `text-price-md` (o `-sm`, `-lg`, `-xl`) para tamaño y `text-price` para color. No existe `--text-price` base (D22).
- **Color en JS:** funcionan `colorClassName="accent-*"` y `useCSSVariable('--color-*')` de Uniwind.
- **Si la app queda en negro o no responde tras cambiar `metro.config.js`:** reinicia Metro con `--reset-cache` y cierra la app por completo (`adb shell am force-stop com.minishop`); recargar no basta.

## 8. Convenciones de nombres (clean code)

- **Código en inglés; textos de UI en español.**
- Componentes y tipos: `PascalCase` con sustantivo claro (`ProductCard`, `CartSummary`).
- Funciones: verbo + objeto (`addItem`, `formatPrice`, `filterProducts`).
- Hooks: `use` + propósito (`usePaginatedProducts`, `useDebouncedValue`).
- Booleanos: `is`/`has`/`can` (`isLoading`, `hasError`, `canDecrease`).
- Handlers internos `handle*`; props de eventos `on*` (`onAddToCart`).
- Schemas: `*Schema`. Selectores: `select*`. Slices: `*Slice`. Endpoints: `*Api`.
- Constantes: `UPPER_SNAKE_CASE` (`MAX_QUANTITY`, `PAGE_SIZE`).
- Archivos de componentes en `PascalCase.tsx`; el resto en `camelCase.ts`.
- TypeScript estricto. **Prohibido `any`** y `@ts-ignore`. Usa `unknown` y estrecha.

## 9. Android primero, iOS listo

- `Pressable` con `android_ripple` y estado `pressed` para iOS.
- Sombras: clases `shadow-card` y `shadow-bar` de Uniwind, que se traducen a `boxShadow` (RN 0.87, Android 9+ e iOS). Respaldo para Android API < 28 con `getLegacyShadowStyle('card' | 'bar')` de `shared/platform/shadows.ts` (`elevation` 2 y 8). Ver D21.
- Edge-to-edge con `react-native-safe-area-context` (`useSafeAreaInsets`), sin `SafeAreaView` de React Native.
- El botón atrás físico lo maneja el native stack; no agregues `BackHandler` salvo en flujos que lo requieran (checkout en proceso).
- `accessibilityLabel` y `accessibilityRole` en botones de solo ícono (+, −, eliminar, carrito).
- No uses APIs exclusivas de Android sin su equivalente o fallback para iOS.

## 10. Estados de UI obligatorios

Cada pantalla con datos maneja: **cargando**, **error con Reintentar**, **vacío** y **éxito**. Casos de vacío: carrito vacío, búsqueda sin resultados, categoría sin productos. Las imágenes tienen placeholder si fallan.

## 11. Calidad

- Scripts en la raíz: `npm run lint`, `npm run typecheck`, `npm test` (delegan en cada app con `--prefix`).
- Pruebas obligatorias: `cart.rules`, `money`, `cart.selectors`, schemas y rehidratación inválida de `cartPersistence`. RNTL para `QuantityStepper` y `ErrorState`.
- Commits pequeños con Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`). Un feature por commit.

## 12. Cómo trabajar conmigo (Claude Code)

1. Para cualquier cambio de más de un archivo: **primero un plan** con archivos a crear o modificar y por qué. Espera aprobación.
2. No marques una tarea como terminada sin correr `typecheck`, `lint` y las pruebas relacionadas, y reportar el resultado.
3. Si algo de este archivo choca con la realidad de una librería (versión, compatibilidad), **detente y avísame** con la evidencia; no improvises un workaround silencioso.
4. Al terminar cada tarea, dame un resumen corto: qué hiciste, qué decisiones tomaste y qué debería revisar yo. Lo uso para documentar `PROMPTS.md`.
5. No edites `PROMPTS.md` ni `DECISIONS.md`: esos los escribo yo.
