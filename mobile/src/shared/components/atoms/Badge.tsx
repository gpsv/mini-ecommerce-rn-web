import { Text, View } from 'react-native';
import { TEXT_METRICS, getFixedScaleTextProps } from '../../theme/typography';

const MAX_VISIBLE_COUNT = 9;

interface LabelBadgeProps {
  variant: 'category' | 'success';
  label: string;
}

interface CountBadgeProps {
  /** CartBadge: hidden at 0, shows "9+" from 10. */
  variant: 'count';
  count: number;
}

export type BadgeProps = (LabelBadgeProps | CountBadgeProps) & {
  className?: string;
  /**
   * Scales the text by this factor instead of the system font scale, where the
   * layout computes its height in JS (ProductCard).
   */
  fixedFontScale?: number;
};

const LABEL_CONTAINER_CLASS: Record<LabelBadgeProps['variant'], string> = {
  category: 'bg-primary-soft',
  success: 'bg-success-soft',
};

const LABEL_TEXT_CLASS: Record<LabelBadgeProps['variant'], string> = {
  category: 'text-primary-soft-foreground font-medium',
  success: 'text-success font-semibold',
};

export function Badge(props: BadgeProps) {
  const { className = '', fixedFontScale } = props;

  if (props.variant === 'count') {
    if (props.count <= 0) {
      return null;
    }
    const label =
      props.count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : String(props.count);
    return (
      <View
        className={`min-w-5 h-5 px-[5px] rounded-full bg-cart-badge items-center justify-center ${className}`}
      >
        <Text className="font-sans text-[11px] leading-4 font-bold text-primary-foreground">
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`self-start min-h-5 py-0.5 px-2 rounded-full justify-center ${LABEL_CONTAINER_CLASS[props.variant]} ${className}`}
    >
      <Text
        className={`font-sans text-caption ${LABEL_TEXT_CLASS[props.variant]}`}
        numberOfLines={1}
        {...(fixedFontScale === undefined
          ? undefined
          : getFixedScaleTextProps(TEXT_METRICS.caption, fixedFontScale))}
      >
        {props.label}
      </Text>
    </View>
  );
}
