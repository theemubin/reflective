import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ShieldAlertIcon } from '../../components/icons'
import { useCategoriesStore } from '../../state/categories.store'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function AdminAnalyticsPage() {
  const categories = useCategoriesStore((s) => s.categories)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const approved = submissions.filter((s) => s.status === 'approved')
  const activeRiskFlags = submissions.reduce((sum, s) => sum + (s.evaluation?.risk_flags.length ?? 0), 0)
  const averageScore = submissions.length === 0 ? 0 : Math.round(submissions.reduce((sum, s) => sum + (s.aiScore ?? 0), 0) / submissions.length)
  const passRate = submissions.length === 0 ? 0 : Math.round((submissions.filter((s) => s.passedAiThreshold).length / submissions.length) * 100)
  const weeklyData = [{ name: 'Current', submissions: submissions.length, passRate }]
  const criteriaAverages = categories.slice(0, 5).map((c) => ({ criterion: c.name, avgScore: c.passingPercentage, maxScore: 100 }))

  const stats = [
    { label: 'Total Submissions', value: submissions.length, sub: `${approved.length} approved`, icon: 'assignment', color: 'text-primary' },
    { label: 'Average Score', value: `${averageScore}%`, sub: 'Based on active rubrics', icon: 'equalizer', color: 'text-primary' },
    { label: 'Pass Rate', value: `${passRate}%`, sub: 'AI threshold pass rate', icon: 'trending_up', color: 'text-success-emerald' },
    { label: 'Risk Flags', value: activeRiskFlags, sub: 'Across all submissions', icon: 'warning', color: 'text-warning-amber' },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Performance &amp; Insights</h2>
        <p className="text-sm text-text-muted">Analyze class-wide scoring trends, rubric mastery, and flagged submissions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{s.label}</p>
            <p className={`font-headline text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="flex items-start gap-3 bg-blue-50 border border-secondary-container rounded-xl p-4">
          <ShieldAlertIcon style={{ width: 20, flexShrink: 0, marginTop: 2, color: '#00236f' }} />
          <p className="text-sm text-on-secondary-fixed-variant">No submission data yet. Analytics will populate once associates begin submitting plans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">Submission Volume &amp; Pass Rate</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submissions" stroke="#00236f" strokeWidth={2} />
                <Line type="monotone" dataKey="passRate" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">Criterion Averages by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={criteriaAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="criterion" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#00236f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}