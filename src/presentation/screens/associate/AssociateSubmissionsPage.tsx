import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

function statusBadge(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-success-emerald'
  if (status === 'changes_requested') return 'bg-red-100 text-error'
  if (status === 'submitted_to_mentor') return 'bg-amber-100 text-warning-amber'
  if (status === 'ready_for_mentor') return 'bg-blue-100 text-blue-700'
  return 'bg-surface-container-high text-text-muted'
}

export default function AssociateSubmissionsPage() {
  const user = useAuthStore((s) => s.user)
  const submissions = useSubmissionsStore((s) => s.submissions).filter((s) => s.associateId === user?.id)
  const selected = submissions[0]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">My Submissions</h2>
        <p className="text-sm text-text-muted">Track AI review results, mentor submission status, and mentor decisions.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex items-start gap-3 bg-blue-50 border border-secondary-container rounded-xl p-4">
          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 20 }}>info</span>
          <p className="text-sm text-on-secondary-fixed-variant">No submissions yet. Run an AI review from Submit Plan to create your first submission.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-2">
            <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border">
                <h3 className="text-sm font-semibold text-text-main">Submission History</h3>
              </div>
              <div className="divide-y divide-surface-border">
                {submissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">{s.categoryName}</p>
                      <p className="text-xs text-text-muted">{s.aiScore ?? 0}% &middot; {new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusBadge(s.status)}`}>{s.status.replaceAll('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="md:col-span-3 space-y-4">
            {selected && (
              <>
                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-text-main">{selected.categoryName}</h3>
                      <p className="text-xs text-text-muted">{selected.sourceType === 'google_doc' ? selected.sourceLabel : 'Pasted text'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(selected.aiScore ?? 0) >= 75 ? 'bg-emerald-100 text-success-emerald' : 'bg-amber-100 text-warning-amber'}`}>{selected.aiScore ?? 0}% AI score</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-3 border border-surface-border">
                    <pre className="text-xs text-on-surface whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">{selected.submissionText}</pre>
                  </div>
                </div>

                {selected.mentorComment && (
                  <div className={`flex items-start gap-3 rounded-xl p-4 ${selected.status === 'approved' ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <span className={`material-symbols-outlined flex-shrink-0 ${selected.status === 'approved' ? 'text-success-emerald' : 'text-warning-amber'}`} style={{ fontSize: 18 }}>{selected.status === 'approved' ? 'check_circle' : 'rate_review'}</span>
                    <div>
                      <p className="text-xs font-bold mb-0.5">Mentor comment</p>
                      <p className="text-sm">{selected.mentorComment}</p>
                    </div>
                  </div>
                )}

                {selected.evaluation && (
                  <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-text-main mb-3">AI Criterion Evidence</h3>
                    <div className="space-y-3">
                      {selected.evaluation.criterion_scores.map((cr) => (
                        <div key={cr.criterion} className="border border-surface-border rounded-xl p-3">
                          <div className="flex justify-between mb-0.5">
                            <p className="text-xs font-bold text-text-main">{cr.criterion}</p>
                            <span className="px-2 py-0 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">{cr.score}/{cr.max_score}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">{cr.reasoning}</p>
                          {cr.evidence && <p className="text-xs text-text-muted mt-1 italic">{cr.evidence}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}