export type UserRole = 'admin' | 'mentor' | 'associate' | 'student'

export interface RubricCriterion {
  id: string
  name: string
  marks: number
  description: string
}

export interface Category {
  id: string
  name: string
  prompt: string
  passingPercentage: number
  createdBy: string
  criteria: RubricCriterion[]
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export interface GeminiCriterionScore {
  criterion: string
  score: number
  max_score: number
  reasoning: string
  evidence: string
}

export interface GeminiEvaluation {
  overall_score: number
  criterion_scores: GeminiCriterionScore[]
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  reflective_questions: string[]
  risk_flags: string[]
  ready_for_review: boolean
}

export type SubmissionSourceType = 'text' | 'google_doc'

export type PlanSubmissionStatus =
  | 'draft'
  | 'ai_reviewed'
  | 'ready_for_mentor'
  | 'submitted_to_mentor'
  | 'changes_requested'
  | 'approved'

export interface PlanSubmission {
  id: string
  associateId: string
  associateName: string
  categoryId: string
  categoryName: string
  submissionText: string
  sourceType: SubmissionSourceType
  sourceLabel?: string
  evaluation?: GeminiEvaluation
  aiScore?: number
  passedAiThreshold: boolean
  status: PlanSubmissionStatus
  mentorComment?: string
  createdAt: string
  updatedAt: string
  submittedToMentorAt?: string
  reviewedAt?: string
}
