<template>
  <div class="pomodoro-view">
    <div class="pomodoro-header">
      <h1 class="page-title">番茄钟</h1>
      <p class="page-subtitle">专注工作，定时休息</p>
    </div>

    <div class="pomodoro-main">
      <div class="timer-section">
        <div class="timer-display">
          <div class="timer-circle">
            <svg class="timer-progress" width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--color-border)"
                stroke-width="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--color-primary)"
                stroke-width="8"
                :stroke-dasharray="`${progress * 565} 565`"
                stroke-linecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div class="timer-text">
              <div class="timer-time">{{ formattedTime }}</div>
              <div class="timer-mode">{{ modeText }}</div>
            </div>
          </div>
        </div>

        <div class="timer-controls">
          <button
            v-if="!isRunning"
            class="btn btn-primary"
            @click="startTimer"
          >
            <Icon icon="mdi:play" class="btn-icon" />
            开始专注
          </button>
          <button
            v-else
            class="btn btn-secondary"
            @click="pauseTimer"
          >
            <Icon icon="mdi:pause" class="btn-icon" />
            暂停
          </button>
          <button
            class="btn btn-text"
            @click="skipSession"
            :disabled="!isRunning"
          >
            <Icon icon="mdi:skip-next" class="btn-icon" />
            跳过
          </button>
          <button
            class="btn btn-text"
            @click="resetTimer"
          >
            <Icon icon="mdi:refresh" class="btn-icon" />
            重置
          </button>
        </div>

        <div class="timer-settings">
          <div class="setting-item">
            <label class="setting-label">专注时长</label>
            <div class="setting-control">
              <button
                class="btn btn-icon"
                @click="decrementFocusTime"
                :disabled="isRunning"
              >
                <Icon icon="mdi:minus" />
              </button>
              <span class="setting-value">{{ focusTime }}分钟</span>
              <button
                class="btn btn-icon"
                @click="incrementFocusTime"
                :disabled="isRunning"
              >
                <Icon icon="mdi:plus" />
              </button>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">休息时长</label>
            <div class="setting-control">
              <button
                class="btn btn-icon"
                @click="decrementBreakTime"
                :disabled="isRunning"
              >
                <Icon icon="mdi:minus" />
              </button>
              <span class="setting-value">{{ breakTime }}分钟</span>
              <button
                class="btn btn-icon"
                @click="incrementBreakTime"
                :disabled="isRunning"
              >
                <Icon icon="mdi:plus" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stats-header">
          <h3 class="stats-title">今日统计</h3>
          <button class="btn btn-text" @click="refreshStats">
            <Icon icon="mdi:refresh" class="btn-icon" />
            刷新
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:timer-outline" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_focus_minutes }}</div>
              <div class="stat-label">专注分钟</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:coffee-outline" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_break_minutes }}</div>
              <div class="stat-label">休息分钟</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:chart-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.daily_average }}</div>
              <div class="stat-label">日均专注</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <Icon icon="mdi:fire" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.streak_days }}</div>
              <div class="stat-label">连续天数</div>
            </div>
          </div>
        </div>

        <div class="recent-sessions">
          <h3 class="sessions-title">最近会话</h3>
          <div v-if="todayRecords.length === 0" class="empty-sessions">
            <Icon icon="mdi:timer-off-outline" class="empty-icon" />
            <p class="empty-text">今天还没有番茄钟会话</p>
          </div>
          <div v-else class="sessions-list">
            <div v-for="record in todayRecords" :key="record.id" class="session-item">
              <div class="session-type" :class="`type-${record.type}`">
                <Icon :icon="record.type === 'focus' ? 'mdi:timer-outline' : 'mdi:coffee-outline'" />
                {{ record.type === 'focus' ? '专注' : '休息' }}
              </div>
              <div class="session-duration">{{ record.duration }}分钟</div>
              <div class="session-time">
                {{ formatTime(record.completed_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { usePomodoroStore } from '../stores/pomodoro.store'

const pomodoroStore = usePomodoroStore()

// 计时器状态
const isRunning = ref(false)
const timeLeft = ref(25 * 60) // 25分钟，单位秒
const isFocusMode = ref(true)
const focusTime = ref(25) // 分钟
const breakTime = ref(5) // 分钟
const timerInterval = ref<NodeJS.Timeout | null>(null)

// 格式化时间显示
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 进度计算
const progress = computed(() => {
  const totalTime = (isFocusMode.value ? focusTime.value : breakTime.value) * 60
  return (totalTime - timeLeft.value) / totalTime
})

// 模式文本
const modeText = computed(() => {
  return isFocusMode.value ? '专注时间' : '休息时间'
})

// 开始计时器
const startTimer = () => {
  if (!timerInterval.value) {
    isRunning.value = true
    timerInterval.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        sessionComplete()
      }
    }, 1000)
  }
}

