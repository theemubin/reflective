import { useState } from 'react'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function PlanRepositoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const submissions = useSubmissionsStore((s) => s.submissions)

  // Repository only shows approved plans
  const approvedPlans = submissions.filter((s) => s.status === 'approved')

  const filteredPlans = approvedPlans.filter(
    (p) =>
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.associateName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📚</span>
              <h1 className="font-headline text-3xl md:text-4xl font-black" style={{ background: 'linear-gradient(90deg, #10b981, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Knowledge Repository
              </h1>
            </div>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: '#94a3b8' }}>
              Success is achieved when knowledge survives beyond the original creator. These are <strong className="text-emerald-400">mentor-approved plans</strong> from the ReflectiEVE community.
            </p>
          </div>
          <div className="w-full md:w-72">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 20, color: '#475569' }}>search</span>
              <input
                type="text"
                placeholder="Search plans or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                }}
              />
            </div>
          </div>
        </div>

        {approvedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl gap-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: '#10b981' }}>auto_stories</span>
            </div>
            <div className="text-center">
              <p className="font-headline text-xl font-bold text-white">No approved plans yet</p>
              <p className="text-sm mt-1 max-w-sm" style={{ color: '#64748b' }}>
                Plans will appear here once a mentor approves them. Keep submitting and improving!
              </p>
            </div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#334155' }}>search_off</span>
            <p className="text-lg font-semibold text-white">No plans match your search</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                      {plan.categoryName}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold">Approved</span>
                    </span>
                  </div>

                  <h3 className="font-headline text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {plan.categoryName} — {plan.sourceType === 'google_doc' ? 'Google Doc' : 'Submitted Text'}
                  </h3>
                  <p className="text-xs mb-3" style={{ color: '#64748b' }}>By {plan.associateName}</p>

                  <div className="rounded-lg p-2 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-20 overflow-hidden" style={{ color: '#64748b' }}>
                      {plan.submissionText.slice(0, 200)}{plan.submissionText.length > 200 ? '...' : ''}
                    </pre>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#10b981' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                      {plan.aiScore ?? 0}% AI Score
                    </span>
                    <span className="text-xs" style={{ color: '#334155' }}>{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                    ✓ Mentor Approved
                  </span>
                  <button
                    className="flex items-center gap-1 text-xs font-bold transition-colors"
                    style={{ color: '#818cf8' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_copy</span>
                    Adapt
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
