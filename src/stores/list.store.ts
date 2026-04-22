import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { List, ListGroup } from '../types/repositories'

export const useListStore = defineStore('list', () => {
  // State
  const lists = ref<List[]>([])
  const groups = ref<ListGroup[]>([])
  const selectedListId = ref<string>('inbox')
  const editingList = ref<Partial<List> | null>(null)
  const editingGroup = ref<Partial<ListGroup> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const selectedList = computed(() => {
    return lists.value.find((list) => list.id === selectedListId.value)
  })

  // Grouped lists: { groupId: [lists] }
  const groupedLists = computed(() => {
    const result: Record<string, List[]> = {}
    // Initialize with empty arrays for each group
    groups.value.forEach((g) => {
      result[g.id] = []
    })
    // Add ungrouped lists
    result['ungrouped'] = []
    // Sort lists into groups
    lists.value.forEach((list) => {
      if (list.group_id) {
        if (!result[list.group_id]) {
          result[list.group_id] = []
        }
        result[list.group_id].push(list)
      } else {
        result['ungrouped'].push(list)
      }
    })
    return result
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

  const loadGroups = async () => {
    try {
      loading.value = true
      const result = await window.electronAPI.getListGroups()
      groups.value = result
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load list groups'
      console.error('Error loading list groups:', err)
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

  const createGroup = async (groupData: Partial<ListGroup>) => {
    try {
      loading.value = true
      const newGroup = await window.electronAPI.createListGroup(groupData)
      groups.value.push(newGroup)
      error.value = null
      return newGroup
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create list group'
      console.error('Error creating list group:', err)
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
        const index = lists.value.findIndex((list) => list.id === id)
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

  const updateGroup = async (id: string, updates: Partial<ListGroup>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateListGroup(id, updates)
      if (success) {
        const index = groups.value.findIndex((g) => g.id === id)
        if (index !== -1) {
          groups.value[index] = { ...groups.value[index], ...updates }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update list group'
      console.error('Error updating list group:', err)
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
        lists.value = lists.value.filter((list) => list.id !== id)
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

  const deleteGroup = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteListGroup(id)
      if (success) {
        groups.value = groups.value.filter((g) => g.id !== id)
        // Refresh lists since group_id will be set to null
        await loadLists()
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete list group'
      console.error('Error deleting list group:', err)
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
      const list = lists.value.find((l) => l.id === listId)
      editingList.value = list ? { ...list } : null
    } else {
      editingList.value = {}
    }
  }

  const openGroupEditor = (groupId?: string) => {
    if (groupId) {
      const group = groups.value.find((g) => g.id === groupId)
      editingGroup.value = group ? { ...group } : null
    } else {
      editingGroup.value = {}
    }
  }

  const closeListEditor = () => {
    editingList.value = null
  }

  const closeGroupEditor = () => {
    editingGroup.value = null
  }

  const getListById = (listId: string) => {
    return lists.value.find((l) => l.id === listId)
  }

  const getGroupById = (groupId: string) => {
    return groups.value.find((g) => g.id === groupId)
  }

  const moveListToGroup = async (listId: string, groupId: string | null) => {
    return updateList(listId, { group_id: groupId })
  }

  // Initial load
  const init = () => {
    loadLists()
    loadGroups()
  }

  return {
    // State
    lists,
    groups,
    selectedListId,
    editingList,
    editingGroup,
    loading,
    error,

    // Getters
    selectedList,
    groupedLists,

    // Actions
    loadLists,
    loadGroups,
    createList,
    createGroup,
    updateList,
    updateGroup,
    deleteList,
    deleteGroup,
    selectList,
    openListEditor,
    openGroupEditor,
    closeListEditor,
    closeGroupEditor,
    getListById,
    getGroupById,
    moveListToGroup,
    init,
  }
})
