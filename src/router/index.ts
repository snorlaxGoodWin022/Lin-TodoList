import { createRouter, createWebHashHistory } from 'vue-router'
import TodayView from '../views/TodayView.vue'
import CalendarPage from '../views/CalendarPage.vue'
import ListView from '../views/ListView.vue'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'Today',
    component: TodayView
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarPage
  },
  {
    path: '/lists/:id',
    name: 'List',
    component: ListView,
    props: true
  },
  // TODO: Add routes for other views (quadrant, pomodoro, habit, note)
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router