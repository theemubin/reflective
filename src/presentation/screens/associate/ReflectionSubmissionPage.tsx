import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function ReflectionSubmissionPage() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const submissions = useSubmissionsStore((s) => s.submissions)

  const plan = submissions.find((s) => s.id === planId && s.associateId === user?.id)

  const [assumptions, setAssumptions] = useState('')
  const [blindSpots, setBlindSpots] = useState('')
  const [futureAdapt, setFutureAdapt] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const textLength = (assumptions + blindSpots + futureAdapt).length
  const depthScore = Math.min(10, Math.max(1, textLength / 50))

  const depthColor = depthScore > 7 ? '#10b981' : depthScore > 4 ? '#f59e0b' : '#ef4444'
  const depthLabel = depthScore > 7
    ? 'Excellent depth! Strong self-awareness and systems thinking.'
    : depthScore > 4
    ? 'Good start. Add specific examples from your execution to deepen the reflection.'
    : "Your reflection is brief. Dig deeper into the 'why' to increase your Growth Index."

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (depthScore < 4) return
    // Store reflection locally (in a real app, this would persist to DB)
    setSubmitted(true)
    setTimeout(() => navigate('/dashboard/associate/my-submissions'), 1500)
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a1a, #0d0d2b)' }}>
        <div className="text-center p-8">
          <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#334155' }}>search_off</span>
          <p className="text-white font-bold text-lg">Plan not found</p>
          <p className="text-sm mt-2 mb-4" style={{ color: '#64748b' }}>This plan doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard/associate/my-submissions')}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff' }}
          >
            View My Submissions
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a1a, #0d0d2b)' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }}>check</span>
          </div>
          <p className="text-white font-black text-2xl font-headline">Reflection saved!</p>
          <p className="text-sm mt-2" style={{ color: '#64748b' }}>Redirecting to your submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)' }}>
      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🪞</span>
            <h1 className="font-headline text-2xl md:text-3xl font-black" style={{ background: 'linear-gradient(90deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Deep Reflection
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Reflecting on: <span className="font-semibold" style={{ color: '#94a3b8' }}>{plan.categoryName}</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(plan.aiScore ?? 0) >= 75 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
              {plan.aiScore ?? 0}% AI Score
            </span>
            <span className="text-xs" style={{ color: '#475569' }}>Submitted {new Date(plan.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                {
                  id: 'assumptions',
                  label: 'What assumptions did you have going in that were proven wrong?',
                  placeholder: 'I assumed the students would grasp the concept quickly, but...',
                  value: assumptions,
                  onChange: setAssumptions,
                },
                {
                  id: 'blind-spots',
                  label: 'What did you learn about your own blind spots?',
                  placeholder: 'I realized I often skip verifying foundational knowledge...',
                  value: blindSpots,
                  onChange: setBlindSpots,
                },
                {
                  id: 'future-adapt',
                  label: 'How will you adapt this for future execution?',
                  placeholder: 'Next time, I will incorporate a 5-minute pre-assessment...',
                  value: futureAdapt,
                  onChange: setFutureAdapt,
                },
              ].map((field) => (
                <div key={field.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="block text-sm font-semibold mb-3 text-white">{field.label}</label>
                  <textarea
                    id={field.id}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full min-h-[100px] p-3 rounded-xl text-sm resize-y transition-all outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#e2e8f0',
                    }}
                    placeholder={field.placeholder}
                    required
                    onFocus={(e) => (e.target.style.border = '1px solid rgba(167,139,250,0.5)')}
                    onBlur={(e) => (e.target.style.border = '1px solid rgba(255,255,255,0.08)')}
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depthScore < 4}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: depthScore >= 4 ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : undefined, color: '#fff' }}
                >
                  Save Reflection
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live depth indicator */}
          <div>
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(99,102,241,0.08))', border: '1px solid rgba(124,58,237,0.3)' }}>
              <h3 className="font-headline text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#a78bfa' }}>analytics</span>
                AI Depth Analysis
              </h3>

              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Reflection Depth</span>
                  <span className="text-2xl font-black" style={{ color: depthColor }}>{depthScore.toFixed(1)}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${depthScore * 10}%`, background: depthColor }}
                  />
                </div>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{depthLabel}</p>

              {depthScore < 4 && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-xs font-bold" style={{ color: '#f87171' }}>⚠ Reflection too brief to submit</p>
                </div>
              )}

              {/* Reflective question prompts from the AI evaluation */}
              {plan.evaluation?.reflective_questions && plan.evaluation.reflective_questions.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7c3aed' }}>ReflectiEVE Questions</p>
                  <div className="space-y-2">
                    {plan.evaluation.reflective_questions.slice(0, 3).map((q, i) => (
                      <div key={i} className="p-2 rounded-lg text-xs leading-relaxed" style={{ background: 'rgba(124,58,237,0.1)', color: '#c4b5fd' }}>
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
