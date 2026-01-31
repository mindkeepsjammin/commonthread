import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Link, router, Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { signUpWithEmail } from '@/lib/neon/auth';
import { signInWithGoogle } from '@/lib/neon/social-auth';
import { Divider } from 'react-native-paper';

export default function SignupScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsSubmitting(true);
    setError(null);

    const result = await signUpWithEmail(data.email, data.password, data.displayName);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    // If no session returned, email confirmation is required
    if (!result.session) {
      router.replace('/(auth)/verify-email' as Href);
      return;
    }

    // Redirect to profile completion after signup
    router.replace('/(auth)/complete-profile' as Href);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center p-6">
          <Text variant="headlineLarge" className="mb-2 text-center">
            Create Account
          </Text>
          <Text variant="bodyLarge" className="mb-8 text-center text-neutral-500">
            Join Common Thread
          </Text>

          {error && (
            <View className="mb-4 rounded-lg bg-red-100 p-3">
              <Text className="text-red-700">{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-4">
                <TextInput
                  label="Display Name"
                  mode="outlined"
                  autoCapitalize="words"
                  autoComplete="name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.displayName}
                />
                {errors.displayName && (
                  <HelperText type="error">{errors.displayName.message}</HelperText>
                )}
              </View>
            )}
          />

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
              <View className="mb-4">
                <TextInput
                  label="Password"
                  mode="outlined"
                  secureTextEntry
                  autoComplete="new-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={!!errors.password}
                />
                {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-6">
                <TextInput
                  label="Confirm Password"
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
            className="mb-4"
          >
            Create Account
          </Button>

          <View className="my-4 flex-row items-center">
            <Divider className="flex-1" />
            <Text variant="bodySmall" className="mx-4 text-neutral-400">OR</Text>
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
                router.replace('/(tabs)' as Href);
              }
              setIsGoogleLoading(false);
            }}
            loading={isGoogleLoading}
            disabled={isGoogleLoading || isSubmitting}
            className="mb-4"
          >
            Sign up with Google
          </Button>

          <Link href="/(auth)/login" asChild>
            <Button mode="text">Already have an account? Sign in</Button>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
