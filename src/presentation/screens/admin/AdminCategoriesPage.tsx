import { useState } from 'react'
import { PlusIcon, TrashIcon, EditIcon } from '../../components/icons'
import { useCategoriesStore } from '../../state/categories.store'
import { useAuthStore } from '../../state/auth.store'
import type { Category, RubricCriterion } from '../../../domain/types'

interface CriterionDraft { name: string; marks: number; description: string }

const emptyCriterion = (): CriterionDraft => ({ name: '', marks: 10, description: '' })
const emptyForm = () => ({ name: '', prompt: '', passingPercentage: 70, criteria: [emptyCriterion()] })

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoriesStore()
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formName, setFormName] = useState('')
  const [formPrompt, setFormPrompt] = useState('')
  const [formPassingPercentage, setFormPassingPercentage] = useState(70)
  const [formCriteria, setFormCriteria] = useState<CriterionDraft[]>([emptyCriterion()])
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [panelMode, setPanelMode] = useState<'new' | 'edit' | null>(null)

  const openNew = () => {
    const f = emptyForm()
    setEditing(null); setFormName(f.name); setFormPrompt(f.prompt); setFormPassingPercentage(f.passingPercentage); setFormCriteria(f.criteria); setFormError(''); setPanelMode('new')
  }
  const openEdit = (cat: Category) => {
    setEditing(cat); setFormName(cat.name); setFormPrompt(cat.prompt); setFormPassingPercentage(cat.passingPercentage); setFormCriteria(cat.criteria.map((c) => ({ name: c.name, marks: c.marks, description: c.description }))); setFormError(''); setPanelMode('edit')
  }
  const closePanel = () => { setPanelMode(null); setEditing(null); setFormError('') }
  const addCriterion = () => setFormCriteria((p) => [...p, emptyCriterion()])
  const removeCriterion = (idx: number) => setFormCriteria((p) => p.filter((_, i) => i !== idx))
  const updateCriterionField = (idx: number, field: keyof CriterionDraft, val: string | number) =>
    setFormCriteria((p) => p.map((c, i) => (i === idx ? { ...c, [field]: val } : c)))

  const handleSave = () => {
    if (!formName.trim()) { setFormError('Category name is required.'); return }
    if (!formPrompt.trim()) { setFormError('Prompt is required.'); return }
    if (formPassingPercentage < 1 || formPassingPercentage > 100) { setFormError('Passing percentage must be between 1 and 100.'); return }
    if (formCriteria.some((c) => !c.name.trim())) { setFormError('All criteria must have a name.'); return }
    if (formCriteria.some((c) => c.marks <= 0)) { setFormError('All criteria must have marks > 0.'); return }
    if (panelMode === 'new') {
      addCategory({ name: formName.trim(), prompt: formPrompt.trim(), passingPercentage: formPassingPercentage, createdBy: user?.id ?? 'demo-mentor', criteria: formCriteria })
    } else if (panelMode === 'edit' && editing) {
      const updatedCriteria: RubricCriterion[] = formCriteria.map((c, i) => ({ id: editing.criteria[i]?.id ?? `crit-${i}-${Date.now()}`, name: c.name, marks: c.marks, description: c.description }))
      updateCategory(editing.id, { name: formName.trim(), prompt: formPrompt.trim(), passingPercentage: formPassingPercentage, criteria: updatedCriteria })
    }
    closePanel()
  }

  const totalMarks = (cat: Category) => cat.criteria.reduce((s, c) => s + c.marks, 0)
  const formTotalMarks = formCriteria.reduce((s, c) => s + (Number(c.marks) || 0), 0)

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Submission Categories</h2>
          <p className="text-sm text-text-muted">{role === 'mentor' ? 'Create categories that define the AI prompt, passing threshold, and rubric.' : 'View mentor-created categories and rubric configuration.'}</p>
        </div>
        {role === 'mentor' && (
          <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
            <PlusIcon style={{ width: 16 }} />
            New Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Category list */}
        <div className={panelMode ? 'md:col-span-5' : 'md:col-span-12'}>
          {categories.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-10 flex flex-col items-center gap-2 text-center">
              <span className="material-symbols-outlined text-4xl text-outline">category</span>
              <p className="text-sm text-text-muted">No categories yet. Create the first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className={`bg-surface-container-lowest border-2 rounded-xl p-5 transition-all ${editing?.id === cat.id ? 'border-primary' : 'border-surface-border'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 font-headline font-bold text-white text-base">{cat.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-main mb-0.5">{cat.name}</h3>
                      <p className="text-xs text-text-muted line-clamp-2 mb-2">{cat.prompt}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-0 rounded-full text-xs font-semibold bg-surface-container-high text-text-muted border border-outline-variant">{cat.criteria.length} criteria</span>
                        <span className="px-2 py-0 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">{totalMarks(cat)} total marks</span>
                        <span className="px-2 py-0 rounded-full text-xs font-semibold bg-emerald-100 text-success-emerald border border-emerald-200">Pass {cat.passingPercentage}%</span>
                        <span className="px-2 py-0 rounded-full text-xs font-semibold bg-surface-container-high text-text-muted border border-outline-variant">{new Date(cat.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="border-t border-surface-border pt-2 divide-y divide-surface-border">
                        {cat.criteria.map((c) => (
                          <div key={c.id} className="py-1.5">
                            <p className="text-xs font-semibold text-text-main">{c.name} &mdash; {c.marks} marks</p>
                            {c.description && <p className="text-xs text-text-muted">{c.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {role === 'mentor' && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" title="Edit">
                          <EditIcon style={{ width: 16 }} />
                        </button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg hover:bg-red-50 text-outline hover:text-error transition-colors" title="Delete">
                          <TrashIcon style={{ width: 16 }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create / Edit panel */}
        {panelMode && (
          <div className="md:col-span-7">
            <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-text-main">{panelMode === 'new' ? 'New Category' : `Edit: ${editing?.name ?? ''}`}</h3>
                <button onClick={closePanel} className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors">Cancel</button>
              </div>

              {formError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 16 }}>error</span>
                  <p className="text-xs text-error">{formError}</p>
                </div>
              )}

              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Category Name</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g., Life Skills Plans" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">AI Evaluation Prompt</label>
                  <textarea rows={4} className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="You are a... Evaluate the submission against the rubric..." value={formPrompt} onChange={(e) => setFormPrompt(e.target.value)} />
                  <p className="text-xs text-text-muted mt-0.5">Sent to Gemini AI when associates submit plans in this category.</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Passing Percentage</label>
                  <input type="number" min={1} max={100} className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" value={formPassingPercentage} onChange={(e) => setFormPassingPercentage(Number(e.target.value))} />
                  <p className="text-xs text-text-muted mt-0.5">Associates can submit to Mentor only after reaching this score.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-text-muted">Rubric Criteria</label>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0 rounded-full text-xs font-semibold bg-primary/10 text-primary">{formTotalMarks} marks</span>
                      <button onClick={addCriterion} className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity">
                        <PlusIcon style={{ width: 14 }} />Add
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {formCriteria.map((c, idx) => (
                      <div key={idx} className="border border-surface-border rounded-xl p-3 flex gap-2">
                        <div className="w-6 h-6 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 text-xs font-bold text-text-muted">{idx + 1}</div>
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <input type="text" className="col-span-2 px-2.5 py-2 rounded-xl border border-surface-border text-xs focus:border-primary outline-none" placeholder="Criterion Name" value={c.name} onChange={(e) => updateCriterionField(idx, 'name', e.target.value)} />
                            <input type="number" min={1} className="px-2.5 py-2 rounded-xl border border-surface-border text-xs focus:border-primary outline-none" placeholder="Marks" value={c.marks} onChange={(e) => updateCriterionField(idx, 'marks', parseInt(e.target.value) || 0)} />
                          </div>
                          <input type="text" className="w-full px-2.5 py-2 rounded-xl border border-surface-border text-xs focus:border-primary outline-none" placeholder="Description (optional)" value={c.description} onChange={(e) => updateCriterionField(idx, 'description', e.target.value)} />
                        </div>
                        <button onClick={() => removeCriterion(idx)} disabled={formCriteria.length <= 1} className="p-1 rounded-lg hover:bg-red-50 text-outline hover:text-error transition-colors disabled:opacity-30">
                          <TrashIcon style={{ width: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="w-full mt-4 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{panelMode === 'new' ? 'add' : 'save'}</span>
                {panelMode === 'new' ? 'Create Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-headline text-lg font-bold text-text-main mb-2">Delete Category?</h3>
            <p className="text-sm text-text-muted mb-5">Are you sure you want to delete <strong className="text-text-main">{deleteTarget.name}</strong>? Associates will no longer be able to submit under this category.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-outline-variant text-text-main rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors">Cancel</button>
              <button
                onClick={() => { deleteCategory(deleteTarget.id); setDeleteTarget(null) }}
                className="flex-1 py-2.5 bg-error text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}