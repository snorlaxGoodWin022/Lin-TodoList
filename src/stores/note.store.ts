import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Note, NoteFilters } from '../../electron/database/repositories/note.repo'

export const useNoteStore = defineStore('note', () => {
  // State
  const notes = ref<Note[]>([])
  const editingNote = ref<Partial<Note> | null>(null)
  const filters = ref<NoteFilters>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const pinnedNotes = computed(() => notes.value.filter(note => note.pinned === 1))
  const unpinnedNotes = computed(() => notes.value.filter(note => note.pinned === 0))

  // Actions
  const loadNotes = async (newFilters?: NoteFilters) => {
    try {
      loading.value = true
      if (newFilters) {
        filters.value = newFilters
      }
      const result = await window.electronAPI.getNotes(filters.value)
      notes.value = result
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load notes'
      console.error('Error loading notes:', err)
    } finally {
      loading.value = false
    }
  }

  const createNote = async (noteData: Partial<Note>) => {
    try {
      loading.value = true
      const newNote = await window.electronAPI.createNote(noteData)
      notes.value.unshift(newNote)
      error.value = null
      return newNote
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create note'
      console.error('Error creating note:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      loading.value = true
      const success = await window.electronAPI.updateNote(id, updates)
      if (success) {
        const index = notes.value.findIndex(note => note.id === id)
        if (index !== -1) {
          notes.value[index] = { ...notes.value[index], ...updates }
        }
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update note'
      console.error('Error updating note:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteNote = async (id: string) => {
    try {
      loading.value = true
      const success = await window.electronAPI.deleteNote(id)
      if (success) {
        notes.value = notes.value.filter(note => note.id !== id)
      }
      error.value = null
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete note'
      console.error('Error deleting note:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const togglePin = async (id: string, pinned: boolean) => {
    try {
      return await updateNote(id, { pinned: pinned ? 1 : 0 })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to toggle pin'
      console.error('Error toggling pin:', err)
      throw err
    }
  }

  const searchNotes = (query: string) => {
    filters.value.search = query
    loadNotes()
  }

  const clearSearch = () => {
    delete filters.value.search
    loadNotes()
  }

  const openNoteEditor = (noteId?: string) => {
    if (noteId) {
      const note = notes.value.find(n => n.id === noteId)
      editingNote.value = note ? { ...note } : null
    } else {
      editingNote.value = {}
    }
  }

  const closeNoteEditor = () => {
    editingNote.value = null
  }

  // Initial load
  const init = () => {
    loadNotes()
  }

  return {
    // State
    notes,
    editingNote,
    filters,
    loading,
    error,

    // Getters
    pinnedNotes,
    unpinnedNotes,

    // Actions
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    clearSearch,
    openNoteEditor,
    closeNoteEditor,
    init
  }
})