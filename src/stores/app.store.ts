import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<'light' | 'dark'>('light')
  const sidebarCollapsed = ref(false)
  const currentView = ref('today')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isDarkMode = computed(() => theme.value === 'dark')

  // Actions
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    // Update HTML data-theme attribute
    document.documentElement.setAttribute('data-theme', theme.value)
    // Persist to localStorage
    localStorage.setItem('theme', theme.value)
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setView = (view: string) => {
    currentView.value = view
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize theme
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    theme.value = initialTheme
    document.documentElement.setAttribute('data-theme', initialTheme)
  }

  return {
    // State
    theme,
    sidebarCollapsed,
    currentView,
    isLoading,
    error,

    // Getters
    isDarkMode,

    // Actions
    toggleTheme,
    setTheme,
    toggleSidebar,
    setView,
    setLoading,
    setError,
    clearError,
    initTheme,
  }
})
