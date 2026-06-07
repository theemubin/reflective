import { useNavigate } from 'react-router-dom'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function MentorDashboardPage() {
  const navigate = useNavigate()
  const submissions = useSubmissionsStore((s) => s.submissions)

  const pending = submissions.filter((s) => s.status === 'submitted_to_mentor')
  const approved = submissions.filter((s) => s.status === 'approved')
  const allVisible = submissions.filter((s) => ['submitted_to_mentor', 'ai_reviewed', 'ready_for_mentor', 'approved', 'changes_requested'].includes(s.status))

  const riskAlerts = [
    { learner: 'David Kim', issue: 'Superficial reflections across last 3 plans.', severity: 'high' },
    { learner: 'Sarah Jenkins', issue: 'Declining execution rate this month.', severity: 'medium' },
  ]

  const recommendations = [
    { text: 'Suggest David Kim focuses on the "Why" in his next reflection.' },
    { text: 'Sarah Jenkins shows strong leadership potential; consider nominating her for a peer-review role.' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🧭</span>
              <h2 className="font-headline text-3xl md:text-4xl font-black" style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Mentor Dashboard
              </h2>
            </div>
            <p className="text-sm" style={{ color: '#94a3b8' }}>Monitor cohort trajectory, provide guidance, and manage review queues.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/mentor/categories')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Manage Categories
            </button>
            <button
              onClick={() => navigate('/dashboard/mentor/review-queue')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 relative"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}
            >
              Review Queue
              {pending.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{ background: '#ef4444' }}>
                  {pending.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Submissions', value: allVisible.length, icon: '📋', color: '#6366f1' },
            { label: 'Pending Review', value: pending.length, icon: '🔍', color: '#3b82f6' },
            { label: 'Approved', value: approved.length, icon: '✓', color: '#10b981' },
            { label: 'Avg Score', value: `${allVisible.length > 0 ? Math.round(allVisible.reduce((a, s) => a + (s.aiScore ?? 0), 0) / allVisible.length) : 0}%`, icon: '⚡', color: '#f59e0b' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 relative overflow-hidden" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}25` }}>
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#64748b' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Cohort Analytics */}
          <section className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#818cf8' }}>insights</span>
              Cohort Analytics
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#64748b' }}>Avg Growth Index</span>
                <span className="text-3xl font-black" style={{ color: '#818cf8' }}>76.4</span>
                <span className="text-xs font-bold ml-1" style={{ color: '#10b981' }}>↑ 4.2</span>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#64748b' }}>Execution Rate</span>
                <span className="text-3xl font-black" style={{ color: '#818cf8' }}>82%</span>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#64748b' }}>Deep Reflections</span>
                <span className="text-3xl font-black" style={{ color: '#818cf8' }}>45</span>
                <span className="text-xs ml-1" style={{ color: '#64748b' }}>this week</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-3">Cohort Thinking Evolution</h4>
            <div className="space-y-3">
              {[
                { label: 'User Empathy', pct: 85, status: 'Strong', color: '#10b981' },
                { label: 'Systems Thinking', pct: 45, status: 'Needs Focus', color: '#f59e0b' },
                { label: 'Risk Identification', pct: 60, status: 'Improving', color: '#6366f1' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold" style={{ color: '#e2e8f0' }}>{item.label}</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.status}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Alerts */}
          <section className="rounded-2xl p-6 flex flex-col" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#f87171' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
              Risk Alerts
            </h3>
            <div className="space-y-3 flex-1">
              {riskAlerts.map((alert, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-sm font-bold text-white mb-0.5">{alert.learner}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{alert.issue}</p>
                  <span className={`text-[10px] font-bold mt-1.5 inline-block px-2 py-0.5 rounded-full ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {alert.severity} severity
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Coaching Recommendations */}
        <section className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-headline text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fbbf24' }}>lightbulb</span>
            AI Coaching Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <span className="material-symbols-outlined mt-0.5 flex-shrink-0" style={{ fontSize: 20, color: '#818cf8' }}>tips_and_updates</span>
                <p className="text-sm leading-relaxed" style={{ color: '#e2e8f0' }}>{rec.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}