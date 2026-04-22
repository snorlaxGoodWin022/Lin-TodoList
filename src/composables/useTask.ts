import { computed, ref } from 'vue'
import { useTaskStore } from '../stores/task.store'
import { useListStore } from '../stores/list.store'
import type { Task, TaskFilters } from '../types/repositories'

export function useTask() {
  const taskStore = useTaskStore()
  const listStore = useListStore()

  // Reactive state for task creation/editing
  const editingTask = ref<Partial<Task> | null>(null)
  const isEditing = computed(() => editingTask.value !== null)

  // Task filters
  const filters = ref<TaskFilters>({})

  // Task list getters
  const tasks = computed(() => taskStore.tasks)
  const completedTasks = computed(() => taskStore.completedTasks)
  const pendingTasks = computed(() => taskStore.pendingTasks)
  const highPriorityTasks = computed(() => taskStore.highPriorityTasks)
  const todayTasks = computed(() => taskStore.todayTasks)
  const tomorrowTasks = computed(() => taskStore.tomorrowTasks)
  const thisWeekTasks = computed(() => taskStore.thisWeekTasks)
  const allTasks = computed(() => taskStore.allTasks)
  const overdueTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return taskStore.pendingTasks.filter((t) => t.due_date && t.due_date < today)
  })

  // Task selection
  const selectedTask = computed(() => taskStore.selectedTask)
  const detailPanelCollapsed = computed(() => taskStore.detailPanelCollapsed)

  // List information
  const currentList = computed(() => listStore.selectedList)

  // Actions
  const loadTasks = async (newFilters?: TaskFilters) => {
    if (newFilters) {
      filters.value = newFilters
    }
    return taskStore.loadTasks(filters.value)
  }

  const createTask = async (taskData: Partial<Task>) => {
    const newTask = await taskStore.createTask(taskData)
    return newTask
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    return taskStore.updateTask(id, updates)
  }

  const deleteTask = async (id: string) => {
    return taskStore.deleteTask(id)
  }

  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    return taskStore.toggleTaskCompletion(id, completed)
  }

  const selectTask = (task: Task | null) => {
    taskStore.selectTask(task)
  }

  const toggleDetailPanel = () => {
    taskStore.toggleDetailPanel()
  }

  const searchTasks = (query: string) => {
    taskStore.searchTasks(query)
  }

  const clearSearch = () => {
    taskStore.clearSearch()
  }

  // Task editor - delegate to store
  const openTaskEditor = (taskId?: string) => {
    taskStore.openTaskEditor(taskId)
  }

  const closeTaskEditor = () => {
    taskStore.closeTaskEditor()
  }

  const saveTask = async () => {
    if (!editingTask.value) return

    const { id, ...updates } = editingTask.value

    if (id) {
      // Update existing task
      await updateTask(id, updates)
    } else {
      // Create new task
      await createTask(updates)
    }

    closeTaskEditor()
  }

  // Initialize
  const init = () => {
    taskStore.init()
    listStore.init()
  }

  return {
    // State
    tasks,
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    todayTasks,
    tomorrowTasks,
    thisWeekTasks,
    allTasks,
    overdueTasks,
    selectedTask,
    detailPanelCollapsed,
    currentList,
    editingTask,
    isEditing,
    filters,

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
    saveTask,
    init,
  }
}
