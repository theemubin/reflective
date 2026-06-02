export default function StudentDashboardPage() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-text-main">Student Dashboard</h2>
        <p className="text-sm text-text-muted">Your learning journey and feedback.</p>
      </div>
      <div className="flex items-start gap-3 bg-blue-50 border border-secondary-container rounded-xl p-4 mb-6">
        <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 20 }}>info</span>
        <p className="text-sm text-on-secondary-fixed-variant">Student workflows are intentionally minimal while the Mentor and Associate review flow is being built out.</p>
      </div>
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-main mb-2">Coming Next</h3>
        <p className="text-sm text-text-muted">Students will later view approved plans, final feedback, and learning progress once the review workflow is stable.</p>
      </div>
    </div>
  )
}