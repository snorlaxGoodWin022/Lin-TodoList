import { createRouter, createWebHashHistory } from 'vue-router'
import TodayView from '../views/TodayView.vue'
import CalendarPage from '../views/CalendarPage.vue'
import ListView from '../views/ListView.vue'
import QuadrantView from '../views/QuadrantView.vue'
import PomodoroView from '../views/PomodoroView.vue'
import HabitView from '../views/HabitView.vue'
import NoteView from '../views/NoteView.vue'
import KanbanView from '../views/KanbanView.vue'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/today',
  },
  {
    path: '/today',
    name: 'Today',
    component: TodayView,
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarPage,
  },
  {
    path: '/lists/:id',
    name: 'List',
    component: ListView,
    props: true,
  },
  {
    path: '/quadrant',
    name: 'Quadrant',
    component: QuadrantView,
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: PomodoroView,
  },
  {
    path: '/kanban',
    name: 'Kanban',
    component: KanbanView,
  },
  {
    path: '/habits',
    name: 'Habits',
    component: HabitView,
  },
  {
    path: '/notes',
    name: 'Notes',
    component: NoteView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
