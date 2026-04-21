import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Habit, HabitRecord, HabitFilters } from '../types/repositories'

export const useHabitStore = defineStore('habit', () => {
  // State
  const habits = ref<Habit[]>([])
  const habitRecords = ref<Map<string, HabitRecord[]>>(new Map())
  const editingHabit = ref<Partial<Habit> | null>(null)
  const filters = ref<HabitFilters>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeHabits = computed(() => habits.value.filter(habit => habit.archived === 0))
  const archivedHabits = computed(() => habits.value.filter(habit => habit.archived === 1))

  // Actions
  const loadHabits = async (newFilters?: HabitFilters) => {
    try {
      loading.value = true
      if (newFilters) {
        filters.value = newFilters
      }
      const result = await window.electronAPI.getHabits(filters.value)
      habits.value = result
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load habits'
      console.error('Error loading habits:', err)
    } finally {
      loading.value = false
    }
  }

  const createHabit = async (habitData: Partial<Habit>) => {
    try {
      loading.value = true
      const newHabit = await window.electronAPI.createHabit(habitData)
      habits.value.unshift(newHabit)
      error.value = null
      return newHabit
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create habit'
      console.error('Error creating habit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateHabit(id, updates)
      if (success) {
        const index = habits.value.findIndex(habit => habit.id === id)
        if (index !== -1) {
          habits.value[index] = { ...habits.value[index], ...updates }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update habit'
      console.error('Error updating habit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteHabit(id)
      if (success) {
        habits.value = habits.value.filter(habit => habit.id !== id)
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete habit'
      console.error('Error deleting habit:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleHabitRecord = async (habitId: string, date: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.toggleHabitRecord(habitId, date)
      if (success) {
        // Refresh records for this habit
        await loadHabitRecords(habitId)
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle habit record'
      console.error('Error toggling habit record:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadHabitRecords = async (habitId: string, month?: string) => {
    try {
      loading.value = true
      const result = await window.electronAPI.getHabitRecords(habitId, month)
      habitRecords.value.set(habitId, result)
      error.value = null
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load habit records'
      console.error('Error loading habit records:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getHabitRecords = (habitId: string) => {
    return habitRecords.value.get(habitId) || []
  }

  const openHabitEditor = (habitId?: string) => {
    if (habitId) {
      const habit = habits.value.find(h => h.id === habitId)
      editingHabit.value = habit ? { ...habit } : null
    } else {
      editingHabit.value = {}
    }
  }

  const closeHabitEditor = () => {
    editingHabit.value = null
  }

  // Initial load
  const init = () => {
    loadHabits()
  }

  return {
    // State
    habits,
    habitRecords,
    editingHabit,
    filters,
    loading,
    error,

    // Getters
    activeHabits,
    archivedHabits,

    // Actions
    loadHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitRecord,
    loadHabitRecords,
    getHabitRecords,
    openHabitEditor,
    closeHabitEditor,
    init
  }
})