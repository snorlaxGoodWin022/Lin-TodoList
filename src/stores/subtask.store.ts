import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subtask } from '../types/repositories'

export interface SubtaskCreateData {
  parent_id: string
  title: string
}

export const useSubtaskStore = defineStore('subtask', () => {
  // State - use Map keyed by parent_id to avoid race conditions
  const subtasksByParent = ref<Map<string, Subtask[]>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Track which parentIds have been loaded
  const loadedParents = ref<Set<string>>(new Set())

  // Getters
  const getSubtasksByParentId = computed(() => {
    return (parentId: string) => subtasksByParent.value.get(parentId) || []
  })

  // Actions
  const loadSubtasks = async (parentId: string) => {
    try {
      loading.value = true
      const result = await window.electronAPI.getSubtasks({ parentId })
      subtasksByParent.value.set(parentId, result)
      loadedParents.value.add(parentId)
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load subtasks'
      console.error('Error loading subtasks:', err)
    } finally {
      loading.value = false
    }
  }

  const createSubtask = async (data: SubtaskCreateData) => {
    try {
      loading.value = true
      const newSubtask = await window.electronAPI.createSubtask(data)
      // Add to the parent's subtasks list
      const parentSubtasks = subtasksByParent.value.get(data.parent_id) || []
      subtasksByParent.value.set(data.parent_id, [newSubtask, ...parentSubtasks])
      error.value = null
      return newSubtask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create subtask'
      console.error('Error creating subtask:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateSubtask(id, updates)
      if (success) {
        // Find and update in the map
        for (const [parentId, subtasks] of subtasksByParent.value.entries()) {
          const index = subtasks.findIndex((s) => s.id === id)
          if (index !== -1) {
            subtasks[index] = { ...subtasks[index], ...updates }
            subtasksByParent.value.set(parentId, [...subtasks])
            break
          }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subtask'
      console.error('Error updating subtask:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSubtask = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteSubtask(id)
      if (success) {
        // Find and remove from the map
        for (const [parentId, subtasks] of subtasksByParent.value.entries()) {
          const filtered = subtasks.filter((s) => s.id !== id)
          if (filtered.length !== subtasks.length) {
            subtasksByParent.value.set(parentId, filtered)
            break
          }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete subtask'
      console.error('Error deleting subtask:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleSubtaskCompletion = async (id: string, completed: boolean) => {
    return updateSubtask(id, { completed: completed ? 1 : 0 })
  }

  return {
    // State
    subtasksByParent,
    loading,
    error,

    // Getters
    getSubtasksByParentId,

    // Actions
    loadSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    toggleSubtaskCompletion,
  }
})
