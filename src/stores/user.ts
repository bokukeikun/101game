import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserSettings } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const settings = ref<UserSettings>({
    theme: 'light',
    language: 'ja',
    notifications: true,
  })

  const isAuthenticated = computed(() => currentUser.value !== null)
  const userName = computed(() => currentUser.value?.name || '')
  const userId = computed(() => currentUser.value?.id || '')

  function setUser(user: User | null) {
    currentUser.value = user
  }

  function updateSettings(newSettings: Partial<UserSettings>) {
    settings.value = {
      ...settings.value,
      ...newSettings,
    }
  }

  function clearUser() {
    currentUser.value = null
  }

  return {
    currentUser,
    settings,
    isAuthenticated,
    userName,
    userId,
    setUser,
    updateSettings,
    clearUser,
  }
})
