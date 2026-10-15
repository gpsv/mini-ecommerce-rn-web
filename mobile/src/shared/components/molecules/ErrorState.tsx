import { View } from 'react-native';
import { CloudOff } from 'lucide-react-native';
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
      className={`items-center gap-2.5 px-8 py-2 ${className}`}
    >
      <View className="size-[72px] rounded-full bg-danger-soft items-center justify-center">
        <CloudOff size={32} color={dangerColor} strokeWidth={2} />
      </View>
      <AppText variant="subtitle" className="text-center">
        {title}
      </AppText>
      <AppText tone="muted" className="text-center">
        {message}
      </AppText>
      <Button label={retryLabel} onPress={onRetry} className="mt-1 self-center" />
    </View>
  );
}
