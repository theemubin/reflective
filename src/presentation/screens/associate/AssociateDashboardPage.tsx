import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function AssociateDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const submissions = useSubmissionsStore((s) => s.submissions).filter((s) => s.associateId === user?.id)

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  const approvedCount = submissions.filter((s) => s.status === 'approved').length
  const pendingCount = submissions.filter((s) => s.status === 'submitted_to_mentor' || s.status === 'ready_for_mentor').length
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.aiScore ?? 0), 0) / submissions.length)
    : 0

  const recentSubmissions = submissions.slice(0, 3)

  const thinkingProfile = [
    { label: 'Clarity', score: 8.5 },
    { label: 'Systems Thinking', score: 6.2 },
    { label: 'Problem Solving', score: 7.8 },
    { label: 'User Empathy', score: 9.1 },
    { label: 'Risk Identification', score: 5.4 },
  ]

  function getStatusLabel(status: string) {
    switch (status) {
      case 'approved': return { label: '✓ Approved', color: '#10b981' }
      case 'changes_requested': return { label: '↩ Revise', color: '#ef4444' }
      case 'submitted_to_mentor': return { label: '🔍 In Review', color: '#3b82f6' }
      case 'ready_for_mentor': return { label: '✈ Ready', color: '#8b5cf6' }
      case 'ai_reviewed': return { label: '⚡ AI Done', color: '#f59e0b' }
      default: return { label: status, color: '#64748b' }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">

        {/* Welcome Hero */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          <section className="md:col-span-8 rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.08))', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(20px)' }}>
            {/* Ambient glow */}
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(124,58,237,0.3)' }} />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(99,102,241,0.2)' }} />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚀</span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>Growth Journey</span>
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-black text-white mb-2">
                Hey, {firstName}!
              </h1>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
                Keep pushing — consistent execution and deep reflection are the fastest path to mastery.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/dashboard/associate/submit-plan')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                  Submit New Plan
                </button>
                <button
                  onClick={() => navigate('/dashboard/associate/my-submissions')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#c4b5fd', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
                  My History
                </button>
              </div>
            </div>
          </section>

          {/* Stats card */}
          <section className="md:col-span-4 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>Your Stats</span>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Avg AI Score</p>
                  <p className="text-3xl font-black text-white">{avgScore}<span className="text-lg">%</span></p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-[10px] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Approved</p>
                    <p className="text-xl font-black text-white">{approvedCount}</p>
                  </div>
                  <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <p className="text-[10px] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending</p>
                    <p className="text-xl font-black text-white">{pendingCount}</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs font-bold mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{submissions.length} total plans submitted</p>
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Thinking Profile */}
          <section className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#a78bfa' }}>radar</span>
              Thinking Profile
            </h2>
            <div className="space-y-4">
              {thinkingProfile.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold" style={{ color: '#e2e8f0' }}>{item.label}</span>
                    <span className="font-black" style={{ color: '#a78bfa' }}>{item.score.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(item.score / 10) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Insights */}
          <section className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#34d399' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>psychology</span>
                Learning Insight
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                "You consistently demonstrate high empathy for users. Your recent plans show a strong upward trend in clarity and structure."
              </p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#fbbf24' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility_off</span>
                Blind Spot
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                "You frequently design strong activities but occasionally underestimate implementation complexity. Add a risk-mitigation section to your next plan."
              </p>
            </div>
          </section>
        </div>

        {/* Recent Submissions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6366f1' }}>history</span>
              Recent Submissions
            </h2>
            <button
              onClick={() => navigate('/dashboard/associate/my-submissions')}
              className="text-sm font-bold flex items-center gap-1 transition-all"
              style={{ color: '#818cf8' }}
            >
              View All
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>

          {recentSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-4xl">📝</span>
              <p className="text-sm font-semibold text-white">No submissions yet</p>
              <p className="text-xs" style={{ color: '#64748b' }}>Submit your first plan to get started</p>
              <button
                onClick={() => navigate('/dashboard/associate/submit-plan')}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff' }}
              >
                Submit Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentSubmissions.map((s) => {
                const { label, color } = getStatusLabel(s.status)
                return (
                  <article
                    key={s.id}
                    onClick={() => navigate('/dashboard/associate/my-submissions')}
                    className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-sm font-bold text-white truncate">{s.categoryName}</h3>
                        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: `${color}20`, color }}
                      >
                        {s.status === 'approved' ? '✓' : s.status === 'submitted_to_mentor' ? '🔍' : s.status === 'ai_reviewed' ? '⚡' : '•'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                        {label}
                      </span>
                      <span className="text-xs font-black" style={{ color: (s.aiScore ?? 0) >= 75 ? '#10b981' : '#f59e0b' }}>
                        {s.aiScore ?? 0}%
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}