import { create } from 'zustand'
import type { GeminiEvaluation, PlanSubmission, PlanSubmissionStatus, SubmissionSourceType } from '../../domain/types'

interface CreateSubmissionInput {
  associateId: string
  associateName: string
  categoryId: string
  categoryName: string
  submissionText: string
  sourceType: SubmissionSourceType
  sourceLabel?: string
  evaluation: GeminiEvaluation
  passingPercentage: number
}

interface SubmissionsState {
  submissions: PlanSubmission[]
  saveAiReview: (input: CreateSubmissionInput) => PlanSubmission
  submitToMentor: (id: string) => void
  mentorReview: (id: string, status: Extract<PlanSubmissionStatus, 'approved' | 'changes_requested'>, mentorComment: string) => void
}

export const useSubmissionsStore = create<SubmissionsState>((set) => ({
  submissions: [],

  saveAiReview: (input) => {
    const now = new Date().toISOString()
    const passedAiThreshold = input.evaluation.overall_score >= input.passingPercentage
    const submission: PlanSubmission = {
      id: `sub-${Date.now()}`,
      associateId: input.associateId,
      associateName: input.associateName,
      categoryId: input.categoryId,
      categoryName: input.categoryName,
      submissionText: input.submissionText,
      sourceType: input.sourceType,
      sourceLabel: input.sourceLabel,
      evaluation: input.evaluation,
      aiScore: input.evaluation.overall_score,
      passedAiThreshold,
      status: passedAiThreshold ? 'ready_for_mentor' : 'ai_reviewed',
      createdAt: now,
      updatedAt: now,
    }

    set((state) => ({ submissions: [submission, ...state.submissions] }))
    return submission
  },

  submitToMentor: (id) =>
    set((state) => ({
      submissions: state.submissions.map((submission) =>
        submission.id === id && submission.passedAiThreshold
          ? {
              ...submission,
              status: 'submitted_to_mentor',
              submittedToMentorAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : submission,
      ),
    })),

  mentorReview: (id, status, mentorComment) =>
    set((state) => ({
      submissions: state.submissions.map((submission) =>
        submission.id === id
          ? {
              ...submission,
              status,
              mentorComment,
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : submission,
      ),
    })),
}))

export const selectSubmissionsForAssociate = (associateId: string) =>
  getSubmissions().filter((submission) => submission.associateId === associateId)

const getSubmissions = () => getStore().submissions
const getStore = () => useSubmissionsStore.getState()
