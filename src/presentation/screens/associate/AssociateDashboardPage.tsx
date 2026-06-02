import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.store'
import { useCategoriesStore } from '../../state/categories.store'
import { useEffect } from 'react'

export default function AssociateDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const categories = useCategoriesStore((s) => s.categories)

  useEffect(() => {}, [])

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'

  const recentSubmissions = [
    { title: 'Advanced Pedagogy 101', date: 'Submitted Oct 24, 2023', status: 'AI Scored', statusColor: 'emerald', insight: 'Strong alignment with learning objectives.' },
    { title: 'Inclusive Design Workshop', date: 'Submitted Oct 22, 2023', status: 'Pending Review', statusColor: 'amber', insight: 'Awaiting human review by your mentor.' },
    { title: 'Data Literacy Framework', date: 'Submitted Oct 18, 2023', status: 'AI Scored', statusColor: 'emerald', insight: 'Score: 92/100. Excellent clarity on learning outcomes.' },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">

      {/* Welcome + summary bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Hero welcome card */}
        <section className="md:col-span-8 bg-surface-container-lowest border border-surface-border rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="font-headline text-2xl md:text-4xl font-bold text-primary mb-2">
              Welcome back, {firstName}
            </h1>
            <p className="text-body-md text-text-muted max-w-md">
              Your professional growth dashboard is ready. Submit a session plan to get AI-powered feedback against your rubric.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard/associate/submit-plan')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Submit Session Plan
              </button>
              <button
                onClick={() => navigate('/dashboard/associate/my-submissions')}
                className="border border-outline-variant text-secondary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors"
              >
                View My Submissions
              </button>
            </div>
          </div>
          {/* Decorative blob */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#00236f" d="M44.7,-76.4C58.2,-69.2,70,-58.5,77.7,-45.5C85.4,-32.5,89,-17.2,88.1,-2.4C87.2,12.3,81.8,26.5,73.5,39.1C65.2,51.7,54,62.7,40.7,70.1C27.5,77.5,12.2,81.4,-2.4,85.5C-17,89.6,-31.1,93.9,-44.4,90.4C-57.7,86.9,-70.2,75.6,-78.9,62.1C-87.6,48.5,-92.5,32.7,-93.3,16.8C-94.1,0.9,-90.8,-15.1,-83.4,-29.4C-76,-43.7,-64.5,-56.3,-51.1,-63.5C-37.7,-70.7,-22.4,-72.5,-6.9,-60.5C8.6,-48.5,22.4,-22.8,31.2,-83.6Z" transform="translate(100 100)" />
            </svg>
          </div>
        </section>

        {/* Stats sidebar */}
        <section className="md:col-span-4 grid grid-rows-2 gap-4">
          <div className="bg-primary-container text-white rounded-xl p-4 flex flex-col justify-center">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-primary-container opacity-80">Completion Status</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="font-headline text-4xl font-bold text-white">3</span>
              <span className="text-base mb-1 text-white opacity-80">Plans Submitted</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
              <div className="bg-white w-3/4 h-full rounded-full" />
            </div>
          </div>
          <div className="bg-secondary-container rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined">event</span>
            </div>
            <div>
              <span className="text-xs font-medium block text-on-secondary-fixed-variant">Categories Available</span>
              <span className="font-headline text-xl font-semibold block text-text-main">{categories.length} active</span>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Submissions */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl font-semibold text-text-main">Recent Submissions</h2>
          <button
            onClick={() => navigate('/dashboard/associate/my-submissions')}
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline underline-offset-4"
          >
            View Archive
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentSubmissions.map((s, i) => (
            <article
              key={i}
              className="bg-surface-container-lowest border border-surface-border rounded-xl flex flex-col hover:border-primary-container hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="p-4 border-b border-surface-border bg-surface-container-low flex justify-between items-start rounded-t-xl">
                <div>
                  <h3 className="text-sm font-semibold text-text-main mb-0.5">{s.title}</h3>
                  <p className="text-xs text-text-muted">{s.date}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  s.statusColor === 'emerald'
                    ? 'bg-emerald-100 text-success-emerald'
                    : 'bg-amber-100 text-warning-amber'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="p-4 flex-grow">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontSize: 18 }}>
                    {s.statusColor === 'emerald' ? 'auto_awesome' : 'hourglass_empty'}
                  </span>
                  <p className="text-sm text-text-muted italic">{s.insight}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    Details →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* AI Insight block */}
      <section className="bg-blue-50 border border-secondary-container rounded-xl p-6 flex flex-col md:flex-row items-center gap-6" style={{ boxShadow: '0 0 20px rgba(144,168,255,0.15)' }}>
        <div className="flex-shrink-0 w-14 h-14 bg-white rounded-full flex items-center justify-center text-primary-container shadow-sm">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-lg font-semibold text-primary-container mb-1">Clarity Insight</h3>
          <p className="text-sm text-on-secondary-container">
            Your session plans consistently score high on "Student Engagement." To reach the next level, try incorporating more quantitative assessment metrics in your next submission.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/associate/submit-plan')}
          className="flex-shrink-0 bg-white border border-primary-container text-primary-container px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-container hover:text-white transition-all whitespace-nowrap"
        >
          Submit New Plan
        </button>
      </section>
    </div>
  )
}