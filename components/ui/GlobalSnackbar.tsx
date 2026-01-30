import { Snackbar } from 'react-native-paper';
import { useSnackbar } from '@/hooks/use-snackbar';

export function GlobalSnackbar() {
  const { visible, message, type, duration, hideSnackbar } = useSnackbar();

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      default:
        return undefined;
    }
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar}
      duration={duration}
      action={{
        label: 'Dismiss',
        onPress: hideSnackbar,
      }}
      style={type !== 'info' ? { backgroundColor: getBackgroundColor() } : undefined}
    >
      {message}
    </Snackbar>
  );
}
