import { ResearchForm } from '@/components/research-forms/ResearchForm';
import { grandparentFormData } from '@/lib/research-forms';

export default function GrandparentFormPage() {
  return <ResearchForm formData={grandparentFormData} />;
}
