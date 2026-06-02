import { useMemo, useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { GeminiEvaluation } from '../../../domain/types'
import { fetchGoogleDocText, geminiService, getGeminiApiKey, getGrokApiKey } from '../../../data/services/gemini.service'
import { useAssignmentsStore } from '../../state/assignments.store'

const studentReviewSchema = z.object({
  assignmentId: z.string().min(1, 'Please select an assignment.'),
  submissionMethod: z.enum(['text', 'file', 'google_doc']),
  submissionText: z.string().optional(),
  fileName: z.string().optional(),
  googleDocUrl: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.submissionMethod === 'text' && (!data.submissionText || data.submissionText.length < 20))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide at least 20 characters.', path: ['submissionText'] })
  if (data.submissionMethod === 'google_doc' && (!data.googleDocUrl || data.googleDocUrl.length === 0))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide a valid Google Doc URL.', path: ['googleDocUrl'] })
  if (data.submissionMethod === 'file' && (!data.fileName || data.fileName.length === 0))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide a file name.', path: ['fileName'] })
})

type StudentReviewValues = z.infer<typeof studentReviewSchema>

interface StudentReviewVersion {
  version: number; assignmentId: string; assignmentTitle: string; submissionText: string
  submissionMethod: StudentReviewValues['submissionMethod']; score: number; status: 'Needs Improvement' | 'Ready For Final Review'
  createdAt: string; evaluation: GeminiEvaluation
}

const METHODS = [{ value: 'text', label: 'Paste Text' }, { value: 'google_doc', label: 'Google Doc' }, { value: 'file', label: 'Upload File' }] as const

