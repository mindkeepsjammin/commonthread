import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router, Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations';
import { resetPassword } from '@/lib/neon/auth';

export default function ForgotPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);
    setError(null);

    const result = await resetPassword(data.email);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace({
      pathname: '/(auth)/reset-password-sent' as Href,
      params: { email: data.email },
    } as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center p-6">
        <Text variant="headlineLarge" className="mb-2 text-center">
          Reset Password
        </Text>
        <Text variant="bodyLarge" className="mb-8 text-center text-gray-500">
          Enter your email and we'll send you a reset link
        </Text>

        {error && (
          <View className="mb-4 rounded-lg bg-red-100 p-3">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-6">
              <TextInput
                label="Email"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.email}
              />
              {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
            </View>
          )}
        />

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="mb-4"
        >
          Send Reset Link
        </Button>

        <Link href="/(auth)/login" asChild>
          <Button mode="text">Back to Sign In</Button>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
