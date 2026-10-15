import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Lives in shared/ (not app/navigation) because feature screens need it and
 * features may not import app/ (features → shared → core).
 */
export type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: number };
  Cart: undefined;
  Checkout: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

// Types useNavigation() everywhere without passing the param list by hand.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
