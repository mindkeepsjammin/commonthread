import { ResearchForm } from '@/components/research-forms/ResearchForm';
import { parentFormData } from '@/lib/research-forms';

export default function ParentFormPage() {
  return <ResearchForm formData={parentFormData} />;
}
