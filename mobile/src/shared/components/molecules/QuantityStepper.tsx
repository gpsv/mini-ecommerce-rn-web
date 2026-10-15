import { Text, View } from 'react-native';
import { Minus, Plus, Trash } from 'lucide-react-native';
import { MAX_QUANTITY, MIN_QUANTITY } from '@core/cart/cart.schema';
import { IconButton } from '../atoms/IconButton';

export interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  /**
   * Cart only: at quantity 1 the − becomes a delete icon that calls this
   * (the screen asks for confirmation, D08). Without it, − is just disabled.
   */
  onRemoveRequest?: () => void;
  className?: string;
}

const STEP_ICON_SIZE = 18;

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  onRemoveRequest,
  className = '',
}: QuantityStepperProps) {
  const isAtMin = quantity <= MIN_QUANTITY;
  const canIncrease = quantity < MAX_QUANTITY;
  const showsRemove = isAtMin && onRemoveRequest !== undefined;

  return (
    <View
      className={`h-10 flex-row items-center self-start border border-border rounded-md overflow-hidden bg-surface ${className}`}
    >
      {showsRemove ? (
        <IconButton
          icon={Trash}
          accessibilityLabel="Eliminar producto"
          variant="danger"
          shape="square"
          size={40}
          iconSize={STEP_ICON_SIZE}
          onPress={onRemoveRequest}
        />
      ) : (
        <IconButton
          icon={Minus}
          accessibilityLabel="Quitar uno"
          variant="primary"
          shape="square"
          size={40}
          iconSize={STEP_ICON_SIZE}
          disabled={isAtMin}
          onPress={onDecrease}
        />
      )}
      <Text
        accessibilityLabel={`Cantidad: ${quantity}`}
        className="min-w-9 text-center font-sans text-[16px] font-semibold text-text"
      >
        {quantity}
      </Text>
      <IconButton
        icon={Plus}
        accessibilityLabel="Agregar uno"
        variant="primary"
        shape="square"
        size={40}
        iconSize={STEP_ICON_SIZE}
        disabled={!canIncrease}
        onPress={onIncrease}
      />
    </View>
  );
}
