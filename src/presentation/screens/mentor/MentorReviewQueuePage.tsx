import { useMemo, useState } from 'react'
import type { PlanSubmission } from '../../../domain/types'
import { useSubmissionsStore } from '../../state/submissions.store'

const reviewableStatuses = ['submitted_to_mentor', 'approved', 'changes_requested'] as const

function statusBadge(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-success-emerald'
  if (status === 'changes_requested') return 'bg-red-100 text-error'
  return 'bg-amber-100 text-warning-amber'
}

export default function MentorReviewQueuePage() {
  const submissions = useSubmissionsStore((s) => s.submissions)
  const mentorReview = useSubmissionsStore((s) => s.mentorReview)
  const reviewable = submissions.filter((s) => reviewableStatuses.includes(s.status as (typeof reviewableStatuses)[number]))
  const [selectedId, setSelectedId] = useState(reviewable[0]?.id ?? '')
  const [comment, setComment] = useState('')

  const selected = useMemo<PlanSubmission | undefined>(() => reviewable.find((s) => s.id === selectedId) ?? reviewable[0], [reviewable, selectedId])

  const decide = (status: 'approved' | 'changes_requested') => {
    if (!selected) return
    mentorReview(selected.id, status, comment.trim())
    setComment('')
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Mentor Review Queue</h2>
        <p className="text-sm text-text-muted">Review associate plans that passed the AI threshold and were submitted for mentor decision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Sidebar list */}
        <div className="md:col-span-2">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden">
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border">
              <h3 className="text-sm font-semibold text-text-main">Submitted Plans</h3>
            </div>
            {reviewable.length === 0 ? (
              <div className="p-6 flex flex-col items-center gap-2 text-center">
                <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
                <p className="text-sm text-text-muted">No plans are waiting for mentor review.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {reviewable.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedId(s.id); setComment(s.mentorComment ?? '') }}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${selectedId === s.id ? 'bg-primary/5' : 'hover:bg-surface-container-low'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">{s.categoryName}</p>
                      <p className="text-xs text-text-muted">{s.associateName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs font-bold ${(s.aiScore ?? 0) >= 75 ? 'text-success-emerald' : 'text-warning-amber'}`}>{s.aiScore ?? 0}%</span>
                      <span className={`px-2 py-0 rounded-full text-[10px] font-semibold ${statusBadge(s.status)}`}>{s.status.replaceAll('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="md:col-span-3">
          {selected ? (
            <div className="space-y-4">
              {/* Submission header */}
              <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-main">{selected.categoryName}</h3>
                    <p className="text-sm text-text-muted">Submitted by {selected.associateName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(selected.aiScore ?? 0) >= 75 ? 'bg-emerald-100 text-success-emerald' : 'bg-amber-100 text-warning-amber'}`}>{selected.aiScore ?? 0}% AI score</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3 border border-surface-border">
                  <pre className="text-xs text-on-surface whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">{selected.submissionText}</pre>
                </div>
              </div>

              {/* AI Evidence */}
              {selected.evaluation && (
                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-text-main mb-3">AI Evidence Review</h3>
                  <div className="space-y-3">
                    {selected.evaluation.criterion_scores.map((cr) => {
                      const pct = Math.round((cr.score / cr.max_score) * 100)
                      const passed = cr.score >= cr.max_score * 0.7
                      return (
                        <div key={cr.criterion} className="border border-surface-border rounded-xl p-3">
                          <div className="flex justify-between mb-1.5">
                            <p className="text-xs font-semibold text-text-main">{cr.criterion}</p>
                            <p className={`text-xs font-bold ${passed ? 'text-success-emerald' : 'text-warning-amber'}`}>{cr.score}/{cr.max_score}</p>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
                            <div className={`h-full rounded-full ${passed ? 'bg-success-emerald' : 'bg-warning-amber'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-text-muted">{cr.reasoning}</p>
                          {cr.evidence && <p className="text-xs text-text-muted mt-1 italic">Evidence: {cr.evidence}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mentor Decision */}
              <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-main mb-3">Mentor Decision</h3>
                {selected.status === 'approved' && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                    <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: 18 }}>check_circle</span>
                    <p className="text-sm text-success-emerald">Approved by Mentor.</p>
                  </div>
                )}
                {selected.status === 'changes_requested' && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                    <span className="material-symbols-outlined text-warning-amber" style={{ fontSize: 18 }}>pending</span>
                    <p className="text-sm text-warning-amber">Changes requested.</p>
                  </div>
                )}
                <textarea
                  rows={4}
                  className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-3"
                  placeholder="Add clear next steps or approval note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={() => decide('approved')} className="flex-1 py-3 bg-success-emerald text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>Approve
                  </button>
                  <button onClick={() => decide('changes_requested')} className="flex-1 py-3 border-2 border-warning-amber text-warning-amber rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>Request Changes
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}