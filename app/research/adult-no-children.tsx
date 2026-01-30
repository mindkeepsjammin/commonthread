import { ResearchForm } from '@/components/research-forms/ResearchForm';
import { adultNoChildrenFormData } from '@/lib/research-forms';

export default function AdultNoChildrenFormPage() {
  return <ResearchForm formData={adultNoChildrenFormData} />;
}
