import { create } from 'zustand'
import type { Category, RubricCriterion } from '../../domain/types'

const strictMentorPrompt = [
  'You are a highly experienced expert in English language learning, life skills education, peer learning, curriculum design, facilitation, assessment, and certification. Review the submitted plan as if you are responsible for approving or rejecting it for implementation with real learners tomorrow.',
  '',
  'Be extremely critical, honest, reflective, and evidence-based. Do not praise effort, intentions, or formatting. Do not assume missing details will be added later. If something is not explicitly written, treat it as missing. Focus on what will actually happen on the ground rather than what sounds good in theory.',
  '',
  'Your feedback must be deeply reflective. Do not simply point out problems. For every observation, quote or reference the exact section of the plan that led you to that conclusion. Explain why it concerns you, what assumptions it makes, what might happen during implementation, and what evidence from the plan supports your concern.',
  '',
  'Ask challenging reflective questions throughout your review. These questions should help the author think more deeply about learner experience, facilitation, assessment, peer learning, learner agency, inclusion, engagement, and real-world execution. Do not ask generic questions. Ask questions that emerge directly from specific parts of the plan.',
  '',
  'When you identify a weakness, explore it thoroughly. For example, if a speaking activity is included, ask how a beginner learner who can only speak a few words will succeed. If a reflection activity is included, ask how the author knows the questions will lead to meaningful insight. If a resource is mentioned, ask why that specific resource was chosen and how its quality was determined.',
  '',
  'Identify contradictions, hidden assumptions, vague language, generic activities, signs of AI-generated planning, unrealistic expectations, missing resources, weak assessment methods, and any gaps between objectives, activities, and outcomes. Distinguish between what is explicitly designed in the plan and what the reviewer is expected to assume.',
  '',
  'Write the review as a thoughtful critique from an experienced educator who genuinely wants the plan to succeed but is unwilling to overlook weaknesses. The review should feel like a dialogue with the author, continuously probing, questioning, and testing the strength of the design.',
  '',
  'Conclude with the most important risks, the most important revisions required, and a final verdict: APPROVE, APPROVE WITH MINOR REVISIONS, APPROVE WITH MAJOR REVISIONS, or REJECT, supported by evidence from the plan.',
].join('\n')

interface CategoriesState {
  categories: Category[]
  addCategory: (data: { name: string; prompt: string; passingPercentage: number; createdBy: string; criteria: Omit<RubricCriterion, 'id'>[] }) => Category
  updateCategory: (id: string, updates: { name?: string; prompt?: string; passingPercentage?: number; criteria?: RubricCriterion[] }) => void
  deleteCategory: (id: string) => void
}

const seedCategories: Category[] = [
  {
    id: 'cat-life-skills',
    name: 'Life Skills Plans',
    prompt: strictMentorPrompt,
    passingPercentage: 70,
    createdBy: 'demo-mentor',
    createdAt: '2026-01-10T08:00:00Z',
    criteria: [
      { id: 'ls-1', name: 'Learning Objectives', marks: 10, description: 'Objectives are clear, measurable, and learner-centred.' },
      { id: 'ls-2', name: 'Engagement Strategies', marks: 10, description: 'Activities promote active participation.' },
      { id: 'ls-3', name: 'Reflection Opportunities', marks: 10, description: 'Plan includes structured self-reflection moments.' },
      { id: 'ls-4', name: 'Assessment Method', marks: 10, description: 'Evidence of student achievement is captured.' },
      { id: 'ls-5', name: 'Inclusivity & Differentiation', marks: 10, description: 'Accommodates diverse learning needs.' },
    ],
  },
  {
    id: 'cat-english-plans',
    name: 'English Plans',
    prompt: strictMentorPrompt,
    passingPercentage: 75,
    createdBy: 'demo-mentor',
    createdAt: '2026-01-15T09:00:00Z',
    criteria: [
      { id: 'en-1', name: 'Language Objectives', marks: 10, description: 'Clear reading, writing, or speaking targets aligned to level.' },
      { id: 'en-2', name: 'Vocabulary Development', marks: 10, description: 'Key vocabulary explicitly taught and practised.' },
      { id: 'en-3', name: 'Text & Comprehension', marks: 10, description: 'Appropriate texts with guided comprehension strategies.' },
      { id: 'en-4', name: 'Writing Scaffolding', marks: 10, description: 'Structured support for independent writing.' },
      { id: 'en-5', name: 'Assessment & Feedback', marks: 10, description: 'Formative checks embedded throughout the lesson.' },
    ],
  },
]

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: seedCategories,

  addCategory: (data) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name,
      prompt: data.prompt,
      passingPercentage: data.passingPercentage,
      createdBy: data.createdBy,
      criteria: data.criteria.map((c, i) => ({ ...c, id: `crit-${Date.now()}-${i}` })),
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ categories: [newCategory, ...state.categories] }))
    return newCategory
  },

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteCategory: (id) =>
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),
}))
