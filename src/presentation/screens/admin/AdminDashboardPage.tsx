import { useNavigate } from 'react-router-dom'

const stats = [
  { label: 'Total Users', value: '—', icon: 'group', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active Categories', value: '—', icon: 'category', color: 'text-secondary', bg: 'bg-secondary/10' },
  { label: 'Submissions', value: '—', icon: 'assignment_turned_in', color: 'text-success-emerald', bg: 'bg-emerald-100' },
  { label: 'Pending Review', value: '—', icon: 'pending_actions', color: 'text-warning-amber', bg: 'bg-amber-100' },
]

const quickActions = [
  { title: 'Manage Users', desc: 'Role access for Admins, Mentors, Associates, and Students.', icon: 'manage_accounts', path: '/dashboard/admin/users' },
  { title: 'Platform Oversight', desc: 'View platform-level review and risk indicators.', icon: 'monitoring', path: '/dashboard/admin/oversight' },
  { title: 'System Settings', desc: 'Configure operational settings and provider keys.', icon: 'settings', path: '/dashboard/admin/settings' },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Admin Dashboard</h2>
        <p className="text-sm text-text-muted">Platform management and oversight.</p>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex items-center gap-3">
            <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${s.color}`} style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-text-main">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl divide-y divide-surface-border overflow-hidden">
            {quickActions.map((a) => (
              <button
                key={a.title}
                onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left group hover:bg-primary hover:text-white transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors" style={{ fontSize: 22 }}>{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-main group-hover:text-white transition-colors">{a.title}</p>
                  <p className="text-xs text-text-muted group-hover:text-white/70 transition-colors">{a.desc}</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-white/80 transition-colors" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight block */}
        <div>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">AI Insight</h3>
          <div className="bg-blue-50 border border-secondary-container rounded-xl p-4" style={{ boxShadow: '0 0 20px rgba(144,168,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Gemini Insight</p>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">No recent evaluation data. Run some AI reviews to see platform-wide insights here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}