import { useState, useMemo } from 'react'
import type { PlanSubmission } from '../../../domain/types'
import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

function statusConfig(status: string) {
  switch (status) {
    case 'approved':
      return { bg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', dot: 'bg-emerald-400', label: '✓ Approved' }
    case 'changes_requested':
      return { bg: 'bg-red-500/15 text-red-400 border border-red-500/30', dot: 'bg-red-400', label: '↩ Revise' }
    case 'submitted_to_mentor':
      return { bg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30', dot: 'bg-blue-400', label: '🔍 In Review' }
    case 'ready_for_mentor':
      return { bg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30', dot: 'bg-violet-400', label: '✈ Ready' }
    case 'ai_reviewed':
      return { bg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', dot: 'bg-amber-400', label: '⚡ AI Reviewed' }
    default:
      return { bg: 'bg-slate-500/15 text-slate-400 border border-slate-500/30', dot: 'bg-slate-400', label: status.replaceAll('_', ' ') }
  }
}

export default function AssociateSubmissionsPage() {
  const user = useAuthStore((s) => s.user)
  const submissions = useSubmissionsStore((s) => s.submissions).filter((s) => s.associateId === user?.id)
  const [selectedId, setSelectedId] = useState<string | null>(submissions[0]?.id ?? null)

  const selected = useMemo<PlanSubmission | undefined>(
    () => submissions.find((s) => s.id === selectedId) ?? submissions[0],
    [submissions, selectedId]
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>history</span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-black" style={{ background: 'linear-gradient(90deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              My Submissions
            </h2>
          </div>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Track all your plans — AI reviews, mentor submissions, approvals, and feedback.</p>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed20, #a855f720)', border: '1px solid #7c3aed40' }}>
              <span className="material-symbols-outlined text-violet-400 text-5xl">inbox</span>
            </div>
            <p className="font-headline text-xl font-bold text-white">Nothing here yet</p>
            <p className="text-sm" style={{ color: '#64748b' }}>Run an AI review from Submit Plan to create your first submission.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-2">
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-sm font-bold text-white">Submission History</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{submissions.length} total submission{submissions.length !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  {submissions.map((s) => {
                    const cfg = statusConfig(s.status)
                    const isSelected = s.id === (selected?.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-all duration-200 group"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: isSelected ? 'linear-gradient(90deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))' : 'transparent',
                          borderLeft: isSelected ? '3px solid #7c3aed' : '3px solid transparent',
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: isSelected ? '#c4b5fd' : '#e2e8f0' }}>{s.categoryName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ color: '#475569' }}>{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 ml-2 flex-shrink-0">
                          <span className={`text-xs font-bold ${(s.aiScore ?? 0) >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{s.aiScore ?? 0}%</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg}`}>{cfg.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="md:col-span-3 space-y-4">
              {selected ? (
                <>
                  {/* Score Hero */}
                  <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white">{selected.categoryName}</h3>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                          {selected.sourceType === 'google_doc' ? `📄 ${selected.sourceLabel ?? 'Google Doc'}` : '📝 Pasted text'}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#475569' }}>Submitted {new Date(selected.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${(selected.aiScore ?? 0) >= 75 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                          {selected.aiScore ?? 0}% AI Score
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusConfig(selected.status).bg}`}>
                          {statusConfig(selected.status).label}
                        </span>
                      </div>
                    </div>

                    {/* Status timeline */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {['ai_reviewed', 'ready_for_mentor', 'submitted_to_mentor', 'approved'].map((stage, i) => {
                        const stageOrder = ['ai_reviewed', 'ready_for_mentor', 'submitted_to_mentor', 'approved']
                        const currentIdx = stageOrder.indexOf(selected.status)
                        const stageIdx = stageOrder.indexOf(stage)
                        const isPast = stageIdx <= currentIdx
                        const isCurrent = stage === selected.status || (selected.status === 'changes_requested' && stage === 'submitted_to_mentor')
                        return (
                          <div key={stage} className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full transition-all"
                              style={{ background: isCurrent ? '#a855f7' : isPast ? '#6366f1' : '#1e293b' }}
                            />
                            {i < 3 && <div className="w-6 h-0.5 rounded" style={{ background: isPast ? '#6366f130' : '#1e293b' }} />}
                          </div>
                        )
                      })}
                    </div>

                    {/* Plan text preview */}
                    <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto" style={{ color: '#94a3b8' }}>{selected.submissionText}</pre>
                    </div>
                  </div>

                  {/* Mentor Comment */}
                  {selected.mentorComment && (
                    <div className="rounded-2xl p-4 flex items-start gap-3" style={{
                      background: selected.status === 'approved' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      border: `1px solid ${selected.status === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                    }}>
                      <span className={`material-symbols-outlined flex-shrink-0 ${selected.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`} style={{ fontSize: 20 }}>
                        {selected.status === 'approved' ? 'check_circle' : 'rate_review'}
                      </span>
                      <div>
                        <p className="text-xs font-bold mb-1" style={{ color: selected.status === 'approved' ? '#34d399' : '#fbbf24' }}>Mentor Feedback</p>
                        <p className="text-sm" style={{ color: '#e2e8f0' }}>{selected.mentorComment}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Criterion Scores */}
                  {selected.evaluation && (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-violet-400" style={{ fontSize: 18 }}>auto_awesome</span>
                        AI Criterion Scores
                      </h3>
                      <div className="space-y-3">
                        {selected.evaluation.criterion_scores.map((cr) => {
                          const pct = Math.round((cr.score / cr.max_score) * 100)
                          const passed = cr.score >= cr.max_score * 0.7
                          return (
                            <div key={cr.criterion} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <div className="flex justify-between mb-2">
                                <p className="text-xs font-semibold text-white">{cr.criterion}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                  {cr.score}/{cr.max_score}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, background: passed ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                                />
                              </div>
                              <p className="text-xs mt-2" style={{ color: '#64748b' }}>{cr.reasoning}</p>
                              {cr.evidence && <p className="text-xs mt-1 italic" style={{ color: '#475569' }}>{cr.evidence}</p>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  {selected.evaluation && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>rocket_launch</span>
                          Strengths
                        </p>
                        <ul className="space-y-1">
                          {selected.evaluation.strengths.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs flex gap-1.5" style={{ color: '#94a3b8' }}>
                              <span className="text-emerald-400 flex-shrink-0">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                          Improve
                        </p>
                        <ul className="space-y-1">
                          {selected.evaluation.improvements.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-xs flex gap-1.5" style={{ color: '#94a3b8' }}>
                              <span className="text-amber-400 flex-shrink-0">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}