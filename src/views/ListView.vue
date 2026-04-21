<template>
  <div class="list-view">
    <div class="view-header">
      <div class="list-info">
        <div class="list-icon" :style="{ color: currentList?.color || '#10B981' }">
          <span class="icon">{{ currentList?.icon || '📝' }}</span>
        </div>
        <div>
          <h1 class="view-title">{{ currentList?.name || '加载中...' }}</h1>
          <div class="list-stats">
            <span class="stat">{{ pendingTasks.length }} 个待办</span>
            <span class="stat">{{ completedTasks.length }} 个已完成</span>
          </div>
        </div>
      </div>
      <div class="list-actions">
        <button class="btn btn-icon" @click="editList">
          <span class="icon">✏️</span>
          编辑
        </button>
        <button class="btn btn-primary" @click="createTask">
          <span class="icon">➕</span>
          添加任务
        </button>
      </div>
    </div>

    <div class="view-content">
      <div v-if="pendingTasks.length > 0" class="pending-section">
        <h2 class="section-title">待办事项</h2>
        <draggable
          v-model="pendingTaskList"
          item-key="id"
          class="task-list"
          ghost-class="ghost"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <TaskCard
              :task="element"
              @select="selectTask"
              @toggle="toggleTaskCompletion(element.id, !element.completed)"
            />
          </template>
        </draggable>
      </div>

      <div v-if="completedTasks.length > 0" class="completed-section">
        <h2 class="section-title">已完成</h2>
        <div class="task-list">
          <TaskCard
            v-for="task in completedTasks"
            :key="task.id"
            :task="task"
            @select="selectTask"
            @toggle="toggleTaskCompletion(task.id, !task.completed)"
          />
        </div>
      </div>

      <div v-if="totalTasks === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3 class="empty-title">清单为空</h3>
        <p class="empty-description">添加第一个任务开始使用</p>
        <button class="btn btn-primary" @click="createTask">
          创建新任务
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { useTask } from '../composables/useTask'
import { useList } from '../composables/useList'
import TaskCard from '../components/task/TaskCard.vue'

const route = useRoute()
const task = useTask()
const list = useList()

// Get list ID from route params
const listId = computed(() => route.params.id as string)

// Computed properties
const currentList = computed(() => list.getListById(listId.value))
const pendingTasks = computed(() => {
  return task.pendingTasks.filter(t => t.list_id === listId.value)
})
const completedTasks = computed(() => {
  return task.completedTasks.filter(t => t.list_id === listId.value)
})
const totalTasks = computed(() => pendingTasks.value.length + completedTasks.value.length)

const pendingTaskList = computed({
  get: () => pendingTasks.value,
  set: () => {}
})

// Watch for list ID changes
watch(listId, (newId) => {
  if (newId) {
    list.selectList(newId)
    loadListTasks()
  }
})

// Actions
const selectTask = (taskItem: any) => {
  task.selectTask(taskItem)
}

const toggleTaskCompletion = (id: string, completed: boolean) => {
  task.toggleTaskCompletion(id, completed)
}

const createTask = () => {
  task.openTaskEditor()
}

const editList = () => {
  if (currentList.value) {
    list.openListEditor(currentList.value.id)
  }
}

const loadListTasks = () => {
  task.loadTasks({ list_id: listId.value })
}

const onDragEnd = () => {
  // Update task sort orders after drag
}

// Lifecycle
onMounted(() => {
  task.init()
  list.init()

  if (listId.value) {
    list.selectList(listId.value)
    loadListTasks()
  }
})
</script>

<style scoped>
.list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
}

.list-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.list-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  background-color: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.list-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: 2px 8px;
  background-color: var(--color-bg);
  border-radius: var(--radius-full);
}

.list-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
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

.btn-icon {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-icon:hover {
  background-color: var(--color-primary-bg);
  border-color: var(--color-primary);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.view-content {
  flex: 1;
  overflow: auto;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-height: 10px;
}

.task-list.ghost {
  opacity: 0.5;
  background: var(--color-primary-light);
  border-radius: 8px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.empty-description {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xl);
  max-width: 300px;
}
</style>