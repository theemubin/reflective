import { useMemo, useState } from 'react'
import type { PlanSubmission } from '../../../domain/types'
import { useSubmissionsStore } from '../../state/submissions.store'

// Mentor sees ALL submissions from associates (all statuses)
const ALL_STATUSES = ['submitted_to_mentor', 'ai_reviewed', 'ready_for_mentor', 'approved', 'changes_requested'] as const

function statusConfig(status: string) {
  switch (status) {
    case 'approved':
      return { bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', label: '✓ Approved', pill: 'text-emerald-400' }
    case 'changes_requested':
      return { bg: 'bg-red-500/15 text-red-400 border border-red-500/30', label: '↩ Needs Changes', pill: 'text-red-400' }
    case 'submitted_to_mentor':
      return { bg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30', label: '🔍 In Review', pill: 'text-blue-400' }
    case 'ready_for_mentor':
      return { bg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30', label: '✈ Ready to Review', pill: 'text-violet-400' }
    case 'ai_reviewed':
      return { bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', label: '⚡ Low Score', pill: 'text-amber-400' }
    default:
      return { bg: 'bg-slate-500/15 text-slate-400 border border-slate-500/30', label: status.replaceAll('_', ' '), pill: 'text-slate-400' }
  }
}

const STATUS_FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'submitted_to_mentor', label: 'Pending' },
  { key: 'ready_for_mentor', label: 'Ready' },
  { key: 'ai_reviewed', label: 'Low Score' },
  { key: 'approved', label: 'Approved' },
  { key: 'changes_requested', label: 'Revise' },
]

export default function MentorReviewQueuePage() {
  const submissions = useSubmissionsStore((s) => s.submissions)
  const mentorReview = useSubmissionsStore((s) => s.mentorReview)

  // Mentor sees ALL submissions (all statuses)
  const allVisible = submissions.filter((s) => ALL_STATUSES.includes(s.status as (typeof ALL_STATUSES)[number]))

  const [selectedId, setSelectedId] = useState(allVisible[0]?.id ?? '')
  const [comment, setComment] = useState('')
  const [filterTab, setFilterTab] = useState('all')

  const filtered = useMemo(() => {
    if (filterTab === 'all') return allVisible
    return allVisible.filter((s) => s.status === filterTab)
  }, [allVisible, filterTab])

  const selected = useMemo<PlanSubmission | undefined>(
    () => filtered.find((s) => s.id === selectedId) ?? filtered[0],
    [filtered, selectedId]
  )

  const decide = (status: 'approved' | 'changes_requested') => {
    if (!selected) return
    mentorReview(selected.id, status, comment.trim())
    setComment('')
  }

  const pendingCount = allVisible.filter((s) => s.status === 'submitted_to_mentor').length

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>supervisor_account</span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-black" style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mentor Review Queue
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            All submissions visible to you — including AI-reviewed (low score), ready for review, and previously decided plans.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {STATUS_FILTER_TABS.map((tab) => {
            const count = tab.key === 'all' ? allVisible.length : allVisible.filter((s) => s.status === tab.key).length
            const active = filterTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                style={{
                  background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#fff' : '#64748b',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                    style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', color: active ? '#fff' : '#94a3b8' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Sidebar list */}
          <div className="md:col-span-2">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-sm font-bold text-white">Submissions</h3>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{filtered.length} showing</p>
              </div>
              {filtered.length === 0 ? (
                <div className="p-10 flex flex-col items-center gap-3 text-center">
                  <span className="material-symbols-outlined text-5xl" style={{ color: '#334155' }}>inbox</span>
                  <p className="text-sm" style={{ color: '#475569' }}>Nothing in this category yet.</p>
                </div>
              ) : (
                <div>
                  {filtered.map((s) => {
                    const cfg = statusConfig(s.status)
                    const isSelected = s.id === selected?.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedId(s.id); setComment(s.mentorComment ?? '') }}
                        className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-200"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isSelected ? 'linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent',
                          borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: isSelected ? '#c4b5fd' : '#e2e8f0' }}>{s.categoryName}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{s.associateName}</p>
                          <p className="text-xs" style={{ color: '#334155' }}>{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-xs font-bold ${(s.aiScore ?? 0) >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.aiScore ?? 0}%</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg}`}>{cfg.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="md:col-span-3">
            {selected ? (
              <div className="space-y-4">
                {/* Submission header */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">{selected.categoryName}</h3>
                      <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>Submitted by <span className="text-violet-400 font-semibold">{selected.associateName}</span></p>
                      <p className="text-xs mt-1" style={{ color: '#475569' }}>{new Date(selected.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(selected.aiScore ?? 0) >= 75 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                        {selected.aiScore ?? 0}% AI Score
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig(selected.status).bg}`}>
                        {statusConfig(selected.status).label}
                      </span>
                    </div>
                  </div>

                  {/* Low score notice */}
                  {selected.status === 'ai_reviewed' && (
                    <div className="rounded-xl p-3 mb-4 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                      <span className="material-symbols-outlined text-amber-400 flex-shrink-0" style={{ fontSize: 18 }}>info</span>
                      <p className="text-xs" style={{ color: '#fbbf24' }}>
                        This plan scored below the passing threshold and was not submitted to you. You can see it here for coaching insight.
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto" style={{ color: '#94a3b8' }}>{selected.submissionText}</pre>
                  </div>
                </div>

                {/* AI Evidence Review */}
                {selected.evaluation && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-violet-400" style={{ fontSize: 18 }}>auto_awesome</span>
                      AI Evidence Review
                    </h3>
                    <div className="space-y-3">
                      {selected.evaluation.criterion_scores.map((cr) => {
                        const pct = Math.round((cr.score / cr.max_score) * 100)
                        const passed = cr.score >= cr.max_score * 0.7
                        return (
                          <div key={cr.criterion} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex justify-between mb-1.5">
                              <p className="text-xs font-semibold text-white">{cr.criterion}</p>
                              <p className={`text-xs font-bold ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>{cr.score}/{cr.max_score}</p>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: passed ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                            </div>
                            <p className="text-xs" style={{ color: '#64748b' }}>{cr.reasoning}</p>
                            {cr.evidence && <p className="text-xs mt-1 italic" style={{ color: '#475569' }}>Evidence: {cr.evidence}</p>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Mentor Decision (only for submitted_to_mentor, approved, or changes_requested) */}
                {(selected.status === 'submitted_to_mentor' || selected.status === 'approved' || selected.status === 'changes_requested') && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sky-400" style={{ fontSize: 18 }}>rate_review</span>
                      Mentor Decision
                    </h3>
                    {selected.status === 'approved' && (
                      <div className="flex items-center gap-2 rounded-xl p-3 mb-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 18 }}>check_circle</span>
                        <p className="text-sm text-emerald-400 font-semibold">Approved by you.</p>
                      </div>
                    )}
                    {selected.status === 'changes_requested' && (
                      <div className="flex items-center gap-2 rounded-xl p-3 mb-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 18 }}>pending</span>
                        <p className="text-sm text-amber-400 font-semibold">Changes requested.</p>
                      </div>
                    )}
                    {selected.mentorComment && (
                      <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#94a3b8' }}>Previous comment:</p>
                        <p className="text-sm" style={{ color: '#e2e8f0' }}>{selected.mentorComment}</p>
                      </div>
                    )}
                    <textarea
                      rows={4}
                      className="w-full p-3 rounded-xl text-sm resize-none outline-none transition-all mb-3"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e2e8f0',
                      }}
                      placeholder="Add clear next steps or approval note..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => decide('approved')}
                        className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>Approve
                      </button>
                      <button
                        onClick={() => decide('changes_requested')}
                        className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>Request Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Info for low-score plans (mentor can only view, not decide) */}
                {selected.status === 'ai_reviewed' && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 18 }}>visibility</span>
                      Coaching View Only
                    </h3>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      This plan scored below the passing threshold. The associate needs to improve and resubmit before it becomes reviewable. Use this view for coaching and feedback in 1-on-1 sessions.
                    </p>
                  </div>
                )}

                {/* Info for ready_for_mentor plans (associate hasn't clicked "Submit to Mentor" yet) */}
                {selected.status === 'ready_for_mentor' && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-violet-400" style={{ fontSize: 18 }}>hourglass_top</span>
                      Awaiting Associate Submission
                    </h3>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      This plan passed the AI threshold but the associate hasn't clicked "Submit to Mentor" yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="material-symbols-outlined text-5xl" style={{ color: '#1e293b' }}>inbox</span>
                <p className="text-sm" style={{ color: '#475569' }}>Select a submission to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}