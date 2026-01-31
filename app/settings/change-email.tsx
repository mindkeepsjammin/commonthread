import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeEmailSchema, type ChangeEmailInput } from '@/lib/validations';
import { updateEmail } from '@/lib/neon/auth';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function ChangeEmailScreen() {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ChangeEmailInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateEmail(data.email);

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
        <Text variant="headlineMedium" className="mb-2">
          Change Email
        </Text>
        <Text variant="bodyMedium" className="mb-6 text-neutral-500">
          Current email: {user?.email}
        </Text>

        {error && (
          <View className="mb-4 rounded-lg bg-red-100 p-3">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        {success && (
          <View className="mb-4 rounded-lg bg-green-100 p-3">
            <Text className="text-green-700">
              A confirmation link has been sent to your new email address.
            </Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-6">
              <TextInput
                label="New Email"
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
        >
          Update Email
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
