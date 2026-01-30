import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function ThankYouPage() {
  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <View className="max-w-md items-center">
        <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">✓</Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          Thank You
        </Text>

        <Text className="text-lg text-gray-600 text-center mb-6">
          Your reflections have been received.
        </Text>

        <Text className="text-base text-gray-500 text-center mb-8">
          We're grateful for the time you took to share your perspective. Your
          insights help us understand how families experience technology and
          relationships in real life.
        </Text>

        <Link href="/research" asChild>
          <Pressable className="bg-primary-600 py-3 px-6 rounded-lg active:bg-primary-700">
            <Text className="text-white font-semibold text-base">
              Return to Forms
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
