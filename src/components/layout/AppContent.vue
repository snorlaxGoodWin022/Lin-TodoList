<template>
  <main class="app-content">
    <div v-if="showContentHeader" class="content-header">
      <div class="header-actions">
        <slot name="header-actions"></slot>
      </div>
      <div class="view-controls">
        <slot name="view-controls"></slot>
      </div>
    </div>
    <div class="content-body">
      <router-view v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app.store'

const appStore = useAppStore()

const showContentHeader = computed(() => appStore.currentView !== 'pomodoro')
</script>

<style scoped>
.app-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
}

.content-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.view-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.content-body {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
}
</style>
