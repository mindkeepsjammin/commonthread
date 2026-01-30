import { Chip, useTheme } from 'react-native-paper';

interface ValueChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function ValueChip({ label, selected, onPress }: ValueChipProps) {
  const theme = useTheme();

  return (
    <Chip
      mode={selected ? 'flat' : 'outlined'}
      selected={selected}
      onPress={onPress}
      className="m-1"
      style={{
        backgroundColor: selected ? theme.colors.primaryContainer : 'transparent',
      }}
      textStyle={{
        color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
      }}
    >
      {label}
    </Chip>
  );
}