export default function StudentAssignmentReviewPage() {
  const assignments = useAssignmentsStore((s) => s.assignments)
  const [history, setHistory] = useState<StudentReviewVersion[]>([])
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    const check = () => setHasApiKey(getGeminiApiKey().length > 0 || getGrokApiKey().length > 0)
    check(); const id = setInterval(check, 2000); return () => clearInterval(id)
  }, [])

  const form = useForm<StudentReviewValues>({
    resolver: zodResolver(studentReviewSchema),
    defaultValues: { assignmentId: assignments[0]?.id ?? '', submissionMethod: 'text', submissionText: '', fileName: '', googleDocUrl: '' },
  })

  const assignmentId = useWatch({ control: form.control, name: 'assignmentId' })
  const submissionMethod = useWatch({ control: form.control, name: 'submissionMethod' })
  const submissionTextValue = useWatch({ control: form.control, name: 'submissionText' })
  const googleDocUrlValue = useWatch({ control: form.control, name: 'googleDocUrl' })
  const selectedAssignment = useMemo(() => assignments.find((a) => a.id === assignmentId) ?? assignments[0], [assignmentId, assignments])
  const passingPercentage = selectedAssignment?.passingPercentage ?? 75

  const mutation = useMutation({
    mutationFn: async (values: StudentReviewValues) => {
      const assignment = assignments.find((a) => a.id === values.assignmentId)
      if (!assignment) throw new Error('Assignment not found')
      let submissionText = values.submissionText || ''
      if (values.submissionMethod === 'google_doc' && values.googleDocUrl) submissionText = await fetchGoogleDocText(values.googleDocUrl)
      else if (values.submissionMethod === 'file' && values.fileName) throw new Error('UNSUPPORTED_SUBMISSION_METHOD')
      return geminiService.evaluateSubmission({ submissionText, rubricText: assignment.rubricText, promptText: assignment.promptText })
    },
    onSuccess: (evaluation, values) => {
      const assignment = assignments.find((a) => a.id === values.assignmentId)
      if (!assignment) return
      const status: StudentReviewVersion['status'] = evaluation.overall_score >= assignment.passingPercentage ? 'Ready For Final Review' : 'Needs Improvement'
      setHistory((p) => [{ version: p.length + 1, assignmentId: values.assignmentId, assignmentTitle: assignment.title, submissionText: values.submissionMethod === 'text' ? values.submissionText || '' : values.googleDocUrl || '', submissionMethod: values.submissionMethod, score: evaluation.overall_score, status, createdAt: new Date().toISOString(), evaluation }, ...p])
    },
  })

  const current = history[0]?.assignmentId === assignmentId && history[0]?.submissionText === (submissionMethod === 'text' ? submissionTextValue || '' : googleDocUrlValue || '') ? history[0] : undefined
  const onSubmit = form.handleSubmit((values) => { mutation.reset(); mutation.mutate(values) })

  if (assignments.length === 0) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <span className="material-symbols-outlined text-warning-amber" style={{ fontSize: 20 }}>warning</span>
          <p className="text-sm">No assignments available yet. Ask an admin to create one.</p>
        </div>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - (current?.score ?? 0) / 100)

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Submit Assignment</h2>
        <p className="text-sm text-text-muted">Choose your assignment and submit for instant AI feedback.</p>
      </div>

      {!hasApiKey ? (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <span className="material-symbols-outlined text-warning-amber flex-shrink-0" style={{ fontSize: 20 }}>warning</span>
          <p className="text-sm"><strong>No API Key:</strong> Click the "API Key" button in the top bar to add a Gemini or Grok API key.</p>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <span className="material-symbols-outlined text-success-emerald flex-shrink-0" style={{ fontSize: 20 }}>check_circle</span>
          <p className="text-sm"><strong>API Key Active:</strong> Your submissions will be reviewed by the active AI provider.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-main mb-4">Submission Form</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Select Assignment</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" {...form.register('assignmentId')}>
                {assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>

            <div className="bg-surface-container-low rounded-xl p-1 flex gap-1 border border-surface-border">
              {METHODS.map((m) => (
                <button key={m.value} type="button" onClick={() => form.setValue('submissionMethod', m.value)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${submissionMethod === m.value ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                  {m.label}
                </button>
              ))}
            </div>

            {submissionMethod === 'google_doc' && (
              <div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>link</span>
                  <input type="url" className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://docs.google.com/document/d/..." {...form.register('googleDocUrl')} />
                </div>
                {form.formState.errors.googleDocUrl && <p className="text-xs text-error mt-1">{form.formState.errors.googleDocUrl.message}</p>}
              </div>
            )}
            {submissionMethod === 'text' && (
              <div>
                <textarea rows={10} className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Paste or type your assignment content here..." {...form.register('submissionText')} />
                {form.formState.errors.submissionText && <p className="text-xs text-error mt-1">{form.formState.errors.submissionText.message}</p>}
              </div>
            )}
            {submissionMethod === 'file' && (
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center gap-2 bg-surface-container-low">
                <span className="material-symbols-outlined text-4xl text-outline">cloud_upload</span>
                <p className="text-sm text-text-muted">File upload coming soon — use text or Google Doc.</p>
              </div>
            )}

            <button type="submit" disabled={mutation.isPending || !hasApiKey} className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {mutation.isPending ? (<><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span>Reviewing...</>) : (<><span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>Submit &amp; Get AI Feedback</>)}
            </button>
          </form>

          {mutation.isPending && (<div className="mt-3 w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full animate-pulse w-2/3" /></div>)}
          {mutation.isError && (
            <div className="mt-3 flex items-start gap-2 bg-error-container border border-error/20 rounded-xl p-3">
              <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>error</span>
              <p className="text-xs text-on-error-container">{(mutation.error as Error)?.message ?? 'An unexpected error occurred.'}</p>
            </div>
          )}
        </div>

        {/* Right panel: rubric or results */}
        {current ? (
          <div className="space-y-4">
            <div className={`bg-surface-container-lowest border-2 rounded-xl p-5 ${current.evaluation.ready_for_review ? 'border-success-emerald' : 'border-warning-amber'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="transparent" stroke="#e6e8ea" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="transparent" stroke={current.evaluation.ready_for_review ? '#059669' : '#D97706'} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="font-headline text-xl font-bold" style={{ color: current.evaluation.ready_for_review ? '#059669' : '#D97706' }}>{current.score}</span>
                    <span className="text-[9px] text-text-muted uppercase">Score</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${current.evaluation.ready_for_review ? 'bg-emerald-100 text-success-emerald' : 'bg-amber-100 text-warning-amber'}`}>{current.status}</span>
                  <p className="text-xs text-text-muted">Pass threshold: {passingPercentage}%</p>
                </div>
              </div>
              <div className="space-y-3">
                {current.evaluation.criterion_scores.map((s) => {
                  const pct = Math.round((s.score / s.max_score) * 100)
                  const passed = s.score >= s.max_score * 0.7
                  return (
                    <div key={s.criterion}>
                      <div className="flex justify-between mb-1"><span className="text-xs font-semibold text-text-main">{s.criterion}</span><span className={`text-xs font-bold ${passed ? 'text-success-emerald' : 'text-warning-amber'}`}>{s.score}/{s.max_score}</span></div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${passed ? 'bg-success-emerald' : 'bg-warning-amber'}`} style={{ width: `${pct}%`, transition: 'width 1s ease' }} /></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden sticky top-20">
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-main">Grading Rubric</h3>
              {selectedAssignment && <span className="text-xs font-semibold text-text-muted">Pass {passingPercentage}%</span>}
            </div>
            <div className="p-4">
              {selectedAssignment ? (
                <pre className="text-xs text-on-surface whitespace-pre-wrap leading-relaxed">{selectedAssignment.rubricText}</pre>
              ) : (
                <p className="text-sm text-text-muted">Select an assignment to view its rubric.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}