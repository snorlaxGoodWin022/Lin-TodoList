<template>
  <div id="app" :data-theme="theme">
    <AppHeader />
    <div class="app-container">
      <AppSidebar />
      <AppContent />
      <DetailPanel />
    </div>
    <TaskEditor />
    <ListEditor />
    <HabitEditor />
    <NoteEditor />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './stores/app.store'
import { useShortcuts } from './composables/useShortcuts'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppContent from './components/layout/AppContent.vue'
import DetailPanel from './components/layout/DetailPanel.vue'
import TaskEditor from './components/task/TaskEditor.vue'
import ListEditor from './components/list/ListEditor.vue'
import HabitEditor from './components/habit/HabitEditor.vue'
import NoteEditor from './components/note/NoteEditor.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const theme = computed(() => appStore.theme)

// Sync router with currentView
const updateCurrentView = () => {
  const path = route.path
  if (path === '/today') appStore.setView('today')
  else if (path === '/calendar') appStore.setView('calendar')
  else if (path.startsWith('/lists')) appStore.setView('list')
  else if (path === '/quadrant') appStore.setView('quadrant')
  else if (path === '/pomodoro') appStore.setView('pomodoro')
  else if (path === '/habits') appStore.setView('habit')
  else if (path === '/notes') appStore.setView('note')
}

watch(() => route.path, updateCurrentView, { immediate: true })

// Initialize shortcuts
useShortcuts()

onMounted(() => {
  appStore.initTheme()
})
</script>

<style>
@import './assets/styles/variables.css';
@import './assets/styles/global.css';
@import './assets/styles/animations.css';

.app-container {
  display: flex;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
}
</style>