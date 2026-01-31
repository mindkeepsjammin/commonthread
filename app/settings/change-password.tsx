import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validations';
import { signInWithEmail, updatePassword } from '@/lib/neon/auth';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Verify current password by re-authenticating
    const signInResult = await signInWithEmail(user?.email ?? '', data.currentPassword);
    if (signInResult.error) {
      setError('Current password is incorrect.');
      setIsSubmitting(false);
      return;
    }

    const result = await updatePassword(data.newPassword);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    reset();
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 p-6">
        <Text
          variant="headlineMedium"
          className="mb-6"
          style={{ color: theme.colors.onBackground }}
        >
          Change Password
        </Text>

        {error && (
          <View
            className="mb-4 rounded-lg p-3"
            style={{ backgroundColor: theme.colors.errorContainer }}
          >
            <Text style={{ color: theme.colors.error }}>{error}</Text>
          </View>
        )}

        {success && (
          <View
            className="mb-4 rounded-lg p-3"
            style={{ backgroundColor: theme.colors.secondaryContainer }}
          >
            <Text style={{ color: theme.colors.secondary }}>Password updated successfully.</Text>
          </View>
        )}

        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                label="Current Password"
                mode="outlined"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.currentPassword}
              />
              {errors.currentPassword && (
                <HelperText type="error">{errors.currentPassword.message}</HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                label="New Password"
                mode="outlined"
                secureTextEntry
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.newPassword}
              />
              {errors.newPassword && (
                <HelperText type="error">{errors.newPassword.message}</HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-6">
              <TextInput
                label="Confirm New Password"
                mode="outlined"
                secureTextEntry
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.confirmNewPassword}
              />
              {errors.confirmNewPassword && (
                <HelperText type="error">{errors.confirmNewPassword.message}</HelperText>
              )}
            </View>
          )}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Update Password
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
