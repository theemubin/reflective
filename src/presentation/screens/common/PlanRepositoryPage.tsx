import { useState } from 'react'

const MOCK_PLANS = [
  { id: '1', title: 'Systems Thinking in Everyday Life', author: 'Alice Chen', category: 'General', executions: 12, rating: 4.8 },
  { id: '2', title: 'Building Empathy through Design', author: 'Bob Smith', category: 'Design', executions: 8, rating: 4.5 },
  { id: '3', title: 'Reflective Practices for Teams', author: 'Carlos Diaz', category: 'Leadership', executions: 24, rating: 4.9 },
]

export default function PlanRepositoryPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPlans = MOCK_PLANS.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">
            Knowledge Repository
          </h1>
          <p className="text-body-md text-text-muted max-w-2xl">
            Success is achieved when knowledge survives beyond the original creator. Discover, reuse, and adapt plans created by the ReflectiEVE community.
          </p>
        </div>
        <div className="w-full md:w-72">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 20 }}>search</span>
            <input 
              type="text" 
              placeholder="Search plans or authors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map(plan => (
          <article key={plan.id} className="bg-surface-container-lowest border border-surface-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider rounded-md">
                  {plan.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xs font-bold">{plan.rating}</span>
                </div>
              </div>
              <h3 className="font-headline text-lg font-bold text-text-main mb-1 group-hover:text-primary transition-colors">{plan.title}</h3>
              <p className="text-sm text-text-muted mb-4">By {plan.author}</p>
              
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>task_alt</span>
                <span>Executed {plan.executions} times</span>
              </div>
            </div>
            <div className="p-4 border-t border-surface-border bg-surface-container-low flex justify-between items-center">
              <button className="text-sm font-semibold text-primary hover:underline underline-offset-4">
                View Details
              </button>
              <button className="flex items-center gap-1 text-sm font-semibold text-text-main hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>content_copy</span>
                Adapt
              </button>
            </div>
          </article>
        ))}
      </div>
      
      {filteredPlans.length === 0 && (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-surface-border">
          <span className="material-symbols-outlined text-text-muted/50 mb-4 block" style={{ fontSize: 48 }}>search_off</span>
          <p className="text-lg font-semibold text-text-main">No plans found</p>
          <p className="text-sm text-text-muted">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}
