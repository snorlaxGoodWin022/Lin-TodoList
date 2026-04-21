<template>
  <div class="habit-view">
    <div class="habit-header">
      <div class="header-left">
        <h1 class="page-title">习惯追踪</h1>
        <p class="page-subtitle">培养好习惯，记录每一天</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showNewHabitModal = true">
          <Icon icon="mdi:plus" class="btn-icon" />
          新建习惯
        </button>
      </div>
    </div>

    <div class="habit-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'active' }"
        @click="activeTab = 'active'"
      >
        <Icon icon="mdi:check-circle-outline" class="tab-icon" />
        进行中
        <span class="tab-count">{{ activeHabits.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'archived' }"
        @click="activeTab = 'archived'"
      >
        <Icon icon="mdi:archive-outline" class="tab-icon" />
        已归档
        <span class="tab-count">{{ archivedHabits.length }}</span>
      </button>
    </div>

    <div class="habit-content">
      <!-- 习惯卡片列表 -->
      <div class="habit-list">
        <div v-if="displayHabits.length === 0" class="empty-state">
          <Icon icon="mdi:calendar-blank-outline" class="empty-icon" />
          <h3 class="empty-title">
            {{ activeTab === 'active' ? '还没有习惯' : '没有已归档的习惯' }}
          </h3>
          <p class="empty-text">
            {{ activeTab === 'active' ? '创建你的第一个习惯，开始追踪吧！' : '归档的习惯将在这里显示' }}
          </p>
          <button v-if="activeTab === 'active'" class="btn btn-primary" @click="showNewHabitModal = true">
            <Icon icon="mdi:plus" class="btn-icon" />
            新建习惯
          </button>
        </div>

        <div v-else class="habit-grid">
          <div v-for="habit in displayHabits" :key="habit.id" class="habit-card">
            <div class="habit-card-header">
              <div class="habit-icon">
                <Icon :icon="habit.icon || 'mdi:check-circle-outline'" />
              </div>
              <div class="habit-info">
                <h4 class="habit-title">{{ habit.title }}</h4>
                <p class="habit-frequency">{{ getFrequencyText(habit.frequency) }}</p>
              </div>
              <div class="habit-actions">
                <button class="btn btn-icon" @click="toggleHabitArchive(habit)">
                  <Icon :icon="habit.archived ? 'mdi:archive-arrow-up-outline' : 'mdi:archive-outline'" />
                </button>
                <button class="btn btn-icon" @click="editHabit(habit)">
                  <Icon icon="mdi:pencil-outline" />
                </button>
                <button class="btn btn-icon" @click="deleteHabit(habit.id)">
                  <Icon icon="mdi:delete-outline" />
                </button>
              </div>
            </div>

            <div class="habit-card-content">
              <p class="habit-description">{{ habit.description || '没有描述' }}</p>

              <!-- 周进度条 -->
              <div class="week-progress">
                <div class="week-header">
                  <span class="week-title">本周进度</span>
                  <span class="week-stats">{{ getWeekCompletion(habit.id) }}/7</span>
                </div>
                <div class="week-days">
                  <div
                    v-for="day in weekDays"
                    :key="day.day"
                    class="week-day"
                    :class="{ completed: isHabitCompletedToday(habit.id, day.date) }"
                    @click="toggleHabitRecord(habit.id, day.date)"
                  >
                    <div class="day-label">{{ day.label }}</div>
                    <div class="day-circle">
                      <Icon v-if="isHabitCompletedToday(habit.id, day.date)" icon="mdi:check" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 月度热力图 -->
              <div class="month-heatmap">
                <div class="month-header">
                  <span class="month-title">月度记录</span>
                  <span class="month-stats">{{ getMonthCompletion(habit.id) }}/{{ currentMonthDays }}</span>
                </div>
                <div class="heatmap-grid">
                  <div
                    v-for="day in monthDays"
                    :key="day.date"
                    class="heatmap-cell"
                    :class="getHeatmapClass(habit.id, day.date)"
                    :title="`${day.date}: ${isHabitCompletedOnDate(habit.id, day.date) ? '已完成' : '未完成'}`"
                    @click="toggleHabitRecord(habit.id, day.date)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边统计 -->
      <div class="habit-sidebar">
        <div class="stats-card">
          <h3 class="stats-title">总体统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ activeHabits.length }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ getTotalCompletionRate() }}%</div>
              <div class="stat-label">完成率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ getCurrentStreak() }}</div>
              <div class="stat-label">连续天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ getTotalCompletions() }}</div>
              <div class="stat-label">总完成</div>
            </div>
          </div>
        </div>

        <div class="calendar-card">
          <h3 class="calendar-title">本月日历</h3>
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <span v-for="weekday in ['日', '一', '二', '三', '四', '五', '六']" :key="weekday" class="weekday">
                {{ weekday }}
              </span>
            </div>
            <div class="calendar-days">
              <div
                v-for="day in calendarDays"
                :key="day.date"
                class="calendar-day"
                :class="{
                  'current-month': day.isCurrentMonth,
                  'today': day.isToday,
                  'has-record': hasAnyHabitRecord(day.date)
                }"
                :title="day.date"
              >
                {{ day.day }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建习惯模态框 -->
    <div v-if="showNewHabitModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">新建习惯</h3>
          <button class="btn btn-icon" @click="showNewHabitModal = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-text">新建习惯模态框将在后续实现...</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-text" @click="showNewHabitModal = false">
            取消
          </button>
          <button class="btn btn-primary" @click="showNewHabitModal = false">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useHabitStore } from '../stores/habit.store'

