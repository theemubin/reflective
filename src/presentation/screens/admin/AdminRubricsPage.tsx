import { useState } from 'react'
import { PlusIcon, TrashIcon } from '../../components/icons'

interface RubricCriterion {
  id: string
  name: string
  maxScore: number
  description: string
}

const rubricPresets: Record<string, RubricCriterion[]> = {
  lifeSkills: [
    { id: '1', name: 'Learning Objectives', maxScore: 20, description: 'Clear and measurable targets.' },
    { id: '2', name: 'Engagement', maxScore: 20, description: 'Interactive learning prompts.' },
    { id: '3', name: 'Reflection', maxScore: 20, description: 'Opportunities for self-correction.' },
    { id: '4', name: 'Assessment', maxScore: 20, description: 'Evidence of student achievement.' },
    { id: '5', name: 'Inclusivity', maxScore: 20, description: 'Differentiation for various students.' },
  ],
  writing: [
    { id: 'w1', name: 'Clarity & Coherence', maxScore: 30, description: 'Logical structural progression.' },
    { id: 'w2', name: 'Grammar & Style', maxScore: 20, description: 'Polished expression and vocabulary.' },
    { id: 'w3', name: 'Evidence & Analysis', maxScore: 30, description: 'Supported claims and references.' },
    { id: 'w4', name: 'Formatting & Citations', maxScore: 20, description: 'Correct academic formatting.' },
  ],
  coding: [
    { id: 'c1', name: 'Correctness', maxScore: 40, description: 'Code runs properly and passes unit tests.' },
    { id: 'c2', name: 'Readability & Documentation', maxScore: 20, description: 'Variables named well, comments provided.' },
    { id: 'c3', name: 'Efficiency', maxScore: 20, description: 'Optimal time and space complexity.' },
    { id: 'c4', name: 'Test Coverage', maxScore: 20, description: 'Comprehensive edge cases covered.' },
  ],
}

export default function AdminRubricsPage() {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(rubricPresets.lifeSkills)
  const [preset, setPreset] = useState('lifeSkills')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newMax, setNewMax] = useState(20)

  const handleApplyPreset = (key: string) => { setPreset(key); setCriteria(rubricPresets[key] || []) }
  const handleAddCriterion = () => {
    if (!newName.trim()) return
    setCriteria((prev) => [...prev, { id: Date.now().toString(), name: newName.trim(), description: newDesc.trim() || 'No description provided.', maxScore: Number(newMax) || 10 }])
    setNewName(''); setNewDesc(''); setNewMax(20)
  }
  const handleDeleteCriterion = (id: string) => setCriteria((prev) => prev.filter((c) => c.id !== id))
  const totalPoints = criteria.reduce((sum, item) => sum + item.maxScore, 0)

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Rubric Architect</h2>
        <p className="text-sm text-text-muted">Draft, construct, and assign evaluation criteria and maximum weight limits.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{criteria.length}</p>
          <p className="text-xs text-text-muted">Criteria</p>
        </div>
        <div className={`${totalPoints === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} border rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold ${totalPoints === 100 ? 'text-success-emerald' : 'text-warning-amber'}`}>{totalPoints}</p>
          <p className={`text-xs ${totalPoints === 100 ? 'text-success-emerald' : 'text-warning-amber'}`}>Total Points</p>
        </div>
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{Object.keys(rubricPresets).length}</p>
          <p className="text-xs text-text-muted">Presets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Creator Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preset selector */}
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-main mb-3">Quick Presets</h3>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              value={preset}
              onChange={(e) => handleApplyPreset(e.target.value)}
            >
              <option value="lifeSkills">Life Skills Evaluation</option>
              <option value="writing">Academic Writing</option>
              <option value="coding">Software Engineering Code</option>
            </select>
          </div>

          {/* Add criterion */}
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-main mb-3">Add Custom Criterion</h3>
            <div className="space-y-3">
              <input
                type="text"
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Criterion Name, e.g. Group Presentation"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Detailed scoring criteria guidance..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-text-muted block mb-1">Max Points</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newMax}
                    min={1}
                    onChange={(e) => setNewMax(Number(e.target.value))}
                  />
                </div>
                <button
                  onClick={handleAddCriterion}
                  className="mt-5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all"
                >
                  <PlusIcon style={{ width: 16 }} />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Rubric */}
        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden h-full flex flex-col">
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-main">Current Rubric Structure</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${totalPoints === 100 ? 'bg-emerald-100 text-success-emerald border-emerald-200' : 'bg-amber-100 text-warning-amber border-amber-200'} border`}>
                {totalPoints} pts
              </span>
            </div>

            {totalPoints !== 100 && (
              <div className="px-4 pt-3">
                <div className="flex items-start gap-2 bg-blue-50 border border-secondary-container rounded-xl p-3">
                  <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 16 }}>info</span>
                  <p className="text-xs text-on-secondary-fixed-variant">Balance criteria to sum to exactly 100 points for best practice.</p>
                </div>
              </div>
            )}
            {totalPoints === 100 && (
              <div className="px-4 pt-3">
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="material-symbols-outlined text-success-emerald flex-shrink-0" style={{ fontSize: 16 }}>check_circle</span>
                  <p className="text-xs text-success-emerald">Rubric successfully balanced at 100 points!</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {criteria.length === 0 ? (
                <div className="p-8 flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">checklist</span>
                  <p className="text-sm text-text-muted">No criteria yet. Add one or select a preset.</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-border">
                  {criteria.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3.5 group hover:bg-surface-container-low transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>rule</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-text-main">{item.name}</p>
                          <span className="px-2 py-0 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">{item.maxScore} pts</span>
                        </div>
                        <p className="text-xs text-text-muted">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCriterion(item.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <TrashIcon style={{ width: 16 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-surface-border">
              <button
                disabled={criteria.length === 0}
                className="w-full py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                Save Active Rubric
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}