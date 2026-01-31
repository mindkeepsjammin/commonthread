import { View, Text, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';

const forms = [
  {
    id: 'parent',
    title: 'Parent Research Form',
    description: 'For parents, step-parents, guardians, and caregivers',
    href: '/research/parent',
  },
  {
    id: 'teen',
    title: 'Teen Research Form',
    description: 'For teens ages 13-18',
    href: '/research/teen',
  },
  {
    id: 'grandparent',
    title: 'Grandparent Research Form',
    description: 'For grandparents and elder family members',
    href: '/research/grandparent',
  },
  {
    id: 'adult-no-children',
    title: 'Adults Without Children Form',
    description: 'For aunts, uncles, siblings, and chosen family',
    href: '/research/adult-no-children',
  },
];

export default function ResearchIndexPage() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="max-w-2xl mx-auto p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-neutral-900 mb-3">
            Family Research Forms
          </Text>
          <Text className="text-lg text-neutral-600 mb-4">
            Families, Technology & Learning Together
          </Text>
          <Text className="text-base text-neutral-500">
            These forms are part of a quiet research process to better understand
            how families experience technology and relationships in real life.
            We're learning with families, not studying them from the outside.
          </Text>
        </View>

        <View className="space-y-4">
          {forms.map((form) => (
            <Link key={form.id} href={form.href as `/research/${string}`} asChild>
              <Pressable className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 active:bg-neutral-100">
                <Text className="text-lg font-semibold text-neutral-900 mb-1">
                  {form.title}
                </Text>
                <Text className="text-base text-neutral-600">
                  {form.description}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>

        <View className="mt-8 pt-6 border-t border-neutral-200">
          <Text className="text-sm text-neutral-500 text-center">
            All responses are confidential and used only for research purposes.
            {'\n'}You can skip any question or stop at any time.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
