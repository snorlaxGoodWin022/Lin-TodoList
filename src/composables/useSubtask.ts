import { computed, ref } from 'vue'
import { useSubtaskStore } from '../stores/subtask.store'
import type { Subtask } from '../types/repositories'

export function useSubtask() {
  const subtaskStore = useSubtaskStore()

  const loading = computed(() => subtaskStore.loading)
  const error = computed(() => subtaskStore.error)

  const getSubtasksByParentId = (parentId: string) => {
    return computed(() => subtaskStore.getSubtasksByParentId(parentId))
  }

  const loadSubtasks = async (parentId: string) => {
    await subtaskStore.loadSubtasks(parentId)
  }

  const createSubtask = async (parentId: string, title: string) => {
    return subtaskStore.createSubtask({ parent_id: parentId, title })
  }

  const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
    return subtaskStore.updateSubtask(id, updates)
  }

  const deleteSubtask = async (id: string) => {
    return subtaskStore.deleteSubtask(id)
  }

  const toggleSubtaskCompletion = async (id: string, completed: boolean) => {
    return subtaskStore.toggleSubtaskCompletion(id, completed)
  }

  return {
    // State
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
}
