import type { ReactElement } from 'react'
import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import LoginPage from '../screens/auth/LoginPage'
import FeatureWorkspacePage from '../screens/common/FeatureWorkspacePage'
import AdminCategoriesPage from '../screens/admin/AdminCategoriesPage'
import AdminRubricsPage from '../screens/admin/AdminRubricsPage'
import AdminPromptsPage from '../screens/admin/AdminPromptsPage'
import AdminAssignmentsPage from '../screens/admin/AdminAssignmentsPage'
import AdminAnalyticsPage from '../screens/admin/AdminAnalyticsPage'
import SessionPlanReviewPage from '../screens/associate/SessionPlanReviewPage'
import AssociateSubmissionsPage from '../screens/associate/AssociateSubmissionsPage'
import StudentAssignmentReviewPage from '../screens/student/StudentAssignmentReviewPage'
import StudentProgressPage from '../screens/student/StudentProgressPage'
import AdminDashboardPage from '../screens/admin/AdminDashboardPage'
import MentorDashboardPage from '../screens/mentor/MentorDashboardPage'
import MentorReviewQueuePage from '../screens/mentor/MentorReviewQueuePage'
import AssociateDashboardPage from '../screens/associate/AssociateDashboardPage'
import StudentDashboardPage from '../screens/student/StudentDashboardPage'
import GrowthBoardsPage from '../screens/common/GrowthBoardsPage'
import PlanRepositoryPage from '../screens/common/PlanRepositoryPage'
import ReflectionSubmissionPage from '../screens/associate/ReflectionSubmissionPage'
import { useAuthStore } from '../state/auth.store'
import type { UserRole } from '../../domain/types'

