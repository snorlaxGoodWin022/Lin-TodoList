<template>
  <div class="kanban-view">
    <div class="view-header">
      <h1 class="view-title">看板</h1>
      <div class="view-actions">
        <button class="btn btn-primary" @click="createTask"><span>+</span> 新建任务</button>
      </div>
    </div>

    <div class="kanban-board">
      <div v-for="column in columns" :key="column.id" class="kanban-column">
        <div class="column-header">
          <div class="column-title-wrapper">
            <span class="column-icon">{{ column.icon }}</span>
            <h3 class="column-title">{{ column.label }}</h3>
            <span class="column-count">{{ getColumnTasks(column.id).length }}</span>
          </div>
        </div>
        <draggable
          :list="getColumnTasks(column.id)"
          group="kanban"
          item-key="id"
          class="column-content"
          ghost-class="ghost"
          @end="onDragEnd($event, column.id)"
        >
          <template #item="{ element }">
            <div
              class="kanban-card"
              :class="`priority-${element.priority}`"
              @click="selectTask(element)"
            >
              <div class="card-priority">
                <span class="priority-dot"></span>
              </div>
              <div class="card-content">
                <h4 class="card-title">{{ element.title }}</h4>
                <div v-if="element.due_date" class="card-meta">
                  <span class="due-date">
                    {{ formatDate(element.due_date) }}
                  </span>
                </div>
                <div v-if="element.list_id" class="card-list">
                  {{ getListName(element.list_id) }}
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useTask } from '../composables/useTask'
import { useList } from '../composables/useList'
import type { Task } from '../types/repositories'

const task = useTask()
const list = useList()

interface KanbanColumn {
  id: number
  label: string
  icon: string
}

const columns: KanbanColumn[] = [
  { id: 0, label: '待办', icon: '📋' },
  { id: 1, label: '进行中', icon: '🔄' },
  { id: 2, label: '已完成', icon: '✅' },
]

const allTasks = computed(() => task.tasks.value)

const getColumnTasks = (columnId: number) => {
  if (columnId === 2) {
    // Done column shows completed tasks
    return allTasks.value.filter((t) => t.completed === 1)
  }
  // 0 = Todo, 1 = In Progress - show uncompleted tasks by kanban_column
  return allTasks.value.filter((t) => t.completed === 0 && t.kanban_column === columnId)
}

const getListName = (listId: string) => {
  const foundList = list.lists.value.find((l) => l.id === listId)
  return foundList ? foundList.name : ''
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const selectTask = (t: Task) => {
  task.selectTask(t)
}

const createTask = () => {
  task.openTaskEditor()
}

const onDragEnd = async (event: any, newColumnId: number) => {
  const { oldIndex, newIndex, item } = event
  if (oldIndex === newIndex) return

  // Find the task that was moved
  const taskId = item.dataset?.id || (event.data as any)?.id
  if (!taskId) return

  try {
    // Update the task's kanban_column
    await task.updateTask(taskId, { kanban_column: newColumnId })
  } catch (err) {
    console.error('Error updating task kanban_column:', err)
  }
}

// Initialize
onMounted(() => {
  task.init()
  list.init()
})
</script>

<style scoped>
.kanban-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.kanban-board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  overflow: hidden;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.column-header {
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.column-title-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.column-icon {
  font-size: var(--font-size-lg);
}

.column-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.column-count {
  background-color: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.column-content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 200px;
}

.kanban-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  gap: var(--spacing-sm);
}

.kanban-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.kanban-card.ghost {
  opacity: 0.5;
  background: var(--color-primary-light);
}

.card-priority {
  flex-shrink: 0;
  padding-top: 4px;
}

.priority-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.priority-0 .priority-dot {
  background-color: var(--color-priority-none);
}
.priority-1 .priority-dot {
  background-color: var(--color-priority-low);
}
.priority-2 .priority-dot {
  background-color: var(--color-priority-medium);
}
.priority-3 .priority-dot {
  background-color: var(--color-priority-high);
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.due-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.card-list {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}
</style>
