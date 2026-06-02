import { useState } from 'react'
import { fetchGoogleDocText } from '../../../data/services/gemini.service'

type Method = 'text' | 'googleDoc'

export default function AssociateInputsPage() {
  const [method, setMethod] = useState<Method>('text')
  const [text, setText] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleImportDoc = async () => {
    if (!googleUrl.trim()) return
    setIsLoading(true); setMsg(null)
    try {
      const importedText = await fetchGoogleDocText(googleUrl)
      setText(importedText)
      setMsg({ type: 'success', text: 'Google Doc text imported successfully.' })
    } catch {
      setMsg({ type: 'error', text: 'Could not import the Google Doc. Make sure it is shared publicly.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Submission Scaffolder</h2>
        <p className="text-sm text-text-muted">Import or paste the real text that will be sent for AI evaluation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input channel */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-main">Input Channels</h3>

          {/* Method tabs */}
          <div className="bg-surface-container-low rounded-xl p-1 flex gap-1 border border-surface-border">
            {[{ value: 'text', label: 'Direct Paste' }, { value: 'googleDoc', label: 'Google Doc' }].map((m) => (
              <button
                key={m.value}
                onClick={() => { setMethod(m.value as Method); setMsg(null); setText('') }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${method === m.value ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {method === 'googleDoc' && (
            <div className="space-y-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>link</span>
                <input
                  type="url"
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="https://docs.google.com/document/d/..."
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                />
              </div>
              <button
                onClick={handleImportDoc}
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span>Fetching Doc...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>Fetch &amp; Extract</>
                )}
              </button>
            </div>
          )}

          {msg && (
            <div className={`flex items-start gap-2 rounded-xl p-3 ${msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <span className={`material-symbols-outlined flex-shrink-0 ${msg.type === 'success' ? 'text-success-emerald' : 'text-error'}`} style={{ fontSize: 18 }}>{msg.type === 'success' ? 'check_circle' : 'error'}</span>
              <p className={`text-xs ${msg.type === 'success' ? 'text-success-emerald' : 'text-error'}`}>{msg.text}</p>
            </div>
          )}
        </div>

        {/* Extracted text */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-text-main mb-3">Extracted Text Outcome</h3>
          <textarea
            rows={14}
            className="flex-1 w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono"
            placeholder="Paste text here, or import from Google Docs above..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs text-text-muted mt-2">{text.length} characters</p>
        </div>
      </div>
    </div>
  )
}