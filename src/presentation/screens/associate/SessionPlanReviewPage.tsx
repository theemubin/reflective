import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { Category, GeminiEvaluation } from '../../../domain/types'
import { fetchGoogleDocText, geminiService, getGeminiApiKey, getGrokApiKey } from '../../../data/services/gemini.service'
import { useCategoriesStore } from '../../state/categories.store'
import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

const submissionSchema = z
  .object({
    submissionMethod: z.enum(['text', 'file', 'google_doc']),
    submissionText: z.string().optional(),
    rubricText: z.string().min(20, 'Rubric is required.'),
    promptText: z.string().min(20, 'Prompt is required.'),
    fileName: z.string().optional(),
    googleDocUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.submissionMethod === 'text') {
      if (!data.submissionText || data.submissionText.length < 20)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide at least 20 characters.', path: ['submissionText'] })
    }
    if (data.submissionMethod === 'google_doc') {
      if (!data.googleDocUrl || data.googleDocUrl.length === 0)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter a valid Google Doc URL.', path: ['googleDocUrl'] })
    }
    if (data.submissionMethod === 'file') {
      if (!data.fileName || data.fileName.length === 0)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter the file name.', path: ['fileName'] })
    }
  })

type SubmissionFormValues = z.infer<typeof submissionSchema>

interface ReviewVersion {
  version: number
  submissionId: string
  categoryId: string
  submissionText: string
  createdAt: string
  method: SubmissionFormValues['submissionMethod']
  evaluation: GeminiEvaluation
}

