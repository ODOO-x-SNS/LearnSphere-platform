import { create } from 'zustand'

export type Role = 'admin' | 'instructor' | 'learner' | 'guest'

interface AuthState {
  user: { name: string; email: string } | null
  role: Role
  setUser: (user: { name: string; email: string } | null) => void
  setRole: (role: Role) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { name: 'Demo User', email: 'demo@learnsphere.com' },
  role: 'learner',
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
}))
