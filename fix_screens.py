import os

base = r'c:\Users\aliju\codespace\Clarity Coach 2\src\presentation\screens'

files = {}

# ─────────────────────────────────────────────────────────────────────────────
# 1. AdminAnalyticsPage
# ─────────────────────────────────────────────────────────────────────────────
files['admin/AdminAnalyticsPage.tsx'] = """\
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ShieldAlertIcon } from '../../components/icons'
import { useCategoriesStore } from '../../state/categories.store'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function AdminAnalyticsPage() {
  const categories = useCategoriesStore((s) => s.categories)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const approved = submissions.filter((s) => s.status === 'approved')
  const activeRiskFlags = submissions.reduce((sum, s) => sum + (s.evaluation?.risk_flags.length ?? 0), 0)
  const averageScore = submissions.length === 0 ? 0 : Math.round(submissions.reduce((sum, s) => sum + (s.aiScore ?? 0), 0) / submissions.length)
  const passRate = submissions.length === 0 ? 0 : Math.round((submissions.filter((s) => s.passedAiThreshold).length / submissions.length) * 100)
  const weeklyData = [{ name: 'Current', submissions: submissions.length, passRate }]
  const criteriaAverages = categories.slice(0, 5).map((c) => ({ criterion: c.name, avgScore: c.passingPercentage, maxScore: 100 }))

  const stats = [
    { label: 'Total Submissions', value: submissions.length, sub: `${approved.length} approved`, icon: 'assignment', color: 'text-primary' },
    { label: 'Average Score', value: `${averageScore}%`, sub: 'Based on active rubrics', icon: 'equalizer', color: 'text-primary' },
    { label: 'Pass Rate', value: `${passRate}%`, sub: 'AI threshold pass rate', icon: 'trending_up', color: 'text-success-emerald' },
    { label: 'Risk Flags', value: activeRiskFlags, sub: 'Across all submissions', icon: 'warning', color: 'text-warning-amber' },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Performance &amp; Insights</h2>
        <p className="text-sm text-text-muted">Analyze class-wide scoring trends, rubric mastery, and flagged submissions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{s.label}</p>
            <p className={`font-headline text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="flex items-start gap-3 bg-blue-50 border border-secondary-container rounded-xl p-4">
          <ShieldAlertIcon style={{ width: 20, flexShrink: 0, marginTop: 2, color: '#00236f' }} />
          <p className="text-sm text-on-secondary-fixed-variant">No submission data yet. Analytics will populate once associates begin submitting plans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">Submission Volume &amp; Pass Rate</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submissions" stroke="#00236f" strokeWidth={2} />
                <Line type="monotone" dataKey="passRate" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">Criterion Averages by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={criteriaAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="criterion" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#00236f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 2. AdminAssignmentsPage
# ─────────────────────────────────────────────────────────────────────────────
files['admin/AdminAssignmentsPage.tsx'] = """\
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAssignmentsStore } from '../../state/assignments.store'

const assignmentSchema = z.object({
  title: z.string().min(3, 'Title is required.'),
  description: z.string().min(10, 'Description is required.'),
  rubricText: z.string().min(20, 'Rubric is required.'),
  promptText: z.string().min(20, 'Prompt is required.'),
  passingPercentage: z.preprocess((v) => Number(v), z.number().min(1).max(100)),
  dueDate: z.string().optional(),
})
type AssignmentFormValues = z.input<typeof assignmentSchema>
type AssignmentParsedValues = z.output<typeof assignmentSchema>

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-success-emerald',
  draft: 'bg-surface-container-high text-text-muted',
}

