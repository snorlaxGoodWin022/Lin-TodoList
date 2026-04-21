import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilters } from '../../electron/database/repositories/task.repo'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref<Task[]>([])
  const selectedTask = ref<Task | null>(null)
  const editingTask = ref<Partial<Task> | null>(null)
  const detailPanelCollapsed = ref(false)
  const filters = ref<TaskFilters>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const completedTasks = computed(() => tasks.value.filter(task => task.completed))
  const pendingTasks = computed(() => tasks.value.filter(task => !task.completed))
  const highPriorityTasks = computed(() => tasks.value.filter(task => task.priority === 3))
  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return tasks.value.filter(task => task.due_date === today)
  })

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

    // Getters
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    todayTasks,

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
    init
  }
})