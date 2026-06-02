import { useState } from 'react'
import { useLocation } from 'react-router-dom'

interface Props { title?: string; subtitle?: string; primaryActionLabel?: string }

export default function FeatureWorkspacePage({ title, subtitle, primaryActionLabel = 'Add' }: Props) {
  const location = useLocation()
  const pathParts = location.pathname.split('/').filter(Boolean)
  const defaultTitle = pathParts[pathParts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Workspace'
  const resolvedTitle = title ?? defaultTitle
  const resolvedSubtitle = subtitle ?? `You are viewing the ${resolvedTitle} workspace.`

  const [items, setItems] = useState<string[]>([])
  const [input, setInput] = useState('')
  const canAdd = input.trim().length > 0
  const onAdd = () => { if (!canAdd) return; setItems((p) => [input.trim(), ...p]); setInput('') }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">{resolvedTitle}</h2>
        <p className="text-sm text-text-muted">{resolvedSubtitle}</p>
      </div>
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Type something and add it to this workspace"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          />
          <button onClick={onAdd} disabled={!canAdd} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
            {primaryActionLabel}
          </button>
        </div>
      </div>
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden">
        <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-text-main">Workspace Items</h3>
        </div>
        {items.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-2 text-center">
            <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
            <p className="text-sm text-text-muted">No items yet. Add your first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {items.map((item, i) => (
              <div key={item + '-' + String(i)} className="px-4 py-3 text-sm text-text-main">{item}</div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-text-muted mt-4">This is an interactive starter page wired to real navigation. Replace it with role-specific business logic as features are implemented.</p>
    </div>
  )
}
