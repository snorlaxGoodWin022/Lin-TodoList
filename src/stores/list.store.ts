import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { List } from '../types/repositories'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<List[]>([])
  const selectedListId = ref<string>('inbox')
  const editingList = ref<Partial<List> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const selectedList = computed(() => {
    return lists.value.find(list => list.id === selectedListId.value)
  })

  // Actions
  const loadLists = async () => {
    try {
      loading.value = true
      const result = await window.electronAPI.getLists()
      lists.value = result
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load lists'
      console.error('Error loading lists:', err)
    } finally {
      loading.value = false
    }
  }

  const createList = async (listData: Partial<List>) => {
    try {
      loading.value = true
      const newList = await window.electronAPI.createList(listData)
      lists.value.push(newList)
      error.value = null
      return newList
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create list'
      console.error('Error creating list:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateList = async (id: string, updates: Partial<List>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateList(id, updates)
      if (success) {
        const index = lists.value.findIndex(list => list.id === id)
        if (index !== -1) {
          lists.value[index] = { ...lists.value[index], ...updates }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update list'
      console.error('Error updating list:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteList = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteList(id)
      if (success) {
        lists.value = lists.value.filter(list => list.id !== id)
        if (selectedListId.value === id) {
          selectedListId.value = 'inbox'
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete list'
      console.error('Error deleting list:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const selectList = (listId: string) => {
    selectedListId.value = listId
  }

  const openListEditor = (listId?: string) => {
    if (listId) {
      const list = lists.value.find(l => l.id === listId)
      editingList.value = list ? { ...list } : null
    } else {
      editingList.value = {}
    }
  }

  const closeListEditor = () => {
    editingList.value = null
  }

  const getListById = (listId: string) => {
    return lists.value.find(l => l.id === listId)
  }

  // Initial load
  const init = () => {
    loadLists()
  }

  return {
    // State
    lists,
    selectedListId,
    editingList,
    loading,
    error,

    // Getters
    selectedList,

    // Actions
    loadLists,
    createList,
    updateList,
    deleteList,
    selectList,
    openListEditor,
    closeListEditor,
    getListById,
    init
  }
})