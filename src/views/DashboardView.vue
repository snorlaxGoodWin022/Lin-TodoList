<template>
  <div class="dashboard-view">
    <div class="view-header">
      <h1 class="view-title">统计</h1>
      <div class="period-selector">
        <button
          v-for="p in periods"
          :key="p.value"
          class="btn"
          :class="{ active: selectedPeriod === p.value }"
          @click="selectedPeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <span class="stat-value">{{ taskStats.total }}</span>
            <span class="stat-label">总任务</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ taskStats.completed }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-value">{{ taskStats.pending }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <span class="stat-value">{{ completionRate }}%</span>
            <span class="stat-label">完成率</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <!-- Weekly Trend -->
        <div class="chart-card">
          <h3 class="chart-title">本周完成任务趋势</h3>
          <div class="bar-chart">
            <div v-for="(day, index) in weekDays" :key="index" class="bar-wrapper">
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{ height: getDayBarHeight(day.count) + '%' }"
                  :class="{ today: isToday(day.date) }"
                >
                  <span v-if="day.count > 0" class="bar-value">{{ day.count }}</span>
                </div>
              </div>
              <span class="bar-label">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- Priority Distribution -->
        <div class="chart-card">
          <h3 class="chart-title">优先级分布</h3>
          <div class="priority-bars">
            <div v-for="p in priorityDistribution" :key="p.value" class="priority-row">
              <span class="priority-label">{{ p.label }}</span>
              <div class="priority-bar-wrapper">
                <div
                  class="priority-bar"
                  :class="`priority-${p.value}`"
                  :style="{ width: p.percentage + '%' }"
                />
              </div>
              <span class="priority-count">{{ p.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Habit Stats -->
      <div class="habit-section">
        <h3 class="section-title">习惯达成率</h3>
        <div class="habit-grid">
          <div v-for="habit in habitStats" :key="habit.id" class="habit-card">
            <div class="habit-header">
              <span class="habit-icon">{{ habit.icon }}</span>
              <span class="habit-name">{{ habit.name }}</span>
            </div>
            <div class="habit-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: habit.weeklyRate + '%' }" />
              </div>
              <span class="progress-text">{{ habit.weeklyRate }}%</span>
            </div>
            <div class="habit-detail">
              本周 {{ habit.weeklyCompleted }}/{{ habit.weeklyTotal }} 天
            </div>
          </div>
          <div v-if="habitStats.length === 0" class="empty-habits">暂无习惯数据</div>
        </div>
      </div>

      <!-- Lists Distribution -->
      <div class="lists-section">
        <h3 class="section-title">清单分布</h3>
        <div class="lists-grid">
          <div v-for="list in listStats" :key="list.id" class="list-card">
            <div class="list-header">
              <span class="list-icon" :style="{ color: list.color }">{{ list.icon }}</span>
              <span class="list-name">{{ list.name }}</span>
            </div>
            <div class="list-count">{{ list.taskCount }} 个任务</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/task.store'
import { useHabitStore } from '../stores/habit.store'
import { useListStore } from '../stores/list.store'

const taskStore = useTaskStore()
const habitStore = useHabitStore()
const listStore = useListStore()

const periods = [
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'all', label: '全部' },
]

const selectedPeriod = ref('week')

// Task Statistics
const taskStats = computed(() => {
  const tasks = taskStore.tasks
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed
  return { total, completed, pending }
})

const completionRate = computed(() => {
  if (taskStats.value.total === 0) return 0
  return Math.round((taskStats.value.completed / taskStats.value.total) * 100)
})

// Weekly Trend
const weekDays = computed(() => {
  const days = []
  const today = new Date()
  const dayOfWeek = today.getDay()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - dayOfWeek + i)
    const dateStr = date.toISOString().split('T')[0]

    const count = taskStore.tasks.filter((t) => {
      if (!t.completed_at) return false
      const completedDate = t.completed_at.split('T')[0]
      return completedDate === dateStr
    }).length

    days.push({
      date,
      dateStr,
      count,
      label: ['日', '一', '二', '三', '四', '五', '六'][i],
    })
  }

  return days
})

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const getDayBarHeight = (count: number) => {
  const max = Math.max(...weekDays.value.map((d) => d.count), 1)
  return (count / max) * 100
}

// Priority Distribution
const priorityDistribution = computed(() => {
  const priorities = [
    { value: 3, label: '高优先级', count: 0 },
    { value: 2, label: '中优先级', count: 0 },
    { value: 1, label: '低优先级', count: 0 },
    { value: 0, label: '无优先级', count: 0 },
  ]

  taskStore.tasks.forEach((task) => {
    const p = priorities.find((p) => p.value === task.priority)
    if (p) p.count++
  })

  const total = taskStore.tasks.length || 1
  return priorities.map((p) => ({
    ...p,
    percentage: Math.round((p.count / total) * 100),
  }))
})

// Habit Statistics
const habitStats = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()

  return habitStore.activeHabits.map((habit) => {
    let weeklyCompleted = 0
    const weeklyTotal = 7

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - dayOfWeek + i)
      const dateStr = date.toISOString().split('T')[0]

      const records = habitStore.getHabitRecords(habit.id)
      if (records.some((r) => r.date === dateStr && r.completed)) {
        weeklyCompleted++
      }
    }

    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon || '🔖',
      weeklyCompleted,
      weeklyTotal,
      weeklyRate: Math.round((weeklyCompleted / weeklyTotal) * 100),
    }
  })
})

// List Statistics
const listStats = computed(() => {
  return listStore.lists.map((list) => ({
    id: list.id,
    name: list.name,
    icon: list.icon || '📋',
    color: list.color || '#10B981',
    taskCount: taskStore.tasks.filter((t) => t.list_id === list.id).length,
  }))
})

// Lifecycle
onMounted(() => {
  taskStore.loadTasks()
  habitStore.loadHabits()
  listStore.loadLists()
})
</script>

<style scoped>
.dashboard-view {
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

.period-selector {
  display: flex;
  gap: var(--spacing-xs);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
}

.period-selector .btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: none;
  color: var(--color-text-secondary);
}

.period-selector .btn.active {
  background-color: var(--color-primary);
  color: white;
}

.dashboard-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.chart-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.chart-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg) 0;
}

/* Bar Chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  gap: var(--spacing-sm);
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 80%;
  max-width: 40px;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  min-height: 4px;
  position: relative;
  transition: height var(--transition-fast);
}

.bar.today {
  background-color: var(--color-priority-high);
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.bar-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}

/* Priority Bars */
.priority-bars {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.priority-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.priority-label {
  width: 80px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.priority-bar-wrapper {
  flex: 1;
  height: 16px;
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.priority-bar {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width var(--transition-fast);
}

.priority-bar.priority-3 {
  background-color: var(--color-priority-high);
}
.priority-bar.priority-2 {
  background-color: var(--color-priority-medium);
}
.priority-bar.priority-1 {
  background-color: var(--color-priority-low);
}
.priority-bar.priority-0 {
  background-color: var(--color-priority-none);
}

.priority-count {
  width: 40px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  text-align: right;
}

/* Habit Section */
.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.habit-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.habit-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.habit-icon {
  font-size: var(--font-size-lg);
}

.habit-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.habit-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-fast);
}

.progress-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  min-width: 40px;
  text-align: right;
}

.habit-detail {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.empty-habits {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

/* Lists Section */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.list-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.list-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.list-icon {
  font-size: var(--font-size-lg);
}

.list-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.list-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