// 暂停计时器
const pauseTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
    isRunning.value = false
  }
}

// 跳过当前会话
const skipSession = () => {
  sessionComplete()
}

// 重置计时器
const resetTimer = () => {
  pauseTimer()
  timeLeft.value = focusTime.value * 60
  isFocusMode.value = true
}

// 会话完成
const sessionComplete = async () => {
  pauseTimer()

  // 保存记录
  try {
    await pomodoroStore.savePomodoro({
      type: isFocusMode.value ? 'focus' : 'break',
      duration: isFocusMode.value ? focusTime.value : breakTime.value,
      completed_at: new Date().toISOString()
    })
  } catch (err) {
    console.error('Error saving pomodoro record:', err)
  }

  // 切换模式
  isFocusMode.value = !isFocusMode.value
  timeLeft.value = (isFocusMode.value ? focusTime.value : breakTime.value) * 60

  // 自动开始下一个会话
  if (isFocusMode.value) {
    startTimer()
  }
}

// 设置调整
const incrementFocusTime = () => {
  if (focusTime.value < 60) {
    focusTime.value++
    if (!isRunning.value && isFocusMode.value) {
      timeLeft.value = focusTime.value * 60
    }
  }
}

const decrementFocusTime = () => {
  if (focusTime.value > 1) {
    focusTime.value--
    if (!isRunning.value && isFocusMode.value) {
      timeLeft.value = focusTime.value * 60
    }
  }
}

const incrementBreakTime = () => {
  if (breakTime.value < 30) {
    breakTime.value++
    if (!isRunning.value && !isFocusMode.value) {
      timeLeft.value = breakTime.value * 60
    }
  }
}

const decrementBreakTime = () => {
  if (breakTime.value > 1) {
    breakTime.value--
    if (!isRunning.value && !isFocusMode.value) {
      timeLeft.value = breakTime.value * 60
    }
  }
}

// 统计相关
const stats = computed(() => pomodoroStore.stats)
const todayRecords = computed(() => pomodoroStore.todayRecords)

const refreshStats = () => {
  pomodoroStore.loadStats('today')
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 初始化
onMounted(() => {
  pomodoroStore.init()
  refreshStats()
})

onUnmounted(() => {
  pauseTimer()
})
</script>

<style scoped>
.pomodoro-view {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.pomodoro-header {
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

.pomodoro-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.timer-display {
  position: relative;
}

.timer-circle {
  position: relative;
  width: 200px;
  height: 200px;
}

.timer-progress {
  transform: rotate(-90deg);
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-time {
  font-size: 48px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.timer-mode {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.timer-controls {
  display: flex;
  gap: 12px;
}

.timer-settings {
  display: flex;
  gap: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  min-width: 60px;
  text-align: center;
}

.btn-icon {
  padding: 8px;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 24px;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-primary-light);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.recent-sessions {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.sessions-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.session-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
}

.session-type.type-focus {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.session-type.type-break {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.session-duration {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.session-time {
  font-size: 14px;
  color: var(--color-text-secondary);
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

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background);
  border-color: var(--color-border-hover);
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background: inherit;
  border-color: inherit;
}
</style>