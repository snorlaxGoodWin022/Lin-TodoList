import { ref, computed } from 'vue'
import { useNoteStore } from '../stores/note.store'
import type { Note, NoteFilters } from '../types/repositories'

export function useNote() {
  const noteStore = useNoteStore()

  // State
  const editingNote = ref<Partial<Note> | null>(null)
  const isEditing = computed(() => editingNote.value !== null)
  const previewNote = ref<Note | null>(null)

  // Filters
  const filters = ref<NoteFilters>({})

  // Computed
  const notes = computed(() => noteStore.notes)
  const pinnedNotes = computed(() => noteStore.pinnedNotes)
  const unpinnedNotes = computed(() => noteStore.unpinnedNotes)

  // Search
  const searchQuery = ref('')

  // Actions
  const loadNotes = async (newFilters?: NoteFilters) => {
    if (newFilters) {
      filters.value = newFilters
    }
    return noteStore.loadNotes(filters.value)
  }

  const createNote = async (noteData: Partial<Note>) => {
    const newNote = await noteStore.createNote(noteData)
    return newNote
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    return noteStore.updateNote(id, updates)
  }

  const deleteNote = async (id: string) => {
    return noteStore.deleteNote(id)
  }

  const togglePin = async (id: string) => {
    const note = noteStore.notes.find((n) => n.id === id)
    if (note) {
      return noteStore.togglePin(id, !note.pinned)
    }
  }

  // Note editor
  const openNoteEditor = (noteId?: string) => {
    if (noteId) {
      const note = noteStore.notes.find((n) => n.id === noteId)
      editingNote.value = note ? { ...note } : { id: noteId }
    } else {
      editingNote.value = {
        title: '',
        content: '',
        color: '#FFFFFF',
        pinned: 0,
        sort_order: Date.now(),
      }
    }
  }

  const closeNoteEditor = () => {
    editingNote.value = null
  }

  const saveNote = async () => {
    if (!editingNote.value) return

    const { id, ...updates } = editingNote.value

    if (id) {
      // Update existing note
      await updateNote(id, updates)
    } else {
      // Create new note
      await createNote(updates)
    }

    closeNoteEditor()
  }

  // Preview
  const openPreview = (note: Note) => {
    previewNote.value = note
  }

  const closePreview = () => {
    previewNote.value = null
  }

  // Search
  const search = (query: string) => {
    searchQuery.value = query
    noteStore.searchNotes(query)
  }

  const clearSearch = () => {
    searchQuery.value = ''
    noteStore.clearSearch()
  }

  // Color management
  const noteColors = [
    '#FFFFFF', // White
    '#FEF3C7', // Yellow
    '#DCFCE7', // Green
    '#E0F2FE', // Blue
    '#F3E8FF', // Purple
    '#FFE4E6', // Pink
    '#FEF9C3', // Light Yellow
    '#D1FAE5', // Light Green
    '#CFFAFE', // Light Blue
    '#FCE7F3', // Light Pink
  ]

  const setNoteColor = async (noteId: string, color: string) => {
    return updateNote(noteId, { color })
  }

  // Sorting
  const sortNotes = (notes: Note[]) => {
    return [...notes].sort((a, b) => {
      // Pinned notes first
      if (a.pinned !== b.pinned) {
        return b.pinned - a.pinned
      }
      // Then by sort_order
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order
      }
      // Then by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  // Initialize
  const init = () => {
    noteStore.init()
  }

  return {
    // State
    notes,
    pinnedNotes,
    unpinnedNotes,
    editingNote,
    isEditing,
    previewNote,
    searchQuery,
    filters,
    noteColors,

    // Actions
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    openNoteEditor,
    closeNoteEditor,
    saveNote,
    openPreview,
    closePreview,
    search,
    clearSearch,
    setNoteColor,
    sortNotes,
    init,
  }
}
