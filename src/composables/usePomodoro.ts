import { ref, computed, onUnmounted } from 'vue'
import { usePomodoroStore } from '../stores/pomodoro.store'
import type { PomodoroRecord } from '../types/repositories'

export function usePomodoro() {
  const pomodoroStore = usePomodoroStore()

  // Timer state
  const timerActive = ref(false)
  const timerType = ref<'focus' | 'break'>('focus')
  const remainingSeconds = ref(25 * 60) // 25 minutes in seconds
  const timerInterval = ref<number | null>(null)

  // Settings
  const focusDuration = ref(25) // minutes
  const breakDuration = ref(5) // minutes
  const longBreakDuration = ref(15) // minutes
  const longBreakInterval = ref(4) // after 4 focus sessions

  // Session tracking
  const focusSessionsCompleted = ref(0)
  const currentSessionTaskId = ref<string | null>(null)

  // Computed values
  const progressPercentage = computed(() => {
    const totalSeconds = timerType.value === 'focus'
      ? focusDuration.value * 60
      : breakDuration.value * 60
    return ((totalSeconds - remainingSeconds.value) / totalSeconds) * 100
  })

  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const isLongBreak = computed(() => {
    return focusSessionsCompleted.value % longBreakInterval.value === 0 && focusSessionsCompleted.value > 0
  })

  // Timer actions
  const startTimer = (taskId?: string) => {
    if (timerActive.value) return

    currentSessionTaskId.value = taskId || null
    timerActive.value = true

    timerInterval.value = window.setInterval(() => {
      remainingSeconds.value--

      if (remainingSeconds.value <= 0) {
        completeSession()
      }
    }, 1000)
  }

  const pauseTimer = () => {
    if (!timerActive.value) return

    timerActive.value = false
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const resetTimer = () => {
    pauseTimer()
    focusSessionsCompleted.value = 0
    setTimerType('focus')
  }

  const completeSession = async () => {
    pauseTimer()

    // Save the completed session
    const record: Partial<PomodoroRecord> = {
      task_id: currentSessionTaskId.value || null,
      duration: timerType.value === 'focus' ? focusDuration.value : (isLongBreak.value ? longBreakDuration.value : breakDuration.value),
      type: timerType.value,
      started_at: new Date(Date.now() - (remainingSeconds.value * 1000)).toISOString(),
      completed_at: new Date().toISOString()
    }

    await pomodoroStore.savePomodoro(record)

    // Update session count
    if (timerType.value === 'focus') {
      focusSessionsCompleted.value++
    }

    // Determine next timer type
    if (timerType.value === 'focus') {
      setTimerType('break')
    } else {
      setTimerType('focus')
    }

    // Start next timer automatically
    startTimer(currentSessionTaskId.value || undefined)
  }

  const setTimerType = (type: 'focus' | 'break') => {
    timerType.value = type
    remainingSeconds.value = type === 'focus'
      ? focusDuration.value * 60
      : (isLongBreak.value ? longBreakDuration.value : breakDuration.value) * 60
  }

  const setFocusDuration = (minutes: number) => {
    focusDuration.value = minutes
    if (timerType.value === 'focus' && !timerActive.value) {
      remainingSeconds.value = minutes * 60
    }
  }

  const setBreakDuration = (minutes: number) => {
    breakDuration.value = minutes
    if (timerType.value === 'break' && !timerActive.value && !isLongBreak.value) {
      remainingSeconds.value = minutes * 60
    }
  }

  const setLongBreakDuration = (minutes: number) => {
    longBreakDuration.value = minutes
    if (timerType.value === 'break' && !timerActive.value && isLongBreak.value) {
      remainingSeconds.value = minutes * 60
    }
  }

  const setLongBreakInterval = (interval: number) => {
    longBreakInterval.value = interval
  }

  // Stats
  const loadStats = async (range?: string) => {
    return await pomodoroStore.loadStats(range)
  }

  // Cleanup
  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  })

  return {
    // State
    timerActive,
    timerType,
    remainingSeconds,
    focusDuration,
    breakDuration,
    longBreakDuration,
    longBreakInterval,
    focusSessionsCompleted,
    currentSessionTaskId,

    // Computed
    progressPercentage,
    formattedTime,
    isLongBreak,

    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    completeSession,
    setTimerType,
    setFocusDuration,
    setBreakDuration,
    setLongBreakDuration,
    setLongBreakInterval,
    loadStats
  }
}