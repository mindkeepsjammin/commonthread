import { View, Image } from 'react-native';
import { Text } from 'react-native-paper';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'h-10 w-10',
  medium: 'h-16 w-16',
  large: 'h-24 w-24',
};

const textSizes = {
  small: 'text-sm',
  medium: 'text-xl',
  large: 'text-3xl',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ uri, name, size = 'medium' }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const textSize = textSizes[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeClass} rounded-full bg-neutral-200`}
        resizeMode="cover"
      />
    );
  }

  return (
    <View className={`${sizeClass} items-center justify-center rounded-full bg-primary-500`}>
      <Text className={`${textSize} font-semibold text-white`}>{getInitials(name)}</Text>
    </View>
  );
}
