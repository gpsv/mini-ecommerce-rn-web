import { View } from 'react-native';
import { AppText } from '../../../shared/components/atoms/AppText';
import { Spinner } from '../../../shared/components/atoms/Spinner';

/** 03-Listado-CargandoMas: 64 high with Spinner 24. Shown while there are more pages. */
export function LoadMoreFooter() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando más productos"
      className="h-16 flex-row items-center justify-center gap-2.5"
    >
      <Spinner size={24} />
      <AppText tone="muted" className="font-medium">
        Cargando más productos…
      </AppText>
    </View>
  );
}
