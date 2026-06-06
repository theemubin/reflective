import { useNavigate } from 'react-router-dom'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function MentorDashboardPage() {
  const navigate = useNavigate()
  const submissions = useSubmissionsStore((s) => s.submissions)
  
  const pending = submissions.filter((s) => s.status === 'submitted_to_mentor')

  const riskAlerts = [
    { learner: 'David Kim', issue: 'Superficial reflections across last 3 plans.', severity: 'high' },
    { learner: 'Sarah Jenkins', issue: 'Declining execution rate this month.', severity: 'medium' },
  ]

  const recommendations = [
    { text: 'Suggest David Kim focuses on the "Why" in his next reflection.' },
    { text: 'Sarah Jenkins shows strong leadership potential; consider nominating her for a peer-review role.' },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">Mentor Dashboard</h2>
          <p className="text-sm text-text-muted">Monitor cohort trajectory, provide guidance, and manage review queues.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard/mentor/categories')}
            className="px-4 py-2 border border-outline-variant text-text-main rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
          >
            Manage Categories
          </button>
          <button
            onClick={() => navigate('/dashboard/mentor/review-queue')}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 relative"
          >
            Review Queue
            {pending.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-error-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface-container-lowest">
                {pending.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Cohort Analytics Snapshot */}
        <section className="lg:col-span-2 bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-headline text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">insights</span>
            Cohort Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-border">
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Avg Growth Index</span>
              <span className="text-3xl font-black text-primary">76.4</span>
              <span className="text-xs text-success-emerald font-bold ml-2">↑ 4.2</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-border">
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Execution Rate</span>
              <span className="text-3xl font-black text-primary">82%</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-border">
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Deep Reflections</span>
              <span className="text-3xl font-black text-primary">45</span>
              <span className="text-xs text-text-muted ml-1">this week</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-text-main mb-2">Cohort Thinking Evolution</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium">User Empathy</span><span className="text-success-emerald font-bold">Strong</span></div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full"><div className="h-full bg-success-emerald rounded-full w-[85%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium">Systems Thinking</span><span className="text-warning-amber font-bold">Needs Focus</span></div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full"><div className="h-full bg-warning-amber rounded-full w-[45%]"></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Alerts */}
        <section className="bg-error-container border border-error/20 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-headline text-lg font-bold text-on-error-container mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Risk Alerts
          </h3>
          <div className="space-y-3 flex-1">
            {riskAlerts.map((alert, i) => (
              <div key={i} className="bg-white/60 p-3 rounded-xl border border-error/10">
                <p className="text-sm font-bold text-text-main mb-0.5">{alert.learner}</p>
                <p className="text-xs text-text-muted">{alert.issue}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Coaching Recommendations */}
      <section className="bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="font-headline text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          AI Coaching Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 bg-blue-50/50 p-4 rounded-xl border border-primary/10">
              <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
              <p className="text-sm text-text-main leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}