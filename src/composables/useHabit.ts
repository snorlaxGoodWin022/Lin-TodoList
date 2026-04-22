import { ref, computed } from 'vue'
import { useHabitStore } from '../stores/habit.store'
import type { Habit, HabitFilters } from '../types/repositories'

export function useHabit() {
  const habitStore = useHabitStore()

  // State
  const editingHabit = ref<Partial<Habit> | null>(null)
  const isEditing = computed(() => editingHabit.value !== null)

  // Filters
  const filters = ref<HabitFilters>({})

  // Computed
  const habits = computed(() => habitStore.habits)
  const activeHabits = computed(() => habitStore.activeHabits)
  const archivedHabits = computed(() => habitStore.archivedHabits)

  // Get habit completion status for a date
  const getHabitCompletion = (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const records = habitStore.getHabitRecords(habitId)
    const record = records.find((r) => r.date === dateStr)
    return record?.completed === 1
  }

  // Get habit streak
  const getHabitStreak = (habitId: string) => {
    const records = habitStore.getHabitRecords(habitId)
    if (records.length === 0) return 0

    // Sort records by date descending
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date))

    let streak = 0
    let currentDate = new Date()

    // Check consecutive days from today backwards
    for (let i = 0; i < 365; i++) {
      // Max 1 year
      const dateStr = currentDate.toISOString().split('T')[0]
      const record = sortedRecords.find((r) => r.date === dateStr)

      if (!record || record.completed === 0) {
        // Streak broken
        break
      }

      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  // Get monthly completion data
  const getMonthlyCompletion = (habitId: string, year: number, month: number) => {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`
    const records = habitStore.getHabitRecords(habitId)

    const completionMap: Record<string, boolean> = {}
    records.forEach((record) => {
      if (record.date.startsWith(monthStr)) {
        completionMap[record.date] = record.completed === 1
      }
    })

    return completionMap
  }

  // Get weekly completion rate
  const getWeeklyCompletionRate = (habitId: string) => {
    const records = habitStore.getHabitRecords(habitId)
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weekRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate >= oneWeekAgo && recordDate <= now
    })

    if (weekRecords.length === 0) return 0

    const completed = weekRecords.filter((r) => r.completed === 1).length
    return (completed / weekRecords.length) * 100
  }

  // Actions
  const loadHabits = async (newFilters?: HabitFilters) => {
    if (newFilters) {
      filters.value = newFilters
    }
    return habitStore.loadHabits(filters.value)
  }

  const createHabit = async (habitData: Partial<Habit>) => {
    const newHabit = await habitStore.createHabit(habitData)
    return newHabit
  }

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    return habitStore.updateHabit(id, updates)
  }

  const deleteHabit = async (id: string) => {
    return habitStore.deleteHabit(id)
  }

  const toggleHabitRecord = async (habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return habitStore.toggleHabitRecord(habitId, dateStr)
  }

  const loadHabitRecords = async (habitId: string, month?: string) => {
    return habitStore.loadHabitRecords(habitId, month)
  }

  // Habit editor
  const openHabitEditor = (habitId?: string) => {
    if (habitId) {
      const habit = habitStore.habits.find((h) => h.id === habitId)
      editingHabit.value = habit ? { ...habit } : { id: habitId }
    } else {
      editingHabit.value = {
        name: '',
        icon: 'check',
        frequency: 'daily',
        target_days: '[]',
        remind_at: null,
        sort_order: Date.now(),
        archived: 0,
      }
    }
  }

  const closeHabitEditor = () => {
    editingHabit.value = null
  }

  const saveHabit = async () => {
    if (!editingHabit.value) return

    const { id, ...updates } = editingHabit.value

    if (id) {
      // Update existing habit
      await updateHabit(id, updates)
    } else {
      // Create new habit
      await createHabit(updates)
    }

    closeHabitEditor()
  }

  // Archive/unarchive
  const archiveHabit = async (id: string) => {
    return updateHabit(id, { archived: 1 })
  }

  const unarchiveHabit = async (id: string) => {
    return updateHabit(id, { archived: 0 })
  }

  // Initialize
  const init = () => {
    habitStore.init()
  }

  return {
    // State
    habits,
    activeHabits,
    archivedHabits,
    editingHabit,
    isEditing,
    filters,

    // Actions
    loadHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitRecord,
    loadHabitRecords,
    openHabitEditor,
    closeHabitEditor,
    saveHabit,
    archiveHabit,
    unarchiveHabit,
    init,

    // Getters
    getHabitCompletion,
    getHabitStreak,
    getMonthlyCompletion,
    getWeeklyCompletionRate,
  }
}
