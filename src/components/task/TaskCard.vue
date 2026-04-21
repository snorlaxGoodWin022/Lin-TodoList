<template>
  <div
    class="task-card"
    :class="{ selected: isSelected, completed: task.completed, 'batch-mode': batchSelectMode }"
    @click="handleClick"
  >
    <div class="task-content">
      <div class="task-checkbox" @click.stop="handleCheckboxClick">
        <div v-if="batchSelectMode" class="checkbox" :class="{ checked: isSelected }">
          <span v-if="isSelected" class="checkmark">✓</span>
        </div>
        <div v-else class="checkbox" :class="{ checked: task.completed }">
          <span v-if="task.completed" class="checkmark">✓</span>
        </div>
      </div>
      <div class="task-details">
        <div class="task-header">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="task-meta">
            <span v-if="task.due_date" class="due-date">
              <span class="icon">📅</span>
              {{ formatDate(task.due_date) }}
            </span>
            <span v-if="task.start_time" class="start-time">
              <span class="icon">⏰</span>
              {{ task.start_time.substring(0, 5) }}
            </span>
          </div>
        </div>
        <div v-if="task.description" class="task-description">
          {{ task.description }}
        </div>
        <div class="task-tags">
          <span
            v-for="tag in taskTags"
            :key="tag.id"
            class="tag"
            :style="{ backgroundColor: tag.color + '20', color: tag.color }"
          >
            {{ tag.name }}
          </span>
          <span v-if="task.priority > 0" class="priority-tag" :class="`priority-${task.priority}`">
            {{ priorityText }}
          </span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-icon" @click.stop="editTask">
          <span class="icon">✏️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '../../types/repositories'
import { useTag } from '../../composables/useTag'
import { useTaskStore } from '../../stores/task.store'

const props = defineProps<{
  task: Task
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [task: Task]
  toggle: [id: string, completed: boolean]
}>()

const tag = useTag()
const taskStore = useTaskStore()

// Computed properties
const isSelected = computed(() => props.selected || taskStore.selectedTaskIds.has(props.task.id))
const batchSelectMode = computed(() => taskStore.batchSelectMode)
const priorityText = computed(() => {
  const priorities = ['无', '低', '中', '高']
  return priorities[props.task.priority || 0]
})
const taskTags = computed(() => {
  return tag.getTaskTags(props.task.tags || '[]')
})

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// Actions
const handleClick = () => {
  if (batchSelectMode.value) {
    taskStore.toggleTaskSelection(props.task.id)
  } else {
    emit('select', props.task)
  }
}

const handleCheckboxClick = () => {
  if (batchSelectMode.value) {
    taskStore.toggleTaskSelection(props.task.id)
  } else {
    toggleCompletion()
  }
}

const toggleCompletion = () => {
  emit('toggle', props.task.id, !props.task.completed)
}

const editTask = () => {
  taskStore.openTaskEditor(props.task.id)
}
</script>

<style scoped>
.task-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.task-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.task-card.selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
}

.task-card.completed {
  opacity: 0.7;
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.task-card.batch-mode {
  cursor: pointer;
}

.task-card.batch-mode:hover {
  border-color: var(--color-primary);
}

.task-card.batch-mode.selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.task-checkbox {
  flex-shrink: 0;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.checkbox:hover {
  border-color: var(--color-primary);
}

.checkbox.checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkmark {
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.task-details {
  flex: 1;
  min-width: 0;
}

.task-header {
  margin-bottom: var(--spacing-xs);
}

.task-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  word-break: break-word;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.icon {
  font-size: var(--font-size-xs);
  margin-right: 4px;
}

.task-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin-bottom: var(--spacing-sm);
  word-break: break-word;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.priority-tag {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  color: white;
}

.priority-tag.priority-1 {
  background-color: var(--color-priority-low);
}

.priority-tag.priority-2 {
  background-color: var(--color-priority-medium);
}

.priority-tag.priority-3 {
  background-color: var(--color-priority-high);
}

.task-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.task-card:hover .task-actions {
  opacity: 1;
}

.btn-icon {
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--color-bg);
  color: var(--color-primary);
}
</style>