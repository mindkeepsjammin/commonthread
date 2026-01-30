import { Button, useTheme } from 'react-native-paper';

interface SkipLinkProps {
  onSkip: () => void;
  label?: string;
}

export function SkipLink({ onSkip, label = 'Skip for now' }: SkipLinkProps) {
  const theme = useTheme();

  return (
    <Button
      mode="text"
      onPress={onSkip}
      textColor={theme.colors.onSurfaceVariant}
      compact
    >
      {label}
    </Button>
  );
}
