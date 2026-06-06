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
            <h1 className="font-headline text-3xl font-black text-primary">ReflectiEVE</h1>
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
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${sel ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/30'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? 'bg-primary' : 'bg-surface-container-high'}`}>
                    <span className={`material-symbols-outlined ${sel ? 'text-white' : 'text-on-surface-variant'}`} style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-text-main">{r.label}</p>
                      <span className={`px-2 py-0 text-[10px] font-semibold rounded-full ${sel ? 'bg-primary text-white' : 'bg-surface-container-high text-text-muted'}`}>{r.badge}</span>
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