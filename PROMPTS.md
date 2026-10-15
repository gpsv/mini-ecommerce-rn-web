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
- **Commit:** `docs: record decisions from AI risk review (P01)`

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
