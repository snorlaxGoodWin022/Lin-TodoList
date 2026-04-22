<template>
  <div class="today-view">
    <div class="view-header">
      <h1 class="view-title">今天</h1>
      <div class="view-subtitle">
        <span class="date">{{ formattedDate }}</span>
        <span class="task-count">{{ pendingTasks.length }} 个任务</span>
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="batchSelectMode" class="batch-action-bar">
      <span class="selected-count">已选择 {{ selectedCount }} 项</span>
      <button class="btn btn-secondary" @click="selectAll">全选</button>
      <button class="btn btn-secondary" @click="batchComplete">标记完成</button>
      <button class="btn btn-secondary" @click="batchMove">移动到</button>
      <button class="btn btn-danger" @click="batchDelete">删除</button>
      <button class="btn btn-text" @click="cancelBatch">取消</button>
    </div>

    <div class="view-content">
      <div v-if="overdueTasks.length > 0" class="overdue-section">
        <h2 class="section-title">过期任务</h2>
        <draggable
          v-model="overdueTasks"
          item-key="id"
          class="task-list"
          ghost-class="ghost"
          data-section="overdue"
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

      <div class="today-section">
        <div class="section-header">
          <h2 class="section-title">今天到期</h2>
          <button
            v-if="!batchSelectMode && pendingTasks.length > 0"
            class="btn btn-text"
            @click="startBatchSelect"
          >
            多选
          </button>
        </div>
        <draggable
          v-model="todayTasks"
          item-key="id"
          class="task-list"
          ghost-class="ghost"
          data-section="today"
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
        <div class="empty-icon">📅</div>
        <h3 class="empty-title">没有任务</h3>
        <p class="empty-description">今天很轻松，享受你的时间！</p>
        <button class="btn btn-primary" @click="createTask">创建新任务</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useTask } from '../composables/useTask'
import { useList } from '../composables/useList'
import { useTaskStore } from '../stores/task.store'
import TaskCard from '../components/task/TaskCard.vue'

const task = useTask()
const list = useList()
const taskStore = useTaskStore()

// Batch mode
const batchSelectMode = computed(() => taskStore.batchSelectMode)
const selectedCount = computed(() => taskStore.selectedTaskIds.size)

const startBatchSelect = () => {
  taskStore.toggleBatchSelectMode()
}

const selectAll = () => {
  taskStore.selectAllTasks()
}

const batchComplete = () => {
  taskStore.batchCompleteTasks(true)
}

const batchMove = () => {
  const targetListId = prompt('请输入目标清单ID:')
  if (targetListId) {
    taskStore.batchMoveTasks(targetListId)
  }
}

const batchDelete = () => {
  if (confirm(`确定要删除选中的 ${selectedCount.value} 个任务吗？此操作不可撤销。`)) {
    taskStore.batchDeleteTasks()
  }
}

const cancelBatch = () => {
  taskStore.toggleBatchSelectMode()
}

// Computed properties
const formattedDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const pendingTasks = computed(() => task.pendingTasks.value)
const completedTasks = computed(() => task.completedTasks.value)
const todayTasks = computed(() => task.todayTasks.value)
const overdueTasks = computed(() => task.overdueTasks.value)
const totalTasks = computed(() => task.tasks.value.length)

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

const onDragEnd = async (event: any) => {
  const { from, to, oldIndex, newIndex } = event

  // If nothing moved, skip
  if (oldIndex === newIndex && from === to) return

  const section = from.dataset?.section
  if (!section) return

  try {
    // Get the tasks array for this section
    const tasks = section === 'overdue' ? overdueTasks.value : todayTasks.value

    // Update sort_order for all tasks in the section based on their current order
    for (let i = 0; i < tasks.length; i++) {
      const sortOrder = (i + 1) * 1000
      if (tasks[i].sort_order !== sortOrder) {
        await task.updateTask(tasks[i].id, { sort_order: sortOrder })
      }
    }
  } catch (err) {
    console.error('Error updating task order:', err)
  }
}

// Lifecycle
onMounted(() => {
  task.init()
  list.init()
})
</script>

<style scoped>
.today-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  margin-bottom: var(--spacing-xl);
}

.batch-action-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.selected-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-right: auto;
}

.view-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.view-subtitle {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.date {
  font-weight: var(--font-weight-medium);
}

.task-count {
  padding: 2px 8px;
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
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
  display: inline-block;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--spacing-xl) 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.section-header .section-title {
  margin: 0;
  padding: 0;
  border: none;
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

.btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-border-hover);
}

.btn-danger {
  background-color: var(--color-priority-high);
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: var(--color-priority-high);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
}

.btn-text:hover {
  color: var(--color-primary);
}
</style>
