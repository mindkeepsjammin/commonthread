import type { ResearchFormData } from './types';

export const parentFormData: ResearchFormData = {
  id: 'parent',
  title: 'Parent Research Form',
  subtitle: 'Families, Technology & Learning Together',
  openingFrame: {
    paragraphs: [
      'You know your family better than anyone else.',
      "This form isn't about evaluating your parenting or finding problems. It's part of a quiet research process to better understand how families experience technology and relationship in real life.",
      "We're learning with families, not studying them from the outside.",
      "You're welcome to answer honestly, partially, or not at all.",
    ],
    consentText: 'I understand this is a reflection and research form, not therapy or advice.',
  },
  sections: [
    {
      id: 'role_context',
      title: '1. Your Role & Context',
      description: 'Grounding, Not Defining',
      questions: [
        {
          id: 'preferred_name',
          type: 'short_answer',
          question: 'What name would you like us to use for you?',
          hint: 'optional',
          required: false,
        },
        {
          id: 'family_role',
          type: 'multi_select',
          question: 'What best describes your role in your family?',
          hint: 'select all that apply',
          options: [
            { value: 'parent', label: 'Parent' },
            { value: 'step_parent', label: 'Step-parent' },
            { value: 'guardian', label: 'Guardian' },
            { value: 'grandparent', label: 'Grandparent' },
            { value: 'other_caregiver', label: 'Other caregiver' },
          ],
          required: true,
        },
        {
          id: 'num_children',
          type: 'single_select',
          question: 'How many children are part of your household or family system right now?',
          options: [
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4+', label: '4+' },
          ],
          required: true,
        },
      ],
    },
    {
      id: 'care_system',
      title: '2. Your Care for the Family System',
      description: "These questions aren't about \"getting it right,\" but about what you notice and care about.",
      questions: [
        {
          id: 'family_words',
          type: 'multi_select',
          question: 'When you think about your family as a whole, which words feel most true right now?',
          hint: 'select up to 4',
          maxSelections: 4,
          options: [
            { value: 'connected', label: 'Connected' },
            { value: 'busy', label: 'Busy' },
            { value: 'loving', label: 'Loving' },
            { value: 'learning', label: 'Learning' },
            { value: 'stretched', label: 'Stretched' },
            { value: 'grounded', label: 'Grounded' },
            { value: 'in_transition', label: 'In transition' },
            { value: 'resilient', label: 'Resilient' },
          ],
          required: true,
        },
        {
          id: 'support_reflection',
          type: 'reflection',
          question: 'In what ways do you feel you already support your children well?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'parenting_learning',
      title: '3. Parenting as an Ongoing Learning Process',
      questions: [
        {
          id: 'parenting_lessons',
          type: 'multi_select',
          question: 'Parenting has taught me that:',
          hint: 'select any that resonate',
          options: [
            { value: 'always_learning', label: "I'm always learning" },
            { value: 'no_all_answers', label: "I don't need to have all the answers" },
            { value: 'children_teach', label: 'My children teach me as much as I teach them' },
            { value: 'small_moments', label: 'Growth happens in small moments' },
            { value: 'adapt_over_time', label: "It's okay to adapt over time" },
          ],
          required: false,
        },
        {
          id: 'self_learning_reflection',
          type: 'reflection',
          question: 'What have you learned about yourself since becoming a parent or caregiver?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'technology',
      title: '4. Technology in Family Life',
      description: "There's no \"right\" relationship with technology—only awareness.",
      questions: [
        {
          id: 'tech_role',
          type: 'single_select',
          question: "How would you describe technology's role in your family most days?",
          options: [
            { value: 'mostly_supportive', label: 'Mostly supportive' },
            { value: 'mostly_challenging', label: 'Mostly challenging' },
            { value: 'mixed', label: 'Mixed' },
            { value: 'still_evolving', label: 'Still evolving' },
          ],
          required: true,
        },
        {
          id: 'tech_relationship',
          type: 'multi_select',
          question: 'What do you notice about your own relationship with technology as a parent?',
          hint: 'select any',
          options: [
            { value: 'mindful', label: 'I try to be mindful' },
            { value: 'pulled_directions', label: 'I feel pulled in many directions' },
            { value: 'learning_alongside', label: "I'm learning alongside my kids" },
            { value: 'unsure_balance', label: "I'm unsure what balance looks like" },
            { value: 'curious_reflect', label: "I'm curious to reflect more" },
          ],
          required: false,
        },
      ],
    },
    {
      id: 'perspective',
      title: '5. Perspective & Curiosity',
      questions: [
        {
          id: 'children_appreciation',
          type: 'reflection',
          question: 'What do you think your children might say they appreciate about you as a parent?',
          hint: 'short reflection',
          required: false,
        },
        {
          id: 'children_experience',
          type: 'reflection',
          question: 'What feels important for your children to experience as they grow—especially in a world shaped by technology?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'learning_together',
      title: '6. Learning Together',
      description: 'Future-Facing, Not Directive',
      questions: [
        {
          id: 'family_growth',
          type: 'single_select',
          question: 'When it comes to family growth, what feels most true right now?',
          hint: 'select one',
          options: [
            { value: 'finding_way', label: "We're finding our way" },
            { value: 'adjusting_phases', label: "We're adjusting to new phases" },
            { value: 'learning_together', label: "We're learning together" },
            { value: 'strengthening_communication', label: "We're strengthening communication" },
            { value: 'paying_attention', label: "We're paying closer attention" },
          ],
          required: true,
        },
        {
          id: 'tool_reflection',
          type: 'reflection',
          question: 'If a tool were built to walk alongside families rather than guide them, what would matter most to you? And what would it not do?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'closing',
      title: '7. Closing & Research Participation',
      questions: [
        {
          id: 'future_participation',
          type: 'single_select',
          question: 'Would you be open to occasionally sharing reflections about how family-focused tools feel to use?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'not_now', label: 'Not right now' },
          ],
          required: true,
        },
        {
          id: 'additional_thoughts',
          type: 'reflection',
          question: 'Is there anything else you feel matters for us to understand about families today?',
          hint: 'optional',
          required: false,
        },
      ],
    },
  ],
};