const habitStore = useHabitStore()

// 状态
const activeTab = ref('active')
const showNewHabitModal = ref(false)

// 计算属性
const activeHabits = computed(() => habitStore.activeHabits)
const archivedHabits = computed(() => habitStore.archivedHabits)

const displayHabits = computed(() => {
  return activeTab.value === 'active' ? activeHabits.value : archivedHabits.value
})

// 获取周日期
const weekDays = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - today.getDay() + i)
    const day = date.getDate()
    const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
    days.push({
      day: dayLabels[i],
      date: date.toISOString().split('T')[0],
      isToday: i === today.getDay()
    })
  }
  return days
})

// 获取月日期（热力图）
const monthDays = computed(() => {
  const days = []
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 从本月第一天到最后一天
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push({
      date: d.toISOString().split('T')[0],
      day: d.getDate()
    })
  }
  return days
})

const currentMonthDays = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

// 日历数据
const calendarDays = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  // 获取第一天是周几（0=周日）
  const firstDayOfWeek = firstDay.getDay()

  const days = []

  // 上个月的日期
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      isCurrentMonth: false,
      isToday: false
    })
  }

  // 本月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const isToday = date.toDateString() === today.toDateString()
    days.push({
      day: i,
      date: date.toISOString().split('T')[0],
      isCurrentMonth: true,
      isToday
    })
  }

  // 下个月的日期（补齐到6行）
  const totalCells = 42 // 6行 * 7列
  const nextMonthDays = totalCells - days.length
  for (let i = 1; i <= nextMonthDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      day: i,
      date: date.toISOString().split('T')[0],
      isCurrentMonth: false,
      isToday: false
    })
  }

  return days
})

// 方法
const getFrequencyText = (frequency: number) => {
  const freqMap: Record<number, string> = {
    1: '每天',
    2: '工作日',
    3: '周末',
    4: '每周',
    5: '每月'
  }
  return freqMap[frequency] || '自定义'
}

const isHabitCompletedToday = (habitId: string, date: string) => {
  const records = habitStore.getHabitRecords(habitId)
  return records.some(record => record.date === date && record.completed === 1)
}

const isHabitCompletedOnDate = (habitId: string, date: string) => {
  return isHabitCompletedToday(habitId, date)
}

const getHeatmapClass = (habitId: string, date: string) => {
  if (isHabitCompletedOnDate(habitId, date)) {
    return 'completed'
  }
  return ''
}

