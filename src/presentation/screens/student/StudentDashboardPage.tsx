import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.store'

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.fullName?.split(' ')[0] ?? 'Student'

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Welcome + Growth Index */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Hero welcome card */}
        <section className="md:col-span-8 bg-surface-container-lowest border border-surface-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">
                Your Learning Journey, {firstName}
              </h1>
              <p className="text-body-md text-text-muted max-w-md">
                Focus on deep reflection and understanding how you learn best. Your growth is measured by your self-awareness and improvement over time.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate('/dashboard/student/progress')}
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
              >
                View My Progress
              </button>
            </div>
          </div>
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none bg-gradient-to-l from-primary to-transparent" />
        </section>

        {/* Growth Index sidebar */}
        <section className="md:col-span-4 bg-secondary-container text-on-secondary-container rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Personal Metric</span>
            <div className="mt-2">
              <span className="text-sm font-semibold block text-text-main">Reflection Score</span>
              <span className="font-headline text-5xl font-black text-primary tracking-tight">7.8</span>
              <span className="text-xs text-primary font-bold ml-2">Consistent</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-xl pointer-events-none" />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Feedback */}
        <section className="bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-headline text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">feedback</span>
            Recent Feedback
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-border">
              <p className="text-sm text-text-main leading-relaxed mb-3">
                "Great job breaking down the problem. Next time, try to connect it to real-world examples."
              </p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-semibold">From Mentor Sarah</span>
                <span className="text-text-muted">2 days ago</span>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Focus */}
        <section className="bg-blue-50 border border-secondary-container rounded-2xl p-6 shadow-sm">
          <h2 className="font-headline text-xl font-semibold text-primary-container mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">explore</span>
            Current Focus Area
          </h2>
          <p className="text-sm text-text-main leading-relaxed mb-4">
            Based on your recent assignments, your recommended focus area is <strong>Systems Thinking</strong>. Understanding how different parts of a system interact will elevate your problem-solving skills.
          </p>
          <button className="text-sm font-semibold text-primary-container underline underline-offset-4">
            Explore resources
          </button>
        </section>
      </div>
    </div>
  )
}