export default function AdminAssignmentsPage() {
  const assignments = useAssignmentsStore((s) => s.assignments)
  const addAssignment = useAssignmentsStore((s) => s.addAssignment)

  const form = useForm<AssignmentFormValues, unknown, AssignmentParsedValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: '', description: '', rubricText: '', promptText: '', passingPercentage: 75, dueDate: '' },
  })

  const onSubmit = form.handleSubmit((values: AssignmentParsedValues) => {
    addAssignment({ ...values, dueDate: values.dueDate || undefined })
    form.reset({ title: '', description: '', rubricText: '', promptText: '', passingPercentage: 75, dueDate: '' })
  })

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Assignments</h2>
        <p className="text-sm text-text-muted">Create assignment definitions with rubric, prompt, and passing threshold.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-main mb-4">New Assignment</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              {[
                { name: 'title', label: 'Title', placeholder: 'e.g. Life Skills Plan #1', type: 'text' },
                { name: 'description', label: 'Description', placeholder: 'Brief assignment context...', type: 'text' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-xs font-semibold text-text-muted block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder={f.placeholder}
                    {...form.register(f.name as keyof AssignmentFormValues)}
                  />
                  {form.formState.errors[f.name as keyof AssignmentFormValues] && (
                    <p className="text-xs text-error mt-0.5">{String(form.formState.errors[f.name as keyof AssignmentFormValues]?.message)}</p>
                  )}
                </div>
              ))}
              {['rubricText', 'promptText'].map((name) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-text-muted block mb-1">{name === 'rubricText' ? 'Rubric' : 'Prompt'}</label>
                  <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" {...form.register(name as keyof AssignmentFormValues)} />
                  {form.formState.errors[name as keyof AssignmentFormValues] && (
                    <p className="text-xs text-error mt-0.5">{String(form.formState.errors[name as keyof AssignmentFormValues]?.message)}</p>
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Passing %</label>
                  <input type="number" min={1} max={100} className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" {...form.register('passingPercentage')} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Due Date</label>
                  <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" {...form.register('dueDate')} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all mt-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                Create Assignment
              </button>
            </form>
          </div>
        </div>

        {/* Assignment list */}
        <div className="lg:col-span-3">
          {assignments.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-10 flex flex-col items-center gap-2 text-center">
              <span className="material-symbols-outlined text-4xl text-outline">assignment</span>
              <p className="text-sm text-text-muted">No assignments yet. Create the first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-text-main">{a.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{a.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors['active']}`}>Active</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">Pass {a.passingPercentage}%</span>
                    </div>
                  </div>
                  {a.dueDate && <p className="text-xs text-text-muted mt-2">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 3. AdminCategoriesPage
# ─────────────────────────────────────────────────────────────────────────────
files['admin/AdminCategoriesPage.tsx'] = """\
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
                <div key={cat.id} className={`bg-surface-container-lowest border-2 rounded-xl p-5 transition-all ${panelMode === 'edit' && editing?.id === cat.id ? 'border-primary shadow-sm' : 'border-surface-border'}`}>
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
"""

# ─────────────────────────────────────────────────────────────────────────────
# 4. AdminDashboardPage
# ─────────────────────────────────────────────────────────────────────────────
files['admin/AdminDashboardPage.tsx'] = """\
import { useNavigate } from 'react-router-dom'

const stats = [
  { label: 'Total Users', value: '\u2014', icon: 'group', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active Categories', value: '\u2014', icon: 'category', color: 'text-secondary', bg: 'bg-secondary/10' },
  { label: 'Submissions', value: '\u2014', icon: 'assignment_turned_in', color: 'text-success-emerald', bg: 'bg-emerald-100' },
  { label: 'Pending Review', value: '\u2014', icon: 'pending_actions', color: 'text-warning-amber', bg: 'bg-amber-100' },
]

const quickActions = [
  { title: 'Manage Users', desc: 'Role access for Admins, Mentors, Associates, and Students.', icon: 'manage_accounts', path: '/dashboard/admin/users' },
  { title: 'Platform Oversight', desc: 'View platform-level review and risk indicators.', icon: 'monitoring', path: '/dashboard/admin/oversight' },
  { title: 'System Settings', desc: 'Configure operational settings and provider keys.', icon: 'settings', path: '/dashboard/admin/settings' },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Admin Dashboard</h2>
        <p className="text-sm text-text-muted">Platform management and oversight.</p>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <span className={`material-symbols-outlined ${s.color}`} style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-text-main">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl divide-y divide-surface-border overflow-hidden">
            {quickActions.map((a) => (
              <button
                key={a.title}
                onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left group hover:bg-primary hover:text-white transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors" style={{ fontSize: 22 }}>{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-main group-hover:text-white transition-colors">{a.title}</p>
                  <p className="text-xs text-text-muted group-hover:text-white/70 transition-colors">{a.desc}</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-white/80 transition-colors" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight block */}
        <div>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">AI Insight</h3>
          <div className="bg-blue-50 border border-secondary-container rounded-xl p-4" style={{ boxShadow: '0 0 20px rgba(144,168,255,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Gemini Insight</p>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">No recent evaluation data. Run some AI reviews to see platform-wide insights here.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 5. AdminRubricsPage
# ─────────────────────────────────────────────────────────────────────────────
files['admin/AdminRubricsPage.tsx'] = """\
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
        <div className={`border rounded-xl p-4 text-center ${totalPoints === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-container-lowest border-surface-border'}`}>
          <p className={`text-2xl font-bold ${totalPoints === 100 ? 'text-success-emerald' : 'text-warning-amber'}`}>{totalPoints}</p>
          <p className={`text-xs ${totalPoints === 100 ? 'text-success-emerald' : 'text-text-muted'}`}>Total Points</p>
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
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${totalPoints === 100 ? 'bg-emerald-100 text-success-emerald border-emerald-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
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
"""

# ─────────────────────────────────────────────────────────────────────────────
# 6. AssociateInputsPage
# ─────────────────────────────────────────────────────────────────────────────
files['associate/AssociateInputsPage.tsx'] = """\
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
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${method === m.value ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
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
"""

# ─────────────────────────────────────────────────────────────────────────────
# 7. AssociateSubmissionsPage
# ─────────────────────────────────────────────────────────────────────────────
files['associate/AssociateSubmissionsPage.tsx'] = """\
import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

function statusBadge(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-success-emerald'
  if (status === 'changes_requested') return 'bg-red-100 text-error'
  if (status === 'submitted_to_mentor') return 'bg-amber-100 text-warning-amber'
  if (status === 'ready_for_mentor') return 'bg-blue-100 text-blue-700'
  return 'bg-surface-container-high text-text-muted'
}

export default function AssociateSubmissionsPage() {
  const user = useAuthStore((s) => s.user)
  const submissions = useSubmissionsStore((s) => s.submissions).filter((s) => s.associateId === user?.id)
  const selected = submissions[0]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">My Submissions</h2>
        <p className="text-sm text-text-muted">Track AI review results, mentor submission status, and mentor decisions.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex items-start gap-3 bg-blue-50 border border-secondary-container rounded-xl p-4">
          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 20 }}>info</span>
          <p className="text-sm text-on-secondary-fixed-variant">No submissions yet. Run an AI review from Submit Plan to create your first submission.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-2">
            <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border">
                <h3 className="text-sm font-semibold text-text-main">Submission History</h3>
              </div>
              <div className="divide-y divide-surface-border">
                {submissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container-low transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">{s.categoryName}</p>
                      <p className="text-xs text-text-muted">{s.aiScore ?? 0}% &middot; {new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusBadge(s.status)}`}>{s.status.replaceAll('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="md:col-span-3 space-y-4">
            {selected && (
              <>
                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-text-main">{selected.categoryName}</h3>
                      <p className="text-xs text-text-muted">{selected.sourceType === 'google_doc' ? selected.sourceLabel : 'Pasted text'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(selected.status)}`}>{selected.aiScore ?? 0}% AI score</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-3 border border-surface-border">
                    <pre className="text-xs text-on-surface whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">{selected.submissionText}</pre>
                  </div>
                </div>

                {selected.mentorComment && (
                  <div className={`flex items-start gap-3 rounded-xl p-4 ${selected.status === 'approved' ? 'bg-emerald-50 border border-emerald-200 text-success-emerald' : 'bg-amber-50 border border-amber-200 text-warning-amber'}`}>
                    <span className={`material-symbols-outlined flex-shrink-0 ${selected.status === 'approved' ? 'text-success-emerald' : 'text-warning-amber'}`} style={{ fontSize: 18 }}>{selected.status === 'approved' ? 'check_circle' : 'rate_review'}</span>
                    <div>
                      <p className="text-xs font-bold mb-0.5">Mentor comment</p>
                      <p className="text-sm">{selected.mentorComment}</p>
                    </div>
                  </div>
                )}

                {selected.evaluation && (
                  <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-text-main mb-3">AI Criterion Evidence</h3>
                    <div className="space-y-3">
                      {selected.evaluation.criterion_scores.map((cr) => (
                        <div key={cr.criterion} className="border border-surface-border rounded-xl p-3">
                          <div className="flex justify-between mb-0.5">
                            <p className="text-xs font-bold text-text-main">{cr.criterion}</p>
                            <span className="px-2 py-0 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">{cr.score}/{cr.max_score}</span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">{cr.reasoning}</p>
                          {cr.evidence && <p className="text-xs text-text-muted mt-1 italic">{cr.evidence}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 8. SessionPlanReviewPage
# ─────────────────────────────────────────────────────────────────────────────
files['associate/SessionPlanReviewPage.tsx'] = """\
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { Category, GeminiEvaluation } from '../../../domain/types'
import { fetchGoogleDocText, geminiService, getGeminiApiKey, getGrokApiKey } from '../../../data/services/gemini.service'
import { useCategoriesStore } from '../../state/categories.store'
import { useAuthStore } from '../../state/auth.store'
import { useSubmissionsStore } from '../../state/submissions.store'

const submissionSchema = z
  .object({
    submissionMethod: z.enum(['text', 'file', 'google_doc']),
    submissionText: z.string().optional(),
    rubricText: z.string().min(20, 'Rubric is required.'),
    promptText: z.string().min(20, 'Prompt is required.'),
    fileName: z.string().optional(),
    googleDocUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.submissionMethod === 'text') {
      if (!data.submissionText || data.submissionText.length < 20)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please provide at least 20 characters.', path: ['submissionText'] })
    }
    if (data.submissionMethod === 'google_doc') {
      if (!data.googleDocUrl || data.googleDocUrl.length === 0)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter a valid Google Doc URL.', path: ['googleDocUrl'] })
    }
    if (data.submissionMethod === 'file') {
      if (!data.fileName || data.fileName.length === 0)
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter the file name.', path: ['fileName'] })
    }
  })

type SubmissionFormValues = z.infer<typeof submissionSchema>

interface ReviewVersion {
  version: number
  submissionId: string
  categoryId: string
  submissionText: string
  createdAt: string
  method: SubmissionFormValues['submissionMethod']
  evaluation: GeminiEvaluation
}

const defaultRubric = ['Learning Objectives (20)', 'Engagement (20)', 'Reflection (20)', 'Assessment (20)', 'Inclusivity (20)'].join('\\n')
const defaultPrompt = ['You are an experienced Life Skills Coach.', 'Provide supportive, evidence-based coaching feedback.', 'Evaluate according to rubric and ask reflective questions.', 'Return structured JSON only.'].join('\\n')

function buildRubricText(cat: Category): string {
  return cat.criteria.map((c) => `${c.name} (${c.marks} marks)`).join('\\n')
}

const METHODS = [
  { value: 'google_doc', label: 'Google Doc', icon: 'link' },
  { value: 'text', label: 'Paste Text', icon: 'notes' },
  { value: 'file', label: 'Upload File', icon: 'cloud_upload' },
] as const

export default function SessionPlanReviewPage() {
  const { categories } = useCategoriesStore()
  const user = useAuthStore((s) => s.user)
  const saveAiReview = useSubmissionsStore((s) => s.saveAiReview)
  const submitToMentor = useSubmissionsStore((s) => s.submitToMentor)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [versions, setVersions] = useState<ReviewVersion[]>([])
  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    const check = () => setHasApiKey(getGeminiApiKey().length > 0 || getGrokApiKey().length > 0)
    check()
    const id = setInterval(check, 2000)
    return () => clearInterval(id)
  }, [])

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { submissionMethod: 'google_doc', submissionText: '', rubricText: defaultRubric, promptText: defaultPrompt, fileName: '', googleDocUrl: '' },
  })

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId)
    setVersions([])
    const cat = categories.find((c) => c.id === catId)
    if (cat) { form.setValue('rubricText', buildRubricText(cat)); form.setValue('promptText', cat.prompt) }
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null
  const submissionMethod = useWatch({ control: form.control, name: 'submissionMethod' })
  const submissionTextValue = useWatch({ control: form.control, name: 'submissionText' })
  const googleDocUrlValue = useWatch({ control: form.control, name: 'googleDocUrl' })

  const reviewMutation = useMutation({
    mutationFn: async (values: SubmissionFormValues) => {
      let submissionText = values.submissionText || ''
      if (values.submissionMethod === 'google_doc' && values.googleDocUrl)
        submissionText = await fetchGoogleDocText(values.googleDocUrl)
      else if (values.submissionMethod === 'file' && values.fileName)
        throw new Error('UNSUPPORTED_SUBMISSION_METHOD')
      const evaluation = await geminiService.evaluateSubmission({ submissionText, rubricText: values.rubricText, promptText: values.promptText })
      return { evaluation, submissionText }
    },
    onSuccess: ({ evaluation, submissionText }, values) => {
      if (!selectedCategory || !user) return
      const saved = saveAiReview({
        associateId: user.id, associateName: user.fullName, categoryId: selectedCategory.id, categoryName: selectedCategory.name,
        submissionText, sourceType: values.submissionMethod === 'google_doc' ? 'google_doc' : 'text',
        sourceLabel: values.submissionMethod === 'google_doc' ? values.googleDocUrl : undefined,
        evaluation, passingPercentage: selectedCategory.passingPercentage,
      })
      setVersions((prev) => [{ version: prev.length + 1, submissionId: saved.id, categoryId: selectedCategoryId, submissionText: values.submissionMethod === 'text' ? values.submissionText || '' : values.googleDocUrl || '', createdAt: new Date().toISOString(), method: values.submissionMethod, evaluation }, ...prev])
    },
  })

  const current =
    versions[0]?.categoryId === selectedCategoryId &&
    versions[0]?.submissionText === (submissionMethod === 'text' ? submissionTextValue || '' : googleDocUrlValue || '')
      ? versions[0] : undefined

  const passState = useMemo(() => {
    if (!current || !selectedCategory) return null
    return current.evaluation.overall_score >= selectedCategory.passingPercentage ? 'Ready for Mentor' : 'Needs Revision'
  }, [current, selectedCategory])

  const currentSubmission = current ? submissions.find((s) => s.id === current.submissionId) : undefined
  const canSubmitToMentor = Boolean(currentSubmission?.status === 'ready_for_mentor')

  const onSubmit = form.handleSubmit((values) => { reviewMutation.reset(); reviewMutation.mutate(values) })

  // Circular SVG score
  const circleScore = current?.evaluation.overall_score ?? 0
  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - circleScore / 100)

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Submit Session Plan</h2>
            <p className="text-sm text-text-muted">Choose a category and submit for AI evaluation.</p>
          </div>
          {!hasApiKey && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-warning-amber border border-amber-200">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              No AI key \u2014 add one in the top bar
            </span>
          )}
        </div>

        {/* Category capsule pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => {
              const sel = cat.id === selectedCategoryId
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-150 active:scale-95 ${sel ? 'bg-primary text-white border-primary' : 'bg-surface-container-lowest text-text-muted border-outline-variant hover:border-primary hover:text-primary'}`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div>
          <div className={`bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden transition-opacity ${!selectedCategory ? 'opacity-60' : ''}`}>
            {/* Card header */}
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-main">
                {selectedCategory ? selectedCategory.name : 'Select a category to begin'}
              </h3>
              {selectedCategory && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Pass &gt;= {selectedCategory.passingPercentage}%
                </span>
              )}
            </div>

            <div className="p-4">
              {/* Method tabs */}
              <div className="bg-surface-container-low rounded-xl p-1 flex gap-1 border border-surface-border mb-4">
                {METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => form.setValue('submissionMethod', m.value)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${submissionMethod === m.value ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Input area */}
              <form onSubmit={onSubmit} className="space-y-4">
                {submissionMethod === 'google_doc' && (
                  <div>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: 18 }}>link</span>
                      <input
                        type="url"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        placeholder="https://docs.google.com/document/d/..."
                        {...form.register('googleDocUrl')}
                      />
                    </div>
                    {form.formState.errors.googleDocUrl ? (
                      <p className="text-xs text-error mt-1">{form.formState.errors.googleDocUrl.message}</p>
                    ) : (
                      <p className="text-xs text-text-muted mt-1 italic">Ensure the document sharing is set to "Anyone with link"</p>
                    )}
                  </div>
                )}

                {submissionMethod === 'text' && (
                  <div>
                    <textarea
                      rows={12}
                      className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Paste your session plan here..."
                      style={{ maxHeight: 300, overflowY: 'auto' }}
                      {...form.register('submissionText')}
                    />
                    {form.formState.errors.submissionText && (
                      <p className="text-xs text-error mt-1">{form.formState.errors.submissionText.message}</p>
                    )}
                  </div>
                )}

                {submissionMethod === 'file' && (
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-surface-container-low hover:border-primary transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary">cloud_upload</span>
                    <p className="text-sm font-medium text-text-muted">File upload coming soon</p>
                    <p className="text-xs text-text-muted">Use Google Doc or paste text for now</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending || !hasApiKey}
                    className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewMutation.isPending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>autorenew</span>
                        Reviewing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
                        Run AI Review
                      </>
                    )}
                  </button>
                  {current && (
                    <button
                      type="button"
                      disabled={reviewMutation.isPending}
                      onClick={() => {
                        const existing = form.getValues('submissionText') || ''
                        form.setValue('submissionText', `${existing}\\n\\n[Revised - Version ${versions.length + 1}]`)
                        form.setValue('submissionMethod', 'text')
                      }}
                      className="px-4 py-3.5 border-2 border-outline-variant text-secondary rounded-xl text-sm font-semibold hover:border-primary hover:text-primary active:scale-95 transition-all whitespace-nowrap"
                    >
                      Revise
                    </button>
                  )}
                </div>
              </form>

              {/* Loading bar */}
              {reviewMutation.isPending && (
                <div className="mt-3 w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
                </div>
              )}

              {/* Error */}
              {reviewMutation.isError && (
                <div className="mt-3 flex items-start gap-2 bg-error-container border border-error/20 rounded-xl p-3">
                  <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>error</span>
                  <p className="text-xs text-on-error-container">{getErrorText((reviewMutation.error as Error)?.message)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Version history */}
          {versions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">History</p>
              <div className="flex flex-wrap gap-2">
                {versions.map((v) => (
                  <span
                    key={v.version}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${v.evaluation.overall_score >= (selectedCategory?.passingPercentage ?? 0) ? 'bg-emerald-50 border-emerald-200 text-success-emerald' : 'bg-surface-container border-surface-border text-text-muted'}`}
                  >
                    v{v.version} &middot; {v.evaluation.overall_score}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Results or Rubric preview */}
        <div>
          {current ? (
            <div className="space-y-4">
              {/* Score card */}
              <div className={`bg-surface-container-lowest border-2 rounded-xl p-5 ${current.evaluation.ready_for_review ? 'border-success-emerald/30' : 'border-warning-amber/30'}`}>
                <div className="flex items-center gap-4 mb-4">
                  {/* Circular score */}
                  <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="42" fill="transparent" stroke="#e6e8ea" strokeWidth="7" />
                      <circle
                        cx="48" cy="48" r="42" fill="transparent"
                        stroke={current.evaluation.ready_for_review ? '#059669' : '#D97706'}
                        strokeWidth="7"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }}
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className="font-headline text-2xl font-bold" style={{ color: current.evaluation.ready_for_review ? '#059669' : '#D97706' }}>
                        {current.evaluation.overall_score}
                      </span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">Score</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${current.evaluation.ready_for_review ? 'bg-emerald-100 text-success-emerald' : 'bg-amber-100 text-warning-amber'}`}>
                      {passState}
                    </span>
                    <p className="text-xs text-text-muted">Pass threshold: {selectedCategory?.passingPercentage ?? 0}%</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {canSubmitToMentor && (
                        <button
                          onClick={() => currentSubmission && submitToMentor(currentSubmission.id)}
                          className="px-3 py-1 bg-success-emerald text-white rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
                        >
                          Submit to Mentor
                        </button>
                      )}
                      {currentSubmission?.status === 'submitted_to_mentor' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">In Review</span>}
                      {currentSubmission?.status === 'approved' && <span className="px-2 py-0.5 bg-emerald-100 text-success-emerald rounded-full text-xs font-semibold">Approved</span>}
                      {currentSubmission?.status === 'changes_requested' && <span className="px-2 py-0.5 bg-red-100 text-error rounded-full text-xs font-semibold">Changes Needed</span>}
                    </div>
                  </div>
                </div>

                {/* Criterion bars */}
                <div className="space-y-3">
                  {current.evaluation.criterion_scores.map((s) => {
                    const pct = Math.round((s.score / s.max_score) * 100)
                    const passed = s.score >= s.max_score * 0.7
                    return (
                      <div key={s.criterion}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-text-main">{s.criterion}</span>
                          <span className={`text-xs font-bold ${passed ? 'text-success-emerald' : 'text-warning-amber'}`}>{s.score}/{s.max_score}</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${passed ? 'bg-success-emerald' : 'bg-warning-amber'}`}
                            style={{ width: `${pct}%`, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Feedback grid */}
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">Gemini Feedback</p>
              <div className="grid grid-cols-2 gap-3">
                <FeedbackCard title="Key Strengths" items={current.evaluation.strengths} icon="rocket_launch" colorClass="bg-blue-50 border-secondary-container" textClass="text-primary" />
                <FeedbackCard title="Areas to Improve" items={current.evaluation.improvements} icon="trending_up" colorClass="bg-amber-50 border-amber-200" textClass="text-warning-amber" />
                <FeedbackCard title="Suggestions" items={current.evaluation.suggestions} icon="tips_and_updates" colorClass="bg-surface-container-lowest border-surface-border" textClass="text-on-surface-variant" />
                <FeedbackCard title="Reflection Qs" items={current.evaluation.reflective_questions} icon="psychology" colorClass="bg-purple-50 border-purple-200" textClass="text-purple-700" />
              </div>

              {/* Risk flags */}
              {current.evaluation.risk_flags.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-warning-amber uppercase tracking-wider mb-2">Risk Flags</p>
                  {current.evaluation.risk_flags.map((f) => (
                    <p key={f} className="text-sm text-on-surface flex gap-2"><span>&bull;</span>{f}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onSubmit as React.MouseEventHandler}
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_square</span>
                  Edit and Resubmit
                </button>
              </div>
            </div>
          ) : (
            /* Rubric preview */
            <div className={`bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden ${!selectedCategory ? 'opacity-60' : ''}`}>
              <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-main">
                  {selectedCategory ? `${selectedCategory.name} \u2014 Rubric` : 'Select a category to see the rubric'}
                </h3>
                {selectedCategory && (
                  <span className="text-xs font-semibold text-text-muted">{selectedCategory.criteria.reduce((s, c) => s + c.marks, 0)} total marks</span>
                )}
              </div>
              {selectedCategory && (
                <div className="p-4">
                  <div className="divide-y divide-surface-border">
                    {selectedCategory.criteria.map((c) => (
                      <div key={c.id} className="flex justify-between items-start py-3 gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-main">{c.name}</p>
                          {c.description && <p className="text-xs text-text-muted mt-0.5">{c.description}</p>}
                        </div>
                        <span className="text-sm font-bold text-primary flex-shrink-0">{c.marks}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!selectedCategory && (
                <div className="p-8 flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline">rule</span>
                  <p className="text-sm text-text-muted">Select a category above to preview its evaluation rubric.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getErrorText(msg: string | undefined): string {
  switch (msg) {
    case 'NO_API_KEY': return 'Click the AI key chip in the top bar to add a Gemini or Grok key.'
    case 'RATE_LIMITED': return 'Rate limit reached. Wait a minute, then try again.'
    case 'INVALID_API_KEY': return 'The API key was rejected. Check the key and provider access.'
    case 'BAD_REQUEST': return 'The AI provider rejected the request. The submission may be too long or the model unavailable.'
    case 'UNSUPPORTED_SUBMISSION_METHOD': return 'Only pasted text and Google Doc links are supported right now.'
    case 'INVALID_GOOGLE_DOC_URL': return 'Enter a valid Google Docs URL.'
    case 'GOOGLE_DOC_FETCH_FAILED': return 'Could not fetch the Google Doc. Make sure it is shared publicly.'
    case 'GOOGLE_DOC_EMPTY': return 'The Google Doc did not contain enough readable text to review.'
    default: return msg ?? 'An unexpected error occurred. Please try again.'
  }
}

function FeedbackCard({ title, items, icon, colorClass, textClass }: { title: string; items: string[]; icon: string; colorClass: string; textClass: string }) {
  return (
    <div className={`border rounded-xl p-3 ${colorClass}`} style={{ boxShadow: colorClass.includes('blue') ? '0 0 20px rgba(144,168,255,0.15)' : undefined }}>
      <div className={`flex items-center gap-1.5 mb-2 ${textClass}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
        <p className="text-xs font-semibold">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-text-muted">None</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="material-symbols-outlined text-success-emerald flex-shrink-0" style={{ fontSize: 14, marginTop: 1 }}>check_circle</span>
              <p className="text-xs text-on-secondary-fixed-variant leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 9. LoginPage
# ─────────────────────────────────────────────────────────────────────────────
files['auth/LoginPage.tsx'] = """\
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserRole } from '../../../domain/types'
import { useAuthStore } from '../../state/auth.store'

const roles: { value: UserRole; label: string; description: string; icon: string; badge: string; badgeColor: string }[] = [
  { value: 'associate', label: 'Associate Coach', description: 'Submit plans, run AI reviews, send passing work to mentors.', icon: 'edit_document', badge: 'Main workflow', badgeColor: 'bg-primary/10 text-primary' },
  { value: 'mentor', label: 'Mentor', description: 'Create categories, review plans, approve or request changes.', icon: 'menu_book', badge: 'Reviewer', badgeColor: 'bg-secondary/10 text-secondary' },
  { value: 'admin', label: 'System Admin', description: 'User management, platform oversight, and settings.', icon: 'shield_person', badge: 'Admin', badgeColor: 'bg-purple-100 text-purple-700' },
  { value: 'student', label: 'Student', description: 'View assigned feedback and track your progress.', icon: 'school', badge: 'Learner', badgeColor: 'bg-emerald-100 text-success-emerald' },
]

const features = ['AI-powered plan evaluation', 'Mentor review workflow', 'Criterion-level feedback', 'Google Docs integration']

export default function LoginPage() {
  const navigate = useNavigate()
  const signInAsRole = useAuthStore((s) => s.signInAsRole)
  const [role, setRole] = useState<UserRole>('associate')

  const onContinue = () => { signInAsRole(role); navigate('/dashboard') }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden md:flex w-5/12 flex-shrink-0 bg-primary flex-col justify-center px-12 py-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-12 -left-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10">
          <h1 className="font-headline text-5xl font-black text-white mb-2 tracking-tight leading-none">Clarity<br />Coach</h1>
          <p className="text-white/70 text-base mb-10 leading-relaxed">AI-Augmented Reflection &amp; Life Skills Coaching Platform</p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/60" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-white/75 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: role selector */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-10 py-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="md:hidden text-center mb-8">
            <h1 className="font-headline text-3xl font-black text-primary">Clarity Coach</h1>
            <p className="text-sm text-text-muted mt-1">AI Coaching Platform</p>
          </div>

          <div className="mb-6">
            <h2 className="font-headline text-2xl font-bold text-text-main">Select workspace</h2>
            <p className="text-sm text-text-muted mt-1">Choose your role to enter. Production builds authenticate via SSO.</p>
          </div>

          <div className="space-y-3 mb-6">
            {roles.map((r) => {
              const sel = r.value === role
              return (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${sel ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant hover:border-primary/50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? 'bg-primary' : 'bg-surface-container-high'}`}>
                    <span className={`material-symbols-outlined ${sel ? 'text-white' : 'text-on-surface-variant'}`} style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-text-main">{r.label}</p>
                      <span className={`px-2 py-0 text-[10px] font-semibold rounded-full ${r.badgeColor}`}>{r.badge}</span>
                    </div>
                    <p className="text-xs text-text-muted">{r.description}</p>
                  </div>
                  {sel && (
                    <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={onContinue}
            className="w-full py-4 bg-primary text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            Enter Dashboard
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 10. FeatureWorkspacePage
# ─────────────────────────────────────────────────────────────────────────────
files['common/FeatureWorkspacePage.tsx'] = """\
import { useMemo, useState } from 'react'

interface FeatureWorkspacePageProps { title: string; subtitle: string; primaryActionLabel?: string }

export default function FeatureWorkspacePage({ title, subtitle, primaryActionLabel = 'Add note' }: FeatureWorkspacePageProps) {
  const [input, setInput] = useState('')
  const [items, setItems] = useState<string[]>([])
  const canAdd = useMemo(() => input.trim().length > 0, [input])
  const onAdd = () => { if (!canAdd) return; setItems((p) => [input.trim(), ...p]); setInput('') }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">{title}</h2>
        <p className="text-sm text-text-muted">{subtitle}</p>
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
              <div key={i} className="px-4 py-3 text-sm text-text-main">{item}</div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-text-muted mt-4">This is an interactive starter page wired to real navigation. Replace it with role-specific business logic as features are implemented.</p>
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 11. MentorDashboardPage
# ─────────────────────────────────────────────────────────────────────────────
files['mentor/MentorDashboardPage.tsx'] = """\
import { useNavigate } from 'react-router-dom'
import { useCategoriesStore } from '../../state/categories.store'
import { useSubmissionsStore } from '../../state/submissions.store'

export default function MentorDashboardPage() {
  const navigate = useNavigate()
  const categories = useCategoriesStore((s) => s.categories)
  const submissions = useSubmissionsStore((s) => s.submissions)
  const pending = submissions.filter((s) => s.status === 'submitted_to_mentor')
  const approved = submissions.filter((s) => s.status === 'approved')
  const changes = submissions.filter((s) => s.status === 'changes_requested')

  const stats = [
    { label: 'Pending Reviews', value: pending.length, icon: 'pending_actions', color: 'text-warning-amber', bg: 'bg-amber-100', bar: 'bg-amber-200' },
    { label: 'Approved Plans', value: approved.length, icon: 'task_alt', color: 'text-success-emerald', bg: 'bg-emerald-100', bar: 'bg-emerald-200' },
    { label: 'Changes Requested', value: changes.length, icon: 'rate_review', color: 'text-error', bg: 'bg-red-100', bar: 'bg-red-200' },
    { label: 'Active Categories', value: categories.length, icon: 'category', color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary/20' },
  ]

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Mentor Dashboard</h2>
        <p className="text-sm text-text-muted">Manage categories, review associate plans, and return mentor decisions.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 hover:shadow-sm transition-shadow">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">{s.label}</p>
            <p className={`font-headline text-4xl font-black leading-none mb-3 ${s.color}`}>{s.value}</p>
            <div className={`h-1.5 rounded-full ${s.bar}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`bg-surface-container-lowest border-2 rounded-xl p-5 ${pending.length > 0 ? 'border-primary/30 shadow-sm' : 'border-surface-border'}`}>
          <h3 className="text-base font-semibold text-text-main mb-1">Review Queue</h3>
          <p className="text-sm text-text-muted mb-4">
            {pending.length > 0 ? `${pending.length} plan${pending.length === 1 ? '' : 's'} waiting for your decision.` : 'No plans pending review right now.'}
          </p>
          <button
            onClick={() => navigate('/dashboard/mentor/review-queue')}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Open Review Queue
          </button>
        </div>
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
          <h3 className="text-base font-semibold text-text-main mb-1">Categories</h3>
          <p className="text-sm text-text-muted mb-4">Define rubrics, prompts, and passing thresholds for associates to submit against.</p>
          <button
            onClick={() => navigate('/dashboard/mentor/categories')}
            className="px-4 py-2.5 border-2 border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/5 active:scale-95 transition-all"
          >
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# 12. MentorReviewQueuePage
# ─────────────────────────────────────────────────────────────────────────────
files['mentor/MentorReviewQueuePage.tsx'] = """\
import { useMemo, useState } from 'react'
import type { PlanSubmission } from '../../../domain/types'
import { useSubmissionsStore } from '../../state/submissions.store'

const reviewableStatuses = ['submitted_to_mentor', 'approved', 'changes_requested'] as const

function statusBadge(status: string) {
  if (status === 'approved') return 'bg-emerald-100 text-success-emerald'
  if (status === 'changes_requested') return 'bg-red-100 text-error'
  return 'bg-amber-100 text-warning-amber'
}

export default function MentorReviewQueuePage() {
  const submissions = useSubmissionsStore((s) => s.submissions)
  const mentorReview = useSubmissionsStore((s) => s.mentorReview)
  const reviewable = submissions.filter((s) => reviewableStatuses.includes(s.status as (typeof reviewableStatuses)[number]))
  const [selectedId, setSelectedId] = useState(reviewable[0]?.id ?? '')
  const [comment, setComment] = useState('')

  const selected = useMemo<PlanSubmission | undefined>(() => reviewable.find((s) => s.id === selectedId) ?? reviewable[0], [reviewable, selectedId])

  const decide = (status: 'approved' | 'changes_requested') => {
    if (!selected) return
    mentorReview(selected.id, status, comment.trim())
    setComment('')
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Mentor Review Queue</h2>
        <p className="text-sm text-text-muted">Review associate plans that passed the AI threshold and were submitted for mentor decision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Sidebar list */}
        <div className="md:col-span-2">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl overflow-hidden">
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-border">
              <h3 className="text-sm font-semibold text-text-main">Submitted Plans</h3>
            </div>
            {reviewable.length === 0 ? (
              <div className="p-6 flex flex-col items-center gap-2 text-center">
                <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
                <p className="text-sm text-text-muted">No plans are waiting for mentor review.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {reviewable.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedId(s.id); setComment(s.mentorComment ?? '') }}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${selectedId === s.id ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-surface-container-low'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">{s.categoryName}</p>
                      <p className="text-xs text-text-muted">{s.associateName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-xs font-bold ${s.aiScore && s.aiScore >= 70 ? 'text-success-emerald' : 'text-warning-amber'}`}>{s.aiScore ?? 0}%</span>
                      <span className={`px-2 py-0 rounded-full text-[10px] font-semibold ${statusBadge(s.status)}`}>{s.status.replaceAll('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="md:col-span-3">
          {selected ? (
            <div className="space-y-4">
              {/* Submission header */}
              <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-main">{selected.categoryName}</h3>
                    <p className="text-sm text-text-muted">Submitted by {selected.associateName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selected.aiScore && selected.aiScore >= 70 ? 'bg-emerald-100 text-success-emerald' : 'bg-amber-100 text-warning-amber'}`}>{selected.aiScore ?? 0}% AI score</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3 border border-surface-border">
                  <pre className="text-xs text-on-surface whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">{selected.submissionText}</pre>
                </div>
              </div>

              {/* AI Evidence */}
              {selected.evaluation && (
                <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-text-main mb-3">AI Evidence Review</h3>
                  <div className="space-y-3">
                    {selected.evaluation.criterion_scores.map((cr) => {
                      const pct = Math.round((cr.score / cr.max_score) * 100)
                      const passed = cr.score >= cr.max_score * 0.7
                      return (
                        <div key={cr.criterion} className="border border-surface-border rounded-xl p-3">
                          <div className="flex justify-between mb-1.5">
                            <p className="text-xs font-semibold text-text-main">{cr.criterion}</p>
                            <p className={`text-xs font-bold ${passed ? 'text-success-emerald' : 'text-warning-amber'}`}>{cr.score}/{cr.max_score}</p>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
                            <div className={`h-full rounded-full ${passed ? 'bg-success-emerald' : 'bg-warning-amber'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-text-muted">{cr.reasoning}</p>
                          {cr.evidence && <p className="text-xs text-text-muted mt-1 italic">Evidence: {cr.evidence}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mentor Decision */}
              <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-text-main mb-3">Mentor Decision</h3>
                {selected.status === 'approved' && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3">
                    <span className="material-symbols-outlined text-success-emerald" style={{ fontSize: 18 }}>check_circle</span>
                    <p className="text-sm text-success-emerald">Approved by Mentor.</p>
                  </div>
                )}
                {selected.status === 'changes_requested' && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                    <span className="material-symbols-outlined text-warning-amber" style={{ fontSize: 18 }}>pending</span>
                    <p className="text-sm text-warning-amber">Changes requested.</p>
                  </div>
                )}
                <textarea
                  rows={4}
                  className="w-full p-3 rounded-xl border border-surface-border text-sm resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-3"
                  placeholder="Add clear next steps or approval note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={() => decide('approved')} className="flex-1 py-3 bg-success-emerald text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>Approve
                  </button>
                  <button onClick={() => decide('changes_requested')} className="flex-1 py-3 border-2 border-warning-amber text-warning-amber rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-50 active:scale-95 transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rate_review</span>Request Changes
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
"""

# ─────────────────────────────────────────────────────────────────────────────
# Write all files
# ─────────────────────────────────────────────────────────────────────────────
for rel_path, content in files.items():
    full_path = os.path.join(base, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Written: {rel_path}')

print('\nAll files written successfully.')
