<template>
  <div class="calendar-page">
    <div class="view-header">
      <h1 class="view-title">日历</h1>
      <div class="calendar-controls">
        <button class="btn btn-icon" @click="goToToday">
          <span class="icon">📅</span>
          今天
        </button>
        <div class="view-switcher">
          <button
            v-for="mode in viewModes"
            :key="mode.value"
            class="btn btn-text"
            :class="{ active: viewModeValue === mode.value }"
            @click="setViewMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
        <div class="navigation">
          <button class="btn btn-icon" @click="goToPrev">
            <span class="icon">◀</span>
          </button>
          <span class="current-period">{{ periodLabel }}</span>
          <button class="btn btn-icon" @click="goToNext">
            <span class="icon">▶</span>
          </button>
        </div>
      </div>
    </div>

    <div class="calendar-content">
      <div v-if="viewModeValue === 'month'" class="month-view">
        <div class="calendar-header">
          <div class="weekdays">
            <div v-for="day in weekdays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>
        </div>
        <div class="calendar-grid">
          <div
            v-for="day in calendar.monthDays.value"
            :key="day.date.toISOString()"
            class="calendar-day"
            :class="{ 'current-month': day.isCurrentMonth, today: isToday(day.date) }"
          >
            <div class="day-header">
              <span class="day-number">{{ day.date.getDate() }}</span>
            </div>
            <div class="day-tasks">
              <div
                v-for="task in day.tasks.slice(0, 3)"
                :key="task.id"
                class="task-dot"
                :class="`priority-${task.priority}`"
                :title="task.title"
              />
              <span v-if="day.tasks.length > 3" class="more-tasks">
                +{{ day.tasks.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="viewModeValue === 'week'" class="week-view">
        <div class="week-grid">
          <div
            v-for="day in calendar.weekDays.value"
            :key="day.date.toISOString()"
            class="week-day"
            :class="{ today: isToday(day.date) }"
          >
            <div class="day-header">
              <div class="day-name">{{ formatDate(day.date, 'short') }}</div>
              <div class="day-number">{{ day.date.getDate() }}</div>
            </div>
            <div class="day-tasks">
              <div
                v-for="task in day.tasks"
                :key="task.id"
                class="task-item"
                @click="selectTask(task)"
              >
                <span class="task-title">{{ task.title }}</span>
                <span v-if="task.start_time" class="task-time">
                  {{ formatTime(task.start_time) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="day-view">
        <div class="day-header">
          <h2 class="day-title">{{ formatDate(currentDateValue, 'long') }}</h2>
        </div>
        <div class="time-slots">
          <!-- Time slots would be implemented here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCalendar } from '../composables/useCalendar'
import { useTask } from '../composables/useTask'

const calendar = useCalendar()
const task = useTask()

// View modes
const viewModes = [
  { value: 'month' as const, label: '月' },
  { value: 'week' as const, label: '周' },
  { value: 'day' as const, label: '日' },
]

// Weekdays in Chinese
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// Computed properties that unwrap refs for template use
const viewModeValue = computed(() => calendar.viewMode.value)
const currentDateValue = computed(() => calendar.currentDate.value)

const periodLabel = computed(() => {
  if (viewModeValue.value === 'month') {
    return calendar.monthName
  } else if (viewModeValue.value === 'week') {
    return `Week of ${calendar.formatDate(calendar.currentDate.value, 'medium')}`
  } else {
    return calendar.formatDate(calendar.currentDate.value, 'long')
  }
})

// Actions
const goToToday = () => {
  calendar.goToToday()
}

const goToPrev = () => {
  if (viewModeValue.value === 'month') {
    calendar.goToPrevMonth()
  } else if (viewModeValue.value === 'week') {
    calendar.goToPrevWeek()
  } else {
    calendar.goToPrevDay()
  }
}

const goToNext = () => {
  if (viewModeValue.value === 'month') {
    calendar.goToNextMonth()
  } else if (viewModeValue.value === 'week') {
    calendar.goToNextWeek()
  } else {
    calendar.goToNextDay()
  }
}

const setViewMode = (mode: 'month' | 'week' | 'day') => {
  calendar.setViewMode(mode)
}

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const formatDate = (date: Date, format: 'short' | 'medium' | 'long') => {
  return calendar.formatDate(date, format)
}

const formatTime = (timeStr: string) => {
  // Simple time formatting
  return timeStr.substring(0, 5)
}

const selectTask = (t: any) => {
  task.selectTask(t)
}
</script>

<style scoped>
.calendar-page {
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
  margin: 0 0 var(--spacing-md) 0;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
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

.btn-text {
  background: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs) var(--spacing-md);
}

.btn-text:hover {
  color: var(--color-primary);
}

.btn-text.active {
  color: var(--color-primary);
  background-color: var(--color-primary-bg);
  border-radius: var(--radius-md);
}

.view-switcher {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
}

.navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.current-period {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  min-width: 200px;
  text-align: center;
}

.calendar-content {
  flex: 1;
  overflow: auto;
}

/* Month view */
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  flex-shrink: 0;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.weekday {
  background-color: var(--color-surface);
  padding: var(--spacing-sm);
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.calendar-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-top: var(--spacing-sm);
}

.calendar-day {
  background-color: var(--color-surface);
  padding: var(--spacing-xs);
  min-height: 100px;
  overflow: hidden;
}

.calendar-day.current-month {
  background-color: var(--color-surface);
}

.calendar-day:not(.current-month) {
  background-color: var(--color-bg);
  color: var(--color-text-muted);
}

.calendar-day.today {
  background-color: var(--color-primary-bg);
}

.day-header {
  margin-bottom: var(--spacing-xs);
}

.day-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  margin: 0 auto;
}

.task-dot.priority-0 {
  background-color: var(--color-priority-none);
}
.task-dot.priority-1 {
  background-color: var(--color-priority-low);
}
.task-dot.priority-2 {
  background-color: var(--color-priority-medium);
}
.task-dot.priority-3 {
  background-color: var(--color-priority-high);
}

.more-tasks {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  margin-top: 2px;
}

/* Week view */
.week-view {
  height: 100%;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  height: 100%;
}

.week-day {
  background-color: var(--color-surface);
  padding: var(--spacing-sm);
  overflow: auto;
}

.week-day.today {
  background-color: var(--color-primary-bg);
}

.day-header {
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--color-border);
}

.day-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.day-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.task-item {
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.task-item:hover {
  background-color: var(--color-primary-bg);
}

.task-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
}
</style>
