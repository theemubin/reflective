import { describe, expect, it } from 'vitest'
import { useAuthStore } from './auth.store'

describe('auth store', () => {
  it('signs in with selected role', () => {
    useAuthStore.getState().signInAsRole('admin')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().role).toBe('admin')
  })

  it('signs out and clears state', () => {
    useAuthStore.getState().signOut()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().role).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
