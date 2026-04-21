import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from '../../electron/database/repositories/tag.repo'

export const useTagStore = defineStore('tag', () => {
  // State
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const loadTags = async () => {
    try {
      loading.value = true
      const result = await window.electronAPI.getTags()
      tags.value = result
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tags'
      console.error('Error loading tags:', err)
    } finally {
      loading.value = false
    }
  }

  const createTag = async (tagData: Partial<Tag>) => {
    try {
      loading.value = true
      const newTag = await window.electronAPI.createTag(tagData)
      tags.value.unshift(newTag)
      error.value = null
      return newTag
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create tag'
      console.error('Error creating tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateTag(id, updates)
      if (success) {
        const index = tags.value.findIndex(tag => tag.id === id)
        if (index !== -1) {
          tags.value[index] = { ...tags.value[index], ...updates }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update tag'
      console.error('Error updating tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTag = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteTag(id)
      if (success) {
        tags.value = tags.value.filter(tag => tag.id !== id)
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete tag'
      console.error('Error deleting tag:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initial load
  const init = () => {
    loadTags()
  }

  return {
    // State
    tags,
    loading,
    error,

    // Actions
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    init
  }
})