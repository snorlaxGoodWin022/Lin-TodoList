<template>
  <div id="app" :data-theme="theme">
    <AppHeader />
    <div class="app-container">
      <AppSidebar />
      <AppContent />
      <DetailPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from './stores/app.store'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppContent from './components/layout/AppContent.vue'
import DetailPanel from './components/layout/DetailPanel.vue'

const appStore = useAppStore()
const theme = computed(() => appStore.theme)
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