function TopNav() {
  const signOut = useAuthStore((s) => s.signOut)
  const [openKey, setOpenKey] = useState(false)
  const [geminiKey, setGeminiKey] = useState('')
  const [grokKey, setGrokKey] = useState('')
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()

  const navMap: Record<string, { label: string; to: string }[]> = {
    admin: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Users', to: '/dashboard/admin/users' },
      { label: 'Oversight', to: '/dashboard/admin/oversight' },
      { label: 'Settings', to: '/dashboard/admin/settings' },
      { label: 'Growth', to: '/dashboard/growth-boards' },
      { label: 'Repo', to: '/dashboard/repository' },
    ],
    mentor: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Categories', to: '/dashboard/mentor/categories' },
      { label: 'Review Queue', to: '/dashboard/mentor/review-queue' },
      { label: 'Analytics', to: '/dashboard/mentor/analytics' },
      { label: 'Growth', to: '/dashboard/growth-boards' },
      { label: 'Repo', to: '/dashboard/repository' },
    ],
    associate: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Submit Plan', to: '/dashboard/associate/submit-plan' },
      { label: 'My Submissions', to: '/dashboard/associate/my-submissions' },
      { label: 'Growth', to: '/dashboard/growth-boards' },
      { label: 'Repo', to: '/dashboard/repository' },
    ],
    student: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Growth', to: '/dashboard/growth-boards' },
      { label: 'Repo', to: '/dashboard/repository' },
    ],
  }

  const navItems = role ? (navMap[role] ?? []) : []

  const isActive = (to: string) =>
    to === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(to)

  const openKeyDialog = () => {
    try {
      const userId = localStorage.getItem('current_user_id')
      setGeminiKey(userId ? (localStorage.getItem(`gemini_api_key_${userId}`) ?? '') : (localStorage.getItem('gemini_api_key') ?? ''))
      setGrokKey(userId ? (localStorage.getItem(`grok_api_key_${userId}`) ?? '') : (localStorage.getItem('grok_api_key') ?? ''))
    } catch {
      setGeminiKey(''); setGrokKey('')
    }
    setOpenKey(true)
  }

  const saveKeys = () => {
    try {
      const userId = localStorage.getItem('current_user_id')
      if (userId) {
        if (geminiKey.trim()) localStorage.setItem(`gemini_api_key_${userId}`, geminiKey.trim())
        else localStorage.removeItem(`gemini_api_key_${userId}`)
        if (grokKey.trim()) localStorage.setItem(`grok_api_key_${userId}`, grokKey.trim())
        else localStorage.removeItem(`grok_api_key_${userId}`)
      } else {
        if (geminiKey.trim()) localStorage.setItem('gemini_api_key', geminiKey.trim())
        if (grokKey.trim()) localStorage.setItem('grok_api_key', grokKey.trim())
      }
    } catch { /* ignore */ }
    setOpenKey(false)
  }

  const activeProviders = (() => {
    try {
      const id = localStorage.getItem('current_user_id')
      const g = id ? !!localStorage.getItem(`gemini_api_key_${id}`) : !!localStorage.getItem('gemini_api_key')
      const x = id ? !!localStorage.getItem(`grok_api_key_${id}`) : !!localStorage.getItem('grok_api_key')
      return { gemini: g, grok: x, any: g || x }
    } catch { return { gemini: false, grok: false, any: false } }
  })()

  const aiLabel = activeProviders.any
    ? [activeProviders.gemini && 'Gemini', activeProviders.grok && 'Grok'].filter(Boolean).join(' + ')
    : 'Add AI key'

  const initials = (user?.fullName ?? 'U')[0].toUpperCase()

  return (
    <>
      <header
        className="fixed top-0 w-full flex justify-between items-center px-4 md:px-8 h-16 z-50"
        style={{
          background: 'rgba(9,9,16,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <h1 className="font-headline text-xl font-black" style={{ background: 'linear-gradient(90deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ReflectiEVE
        </h1>

        {isAuthenticated && navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 mx-6 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(item.to)
                    ? 'text-white'
                    : 'hover:text-white'
                }`}
                style={isActive(item.to) ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))',
                  color: '#c4b5fd',
                  border: '1px solid rgba(124,58,237,0.3)',
                } : { color: '#64748b' }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={openKeyDialog}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={activeProviders.any ? {
              background: 'rgba(16,185,129,0.15)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.3)',
            } : {
              background: 'rgba(255,255,255,0.05)',
              color: '#64748b',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {activeProviders.any ? 'check_circle' : 'key'}
            </span>
            {aiLabel}
          </button>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
              >
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold leading-tight" style={{ color: '#e2e8f0' }}>{user?.fullName ?? 'Guest'}</p>
                <p className="text-xs capitalize" style={{ color: '#475569' }}>{role}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut()}
            className="text-sm px-2 py-1.5 rounded-lg transition-colors"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = '#a855f7' }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = '#475569' }}
          >
            Sign out
          </button>
        </div>
      </header>

      {isAuthenticated && navItems.length > 1 && (
        <nav
          className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 px-4 z-50"
          style={{
            background: 'rgba(9,9,16,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {navItems.slice(0, 3).map((item) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-1 rounded-2xl transition-all duration-150 active:scale-95"
              style={isActive(item.to) ? { color: '#a855f7' } : { color: '#475569' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                {item.label === 'Dashboard' ? 'dashboard'
                  : item.label === 'Submit Plan' ? 'add_circle'
                  : item.label === 'Review Queue' ? 'supervisor_account'
                  : item.label === 'My Submissions' ? 'history'
                  : item.label === 'Analytics' ? 'analytics'
                  : item.label === 'Categories' ? 'category'
                  : 'chevron_right'}
              </span>
              <span className="text-[11px] font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <Dialog open={openKey} onClose={() => setOpenKey(false)} fullWidth maxWidth="sm">
        <DialogTitle>AI Provider Keys</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Gemini API Key (Google)" value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            helperText="Get yours at aistudio.google.com" margin="dense" placeholder="AIza..."
          />
          <TextField
            fullWidth label="Grok API Key (xAI)" value={grokKey}
            onChange={(e) => setGrokKey(e.target.value)}
            helperText="Get yours at console.x.ai"
            margin="dense" placeholder="xai-..." sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenKey(false)}>Cancel</Button>
          <Button onClick={saveKeys} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function Protected({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function RoleGate({ role, children }: { role: UserRole; children: ReactElement }) {
  const currentRole = useAuthStore((s) => s.role)
  if (currentRole !== role) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardGateway() {
  const role = useAuthStore((s) => s.role)
  if (role === 'admin') return <AdminDashboardPage />
  if (role === 'mentor') return <MentorDashboardPage />
  if (role === 'associate') return <AssociateDashboardPage />
  return <StudentDashboardPage />
}

export default function AppRouter() {
  return (
    <div className="min-h-screen" style={{ background: '#090910' }}>
      <TopNav />
      <main className="pt-16 pb-16 md:pb-0 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Protected><DashboardGateway /></Protected>} />
          <Route path="/dashboard/growth-boards" element={<Protected><GrowthBoardsPage /></Protected>} />
          <Route path="/dashboard/repository" element={<Protected><PlanRepositoryPage /></Protected>} />
          <Route path="/dashboard/admin/users" element={<Protected><RoleGate role="admin"><FeatureWorkspacePage title="Manage Users" subtitle="Create, update, and review user accounts." primaryActionLabel="Add user note" /></RoleGate></Protected>} />
          <Route path="/dashboard/admin/oversight" element={<Protected><RoleGate role="admin"><AdminAnalyticsPage /></RoleGate></Protected>} />
          <Route path="/dashboard/admin/rubrics" element={<Protected><RoleGate role="admin"><AdminRubricsPage /></RoleGate></Protected>} />
          <Route path="/dashboard/admin/prompts" element={<Protected><RoleGate role="admin"><AdminPromptsPage /></RoleGate></Protected>} />
          <Route path="/dashboard/admin/assignments" element={<Protected><RoleGate role="admin"><AdminAssignmentsPage /></RoleGate></Protected>} />
          <Route path="/dashboard/admin/settings" element={<Protected><RoleGate role="admin"><FeatureWorkspacePage title="Settings" subtitle="Track platform configuration decisions." primaryActionLabel="Add setting note" /></RoleGate></Protected>} />
          <Route path="/dashboard/mentor/categories" element={<Protected><RoleGate role="mentor"><AdminCategoriesPage /></RoleGate></Protected>} />
          <Route path="/dashboard/mentor/review-queue" element={<Protected><RoleGate role="mentor"><MentorReviewQueuePage /></RoleGate></Protected>} />
          <Route path="/dashboard/mentor/analytics" element={<Protected><RoleGate role="mentor"><AdminAnalyticsPage /></RoleGate></Protected>} />
          <Route path="/dashboard/associate/submit-plan" element={<Protected><RoleGate role="associate"><SessionPlanReviewPage /></RoleGate></Protected>} />
          <Route path="/dashboard/associate/session-plan-review" element={<Navigate to="/dashboard/associate/submit-plan" replace />} />
          <Route path="/dashboard/associate/my-submissions" element={<Protected><RoleGate role="associate"><AssociateSubmissionsPage /></RoleGate></Protected>} />
          <Route path="/dashboard/associate/recent-submissions" element={<Navigate to="/dashboard/associate/my-submissions" replace />} />
          <Route path="/dashboard/associate/reflect/:planId" element={<Protected><RoleGate role="associate"><ReflectionSubmissionPage /></RoleGate></Protected>} />
          <Route path="/dashboard/student/assignments" element={<Protected><RoleGate role="student"><StudentAssignmentReviewPage /></RoleGate></Protected>} />
          <Route path="/dashboard/student/progress" element={<Protected><RoleGate role="student"><StudentProgressPage /></RoleGate></Protected>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}