const defaultRubric = ['Learning Objectives (20)', 'Engagement (20)', 'Reflection (20)', 'Assessment (20)', 'Inclusivity (20)'].join('\n')
const defaultPrompt = [
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

function buildRubricText(cat: Category): string {
  return cat.criteria.map((c) => `${c.name} (${c.marks} marks)`).join('\n')
}

const METHODS = [
  { value: 'google_doc', label: 'Google Doc', icon: 'link' },
  { value: 'text', label: 'Paste Text', icon: 'notes' },
  { value: 'file', label: 'Upload File', icon: 'cloud_upload' },
] as const

export default function SessionPlanReviewPage() {
  const categories = useCategoriesStore((s) => s.categories)
  const user = useAuthStore((s) => s.user)
  const saveAiReview = useSubmissionsStore((s) => s.saveAiReview)
  const submitToMentor = useSubmissionsStore((s) => s.submitToMentor)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [versions, setVersions] = useState<ReviewVersion[]>([])
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    const check = () => setHasApiKey(getGeminiApiKey().length > 0 || getGrokApiKey().length > 0)
    check()
    const id = setInterval(check, 2000)
    return () => clearInterval(id)
  }, [])

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { submissionMethod: 'google_doc', submissionText: '', rubricText: defaultRubric, promptText: defaultPrompt, fileName: '', googleDocUrl: '' },
  })

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId)
    setVersions([])
    const cat = categories.find((c) => c.id === catId)
    if (cat) { form.setValue('rubricText', buildRubricText(cat)); form.setValue('promptText', cat.prompt) }
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null
  const submissionMethod = useWatch({ control: form.control, name: 'submissionMethod' })
  const submissionTextValue = useWatch({ control: form.control, name: 'submissionText' })
  const googleDocUrlValue = useWatch({ control: form.control, name: 'googleDocUrl' })

  const reviewMutation = useMutation({
    mutationFn: async (values: SubmissionFormValues) => {
      let submissionText = values.submissionText || ''
      if (values.submissionMethod === 'google_doc' && values.googleDocUrl)
        submissionText = await fetchGoogleDocText(values.googleDocUrl)
      else if (values.submissionMethod === 'file' && values.fileName)
        throw new Error('UNSUPPORTED_SUBMISSION_METHOD')
      const evaluation = await geminiService.evaluateSubmission({ submissionText, rubricText: values.rubricText, promptText: values.promptText })
      return { evaluation, submissionText }
    },
    onSuccess: ({ evaluation, submissionText }, values) => {
      if (!selectedCategory || !user) return
      const saved = saveAiReview({
        associateId: user.id, associateName: user.fullName, categoryId: selectedCategory.id, categoryName: selectedCategory.name,
        submissionText, sourceType: values.submissionMethod === 'google_doc' ? 'google_doc' : 'text',
        sourceLabel: values.submissionMethod === 'google_doc' ? values.googleDocUrl : undefined,
        evaluation, passingPercentage: selectedCategory.passingPercentage,
      })
      setVersions((prev) => [{ version: prev.length + 1, submissionId: saved.id, categoryId: selectedCategoryId, submissionText: values.submissionMethod === 'text' ? values.submissionText || '' : values.googleDocUrl || '', createdAt: new Date().toISOString(), method: values.submissionMethod, evaluation }, ...prev])
    },
  })

  const current =
    versions[0]?.categoryId === selectedCategoryId &&
    versions[0]?.submissionText === (submissionMethod === 'text' ? submissionTextValue || '' : googleDocUrlValue || '')
      ? versions[0] : undefined

  const passState = useMemo(() => {
    if (!current || !selectedCategory) return null
    return current.evaluation.overall_score >= selectedCategory.passingPercentage ? 'Ready for Mentor' : 'Needs Revision'
  }, [current, selectedCategory])

  const currentSubmission = current ? submissions.find((s) => s.id === current.submissionId) : undefined
  const canSubmitToMentor = Boolean(currentSubmission?.status === 'ready_for_mentor')

  const onSubmit = form.handleSubmit((values) => { reviewMutation.reset(); reviewMutation.mutate(values) })

  // Circular SVG score
  const circleScore = current?.evaluation.overall_score ?? 0
  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - circleScore / 100)

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Submit Session Plan</h2>
            <p className="text-sm text-text-muted">Choose a category and submit for AI evaluation.</p>
          </div>
          {!hasApiKey && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-warning-amber border border-amber-200">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              No AI key — add one in the top bar
            </span>
          )}
        </div>

        {/* Category capsule pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => {
              const sel = cat.id === selectedCategoryId
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 active:scale-95 ${sel ? 'bg-primary border-primary text-white' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div>
          <div className={`bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden transition-opacity ${!selectedCategory ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* Card header */}
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-main">
                {selectedCategory ? selectedCategory.name : 'Select a category to begin'}
              </h3>
              {selectedCategory && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Pass &gt;= {selectedCategory.passingPercentage}%
                </span>
              )}
            </div>

            <div className="p-4">
              {/* Method tabs */}
              <div className="bg-surface-container-low rounded-xl p-1 flex gap-1 border border-surface-border mb-4">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => form.setValue('submissionMethod', m.value)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${submissionMethod === m.value ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Input area */}
              <form onSubmit={onSubmit} className="space-y-4">
                {submissionMethod === 'google_doc' && (
                  <div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>link</span>
                      <input
                        type="url"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="https://docs.google.com/document/d/..."
                        {...form.register('googleDocUrl')}
                      />
                    </div>
                    {form.formState.errors.googleDocUrl ? (
                      <p className="text-xs text-error mt-1">{form.formState.errors.googleDocUrl.message}</p>
                    ) : (
                      <p className="text-xs text-text-muted mt-1 italic">Ensure the document sharing is set to "Anyone with link"</p>
                    )}
                  </div>
                )}

                {submissionMethod === 'text' && (
                  <div>
                    <textarea
                      rows={12}
                      className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Paste your session plan here..."
                      style={{ maxHeight: 300, overflowY: 'auto' }}
                      {...form.register('submissionText')}
                    />
                    {form.formState.errors.submissionText && (
                      <p className="text-xs text-error mt-1">{form.formState.errors.submissionText.message}</p>
                    )}
                  </div>
                )}

                {submissionMethod === 'file' && (
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-surface-container-low hover:border-primary transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary">cloud_upload</span>
                    <p className="text-sm font-medium text-text-muted">File upload coming soon</p>
                    <p className="text-xs text-text-muted">Use Google Doc or paste text for now</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending || !hasApiKey}
                    className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewMutation.isPending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span>
                        Reviewing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
                        Run AI Review
                      </>
                    )}
                  </button>
                  {current && (
                    <button
                      type="button"
                      disabled={reviewMutation.isPending}
                      onClick={() => {
                        const existing = form.getValues('submissionText') || ''
                        form.setValue('submissionText', `${existing}\n\n[Revised - Version ${versions.length + 1}]`)
                        form.setValue('submissionMethod', 'text')
                      }}
                      className="px-4 py-3.5 border-2 border-outline-variant text-secondary rounded-xl text-sm font-semibold hover:border-primary hover:text-primary active:scale-95 transition-all whitespace-nowrap"
                    >
                      Revise
                    </button>
                  )}
                </div>
              </form>

              {/* Loading bar */}
              {reviewMutation.isPending && (
                <div className="mt-3 w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
                </div>
              )}

              {/* Error */}
              {reviewMutation.isError && (
                <div className="mt-3 flex items-start gap-2 bg-error-container border border-error/20 rounded-xl p-3">
                  <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>error</span>
                  <p className="text-xs text-on-error-container">{getErrorText((reviewMutation.error as Error)?.message)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Version history */}
          {versions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">History</p>
              <div className="flex flex-wrap gap-2">
                {versions.map((v) => (
                  <span
                    key={v.version}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v.evaluation.ready_for_review ? 'bg-emerald-100 text-success-emerald border-emerald-200' : 'bg-amber-100 text-warning-amber border-amber-200'}`}
                  >
                    v{v.version} &middot; {v.evaluation.overall_score}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Results or Rubric preview */}
        <div>
          {current ? (
            <div className="space-y-4">
              {/* Score card */}
              <div className={`bg-surface-container-lowest border-2 rounded-xl p-5 ${current.evaluation.ready_for_review ? 'border-success-emerald' : 'border-warning-amber'}`}>
                <div className="flex items-center gap-4 mb-4">
                  {/* Circular score */}
                  <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="42" fill="transparent" stroke="#e6e8ea" strokeWidth="7" />
                      <circle
                        cx="48" cy="48" r="42" fill="transparent"
                        stroke={current.evaluation.ready_for_review ? '#059669' : '#D97706'}
                        strokeWidth="7"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }}
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="font-headline text-2xl font-bold" style={{ color: current.evaluation.ready_for_review ? '#059669' : '#D97706' }}>
                        {current.evaluation.overall_score}
                      </span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Score</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${current.evaluation.ready_for_review ? 'bg-emerald-100 text-success-emerald' : 'bg-amber-100 text-warning-amber'}`}>
                      {passState}
                    </span>
                    <p className="text-xs text-text-muted">Pass threshold: {selectedCategory?.passingPercentage ?? 0}%</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {canSubmitToMentor && (
                        <button
                          onClick={() => currentSubmission && submitToMentor(currentSubmission.id)}
                          className="px-3 py-1 bg-success-emerald text-white rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                        >
                          Submit to Mentor
                        </button>
                      )}
                      {currentSubmission?.status === 'submitted_to_mentor' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">In Review</span>}
                      {currentSubmission?.status === 'approved' && <span className="px-2 py-0.5 bg-emerald-100 text-success-emerald rounded-full text-xs font-semibold">Approved</span>}
                      {currentSubmission?.status === 'changes_requested' && <span className="px-2 py-0.5 bg-red-100 text-error rounded-full text-xs font-semibold">Changes Needed</span>}
                    </div>
                  </div>
                </div>

                {/* Criterion bars */}
                <div className="space-y-3">
                  {current.evaluation.criterion_scores.map((s) => {
                    const pct = Math.round((s.score / s.max_score) * 100)
                    const passed = s.score >= s.max_score * 0.7
                    return (
                      <div key={s.criterion}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-text-main">{s.criterion}</span>
                          <span className={`text-xs font-bold ${passed ? 'text-success-emerald' : 'text-warning-amber'}`}>{s.score}/{s.max_score}</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${passed ? 'bg-success-emerald' : 'bg-warning-amber'}`}
                            style={{ width: `${pct}%`, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Feedback grid */}
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">Gemini Feedback</p>
              <div className="grid grid-cols-2 gap-3">
                <FeedbackCard title="Key Strengths" items={current.evaluation.strengths} icon="rocket_launch" colorClass="bg-blue-50 border-secondary-container" textClass="text-primary" />
                <FeedbackCard title="Areas to Improve" items={current.evaluation.improvements} icon="trending_up" colorClass="bg-amber-50 border-amber-200" textClass="text-warning-amber" />
                <FeedbackCard title="Suggestions" items={current.evaluation.suggestions} icon="tips_and_updates" colorClass="bg-surface-container-lowest border-surface-border" textClass="text-on-surface-variant" />
                <FeedbackCard title="Reflection Qs" items={current.evaluation.reflective_questions} icon="psychology" colorClass="bg-purple-50 border-purple-200" textClass="text-purple-700" />
              </div>

              {/* Risk flags */}
              {current.evaluation.risk_flags.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-warning-amber uppercase tracking-wider mb-2">Risk Flags</p>
                  {current.evaluation.risk_flags.map((f) => (
                    <p key={f} className="text-sm text-on-surface flex gap-2"><span>&bull;</span>{f}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onSubmit as React.MouseEventHandler}
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_square</span>
                  Edit and Resubmit
                </button>
              </div>
            </div>
          ) : (
            /* Rubric preview */
            <div className={`bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden ${!selectedCategory ? 'opacity-60' : ''}`}>
              <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-main">
                  {selectedCategory ? `${selectedCategory.name} — Rubric` : 'Select a category to see the rubric'}
                </h3>
                {selectedCategory && (
                  <span className="text-xs font-semibold text-text-muted">{selectedCategory.criteria.reduce((s, c) => s + c.marks, 0)} total marks</span>
                )}
              </div>
              {selectedCategory && (
                <div className="p-4">
                  <div className="divide-y divide-surface-border">
                    {selectedCategory.criteria.map((c) => (
                      <div key={c.id} className="flex justify-between items-start py-3 gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-main">{c.name}</p>
                          {c.description && <p className="text-xs text-text-muted mt-0.5">{c.description}</p>}
                        </div>
                        <span className="text-sm font-bold text-primary flex-shrink-0">{c.marks}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!selectedCategory && (
                <div className="p-8 flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">rule</span>
                  <p className="text-sm text-text-muted">Select a category above to preview its evaluation rubric.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getErrorText(msg: string | undefined): string {
  switch (msg) {
    case 'NO_API_KEY': return 'Click the AI key chip in the top bar to add a Gemini or Grok key.'
    case 'RATE_LIMITED': return 'Rate limit reached. Wait a minute, then try again.'
    case 'INVALID_API_KEY': return 'The API key was rejected. Check the key and provider access.'
    case 'BAD_REQUEST': return 'The AI provider rejected the request. The submission may be too long or the model unavailable.'
    case 'UNSUPPORTED_SUBMISSION_METHOD': return 'Only pasted text and Google Doc links are supported right now.'
    case 'INVALID_GOOGLE_DOC_URL': return 'Enter a valid Google Docs URL.'
    case 'GOOGLE_DOC_FETCH_FAILED': return 'Could not fetch the Google Doc. Make sure it is shared publicly.'
    case 'GOOGLE_DOC_EMPTY': return 'The Google Doc did not contain enough readable text to review.'
    default: return msg ?? 'An unexpected error occurred. Please try again.'
  }
}

function FeedbackCard({ title, items, icon, colorClass, textClass }: { title: string; items: string[]; icon: string; colorClass: string; textClass: string }) {
  return (
    <div className={`border rounded-xl p-3 ${colorClass}`} style={{ boxShadow: colorClass.includes('blue') ? '0 0 20px rgba(144,168,255,0.15)' : undefined }}>
      <div className={`flex items-center gap-1.5 mb-2 ${textClass}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
        <p className="text-xs font-semibold">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-text-muted">None</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="material-symbols-outlined text-success-emerald flex-shrink-0" style={{ fontSize: 14, marginTop: 1 }}>check_circle</span>
              <p className="text-xs text-on-secondary-fixed-variant leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}