import { createRouter, createWebHashHistory } from 'vue-router'
import TodayView from '../views/TodayView.vue'
import CalendarPage from '../views/CalendarPage.vue'
import ListView from '../views/ListView.vue'
import QuadrantView from '../views/QuadrantView.vue'
import PomodoroView from '../views/PomodoroView.vue'
import HabitView from '../views/HabitView.vue'
import NoteView from '../views/NoteView.vue'

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
    path: '/habits',
    name: 'Habits',
    component: HabitView,
  },
  {
    path: '/notes',
    name: 'Notes',
    component: NoteView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
