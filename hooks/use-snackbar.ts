import { create } from 'zustand';

interface SnackbarState {
  visible: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
  duration: number;

  showSnackbar: (message: string, type?: 'info' | 'success' | 'error', duration?: number) => void;
  hideSnackbar: () => void;
}

export const useSnackbar = create<SnackbarState>(set => ({
  visible: false,
  message: '',
  type: 'info',
  duration: 3000,

  showSnackbar: (message, type = 'info', duration = 3000) =>
    set({
      visible: true,
      message,
      type,
      duration,
    }),

  hideSnackbar: () =>
    set({
      visible: false,
    }),
}));
