import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilters } from '../types/repositories'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const selectedTask = ref<Task | null>(null)
  const editingTask = ref<Partial<Task> | null>(null)
  const detailPanelCollapsed = ref(false)
  const filters = ref<TaskFilters>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  // Batch selection state
  const batchSelectMode = ref(false)
  const selectedTaskIds = ref<Set<string>>(new Set())

  // Getters
  const completedTasks = computed(() => tasks.value.filter(task => task.completed))
  const pendingTasks = computed(() => tasks.value.filter(task => !task.completed))
  const highPriorityTasks = computed(() => tasks.value.filter(task => task.priority === 3))

  // Built-in special lists
  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.value.filter(task => task.due_date === today && !task.completed)
  })

  const tomorrowTasks = computed(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    return tasks.value.filter(task => task.due_date === tomorrowStr && !task.completed)
  })

  const thisWeekTasks = computed(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const startStr = startOfWeek.toISOString().split('T')[0]
    const endStr = endOfWeek.toISOString().split('T')[0]

    return tasks.value.filter(task => {
      if (!task.due_date || task.completed) return false
      return task.due_date >= startStr && task.due_date <= endStr
    })
  })

  const allTasks = computed(() => tasks.value)

  // Actions
  const loadTasks = async (newFilters?: TaskFilters) => {
    try {
      loading.value = true
      if (newFilters) {
        filters.value = newFilters
      }
      const result = await window.electronAPI.getTasks(filters.value)
      tasks.value = result
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tasks'
      console.error('Error loading tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      loading.value = true
      const newTask = await window.electronAPI.createTask(taskData)
      tasks.value.unshift(newTask)
      error.value = null
      return newTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create task'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateTask(id, updates)
      if (success) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = { ...tasks.value[index], ...updates }
        }
        if (selectedTask.value?.id === id) {
          selectedTask.value = { ...selectedTask.value, ...updates }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task'
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteTask(id)
      if (success) {
        tasks.value = tasks.value.filter(task => task.id !== id)
        if (selectedTask.value?.id === id) {
          selectedTask.value = null
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete task'
      console.error('Error deleting task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      loading.value = true
      const success = await window.electronAPI.toggleTaskCompletion(id, completed)
      if (success) {
        const task = tasks.value.find(task => task.id === id)
        if (task) {
          task.completed = completed ? 1 : 0
          task.completed_at = completed ? new Date().toISOString() : null
        }
        if (selectedTask.value?.id === id) {
          selectedTask.value = { ...selectedTask.value, completed: completed ? 1 : 0, completed_at: completed ? new Date().toISOString() : null }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle task completion'
      console.error('Error toggling task completion:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const selectTask = (task: Task | null) => {
    selectedTask.value = task
    if (task && detailPanelCollapsed.value) {
      detailPanelCollapsed.value = false
    }
  }

  const toggleDetailPanel = () => {
    detailPanelCollapsed.value = !detailPanelCollapsed.value
  }

  const searchTasks = (query: string) => {
    filters.value.search = query
    loadTasks()
  }

  const clearSearch = () => {
    delete filters.value.search
    loadTasks()
  }

  const openTaskEditor = (taskId?: string) => {
    if (taskId) {
      const task = tasks.value.find(t => t.id === taskId)
      editingTask.value = task ? { ...task } : null
    } else {
      editingTask.value = {}
    }
  }

  const closeTaskEditor = () => {
    editingTask.value = null
  }

  // Batch selection actions
  const toggleBatchSelectMode = () => {
    batchSelectMode.value = !batchSelectMode.value
    if (!batchSelectMode.value) {
      selectedTaskIds.value.clear()
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTaskIds.value.has(taskId)) {
      selectedTaskIds.value.delete(taskId)
    } else {
      selectedTaskIds.value.add(taskId)
    }
  }

  const clearTaskSelection = () => {
    selectedTaskIds.value.clear()
  }

  const selectAllTasks = () => {
    tasks.value.forEach(task => {
      if (!task.completed) {
        selectedTaskIds.value.add(task.id)
      }
    })
  }

  // Batch operations
  const batchDeleteTasks = async () => {
    const ids = Array.from(selectedTaskIds.value)
    if (ids.length === 0) return

    try {
      loading.value = true
      for (const id of ids) {
        await window.electronAPI.deleteTask(id)
        tasks.value = tasks.value.filter(task => task.id !== id)
      }
      selectedTaskIds.value.clear()
      batchSelectMode.value = false
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete tasks'
      console.error('Error batch deleting tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchMoveTasks = async (targetListId: string) => {
    const ids = Array.from(selectedTaskIds.value)
    if (ids.length === 0) return

    try {
      loading.value = true
      for (const id of ids) {
        await window.electronAPI.updateTask(id, { list_id: targetListId })
        const task = tasks.value.find(t => t.id === id)
        if (task) {
          task.list_id = targetListId
        }
      }
      selectedTaskIds.value.clear()
      batchSelectMode.value = false
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move tasks'
      console.error('Error batch moving tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const batchCompleteTasks = async (completed: boolean = true) => {
    const ids = Array.from(selectedTaskIds.value)
    if (ids.length === 0) return

    try {
      loading.value = true
      for (const id of ids) {
        await window.electronAPI.toggleTaskCompletion(id, completed)
        const task = tasks.value.find(t => t.id === id)
        if (task) {
          task.completed = completed ? 1 : 0
          task.completed_at = completed ? new Date().toISOString() : null
        }
      }
      selectedTaskIds.value.clear()
      batchSelectMode.value = false
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to complete tasks'
      console.error('Error batch completing tasks:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initial load
  const init = () => {
    loadTasks()
  }

  return {
    // State
    tasks,
    selectedTask,
    editingTask,
    detailPanelCollapsed,
    filters,
    loading,
    error,
    batchSelectMode,
    selectedTaskIds,

    // Getters
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    todayTasks,
    tomorrowTasks,
    thisWeekTasks,
    allTasks,

    // Actions
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    selectTask,
    toggleDetailPanel,
    searchTasks,
    clearSearch,
    openTaskEditor,
    closeTaskEditor,
    init,

    // Batch operations
    toggleBatchSelectMode,
    toggleTaskSelection,
    clearTaskSelection,
    selectAllTasks,
    batchDeleteTasks,
    batchMoveTasks,
    batchCompleteTasks
  }
})