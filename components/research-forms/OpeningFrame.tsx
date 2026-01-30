import { View, Text } from 'react-native';
import type { ResearchFormData } from '@/lib/research-forms/types';
import { ConsentCheckbox } from './ConsentCheckbox';

interface OpeningFrameProps {
  formData: ResearchFormData;
  consentChecked: boolean;
  onConsentChange: (checked: boolean) => void;
  consentError?: string;
}

export const OpeningFrame = ({
  formData,
  consentChecked,
  onConsentChange,
  consentError,
}: OpeningFrameProps) => {
  return (
    <View className="mb-8 pb-8 border-b border-gray-200">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        {formData.title}
      </Text>
      {formData.subtitle && (
        <Text className="text-lg text-primary-600 mb-6">{formData.subtitle}</Text>
      )}

      <View className="bg-gray-50 rounded-lg p-4 mb-6">
        {formData.openingFrame.paragraphs.map((paragraph, index) => (
          <Text key={index} className="text-base text-gray-700 mb-3 last:mb-0">
            {paragraph}
          </Text>
        ))}
      </View>

      <ConsentCheckbox
        checked={consentChecked}
        onChange={onConsentChange}
        label={formData.openingFrame.consentText}
        error={consentError}
      />
    </View>
  );
};
