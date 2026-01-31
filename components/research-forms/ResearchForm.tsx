'use client';

import { useState, useCallback } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { ResearchFormData, Question } from '@/lib/research-forms/types';
import { submitResearchForm, type FormType } from '@/lib/neon/client';
import { OpeningFrame } from './OpeningFrame';
import { FormSection } from './FormSection';
import { SingleSelect } from './SingleSelect';
import { MultiSelect } from './MultiSelect';
import { ShortAnswer } from './ShortAnswer';
import { Reflection } from './Reflection';
import { SubmitButton } from './SubmitButton';

interface ResearchFormProps {
  formData: ResearchFormData;
}

type FormValues = Record<string, string | string[]>;
type FormErrors = Record<string, string>;

export const ResearchForm = ({ formData }: ResearchFormProps) => {
  const router = useRouter();
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState<string | undefined>();
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((questionId: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Check consent
    if (!consentChecked) {
      setConsentError('Please confirm your consent to continue');
      return false;
    }
    setConsentError(undefined);

    // Check required questions
    for (const section of formData.sections) {
      for (const question of section.questions) {
        if (question.required) {
          const value = values[question.id];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            newErrors[question.id] = 'This field is required';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [consentChecked, formData.sections, values]);

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitResearchForm(
        formData.id as FormType,
        consentChecked,
        (values.preferred_name as string) || null,
        values,
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      );

      // Navigate to thank you page
      router.push('/research/thank-you');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = values[question.id];
    const error = errors[question.id];

    switch (question.type) {
      case 'single_select':
        return (
          <SingleSelect
            key={question.id}
            question={question}
            value={value as string | undefined}
            onChange={(v) => setValue(question.id, v)}
            error={error}
          />
        );
      case 'multi_select':
        return (
          <MultiSelect
            key={question.id}
            question={question}
            value={(value as string[]) || []}
            onChange={(v) => setValue(question.id, v)}
            error={error}
          />
        );
      case 'short_answer':
        return (
          <ShortAnswer
            key={question.id}
            question={question}
            value={(value as string) || ''}
            onChange={(v) => setValue(question.id, v)}
            error={error}
          />
        );
      case 'reflection':
        return (
          <Reflection
            key={question.id}
            question={question}
            value={(value as string) || ''}
            onChange={(v) => setValue(question.id, v)}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="max-w-2xl mx-auto p-6">
        <OpeningFrame
          formData={formData}
          consentChecked={consentChecked}
          onConsentChange={setConsentChecked}
          consentError={consentError}
        />

        {formData.sections.map((section) => (
          <FormSection key={section.id} section={section}>
            {section.questions.map(renderQuestion)}
          </FormSection>
        ))}

        {errors.submit && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-700">{errors.submit}</Text>
          </View>
        )}

        <SubmitButton
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!consentChecked}
        />

        <Text className="text-center text-sm text-neutral-500 mt-6">
          Your responses help us understand families better.
          {'\n'}Thank you for sharing.
        </Text>
      </View>
    </ScrollView>
  );
};
