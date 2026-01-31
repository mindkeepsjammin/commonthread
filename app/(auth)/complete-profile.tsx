import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, HelperText } from 'react-native-paper';
import { router, Href } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProfile } from '@/hooks/use-profile';
import { Avatar } from '@/components/ui';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['child', 'teen', 'adult', 'elder']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfileScreen() {
  const [error, setError] = useState<string | null>(null);
  const createProfile = useCreateProfile();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      role: 'adult',
    },
  });

  const displayName = watch('displayName');

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);

    try {
      await createProfile.mutateAsync({
        displayName: data.displayName,
        role: data.role,
      });
      // Navigate to onboarding instead of tabs
      router.replace('/(onboarding)/welcome' as Href);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="flex-1 p-6 pt-16">
        <Text variant="headlineLarge" className="mb-2 text-center">
          Complete Your Profile
        </Text>
        <Text variant="bodyLarge" className="mb-8 text-center text-neutral-500">
          Tell us a bit about yourself
        </Text>

        <View className="mb-8 items-center">
          <Avatar name={displayName} size="large" />
        </View>

        {error && (
          <View className="mb-4 rounded-lg bg-red-100 p-3">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-6">
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
              <HelperText type="info">This is how your family will see you</HelperText>
            </View>
          )}
        />

        <View className="mb-6">
          <Text variant="titleMedium" className="mb-3">
            Life Stage
          </Text>
          <Text variant="bodySmall" className="mb-3 text-neutral-500">
            This helps personalize your experience
          </Text>
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value || 'adult'}
                onValueChange={onChange}
                buttons={[
                  { value: 'child', label: 'Child' },
                  { value: 'teen', label: 'Teen' },
                  { value: 'adult', label: 'Adult' },
                  { value: 'elder', label: 'Elder' },
                ]}
              />
            )}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createProfile.isPending}
          disabled={createProfile.isPending}
          className="mt-4"
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
}
