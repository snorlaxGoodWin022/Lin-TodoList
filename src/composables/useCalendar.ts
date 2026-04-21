import { ref, computed } from 'vue'
import { useTaskStore } from '../stores/task.store'
import type { Task } from '../../electron/database/repositories/task.repo'

export function useCalendar() {
  const taskStore = useTaskStore()

  // Current date state
  const currentDate = ref(new Date())
  const viewMode = ref<'month' | 'week' | 'day'>('month')

  // Computed date ranges
  const currentMonth = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    return { year, month }
  })

  const monthName = computed(() => {
    return currentDate.value.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })
  })

  // Get tasks for specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return taskStore.tasks.filter(task => task.due_date === dateStr)
  }

  // Get tasks for date range
  const getTasksForDateRange = (startDate: Date, endDate: Date) => {
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    return taskStore.tasks.filter(task => {
      if (!task.due_date) return false
      return task.due_date >= startStr && task.due_date <= endStr
    })
  }

  // Generate month days
  const monthDays = computed(() => {
    const { year, month } = currentMonth.value
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days = []
    const startDay = firstDay.getDay() // 0 = Sunday, 6 = Saturday

    // Add days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date)
      })
    }

    // Add days from current month
    const daysInMonth = lastDay.getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        tasks: getTasksForDate(date)
      })
    }

    // Add days from next month to complete grid
    const totalCells = Math.ceil(days.length / 7) * 7
    while (days.length < totalCells) {
      const lastDate: Date = days[days.length - 1].date
      const nextDate: Date = new Date(lastDate)
      nextDate.setDate(nextDate.getDate() + 1)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        tasks: getTasksForDate(nextDate)
      })
    }

    return days
  })

  // Generate week days
  const weekDays = computed(() => {
    const current = new Date(currentDate.value)
    const dayOfWeek = current.getDay()
    const startDate = new Date(current)
    startDate.setDate(current.getDate() - dayOfWeek)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push({
        date,
        tasks: getTasksForDate(date)
      })
    }

    return days
  })

  // Navigation
  const goToToday = () => {
    currentDate.value = new Date()
  }

  const goToPrevMonth = () => {
    const date = new Date(currentDate.value)
    date.setMonth(date.getMonth() - 1)
    currentDate.value = date
  }

  const goToNextMonth = () => {
    const date = new Date(currentDate.value)
    date.setMonth(date.getMonth() + 1)
    currentDate.value = date
  }

  const goToPrevWeek = () => {
    const date = new Date(currentDate.value)
    date.setDate(date.getDate() - 7)
    currentDate.value = date
  }

  const goToNextWeek = () => {
    const date = new Date(currentDate.value)
    date.setDate(date.getDate() + 7)
    currentDate.value = date
  }

  const goToPrevDay = () => {
    const date = new Date(currentDate.value)
    date.setDate(date.getDate() - 1)
    currentDate.value = date
  }

  const goToNextDay = () => {
    const date = new Date(currentDate.value)
    date.setDate(date.getDate() + 1)
    currentDate.value = date
  }

  // Set view mode
  const setViewMode = (mode: 'month' | 'week' | 'day') => {
    viewMode.value = mode
  }

  // Format date for display
  const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium') => {
    const options: Intl.DateTimeFormatOptions = {}

    if (format === 'short') {
      options.day = 'numeric'
      options.month = 'short'
    } else if (format === 'medium') {
      options.day = 'numeric'
      options.month = 'short'
      options.year = 'numeric'
    } else if (format === 'long') {
      options.weekday = 'long'
      options.day = 'numeric'
      options.month = 'long'
      options.year = 'numeric'
    }

    return date.toLocaleDateString('zh-CN', options)
  }

  return {
    // State
    currentDate,
    viewMode,

    // Computed
    currentMonth,
    monthName,
    monthDays,
    weekDays,

    // Actions
    getTasksForDate,
    getTasksForDateRange,
    goToToday,
    goToPrevMonth,
    goToNextMonth,
    goToPrevWeek,
    goToNextWeek,
    goToPrevDay,
    goToNextDay,
    setViewMode,
    formatDate
  }
}