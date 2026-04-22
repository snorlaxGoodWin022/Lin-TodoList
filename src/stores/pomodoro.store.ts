import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PomodoroRecord, PomodoroStats } from '../types/repositories'

export const usePomodoroStore = defineStore('pomodoro', () => {
  // State
  const pomodoroRecords = ref<PomodoroRecord[]>([])
  const stats = ref<PomodoroStats>({
    total_focus_minutes: 0,
    total_break_minutes: 0,
    daily_average: 0,
    streak_days: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const todayRecords = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return pomodoroRecords.value.filter((record) => record.completed_at.startsWith(today))
  })

  const focusRecords = computed(() =>
    pomodoroRecords.value.filter((record) => record.type === 'focus')
  )
  const breakRecords = computed(() =>
    pomodoroRecords.value.filter((record) => record.type === 'break')
  )

  // Actions
  const savePomodoro = async (recordData: Partial<PomodoroRecord>) => {
    try {
      loading.value = true
      const newRecord = await window.electronAPI.savePomodoro(recordData)
      pomodoroRecords.value.unshift(newRecord)
      error.value = null
      return newRecord
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save pomodoro record'
      console.error('Error saving pomodoro record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadStats = async (range?: string) => {
    try {
      loading.value = true
      const result = await window.electronAPI.getPomodoroStats(range)
      stats.value = result
      error.value = null
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load pomodoro stats'
      console.error('Error loading pomodoro stats:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initial load
  const init = () => {
    loadStats()
  }

  return {
    // State
    pomodoroRecords,
    stats,
    loading,
    error,

    // Getters
    todayRecords,
    focusRecords,
    breakRecords,

    // Actions
    savePomodoro,
    loadStats,
    init,
  }
})
