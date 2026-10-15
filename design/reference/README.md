# Referencia de diseño (Claude Design)

Código fuente de cada tablero del diseño de **Mi Surtido**, exportado desde Claude Design.

- Uso: fuente de **medidas, colores, tipografía y textos exactos** para implementar la UI.
- Los valores visuales salen de `design/tokens.css`; si un tablero tiene un hex que coincide con un token, usa el token.
- Las imágenes (`/_blob/...`) y `support.js` no cargan fuera de Claude Design: son solo datos de ejemplo.
- Diferencia intencional: el diálogo de `09-Carrito-Confirmar` se implementa en **web**; en móvil se usa `Alert.alert` nativo (D15).

Orden: 01–07 listado y detalle móvil · 08–13 carrito y checkout móvil · 14 componentes · 15 specs · 16 tokens · 17–20 web.
