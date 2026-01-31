import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/lib/theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const SIZES = {
  sm: { icon: 32, fontSize: 18, gap: 8 },
  md: { icon: 48, fontSize: 24, gap: 10 },
  lg: { icon: 64, fontSize: 32, gap: 12 },
} as const;

/**
 * Common Thread logo — intertwined thread/heart SVG icon with optional text.
 *
 * @param size - sm (32px), md (48px), lg (64px)
 * @param variant - "full" (icon + text) or "icon" (icon only)
 */
export const Logo = ({ size = 'md', variant = 'full' }: LogoProps) => {
  const theme = useTheme();
  const { icon: iconSize, fontSize, gap } = SIZES[size];

  return (
    <View className="items-center" style={{ gap }}>
      <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
        {/* Intertwined thread forming a heart/knot shape */}
        {/* Left thread arc */}
        <Path
          d="M32 56 C16 44 6 34 6 22 C6 14 12 8 20 8 C25 8 29 11 32 15"
          stroke={colors.primary[500]}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right thread arc */}
        <Path
          d="M32 56 C48 44 58 34 58 22 C58 14 52 8 44 8 C39 8 35 11 32 15"
          stroke={colors.primary[300]}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center crossing knot */}
        <Path
          d="M26 28 C26 24 30 20 34 22 C38 24 38 30 34 32 C30 34 26 32 26 28Z"
          fill={colors.accent[400]}
          opacity={0.8}
        />
        {/* Thread tail left */}
        <Path
          d="M20 8 C14 8 10 4 8 2"
          stroke={colors.primary[500]}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />
        {/* Thread tail right */}
        <Path
          d="M44 8 C50 8 54 4 56 2"
          stroke={colors.primary[300]}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />
      </Svg>
      {variant === 'full' && (
        <Text
          style={{
            fontFamily: 'Merriweather-Bold',
            fontSize,
            color: theme.colors.onBackground,
            textAlign: 'center',
          }}
        >
          Common Thread
        </Text>
      )}
    </View>
  );
};