const getWeekCompletion = (habitId: string) => {
  const records = habitStore.getHabitRecords(habitId)
  const weekDates = weekDays.value.map(d => d.date)
  return records.filter(record =>
    weekDates.includes(record.date) && record.completed === 1
  ).length
}

const getMonthCompletion = (habitId: string) => {
  const records = habitStore.getHabitRecords(habitId)
  const monthDates = monthDays.value.map(d => d.date)
  return records.filter(record =>
    monthDates.includes(record.date) && record.completed === 1
  ).length
}

const toggleHabitRecord = async (habitId: string, date: string) => {
  try {
    await habitStore.toggleHabitRecord(habitId, date)
  } catch (err) {
    console.error('Error toggling habit record:', err)
  }
}

const toggleHabitArchive = async (habit: any) => {
  try {
    await habitStore.updateHabit(habit.id, { archived: habit.archived ? 0 : 1 })
  } catch (err) {
    console.error('Error toggling habit archive:', err)
  }
}

const editHabit = (habit: any) => {
  console.log('Edit habit:', habit)
  // TODO: 实现编辑习惯
}

const deleteHabit = async (habitId: string) => {
  if (confirm('确定要删除这个习惯吗？此操作不可撤销。')) {
    try {
      await habitStore.deleteHabit(habitId)
    } catch (err) {
      console.error('Error deleting habit:', err)
    }
  }
}

const getTotalCompletionRate = () => {
  if (activeHabits.value.length === 0) return 0
  let totalRate = 0
  activeHabits.value.forEach(habit => {
    const monthCompletion = getMonthCompletion(habit.id)
    totalRate += (monthCompletion / currentMonthDays.value) * 100
  })
  return Math.round(totalRate / activeHabits.value.length)
}

const getCurrentStreak = () => {
  // TODO: 实现计算当前连续天数
  return 0
}

const getTotalCompletions = () => {
  let total = 0
  activeHabits.value.forEach(habit => {
    const records = habitStore.getHabitRecords(habit.id)
    total += records.filter(r => r.completed === 1).length
  })
  return total
}

const hasAnyHabitRecord = (date: string) => {
  return activeHabits.value.some(habit =>
    habitStore.getHabitRecords(habit.id).some(record =>
      record.date === date && record.completed === 1
    )
  )
}

// 初始化
onMounted(() => {
  habitStore.init()
  // 加载当月记录
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  activeHabits.value.forEach(habit => {
    habitStore.loadHabitRecords(habit.id, currentMonth)
  })
})
</script>

<style scoped>
.habit-view {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.habit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
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

.habit-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  background: var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 4px;
}

.tab-btn.active .tab-count {
  background: var(--color-primary);
  color: white;
}

.habit-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.habit-list {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-tertiary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.empty-text {
  font-size: 14px;
  margin-bottom: 24px;
  max-width: 300px;
  line-height: 1.5;
}

.habit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.habit-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.habit-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.habit-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.habit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 12px;
  font-size: 24px;
  flex-shrink: 0;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habit-frequency {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.habit-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.habit-card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.habit-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.week-progress {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.week-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.week-stats {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.week-days {
  display: flex;
  justify-content: space-between;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 4px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.week-day:hover {
  background: var(--color-surface);
}

.week-day.completed .day-circle {
  background: var(--color-primary);
  color: white;
}

.day-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.day-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.month-heatmap {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.month-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.month-stats {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.heatmap-cell {
  aspect-ratio: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.heatmap-cell:hover {
  transform: scale(1.1);
}

.heatmap-cell.completed {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.habit-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.calendar-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.calendar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: center;
  font-weight: 500;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: default;
}

.calendar-day.current-month {
  color: var(--color-text-primary);
  background: var(--color-background);
}

.calendar-day:not(.current-month) {
  color: var(--color-text-tertiary);
  background: var(--color-surface);
}

.calendar-day.today {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.calendar-day.has-record {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.btn-text {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-text:hover {
  color: var(--color-text-primary);
  background: var(--color-background);
}

.btn-icon {
  padding: 8px;
  min-width: 36px;
  min-height: 36px;
}
</style>