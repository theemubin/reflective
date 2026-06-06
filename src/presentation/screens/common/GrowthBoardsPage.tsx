import { useState } from 'react'

const GROWTH_BOARDS = [
  { id: 'thinker', name: 'Most Improved Thinker', icon: 'psychology' },
  { id: 'executor', name: 'Most Consistent Executor', icon: 'task_alt' },
  { id: 'learner', name: 'Most Reflective Learner', icon: 'auto_stories' },
  { id: 'contributor', name: 'Most Helpful Contributor', icon: 'handshake' },
  { id: 'leader', name: 'Emerging Leader', icon: 'groups' },
  { id: 'impact', name: 'Community Impact', icon: 'public' },
]

// Mock data
const BOARD_DATA: Record<string, any[]> = {
  thinker: [
    { name: 'Alice Chen', change: '+2.4', metric: 'Systems Thinking Score' },
    { name: 'Bob Smith', change: '+1.9', metric: 'Clarity Score' },
    { name: 'Carlos Diaz', change: '+1.5', metric: 'Problem Solving Score' },
  ],
  executor: [
    { name: 'Diana Prince', change: '100%', metric: 'Completion Rate (30 days)' },
    { name: 'Evan Wright', change: '95%', metric: 'Completion Rate (30 days)' },
  ],
  learner: [
    { name: 'Fiona Gallagher', change: '9.2', metric: 'Reflection Depth Average' },
    { name: 'George Costanza', change: '8.8', metric: 'Reflection Depth Average' },
  ],
  contributor: [
    { name: 'Hannah Abbott', change: '42', metric: 'Helpful Reviews' },
    { name: 'Ian Malcolm', change: '38', metric: 'Helpful Reviews' },
  ],
  leader: [
    { name: 'Julia Child', change: '15', metric: 'Mentoring Hours' },
  ],
  impact: [
    { name: 'Kevin Hart', change: '120', metric: 'People Helped' },
  ],
}

export default function GrowthBoardsPage() {
  const [activeBoard, setActiveBoard] = useState('thinker')

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">
          Community Growth Boards
        </h1>
        <p className="text-body-md text-text-muted max-w-2xl">
          At ReflectiEVE, we celebrate trajectory and contribution. These boards highlight individuals who are making significant strides in their personal growth and helping others along the way.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
          {GROWTH_BOARDS.map(board => (
            <button
              key={board.id}
              onClick={() => setActiveBoard(board.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal text-left ${
                activeBoard === board.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-surface-container-lowest border border-surface-border text-text-muted hover:border-primary-container hover:text-primary-container'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{board.icon}</span>
              <span className="font-semibold text-sm">{board.name}</span>
            </button>
          ))}
        </div>

        {/* Board Content */}
        <div className="flex-1 bg-surface-container-lowest border border-surface-border rounded-2xl p-6 shadow-sm min-h-[400px]">
          <h2 className="font-headline text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>
              {GROWTH_BOARDS.find(b => b.id === activeBoard)?.icon}
            </span>
            {GROWTH_BOARDS.find(b => b.id === activeBoard)?.name}
          </h2>
          
          <div className="space-y-4">
            {BOARD_DATA[activeBoard]?.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main text-lg">{item.name}</h3>
                    <p className="text-xs text-text-muted uppercase tracking-wider">{item.metric}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-headline text-2xl font-black text-primary">{item.change}</span>
                </div>
              </div>
            ))}
            
            {(!BOARD_DATA[activeBoard] || BOARD_DATA[activeBoard].length === 0) && (
              <div className="text-center py-12 text-text-muted">
                No data available for this board yet. Keep growing!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
