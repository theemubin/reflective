import { useNavigate } from 'react-router-dom'
import { useCategoriesStore } from '../../state/categories.store'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function MentorDashboardPage() {
  const navigate = useNavigate()
  const categories = useCategoriesStore((s) => s.categories)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const pending = submissions.filter((s) => s.status === 'submitted_to_mentor')
  const approved = submissions.filter((s) => s.status === 'approved')
  const changes = submissions.filter((s) => s.status === 'changes_requested')

  const stats = [
    { label: 'Pending Reviews', value: pending.length, icon: 'pending_actions', color: 'text-warning-amber', bg: 'bg-amber-100', bar: 'bg-amber-200' },
    { label: 'Approved Plans', value: approved.length, icon: 'task_alt', color: 'text-success-emerald', bg: 'bg-emerald-100', bar: 'bg-emerald-200' },
    { label: 'Changes Requested', value: changes.length, icon: 'rate_review', color: 'text-error', bg: 'bg-red-100', bar: 'bg-red-200' },
    { label: 'Active Categories', value: categories.length, icon: 'category', color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary/20' },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Mentor Dashboard</h2>
        <p className="text-sm text-text-muted">Manage categories, review associate plans, and return mentor decisions.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">{s.label}</p>
            <p className={`font-headline text-4xl font-black leading-none mb-3 ${s.color}`}>{s.value}</p>
            <div className={`h-1.5 rounded-full ${s.bar}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`bg-surface-container-lowest border-2 rounded-xl p-5 ${pending.length > 0 ? 'border-warning-amber' : 'border-surface-border'}`}>
          <h3 className="text-base font-semibold text-text-main mb-1">Review Queue</h3>
          <p className="text-sm text-text-muted mb-4">
            {pending.length > 0 ? `${pending.length} plan${pending.length > 1 ? 's' : ''} waiting for your decision.` : 'No plans pending review right now.'}
          </p>
          <button
            onClick={() => navigate('/dashboard/mentor/review-queue')}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Open Review Queue
          </button>
        </div>
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-text-main mb-1">Categories</h3>
          <p className="text-sm text-text-muted mb-4">Define rubrics, prompts, and passing thresholds for associates to submit against.</p>
          <button
            onClick={() => navigate('/dashboard/mentor/categories')}
            className="px-4 py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 active:scale-95 transition-all"
          >
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  )
}