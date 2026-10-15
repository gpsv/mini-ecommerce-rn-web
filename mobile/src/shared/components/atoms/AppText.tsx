import { Text, type TextProps } from 'react-native';

export type AppTextVariant = 'title' | 'subtitle' | 'body' | 'caption';
export type AppTextTone = 'default' | 'muted' | 'danger' | 'success' | 'onPrimary';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  /** Defaults to muted for caption and to default for the rest. */
  tone?: AppTextTone;
  className?: string;
}

const VARIANT_CLASS: Record<AppTextVariant, string> = {
  title: 'text-title',
  subtitle: 'text-subtitle',
  body: 'text-body',
  caption: 'text-caption',
};

const TONE_CLASS: Record<AppTextTone, string> = {
  default: 'text-text',
  muted: 'text-text-muted',
  danger: 'text-danger',
  success: 'text-success',
  onPrimary: 'text-primary-foreground',
};

export function AppText({
  variant = 'body',
  tone,
  className = '',
  ...textProps
}: AppTextProps) {
  const resolvedTone = tone ?? (variant === 'caption' ? 'muted' : 'default');
  return (
    <Text
      className={`font-sans ${VARIANT_CLASS[variant]} ${TONE_CLASS[resolvedTone]} ${className}`}
      {...textProps}
    />
  );
}
