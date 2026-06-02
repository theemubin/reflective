import { useState } from 'react'
import { AreaChart, Area, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AwardIcon, TrendingUpIcon, PlusIcon, TrashIcon, CheckIcon } from '../../components/icons'

interface ProgressGoal { id: string; text: string; completed: boolean }

const submissions: { name: string; date: string; score: number }[] = []
const criterionScores: { criterion: string; score: number; max: number }[] = []

export default function StudentProgressPage() {
  const [goals, setGoals] = useState<ProgressGoal[]>([
    { id: '1', text: 'Achieve 85%+ on next Communication Assignment', completed: false },
    { id: '2', text: 'Review feedback on Leadership reflection', completed: true },
    { id: '3', text: 'Structure assessment exit tickets clearly', completed: false },
  ])
  const [newGoal, setNewGoal] = useState('')

  const handleToggleGoal = (id: string) => setGoals((p) => p.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)))
  const handleAddGoal = () => {
    if (!newGoal.trim()) return
    setGoals((p) => [...p, { id: Date.now().toString(), text: newGoal.trim(), completed: false }])
    setNewGoal('')
  }
  const handleDeleteGoal = (id: string) => setGoals((p) => p.filter((g) => g.id !== id))

  const completedCount = goals.filter((g) => g.completed).length

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Reflective Growth Hub</h2>
        <p className="text-sm text-text-muted">Monitor your coaching assessment history, score trends, and reflection checkpoints.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary rounded-xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Average Score</p>
            <p className="font-headline text-4xl font-black mt-1">0%</p>
            <p className="text-xs opacity-70 mt-1">No live AI reviews yet</p>
          </div>
          <AwardIcon style={{ width: 32, opacity: 0.6 }} />
        </div>
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Sessions Submitted</p>
            <p className="font-headline text-4xl font-black text-text-main mt-1">{submissions.length}</p>
            <p className="text-xs text-text-muted mt-1">Total reviewed plans</p>
          </div>
          <TrendingUpIcon style={{ width: 32, color: '#00236f', opacity: 0.6 }} />
        </div>
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Goals Completed</p>
            <p className="font-headline text-4xl font-black text-success-emerald mt-1">{completedCount}/{goals.length}</p>
            <p className="text-xs text-text-muted mt-1">Reflection milestones</p>
          </div>
          <CheckIcon style={{ width: 32, color: '#059669', opacity: 0.6 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">Score History</h3>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-outline">show_chart</span>
                <p className="text-sm text-text-muted">No submission data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={submissions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#00236f" fill="#dce1ff" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">Criterion Mastery</h3>
            {criterionScores.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-outline">bar_chart</span>
                <p className="text-sm text-text-muted">No criterion data yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={criterionScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="criterion" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#00236f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden flex flex-col">
          <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-main">Reflection Goals</h3>
            <span className="px-2 py-0 rounded-full text-xs font-semibold bg-emerald-100 text-success-emerald">{completedCount}/{goals.length} done</span>
          </div>
          <div className="flex-1 divide-y divide-surface-border overflow-auto">
            {goals.map((g) => (
              <div key={g.id} className="flex items-start gap-3 px-4 py-3.5 group">
                <button
                  onClick={() => handleToggleGoal(g.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${g.completed ? 'bg-primary border-primary' : 'border-outline-variant'}`}
                >
                  {g.completed && <CheckIcon style={{ width: 12, color: 'white' }} />}
                </button>
                <p className={`flex-1 text-sm ${g.completed ? 'line-through text-text-muted' : 'text-text-main'}`}>{g.text}</p>
                <button onClick={() => handleDeleteGoal(g.id)} className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50 text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                  <TrashIcon style={{ width: 14 }} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-surface-border flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Add new reflection goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
            />
            <button onClick={handleAddGoal} className="px-3 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 active:scale-95 transition-all">
              <PlusIcon style={{ width: 18 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}