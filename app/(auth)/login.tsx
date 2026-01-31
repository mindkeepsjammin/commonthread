import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router, Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { signInWithEmail } from '@/lib/neon/auth';
import { signInWithGoogle } from '@/lib/neon/social-auth';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Divider } from 'react-native-paper';

export default function LoginScreen() {
  const { isSessionExpired, setSessionExpired } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setError(null);

    const result = await signInWithEmail(data.email, data.password);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    setSessionExpired(false);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center bg-neutral-50 p-6">
        <Text variant="headlineLarge" className="mb-2 text-center">
          Welcome Back
        </Text>
        <Text variant="bodyLarge" className="mb-8 text-center text-neutral-600">
          Sign in to Common Thread
        </Text>

        {isSessionExpired && (
          <View className="mb-4 rounded-lg bg-accent-100 p-3">
            <Text className="text-accent-900">Your session has expired. Please sign in again.</Text>
          </View>
        )}

        {error && (
          <View className="mb-4 rounded-lg bg-primary-100 p-3">
            <Text className="text-primary-900">{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-6">
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry
                autoComplete="password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.password}
              />
              {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}
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
          Sign In
        </Button>

        <Link href={'/(auth)/forgot-password' as Href} asChild>
          <Button mode="text">Forgot password?</Button>
        </Link>

        <View className="my-4 flex-row items-center">
          <Divider className="flex-1" />
          <Text variant="bodySmall" className="mx-4 text-neutral-500">OR</Text>
          <Divider className="flex-1" />
        </View>

        <Button
          mode="outlined"
          icon="google"
          onPress={async () => {
            setIsGoogleLoading(true);
            setError(null);
            const { error: googleError } = await signInWithGoogle();
            if (googleError) {
              setError(googleError.message);
            } else {
              setSessionExpired(false);
              router.replace('/(tabs)');
            }
            setIsGoogleLoading(false);
          }}
          loading={isGoogleLoading}
          disabled={isGoogleLoading || isSubmitting}
          className="mb-4"
        >
          Sign in with Google
        </Button>

        <Link href="/(auth)/signup" asChild>
          <Button mode="text">Don't have an account? Sign up</Button>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
