<template>
  <div class="today-view">
    <div class="view-header">
      <h1 class="view-title">今天</h1>
      <div class="view-subtitle">
        <span class="date">{{ formattedDate }}</span>
        <span class="task-count">{{ pendingTasks.length }} 个任务</span>
      </div>
    </div>

    <div class="view-content">
      <div class="overdue-section" v-if="overdueTasks.length > 0">
        <h2 class="section-title">过期任务</h2>
        <div class="task-list">
          <TaskCard
            v-for="task in overdueTasks"
            :key="task.id"
            :task="task"
            @select="selectTask"
            @toggle="toggleTaskCompletion(task.id, !task.completed)"
          />
        </div>
      </div>

      <div class="today-section">
        <h2 class="section-title">今天到期</h2>
        <div class="task-list">
          <TaskCard
            v-for="task in todayTasks"
            :key="task.id"
            :task="task"
            @select="selectTask"
            @toggle="toggleTaskCompletion(task.id, !task.completed)"
          />
        </div>
      </div>

      <div class="completed-section" v-if="completedTasks.length > 0">
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

      <div class="empty-state" v-if="totalTasks === 0">
        <div class="empty-icon">📅</div>
        <h3 class="empty-title">没有任务</h3>
        <p class="empty-description">今天很轻松，享受你的时间！</p>
        <button class="btn btn-primary" @click="createTask">
          创建新任务
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTask } from '../composables/useTask'
import { useList } from '../composables/useList'
import TaskCard from '../components/task/TaskCard.vue'

const task = useTask()
const list = useList()

// Computed properties
const formattedDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const pendingTasks = computed(() => task.pendingTasks)
const completedTasks = computed(() => task.completedTasks)
const todayTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return task.pendingTasks.filter(t => t.due_date === today)
})
const overdueTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return task.pendingTasks.filter(t => t.due_date && t.due_date < today)
})
const totalTasks = computed(() => task.tasks.length)

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
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
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
</style>