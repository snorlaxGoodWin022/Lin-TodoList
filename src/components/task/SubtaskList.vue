<template>
  <div class="subtask-list">
    <div class="subtask-header">
      <span class="subtask-title">子任务</span>
      <span class="subtask-count">{{ completedCount }}/{{ subtasks.length }}</span>
    </div>

    <div class="subtask-items">
      <div
        v-for="subtask in subtasks"
        :key="subtask.id"
        class="subtask-item"
        :class="{ completed: subtask.completed }"
      >
        <button
          class="checkbox"
          :class="{ checked: subtask.completed }"
          @click="toggleSubtask(subtask)"
        >
          <span v-if="subtask.completed" class="checkmark">✓</span>
        </button>
        <span class="subtask-title" @dblclick="startEdit(subtask)">{{ subtask.title }}</span>
        <input
          v-if="editingId === subtask.id"
          v-model="editingText"
          class="edit-input"
          @blur="finishEdit(subtask)"
          @keyup.enter="finishEdit(subtask)"
          @keyup.escape="cancelEdit"
        />
        <button class="delete-btn" @click="removeSubtask(subtask.id)">×</button>
      </div>
    </div>

    <div class="add-subtask">
      <input
        v-model="newSubtaskTitle"
        type="text"
        class="add-input"
        placeholder="添加子任务..."
        @keyup.enter="addSubtask"
      />
      <button class="add-btn" @click="addSubtask" :disabled="!newSubtaskTitle.trim()">添加</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSubtask } from '../../composables/useSubtask'
import type { Subtask } from '../../types/repositories'

const props = defineProps<{
  parentId: string
}>()

const {
  getSubtasksByParentId,
  loadSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  toggleSubtaskCompletion,
} = useSubtask()

const subtasksRef = getSubtasksByParentId(props.parentId)
const subtasks = computed(() => subtasksRef.value)

const newSubtaskTitle = ref('')
const editingId = ref<string | null>(null)
const editingText = ref('')

const completedCount = computed(() => {
  return subtasks.value.filter((s) => s.completed).length
})

const addSubtask = async () => {
  if (!newSubtaskTitle.value.trim()) return

  try {
    await createSubtask(props.parentId, newSubtaskTitle.value.trim())
    newSubtaskTitle.value = ''
  } catch (err) {
    console.error('Error adding subtask:', err)
  }
}

const toggleSubtask = async (subtask: Subtask) => {
  try {
    await toggleSubtaskCompletion(subtask.id, !subtask.completed)
  } catch (err) {
    console.error('Error toggling subtask:', err)
  }
}

const startEdit = (subtask: Subtask) => {
  editingId.value = subtask.id
  editingText.value = subtask.title
}

const finishEdit = async (subtask: Subtask) => {
  if (!editingText.value.trim()) {
    cancelEdit()
    return
  }

  try {
    await updateSubtask(subtask.id, { title: editingText.value.trim() })
    editingId.value = null
    editingText.value = ''
  } catch (err) {
    console.error('Error updating subtask:', err)
  }
}

const cancelEdit = () => {
  editingId.value = null
  editingText.value = ''
}

const removeSubtask = async (id: string) => {
  try {
    await deleteSubtask(id)
  } catch (err) {
    console.error('Error deleting subtask:', err)
  }
}

// Load subtasks when parent changes
watch(
  () => props.parentId,
  (newId) => {
    if (newId) {
      loadSubtasks(newId)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.subtask-list {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.subtask-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.subtask-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.subtask-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.subtask-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.subtask-item:hover {
  background-color: var(--color-bg);
}

.subtask-item.completed .subtask-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.checkbox:hover {
  border-color: var(--color-primary);
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkmark {
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.subtask-item .subtask-title {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.edit-input {
  flex: 1;
  padding: var(--spacing-xs);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-lg);
  padding: 0 var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.subtask-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-priority-high);
}

.add-subtask {
  display: flex;
  gap: var(--spacing-sm);
}

.add-input {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.add-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.add-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.add-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
