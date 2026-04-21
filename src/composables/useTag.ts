import { ref, computed } from 'vue'
import { useTagStore } from '../stores/tag.store'
import type { Tag } from '../types/repositories'

export function useTag() {
  const tagStore = useTagStore()

  // State
  const editingTag = ref<Partial<Tag> | null>(null)
  const isEditing = computed(() => editingTag.value !== null)

  // Computed
  const tags = computed(() => tagStore.tags)

  // Color palette for tags
  const tagColors = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#84CC16'  // Lime
  ]

  // Get random color from palette
  const getRandomColor = () => {
    return tagColors[Math.floor(Math.random() * tagColors.length)]
  }

  // Actions
  const loadTags = async () => {
    return tagStore.loadTags()
  }

  const createTag = async (tagData: Partial<Tag>) => {
    const newTag = await tagStore.createTag(tagData)
    return newTag
  }

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    return tagStore.updateTag(id, updates)
  }

  const deleteTag = async (id: string) => {
    return tagStore.deleteTag(id)
  }

  // Tag editor
  const openTagEditor = (tagId?: string) => {
    if (tagId) {
      const tag = tagStore.tags.find(t => t.id === tagId)
      editingTag.value = tag ? { ...tag } : { id: tagId }
    } else {
      editingTag.value = {
        name: '',
        color: getRandomColor()
      }
    }
  }

  const closeTagEditor = () => {
    editingTag.value = null
  }

  const saveTag = async () => {
    if (!editingTag.value) return

    const { id, ...updates } = editingTag.value

    if (id) {
      // Update existing tag
      await updateTag(id, updates)
    } else {
      // Create new tag
      await createTag(updates)
    }

    closeTagEditor()
  }

  // Get tags for task
  const getTaskTags = (taskTagsJson: string) => {
    try {
      const tagIds = JSON.parse(taskTagsJson || '[]')
      return tagStore.tags.filter(tag => tagIds.includes(tag.id))
    } catch {
      return []
    }
  }

  // Add tag to task
  const addTagToTask = (taskTagsJson: string, tagId: string) => {
    try {
      const tagIds = JSON.parse(taskTagsJson || '[]')
      if (!tagIds.includes(tagId)) {
        tagIds.push(tagId)
      }
      return JSON.stringify(tagIds)
    } catch {
      return JSON.stringify([tagId])
    }
  }

  // Remove tag from task
  const removeTagFromTask = (taskTagsJson: string, tagId: string) => {
    try {
      const tagIds = JSON.parse(taskTagsJson || '[]')
      const filteredIds = tagIds.filter((id: string) => id !== tagId)
      return JSON.stringify(filteredIds)
    } catch {
      return JSON.stringify([])
    }
  }

  // Initialize
  const init = () => {
    tagStore.init()
  }

  return {
    // State
    tags,
    editingTag,
    isEditing,
    tagColors,

    // Actions
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    openTagEditor,
    closeTagEditor,
    saveTag,
    getTaskTags,
    addTagToTask,
    removeTagFromTask,
    getRandomColor,
    init
  }
}