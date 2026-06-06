import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.store'
import { useCategoriesStore } from '../../state/categories.store'

export default function AssociateDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const categories = useCategoriesStore((s) => s.categories)

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  // We keep the real submissions logic (mocked here for the component if it was missing)
  const recentSubmissions = [
    { id: '1', title: 'Advanced Pedagogy 101', date: 'Submitted Oct 24, 2023', status: 'Executed', statusColor: 'emerald', insight: 'Strong alignment with learning objectives.', hasReflected: true },
    { id: '2', title: 'Inclusive Design Workshop', date: 'Submitted Oct 22, 2023', status: 'Pending Review', statusColor: 'amber', insight: 'Awaiting human review by your mentor.', hasReflected: false },
    { id: '3', title: 'Data Literacy Framework', date: 'Submitted Oct 18, 2023', status: 'Executed', statusColor: 'emerald', insight: 'Score: 92/100. Excellent clarity on learning outcomes.', hasReflected: false },
  ]

  // Mock data for new ReflectiEVE metrics
  const thinkingProfile = [
    { label: 'Clarity', score: 8.5 },
    { label: 'Systems Thinking', score: 6.2 },
    { label: 'Problem Solving', score: 7.8 },
    { label: 'User Empathy', score: 9.1 },
    { label: 'Risk Identification', score: 5.4 },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Welcome + Growth Index */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Hero welcome card */}
        <section className="md:col-span-8 bg-surface-container-lowest border border-surface-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">
                Growth Journey, {firstName}
              </h1>
              <p className="text-body-md text-text-muted max-w-md">
                Your professional development track. Focus on consistent execution, deep reflection, and helping the community.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard/associate/submit-plan')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                Submit New Plan
              </button>
              <button
                onClick={() => navigate('/dashboard/associate/my-submissions')}
                className="border border-outline-variant text-secondary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
              >
                Reflection Library
              </button>
            </div>
          </div>
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none bg-gradient-to-l from-primary to-transparent" />
        </section>

        {/* Growth Index sidebar */}
        <section className="md:col-span-4 bg-primary text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-primary/20">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Master Metric</span>
            <div className="mt-2">
              <span className="text-sm font-medium block text-white/90">Growth Index</span>
              <span className="font-headline text-5xl font-black text-white tracking-tight">84.2</span>
              <span className="text-xs text-emerald-300 font-bold ml-2">↑ +2.4 this month</span>
            </div>
          </div>
          <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Plans Executed</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-white/80">Community Impact</span>
              <span className="font-bold">High</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none" />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Thinking Profile */}
        <section className="bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-headline text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">radar</span>
            Thinking Profile
          </h2>
          <div className="space-y-4">
            {thinkingProfile.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-text-main">{item.label}</span>
                  <span className="text-text-muted font-bold">{item.score.toFixed(1)}</span>
                </div>
                <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-fixed-dim rounded-full transition-all duration-1000"
                    style={{ width: `${(item.score / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Learning Insights & Blind Spots */}
        <section className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-headline text-sm font-bold text-success-emerald uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>psychology</span>
              Learning Insight
            </h3>
            <p className="text-sm text-text-main leading-relaxed">
              "You consistently demonstrate high empathy for users in your designs. Your recent plans show a strong upward trend in clarity and structure."
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-headline text-sm font-bold text-warning-amber uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility_off</span>
              Blind Spot Analysis
            </h3>
            <p className="text-sm text-text-main leading-relaxed">
              "You frequently design strong activities but occasionally underestimate implementation complexity and risk identification. Consider adding a dedicated risk-mitigation section to your next plan."
            </p>
          </div>
        </section>
      </div>

      {/* Execution History (Replaces Recent Submissions to focus on action) */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl font-semibold text-text-main flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Recent Execution History
          </h2>
          <button
            onClick={() => navigate('/dashboard/associate/my-submissions')}
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline underline-offset-4"
          >
            View Full Library
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentSubmissions.map((s, i) => (
            <article
              key={i}
              className="bg-surface-container-lowest border border-surface-border rounded-2xl flex flex-col hover:shadow-md hover:border-primary-container transition-all duration-200 group"
            >
              <div className="p-4 border-b border-surface-border bg-surface-container-low flex justify-between items-start rounded-t-2xl">
                <div>
                  <h3 className="text-sm font-bold text-text-main mb-0.5 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-xs text-text-muted">{s.date}</p>
                </div>
                {/* Execution Badge placeholder */}
                <span className={`material-symbols-outlined ${s.statusColor === 'emerald' ? 'text-success-emerald' : 'text-warning-amber'}`}>
                  {s.statusColor === 'emerald' ? 'verified' : 'pending'}
                </span>
              </div>
              <div className="p-4 flex-grow">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-text-muted italic">"{s.insight}"</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 items-center justify-between w-full">
                  <div className="flex gap-2">
                    {s.hasReflected && (
                       <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md border border-primary/20">
                         Reflected Deeply
                       </span>
                    )}
                    <span className="px-2 py-1 bg-surface-container-high text-text-muted text-[10px] font-bold uppercase tracking-wider rounded-md border border-surface-border">
                      {s.status}
                    </span>
                  </div>
                  {!s.hasReflected && s.status === 'Executed' && (
                    <button 
                      onClick={() => navigate(`/dashboard/associate/reflect/${s.id}`)}
                      className="text-[11px] font-bold uppercase tracking-wider bg-warning-amber text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                    >
                      Reflect Now
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}