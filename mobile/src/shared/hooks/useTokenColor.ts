import { useCSSVariable } from 'uniwind';

export type ColorToken = `--color-${string}`;

const HEX_COLOR = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

/** Turns a #RRGGBB token into rgba() so a ripple can be a tint of it. */
function applyOpacity(color: string, opacity: number): string {
  const match = HEX_COLOR.exec(color);
  if (!match) {
    return color;
  }
  const [red, green, blue] = match.slice(1).map(channel => parseInt(channel, 16));
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

/**
 * Reads a color token from design/tokens.css for props that need a string
 * (icon color, android_ripple, ActivityIndicator). Never hardcode a hex (D14).
 */
export function useTokenColor(
  token: ColorToken,
  opacity?: number,
): string | undefined {
  const value = useCSSVariable(token);
  if (typeof value !== 'string') {
    return undefined;
  }
  return opacity === undefined ? value : applyOpacity(value, opacity);
}
