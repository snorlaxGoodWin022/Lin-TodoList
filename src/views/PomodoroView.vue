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
          <button v-if="!isRunning" class="btn btn-primary" @click="startTimer">
            <Icon icon="mdi:play" class="btn-icon" />
            开始专注
          </button>
          <button v-else class="btn btn-secondary" @click="pauseTimer">
            <Icon icon="mdi:pause" class="btn-icon" />
            暂停
          </button>
          <button class="btn btn-text" :disabled="!isRunning" @click="skipSession">
            <Icon icon="mdi:skip-next" class="btn-icon" />
            跳过
          </button>
          <button class="btn btn-text" @click="resetTimer">
            <Icon icon="mdi:refresh" class="btn-icon" />
            重置
          </button>
        </div>

        <div class="timer-settings">
          <div class="setting-item">
            <label class="setting-label">专注时长</label>
            <div class="setting-control">
              <button class="btn btn-icon" :disabled="isRunning" @click="decrementFocusTime">
                <Icon icon="mdi:minus" />
              </button>
              <span class="setting-value">{{ focusTime }}分钟</span>
              <button class="btn btn-icon" :disabled="isRunning" @click="incrementFocusTime">
                <Icon icon="mdi:plus" />
              </button>
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">休息时长</label>
            <div class="setting-control">
              <button class="btn btn-icon" :disabled="isRunning" @click="decrementBreakTime">
                <Icon icon="mdi:minus" />
              </button>
              <span class="setting-value">{{ breakTime }}分钟</span>
              <button class="btn btn-icon" :disabled="isRunning" @click="incrementBreakTime">
                <Icon icon="mdi:plus" />
              </button>
            </div>
          </div>
        </div>

        <div class="white-noise-section">
          <label class="setting-label">白噪音</label>
          <div class="white-noise-selector">
            <button
              v-for="sound in sounds"
              :key="sound.id"
              :class="['sound-btn', { active: currentSound === sound.id }]"
              @click="toggleSound(sound.id)"
            >
              <Icon :icon="sound.icon" />
              <span>{{ sound.name }}</span>
            </button>
          </div>
          <div v-if="currentSound" class="volume-control">
            <Icon icon="mdi:volume-high" />
            <input v-model="volume" type="range" min="0" max="100" class="volume-slider" />
          </div>
        </div>

        <div class="mini-window-section">
          <button class="btn btn-secondary" @click="openMiniWindow">
            <Icon icon="mdi:open-in-new" />
            打开迷你窗口
          </button>
        </div>

        <div class="task-link-section">
          <label class="setting-label">关联任务</label>
          <select v-model="selectedTaskId" class="form-select">
            <option value="">不关联任务</option>
            <option v-for="task in pendingTasks" :key="task.id" :value="task.id">
              {{ task.title }}
            </option>
          </select>
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
                <Icon
                  :icon="record.type === 'focus' ? 'mdi:timer-outline' : 'mdi:coffee-outline'"
                />
                {{ record.type === 'focus' ? '专注' : '休息' }}
              </div>
              <div class="session-duration">{{ record.duration }}分钟</div>
              <div class="session-time">
                {{ formatTime(record.completed_at) }}
              </div>
            </div>
          </div>
        </div>

        <div class="weekly-chart">
          <h3 class="sessions-title">本周专注统计</h3>
          <div class="chart-container">
            <div class="chart-bars">
              <div v-for="(day, index) in weekDays" :key="index" class="chart-bar-wrapper">
                <div class="chart-bar" :style="{ height: getBarHeight(day.minutes) + 'px' }">
                  <span v-if="day.minutes > 0" class="bar-value">{{ day.minutes }}</span>
                </div>
                <span class="bar-label">{{ day.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { usePomodoroStore } from '../stores/pomodoro.store'
import { useTaskStore } from '../stores/task.store'

const pomodoroStore = usePomodoroStore()
const taskStore = useTaskStore()

// Audio context for white noise
let audioContext: AudioContext | null = null
let noiseNode: AudioBufferSourceNode | null = null
let gainNode: GainNode | null = null

// 计时器状态
const isRunning = ref(false)
const timeLeft = ref(25 * 60) // 25分钟，单位秒
const isFocusMode = ref(true)
const focusTime = ref(25) // 分钟
const breakTime = ref(5) // 分钟
const timerInterval = ref<NodeJS.Timeout | null>(null)

// Task linking
const selectedTaskId = ref('')
const pendingTasks = computed(() => taskStore.pendingTasks)

// White noise
const currentSound = ref<string | null>(null)
const volume = ref(50)

const sounds = [
  { id: 'rain', name: '雨声', icon: 'mdi:weather-rainy' },
  { id: 'forest', name: '森林', icon: 'mdi:tree' },
  { id: 'ocean', name: '海浪', icon: 'mdi:waves' },
  { id: 'fire', name: '篝火', icon: 'mdi:fire' },
  { id: 'wind', name: '风声', icon: 'mdi:weather-windy' },
]

// Initialize audio context
const initAudio = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
    gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)
    gainNode.gain.value = volume.value / 100
  }
}

