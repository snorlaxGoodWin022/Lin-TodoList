<template>
  <div class="quadrant-view">
    <div class="quadrant-header">
      <h1 class="page-title">艾森豪威尔矩阵</h1>
      <p class="page-subtitle">按重要性和紧急性分类任务</p>
    </div>

    <div class="quadrant-grid">
      <!-- 第一象限：重要且紧急 -->
      <div class="quadrant quadrant-1">
        <div class="quadrant-header">
          <h3 class="quadrant-title">重要且紧急</h3>
          <span class="quadrant-subtitle">立刻处理</span>
        </div>
        <div class="quadrant-content">
          <div v-if="quadrant1Tasks.length === 0" class="empty-state">
            <Icon icon="mdi:alert-circle-outline" class="empty-icon" />
            <p class="empty-text">没有任务</p>
          </div>
          <TaskCard
            v-for="task in quadrant1Tasks"
            :key="task.id"
            :task="task"
            @click="selectTask(task)"
          />
        </div>
      </div>

      <!-- 第二象限：重要不紧急 -->
      <div class="quadrant quadrant-2">
        <div class="quadrant-header">
          <h3 class="quadrant-title">重要不紧急</h3>
          <span class="quadrant-subtitle">计划处理</span>
        </div>
        <div class="quadrant-content">
          <div v-if="quadrant2Tasks.length === 0" class="empty-state">
            <Icon icon="mdi:calendar-check-outline" class="empty-icon" />
            <p class="empty-text">没有任务</p>
          </div>
          <TaskCard
            v-for="task in quadrant2Tasks"
            :key="task.id"
            :task="task"
            @click="selectTask(task)"
          />
        </div>
      </div>

      <!-- 第三象限：紧急不重要 -->
      <div class="quadrant quadrant-3">
        <div class="quadrant-header">
          <h3 class="quadrant-title">紧急不重要</h3>
          <span class="quadrant-subtitle">委派他人</span>
        </div>
        <div class="quadrant-content">
          <div v-if="quadrant3Tasks.length === 0" class="empty-state">
            <Icon icon="mdi:account-arrow-right-outline" class="empty-icon" />
            <p class="empty-text">没有任务</p>
          </div>
          <TaskCard
            v-for="task in quadrant3Tasks"
            :key="task.id"
            :task="task"
            @click="selectTask(task)"
          />
        </div>
      </div>

      <!-- 第四象限：不紧急不重要 -->
      <div class="quadrant quadrant-4">
        <div class="quadrant-header">
          <h3 class="quadrant-title">不紧急不重要</h3>
          <span class="quadrant-subtitle">尽量不做</span>
        </div>
        <div class="quadrant-content">
          <div v-if="quadrant4Tasks.length === 0" class="empty-state">
            <Icon icon="mdi:delete-outline" class="empty-icon" />
            <p class="empty-text">没有任务</p>
          </div>
          <TaskCard
            v-for="task in quadrant4Tasks"
            :key="task.id"
            :task="task"
            @click="selectTask(task)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import TaskCard from '../components/task/TaskCard.vue'
import { useTaskStore } from '../stores/task.store'

const taskStore = useTaskStore()

// 计算各个象限的任务
const quadrant1Tasks = computed(() => {
  return taskStore.tasks.filter((task) => task.quadrant === 1 && !task.completed)
})

const quadrant2Tasks = computed(() => {
  return taskStore.tasks.filter((task) => task.quadrant === 2 && !task.completed)
})

const quadrant3Tasks = computed(() => {
  return taskStore.tasks.filter((task) => task.quadrant === 3 && !task.completed)
})

const quadrant4Tasks = computed(() => {
  return taskStore.tasks.filter((task) => task.quadrant === 4 && !task.completed)
})

const selectTask = (task: any) => {
  taskStore.selectTask(task)
}
</script>

<style scoped>
.quadrant-view {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.quadrant-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.quadrant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: calc(100% - 100px);
}

.quadrant {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.quadrant:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.quadrant-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.quadrant-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.quadrant-subtitle {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.quadrant-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.quadrant-content::-webkit-scrollbar {
  width: 6px;
}

.quadrant-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.quadrant-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 0;
  color: var(--color-text-tertiary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-text {
  font-size: 14px;
}

/* 象限特定样式 */
.quadrant-1 {
  border-top: 4px solid var(--color-priority-high);
}

.quadrant-2 {
  border-top: 4px solid var(--color-primary);
}

.quadrant-3 {
  border-top: 4px solid var(--color-priority-medium);
}

.quadrant-4 {
  border-top: 4px solid var(--color-text-muted);
}

.quadrant-1 .quadrant-title {
  color: var(--color-priority-high);
}

.quadrant-2 .quadrant-title {
  color: var(--color-primary);
}

.quadrant-3 .quadrant-title {
  color: var(--color-priority-medium);
}

.quadrant-4 .quadrant-title {
  color: var(--color-text-muted);
}
</style>
