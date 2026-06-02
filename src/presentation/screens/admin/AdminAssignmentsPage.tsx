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
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-success-emerald">Active</span>
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