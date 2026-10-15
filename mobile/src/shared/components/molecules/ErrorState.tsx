import { View } from 'react-native';
import { CloudOff, RotateCw } from 'lucide-react-native';
import { useTokenColor } from '../../hooks/useTokenColor';
import { AppText } from '../atoms/AppText';
import { Button } from '../atoms/Button';

export interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  message?: string;
  retryLabel?: string;
  className?: string;
}

/** Layout of 04-Listado-Error: icon 36, title 18/24, Button lg with RotateCw. */
export function ErrorState({
  onRetry,
  title = 'No pudimos cargar los productos',
  message = 'Revisa tu conexión a internet e inténtalo de nuevo.',
  retryLabel = 'Reintentar',
  className = '',
}: ErrorStateProps) {
  const dangerColor = useTokenColor('--color-danger');
  return (
    <View
      accessibilityRole="alert"
      className={`items-center gap-3 px-8 ${className}`}
    >
      <View className="size-[72px] mb-1 rounded-full bg-danger-soft items-center justify-center">
        <CloudOff size={36} color={dangerColor} strokeWidth={2} />
      </View>
      <AppText className="text-center text-[18px] leading-6 font-semibold">
        {title}
      </AppText>
      <AppText tone="muted" className="text-center">
        {message}
      </AppText>
      <Button
        label={retryLabel}
        size="lg"
        icon={RotateCw}
        onPress={onRetry}
        className="mt-2 self-center"
      />
    </View>
  );
}
