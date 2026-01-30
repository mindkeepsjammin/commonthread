export * from './types';
export { parentFormData } from './parent-form';
export { teenFormData } from './teen-form';
export { grandparentFormData } from './grandparent-form';
export { adultNoChildrenFormData } from './adult-no-children-form';

import { parentFormData } from './parent-form';
import { teenFormData } from './teen-form';
import { grandparentFormData } from './grandparent-form';
import { adultNoChildrenFormData } from './adult-no-children-form';
import type { ResearchFormData } from './types';

export const allForms: Record<string, ResearchFormData> = {
  parent: parentFormData,
  teen: teenFormData,
  grandparent: grandparentFormData,
  adult_no_children: adultNoChildrenFormData,
};

export const getFormById = (id: string): ResearchFormData | undefined => {
  return allForms[id];
};
