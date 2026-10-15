import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../shared/navigation/types';

type RootNavigation = NavigationProp<RootStackParamList>;

/** Reuses the existing catalog route (same key), so the catalog keeps its filters and scroll. */
function getCatalogRoute(navigation: RootNavigation) {
  const key = navigation
    .getState()
    ?.routes.find(route => route.name === 'ProductList')?.key;
  return { name: 'ProductList' as const, key };
}

/** [catalog, confirmation]: back from the confirmation goes to the catalog, never to checkout. */
export function resetToOrderConfirmed(navigation: RootNavigation) {
  navigation.reset({
    index: 1,
    routes: [getCatalogRoute(navigation), { name: 'OrderConfirmed' }],
  });
}

export function resetToCatalog(navigation: RootNavigation) {
  navigation.reset({ index: 0, routes: [getCatalogRoute(navigation)] });
}