// Generate noise based on type
const generateNoise = (type: string) => {
  if (!audioContext || !gainNode) return

  // Stop any existing noise
  if (noiseNode) {
    noiseNode.stop()
    noiseNode.disconnect()
  }

  const bufferSize = 2 * audioContext.sampleRate
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const data = buffer.getChannelData(0)

  // Generate different types of noise
  for (let i = 0; i < bufferSize; i++) {
    switch (type) {
      case 'rain':
        data[i] = (Math.random() * 2 - 1) * 0.3 + (Math.random() * 2 - 1) * 0.2
        break
      case 'forest':
        data[i] = (Math.random() * 2 - 1) * 0.15 + Math.sin(i / 500) * 0.1
        break
      case 'ocean':
        data[i] = ((Math.random() * 2 - 1) * 0.4 * (1 + Math.sin(i / 1000))) / 2
        break
      case 'fire':
        data[i] = (Math.random() * 2 - 1) * 0.25 + (Math.random() > 0.98 ? 0.3 : 0)
        break
      case 'wind':
        data[i] = ((Math.random() * 2 - 1) * 0.35 * (1 + Math.sin(i / 2000))) / 2
        break
      default:
        data[i] = Math.random() * 2 - 1
    }
  }

  noiseNode = audioContext.createBufferSource()
  noiseNode.buffer = buffer
  noiseNode.loop = true
  noiseNode.connect(gainNode)
  noiseNode.start()
}

const toggleSound = (soundId: string) => {
  initAudio()

  if (currentSound.value === soundId) {
    // Stop sound
    if (noiseNode) {
      noiseNode.stop()
      noiseNode = null
    }
    currentSound.value = null
  } else {
    // Start new sound
    currentSound.value = soundId
    generateNoise(soundId)
    if (gainNode) {
      gainNode.gain.value = volume.value / 100
    }
  }
}

watch(volume, (newVolume) => {
  if (gainNode) {
    gainNode.gain.value = newVolume / 100
  }
})

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
      task_id: selectedTaskId.value || null,
      completed_at: new Date().toISOString(),
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

// 迷你窗口
const openMiniWindow = () => {
  window.electronAPI.openMiniWindow?.()
}

// 统计相关
const stats = computed(() => pomodoroStore.stats)
const todayRecords = computed(() => pomodoroStore.todayRecords)

const weekDays = computed(() => {
  const days = []
  const labels = ['日', '一', '二', '三', '四', '五', '六']
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayMinutes = todayRecords.value
      .filter((r) => r.type === 'focus' && r.completed_at?.startsWith(dateStr))
      .reduce((sum, r) => sum + (r.duration || 0), 0)
    days.push({
      label: labels[i],
      date: dateStr,
      minutes: i === new Date().getDay() ? stats.value.total_focus_minutes : dayMinutes,
    })
  }
  return days
})

const maxMinutes = computed(() => {
  return Math.max(...weekDays.value.map((d) => d.minutes), 60)
})

const getBarHeight = (minutes: number) => {
  const maxHeight = 120
  return maxMinutes.value > 0 ? (minutes / maxMinutes.value) * maxHeight : 0
}

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

.white-noise-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.white-noise-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.sound-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sound-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sound-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 200px;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: var(--color-border);
  border-radius: 2px;
}

.mini-window-section {
  margin-top: 8px;
}

.task-link-section {
  margin-top: 16px;
}

.task-link-section .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
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
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
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
  color: #10b981;
}

.session-type.type-break {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.session-duration {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.weekly-chart {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.chart-container {
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 140px;
  gap: 8px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(to top, var(--color-primary), var(--color-primary-light));
  border-radius: 6px 6px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: auto;
}

.bar-value {
  font-size: 10px;
  color: white;
  padding-top: 4px;
  font-weight: 600;
}

.bar-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 8px;
  font-weight: 500;
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
