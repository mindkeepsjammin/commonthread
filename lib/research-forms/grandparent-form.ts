import type { ResearchFormData } from './types';

export const grandparentFormData: ResearchFormData = {
  id: 'grandparent',
  title: 'Grandparent Research Form',
  subtitle: 'Family, Time, and Technology',
  openingFrame: {
    paragraphs: [
      'You carry a long view of family life—across seasons, changes, and generations.',
      "This form isn't about evaluating the present or comparing it to the past. It's an invitation to share what you've noticed, learned, and come to appreciate over time.",
      "There are no right answers. We're grateful for whatever you're willing to share.",
    ],
    consentText: 'I understand this is a reflection and research form, not advice-giving or therapy.',
  },
  sections: [
    {
      id: 'family_story',
      title: '1. Your Place in the Family Story',
      questions: [
        {
          id: 'preferred_name',
          type: 'short_answer',
          question: 'What name would you like us to use for you?',
          hint: 'optional',
          required: false,
        },
        {
          id: 'relation_to_children',
          type: 'multi_select',
          question: 'How do you relate to the children in your family?',
          hint: 'select all that apply',
          options: [
            { value: 'grandparent', label: 'Grandparent' },
            { value: 'step_grandparent', label: 'Step-grandparent' },
            { value: 'chosen_family', label: 'Chosen family / elder' },
            { value: 'other', label: 'Other' },
          ],
          required: true,
        },
        {
          id: 'time_with_grandchildren',
          type: 'single_select',
          question: 'How often do you spend time with your grandchildren or younger family members?',
          options: [
            { value: 'very_often', label: 'Very often' },
            { value: 'regularly', label: 'Regularly' },
            { value: 'occasionally', label: 'Occasionally' },
            { value: 'rarely_touch', label: 'Rarely, but we stay in touch' },
          ],
          required: true,
        },
      ],
    },
    {
      id: 'across_time',
      title: '2. Looking Across Time',
      description: 'This section is about what you\'ve observed, not what was "better" or "worse."',
      questions: [
        {
          id: 'family_life_words',
          type: 'multi_select',
          question: 'When you think about family life today, which words feel most accurate to you?',
          hint: 'select up to 4',
          maxSelections: 4,
          options: [
            { value: 'fast_moving', label: 'Fast-moving' },
            { value: 'full', label: 'Full' },
            { value: 'different', label: 'Different' },
            { value: 'loving', label: 'Loving' },
            { value: 'challenging', label: 'Challenging' },
            { value: 'adaptable', label: 'Adaptable' },
            { value: 'still_familiar', label: 'Still familiar in some ways' },
          ],
          required: true,
        },
        {
          id: 'staying_connected',
          type: 'reflection',
          question: 'What feels most important to you about staying connected across generations?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'tech_elder_lens',
      title: '3. Technology Through an Elder Lens',
      description: "You've lived through many changes. Technology is just one of them.",
      questions: [
        {
          id: 'tech_relationship',
          type: 'single_select',
          question: 'How would you describe your relationship with modern technology?',
          options: [
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'curious', label: 'Curious' },
            { value: 'selective', label: 'Selective' },
            { value: 'mixed', label: 'Mixed' },
            { value: 'still_learning', label: 'Still learning' },
          ],
          required: true,
        },
        {
          id: 'tech_affect_connection',
          type: 'multi_select',
          question: 'What do you notice about how technology affects family connection today?',
          hint: 'select any',
          options: [
            { value: 'stay_touch', label: 'It helps people stay in touch' },
            { value: 'distract_presence', label: 'It can distract from presence' },
            { value: 'bridges_distance', label: 'It bridges distance' },
            { value: 'misunderstandings', label: 'It creates misunderstandings' },
            { value: 'part_of_life', label: "It's simply part of life now" },
          ],
          required: false,
        },
      ],
    },
    {
      id: 'experience_taught',
      title: '4. What Experience Has Taught You',
      questions: [
        {
          id: 'relationships_truth',
          type: 'reflection',
          question: 'Over the years, what have you learned about relationships that still feels true today?',
          hint: 'short reflection',
          required: false,
        },
        {
          id: 'younger_realize_later',
          type: 'reflection',
          question: 'What do you think younger generations might not yet realize—but may understand later?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'observing_younger',
      title: '5. Observing Younger Generations',
      description: "This isn't about advice—it's about noticing.",
      questions: [
        {
          id: 'children_stand_out',
          type: 'multi_select',
          question: 'When you spend time with children or teens today, what stands out to you most?',
          hint: 'select any',
          options: [
            { value: 'creativity', label: 'Their creativity' },
            { value: 'sensitivity', label: 'Their sensitivity' },
            { value: 'intelligence', label: 'Their intelligence' },
            { value: 'stress', label: 'Their stress' },
            { value: 'adaptability', label: 'Their adaptability' },
            { value: 'kindness', label: 'Their kindness' },
          ],
          required: false,
        },
        {
          id: 'hope_children_feel',
          type: 'reflection',
          question: 'What do you most hope children feel from their family as they grow?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'being_elder',
      title: '6. Being an Elder in a Changing World',
      questions: [
        {
          id: 'meaningful_role',
          type: 'reflection',
          question: 'What feels meaningful to you about your role in the family now?',
          hint: 'short reflection',
          required: false,
        },
        {
          id: 'tool_generations',
          type: 'reflection',
          question: 'If a tool were created to support families gently across generations, what would matter most to you? And what would it not do?',
          hint: 'short reflection',
          required: false,
        },
      ],
    },
    {
      id: 'closing',
      title: '7. Closing & Ongoing Participation',
      questions: [
        {
          id: 'future_reflections',
          type: 'single_select',
          question: 'Would you be open to occasionally sharing reflections about family life or generational connection?',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'not_now', label: 'Not right now' },
          ],
          required: true,
        },
        {
          id: 'families_across_time',
          type: 'reflection',
          question: 'Is there anything else you feel matters for us to understand about families across time?',
          hint: 'optional',
          required: false,
        },
      ],
    },
  ],
};
