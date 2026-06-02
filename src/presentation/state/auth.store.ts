import { create } from 'zustand'
import type { UserProfile, UserRole } from '../../domain/types'

interface AuthState {
  user: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  signInAsRole: (role: UserRole) => void
  signOut: () => void
}

const demoUserByRole: Record<UserRole, UserProfile> = {
  admin: {
    id: 'demo-admin',
    email: 'admin@reflectiq.app',
    fullName: 'ReflectIQ Admin',
    role: 'admin',
  },
  mentor: {
    id: 'demo-mentor',
    email: 'mentor@reflectiq.app',
    fullName: 'ReflectIQ Mentor',
    role: 'mentor',
  },
  associate: {
    id: 'demo-associate',
    email: 'associate@reflectiq.app',
    fullName: 'ReflectIQ Associate',
    role: 'associate',
  },
  student: {
    id: 'demo-student',
    email: 'student@reflectiq.app',
    fullName: 'ReflectIQ Student',
    role: 'student',
  },
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  signInAsRole: (role) =>
    set(() => {
      const user = demoUserByRole[role]
      try {
        localStorage.setItem('current_user_id', user.id)
      } catch {
        // ignore storage errors in demo environment
      }
      return {
        user,
        role,
        isAuthenticated: true,
      }
    }),
  signOut: () =>
    set(() => {
      try {
        localStorage.removeItem('current_user_id')
      } catch {
        // ignore
      }
      return {
        user: null,
        role: null,
        isAuthenticated: false,
      }
    }),
}))

