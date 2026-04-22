import { ref, computed } from 'vue'
import { useListStore } from '../stores/list.store'
import type { List } from '../types/repositories'

export function useList() {
  const listStore = useListStore()

  // State
  const editingList = ref<Partial<List> | null>(null)
  const isEditing = computed(() => editingList.value !== null)

  // Computed
  const lists = computed(() => listStore.lists)
  const selectedList = computed(() => listStore.selectedList)
  const selectedListId = computed(() => listStore.selectedListId)

  // Get list by ID
  const getListById = (id: string) => {
    return listStore.lists.find((list) => list.id === id)
  }

  // Actions
  const loadLists = async () => {
    return listStore.loadLists()
  }

  const createList = async (listData: Partial<List>) => {
    const newList = await listStore.createList(listData)
    return newList
  }

  const updateList = async (id: string, updates: Partial<List>) => {
    return listStore.updateList(id, updates)
  }

  const deleteList = async (id: string) => {
    return listStore.deleteList(id)
  }

  const selectList = (listId: string) => {
    listStore.selectList(listId)
  }

  // List editor
  const openListEditor = (listId?: string) => {
    if (listId) {
      const list = listStore.lists.find((l) => l.id === listId)
      editingList.value = list ? { ...list } : { id: listId }
    } else {
      editingList.value = {
        name: '',
        color: '#10B981',
        icon: 'list',
      }
    }
  }

  const closeListEditor = () => {
    editingList.value = null
  }

  const saveList = async () => {
    if (!editingList.value) return

    const { id, ...updates } = editingList.value

    if (id) {
      // Update existing list
      await updateList(id, updates)
    } else {
      // Create new list
      await createList(updates)
    }

    closeListEditor()
  }

  // Initialize
  const init = () => {
    listStore.init()
  }

  return {
    // State
    lists,
    selectedList,
    selectedListId,
    editingList,
    isEditing,

    // Actions
    loadLists,
    createList,
    updateList,
    deleteList,
    selectList,
    openListEditor,
    closeListEditor,
    saveList,
    getListById,
    init,
  }
}
