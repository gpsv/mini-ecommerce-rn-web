# Troubleshooting (móvil)

Problemas reales que aparecieron durante el desarrollo, con su causa y su solución. Los comandos `npm` de Metro se ejecutan dentro de `mobile/`, y los de `adb` se pueden ejecutar desde cualquier carpeta.

## Metro no conecta, está en otro puerto o quedó colgado

**Síntoma:** la app muestra "Could not connect to development server", o Metro no responde a `r`.

**Causa:** hay otro Metro (u otro proceso) ocupando el puerto 8081, o el emulador perdió el túnel hacia la Mac.

```bash
lsof -i :8081                     # ¿quién ocupa el puerto?
kill <PID>                        # cerrar el Metro anterior
adb reverse tcp:8081 tcp:8081     # rehacer el túnel emulador → Mac
```

Para usar otro puerto:

```bash
cd mobile
npm start -- --port 8082
adb reverse tcp:8082 tcp:8082
```

En la app: menú de desarrollo (`adb shell input keyevent 82`) → *Change Bundle Location* → `localhost:8082`.

## Pantalla negra o app que no responde después de cambiar la configuración

**Síntoma:** después de cambiar `metro.config.js`, `babel.config.js` o `global.css`, la app queda en negro o no reacciona, aunque Metro ya compile bien.

**Causa probable:** quedó una instancia de React rota por un error de resolución anterior al reinicio. Recargar con `r` reutiliza esa instancia.

```bash
cd mobile
npm start -- --reset-cache             # reinicia Metro sin caché
adb shell am force-stop com.minishop   # cierra la app por completo
```

Después abre la app de nuevo desde el launcher. Recargar no basta.

## Metro se ejecuta desde `mobile/`, no desde la raíz

**Síntoma:** `Unable to resolve module @core/...`, o Metro arranca sin la configuración de Uniwind.

**Causa:** la raíz del repositorio no tiene `metro.config.js`. La configuración que agrega `core/` y `design/` (`watchFolders`, `nodeModulesPaths`), el alias `@core` de Babel y Uniwind vive en `mobile/`.

```bash
cd mobile
npm start
npm run android   # en otra terminal, también desde mobile/
```

## `TransformError` viejo después de editar un archivo

**Síntoma:** en la consola o en DevTools aparece un `TransformError` de un archivo que ya está bien, por ejemplo `ProductCard.tsx`.

**Causa:** Metro compiló el archivo mientras se estaba guardando o escribiendo, y el error se queda en el historial de la consola.

**Solución:** limpia la consola y recarga con `r`. Si el error vuelve a aparecer, es real. Si persiste sin cambios en el código, reinicia con `npm start -- --reset-cache`.

## Probar el error de red: el modo avión en debug corta Metro

**Síntoma:** en debug, al activar el modo avión la app pierde la conexión con Metro y no se puede ver el `ErrorState`.

**Causa:** en debug el JavaScript llega desde Metro por la red. En release el bundle va dentro del APK.

**Solución:** probar con el APK de release.

```bash
cd mobile/android && ./gradlew assembleRelease && cd ../..
adb install -r mobile/android/app/build/outputs/apk/release/app-release.apk
adb shell am force-stop com.minishop                 # sesión nueva: la caché de RTK Query es por sesión
adb shell cmd connectivity airplane-mode enable
```

1. Abre la app: aparecen el loader y luego el error con **Reintentar**.
2. Toca **Reintentar** sin red: el error vuelve a aparecer y la app no se cierra.
3. Desactiva el modo avión (`adb shell cmd connectivity airplane-mode disable`), espera a que haya red y toca **Reintentar**: el listado carga.
4. Opcional: el carrito guardado se ve en modo avión, porque no depende del catálogo.

`adb install -r` reemplaza la versión de debug porque las dos están firmadas con el mismo keystore de debug. Para volver a desarrollo, ejecuta `npm run android`.

## Release: "MiniShop keeps stopping" al cambiar el tamaño de fuente

**Síntoma:** solo en el APK de release, la app se cierra cuando Android recrea la Activity, por ejemplo al cambiar el tamaño de fuente con la app abierta. En logcat (`adb logcat -b crash`) aparece `Screen fragments should never be restored`.

**Causa:** `RNScreensFragmentFactory`, que se configura en `MainActivity`, reconoce los fragments de `react-native-screens` por su nombre de paquete. R8 los renombra y la comprobación falla.

**Solución:** en `android/app/proguard-rules.pro` hay una regla `-keepnames` que conserva solo los nombres de esos fragments. Si cambias las reglas de R8, vuelve a probar con `adb shell settings put system font_scale 1.3` con la app abierta.

## `WARN` de `ReactNativeFeatureFlags` en Metro

**Síntoma:** Metro muestra un `WARN` que menciona `ReactNativeFeatureFlags`.

**Causa:** es interno de React Native 0.87, no viene del código del proyecto.

**Solución:** ninguna; se puede ignorar.

## Restaurar el emulador después de probar fuente grande o pantalla pequeña

```bash
adb shell settings put system font_scale 1.3   # probar fuente grande (también 2.0)
adb shell wm density 597                       # simular 360 dp en un emulador de 1344 px
adb shell settings put system font_scale 1.0   # restaurar
adb shell wm density reset                     # restaurar
```
