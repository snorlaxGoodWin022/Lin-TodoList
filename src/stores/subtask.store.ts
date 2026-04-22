import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subtask } from '../types/repositories'

export interface SubtaskCreateData {
  parent_id: string
  title: string
}

export const useSubtaskStore = defineStore('subtask', () => {
  // State
  const subtasks = ref<Subtask[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getSubtasksByParentId = computed(() => {
    return (parentId: string) => subtasks.value.filter((s) => s.parent_id === parentId)
  })

  // Actions
  const loadSubtasks = async (parentId: string) => {
    try {
      loading.value = true
      const result = await window.electronAPI.getSubtasks({ parentId })
      subtasks.value = result
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
      subtasks.value.unshift(newSubtask)
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
        const index = subtasks.value.findIndex((s) => s.id === id)
        if (index !== -1) {
          subtasks.value[index] = { ...subtasks.value[index], ...updates }
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
        subtasks.value = subtasks.value.filter((s) => s.id !== id)
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
    subtasks,
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
