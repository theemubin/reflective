import { create } from 'zustand'

export interface AssignmentDefinition {
  id: string
  title: string
  description: string
  rubricText: string
  promptText: string
  passingPercentage: number
  dueDate?: string
}

interface AssignmentsState {
  assignments: AssignmentDefinition[]
  addAssignment: (assignment: Omit<AssignmentDefinition, 'id'>) => void
}

const starterAssignments: AssignmentDefinition[] = [
  {
    id: 'a-communication-reflection',
    title: 'Communication Reflection',
    description: 'Reflect on communication challenges and improvements.',
    rubricText: [
      'Clarity of expression (25)',
      'Depth of reflection (25)',
      'Real-life examples (25)',
      'Actionable next steps (25)',
    ].join('\n'),
    promptText:
      'You are an experienced educator and assessor. Review this submission critically using explicit evidence from the text. Treat missing detail as missing, identify weaknesses and risks, ask challenging reflective questions, and conclude with key revisions required.',
    passingPercentage: 75,
  },
  {
    id: 'a-leadership-activity',
    title: 'Leadership Activity',
    description: 'Describe a leadership task and evaluate your decisions.',
    rubricText: [
      'Initiative and ownership (25)',
      'Team collaboration (25)',
      'Problem solving (25)',
      'Self-reflection (25)',
    ].join('\n'),
    promptText:
      'You are an experienced educator and assessor. Review this submission critically using explicit evidence from the text. Treat missing detail as missing, identify weaknesses and risks, ask challenging reflective questions, and conclude with key revisions required.',
    passingPercentage: 75,
  },
]

export const useAssignmentsStore = create<AssignmentsState>((set) => ({
  assignments: starterAssignments,
  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [
        {
          id: `a-${Date.now()}`,
          ...assignment,
        },
        ...state.assignments,
      ],
    })),
}))
