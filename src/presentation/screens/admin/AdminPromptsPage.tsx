import { useState } from 'react'

interface PromptPersona { name: string; label: string; prompt: string }
const personas: Record<string, PromptPersona> = {
  socratic: { name: 'socratic', label: 'Socratic Coach', prompt: 'You are a Socratic coach. Never give direct answers. Instead, analyze the student\'s submission, identify logical inconsistencies, and formulate 3 open-ended questions that lead them to discover the improvement details themselves.' },
  encouraging: { name: 'encouraging', label: 'Encouraging Mentor', prompt: 'You are an encouraging and positive mentor. Always start with 3 detailed strengths in the student\'s submission. Then, frame any critique as an "exciting opportunity for growth" and keep your tone highly motivational.' },
  evaluator: { name: 'evaluator', label: 'Direct Evaluator', prompt: 'You are a strict, objective, and direct evaluation engine. Do not include introductory pleasantries. Point out exactly where the rubric guidelines were missed, list any risk flags immediately, and give concrete, blunt corrections.' },
}

export default function AdminPromptsPage() {
  const [selectedPersona, setSelectedPersona] = useState('socratic')
  const [promptText, setPromptText] = useState(personas.socratic.prompt)
  const [temperature, setTemperature] = useState(0.4)
  const [maxTokens, setMaxTokens] = useState(1024)

  const handlePersonaChange = (key: string) => { setSelectedPersona(key); setPromptText(personas[key]?.prompt || '') }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">AI Prompt Playground</h2>
        <p className="text-sm text-text-muted">Define system personas, customize instruction templates, and adjust model parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-main">Evaluation Persona</h3>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              value={selectedPersona}
              onChange={(e) => handlePersonaChange(e.target.value)}
            >
              {Object.entries(personas).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <div>
              <label className="text-xs font-semibold text-text-muted block mb-2">System Prompt</label>
              <textarea
                rows={10}
                className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </div>

            <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
              Save Prompt Configuration
            </button>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-text-main">Model Parameters</h3>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-text-muted">Temperature</label>
                <span className="text-xs font-bold text-primary">{temperature.toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-muted">Precise</span>
                <span className="text-[10px] text-text-muted">Creative</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-text-muted">Max Tokens</label>
                <span className="text-xs font-bold text-primary">{maxTokens}</span>
              </div>
              <input type="range" min={256} max={4096} step={128} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-text-muted">256</span>
                <span className="text-[10px] text-text-muted">4096</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-secondary-container rounded-xl p-4" style={{ boxShadow: '0 0 20px rgba(144,168,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">AI Note</p>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">Higher temperature produces varied, creative feedback. Lower values give more deterministic and consistent scoring output. For formal evaluations, keep temperature below 0.5.</p>
          </div>
        </div>
      </div>
    </div>
  )
}