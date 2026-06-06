import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ReflectionSubmissionPage() {
  const { planId } = useParams()
  const navigate = useNavigate()

  const [assumptions, setAssumptions] = useState('')
  const [blindSpots, setBlindSpots] = useState('')
  const [futureAdapt, setFutureAdapt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plan, setPlan] = useState<any>(null)

  // Fetch plan info
  useEffect(() => {
    fetch(`http://localhost:3001/api/plans/${planId}`)
      .then(res => res.json())
      .then(data => setPlan(data))
      .catch(console.error)
  }, [planId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          assumptions,
          blindSpots,
          futureAdapt
        })
      })
      
      if (response.ok) {
        navigate('/dashboard')
      } else {
        console.error('Failed to submit reflection')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate live AI reflection depth mock
  const textLength = (assumptions + blindSpots + futureAdapt).length
  const depthScore = Math.min(10, Math.max(1, textLength / 50))
  let depthColor = 'bg-error-rose'
  if (depthScore > 4) depthColor = 'bg-warning-amber'
  if (depthScore > 7) depthColor = 'bg-success-emerald'

  if (!plan) return <div className="p-8">Loading...</div>

  return (
    <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto w-full animate-fade-in-up">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold text-primary mb-2">Deep Reflection</h1>
        <p className="text-body-md text-text-muted">
          Reflecting on your executed plan: <span className="font-bold text-text-main">"{plan.title}"</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-semibold text-text-main mb-2">
                What assumptions did you have going into this that were proven wrong?
              </label>
              <textarea
                value={assumptions}
                onChange={e => setAssumptions(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-xl border border-surface-border bg-surface-container-low focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all resize-y"
                placeholder="I assumed the students would grasp the concept quickly, but..."
                required
              />
            </div>

            <div className="bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-semibold text-text-main mb-2">
                What did you learn about your own blind spots?
              </label>
              <textarea
                value={blindSpots}
                onChange={e => setBlindSpots(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-xl border border-surface-border bg-surface-container-low focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all resize-y"
                placeholder="I realized I often skip verifying foundational knowledge..."
                required
              />
            </div>

            <div className="bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-semibold text-text-main mb-2">
                How will you adapt this for future execution?
              </label>
              <textarea
                value={futureAdapt}
                onChange={e => setFutureAdapt(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-xl border border-surface-border bg-surface-container-low focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all resize-y"
                placeholder="Next time, I will incorporate a 5-minute pre-assessment..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-xl border border-surface-border text-text-main font-semibold hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || depthScore < 4}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Reflection'}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Depth Indicator */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-sm border border-primary/10 sticky top-24">
            <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">analytics</span>
              AI Depth Analysis
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Reflection Depth</span>
                <span className="text-2xl font-black">{depthScore.toFixed(1)}</span>
              </div>
              <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${depthColor} transition-all duration-300`} style={{ width: `${depthScore * 10}%` }} />
              </div>
            </div>
            
            <p className="text-sm opacity-90 leading-relaxed">
              {depthScore < 4 && "Your reflection is currently quite brief. Dig deeper into the 'why' behind your observations to increase your Growth Index."}
              {depthScore >= 4 && depthScore < 7 && "Good start. Can you provide specific examples of what happened during the execution to support your reflection?"}
              {depthScore >= 7 && "Excellent depth! You are demonstrating strong self-awareness and systems thinking."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
