import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { router, Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newPasswordSchema, type NewPasswordInput } from '@/lib/validations';
import { updatePassword } from '@/lib/neon/auth';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: NewPasswordInput) => {
    setIsSubmitting(true);
    setError(null);

    const result = await updatePassword(data.password);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace('/(tabs)' as Href);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center p-6">
        <Text variant="headlineLarge" className="mb-2 text-center" style={{ color: theme.colors.onBackground }}>
          Set New Password
        </Text>
        <Text variant="bodyLarge" className="mb-8 text-center" style={{ color: theme.colors.onSurfaceVariant }}>
          Enter your new password below
        </Text>

        {error && (
          <View className="mb-4 rounded-lg p-3" style={{ backgroundColor: theme.colors.errorContainer }}>
            <Text style={{ color: theme.colors.error }}>{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="password"
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
                error={!!errors.password}
              />
              {errors.password && (
                <HelperText type="error">{errors.password.message}</HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
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
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <HelperText type="error">{errors.confirmPassword.message}</HelperText>
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
