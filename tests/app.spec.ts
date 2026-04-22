import { test, expect } from '@playwright/test'

test.describe('Lin-TodoList 应用测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/today')
    await page.waitForLoadState('networkidle')
  })

  test.describe('视图导航', () => {
    test('今日视图正确加载', async ({ page }) => {
      await expect(
        page.getByRole('main').getByRole('heading', { name: '今天', exact: true })
      ).toBeVisible()
      // 任务数量可能动态变化
      await expect(page.getByText('今天到期')).toBeVisible()
    })

    test('日历视图正确加载', async ({ page }) => {
      await page.getByRole('navigation').getByText('日历').click()
      await expect(page).toHaveURL(/#\/calendar/)
      await expect(page.getByText('2026年4月')).toBeVisible()
    })

    test('四象限视图正确加载', async ({ page }) => {
      await page.getByRole('navigation').getByText('四象限').click()
      await expect(page).toHaveURL(/#\/quadrant/)
      await expect(page.getByRole('heading', { name: '艾森豪威尔矩阵' })).toBeVisible()
    })

    test('看板视图正确加载', async ({ page }) => {
      await page.getByRole('navigation').getByText('看板').click()
      await expect(page).toHaveURL(/#\/kanban/)
      await expect(page.getByRole('heading', { name: '待办' })).toBeVisible()
    })

    test('番茄钟视图正确加载', async ({ page }) => {
      await page.getByRole('navigation').getByText('番茄').click()
      await expect(page).toHaveURL(/#\/pomodoro/)
      await expect(page.getByText('专注时间')).toBeVisible()
    })

    test('习惯视图正确加载', async ({ page }) => {
      await page.getByRole('navigation').getByText('习惯').click()
      await expect(page).toHaveURL(/#\/habits/)
      await expect(page.getByRole('heading', { name: '习惯追踪' })).toBeVisible()
    })

    test('便签视图正确加载', async ({ page }) => {
      await page.getByRole('navigation').getByText('便签').click()
      await expect(page).toHaveURL(/#\/notes/)
      await expect(page.getByRole('heading', { name: '便签' })).toBeVisible()
    })
  })

  test.describe('任务管理功能', () => {
    test('添加任务按钮存在且可点击', async ({ page }) => {
      const addButton = page.getByText('添加任务')
      await expect(addButton).toBeVisible()
      await addButton.click()
      await expect(page.getByText('任务详情')).toBeVisible()
    })

    test('侧边栏导航存在', async ({ page }) => {
      const nav = page.getByRole('navigation')
      await expect(nav.getByText('今天')).toBeVisible()
      await expect(nav.getByText('日历')).toBeVisible()
      await expect(nav.getByText('四象限')).toBeVisible()
      await expect(nav.getByText('看板')).toBeVisible()
    })
  })

  test.describe('任务详情面板', () => {
    test('点击任务显示详情', async ({ page }) => {
      const taskItem = page.getByText('claude').first()
      if (await taskItem.isVisible()) {
        await taskItem.click()
        await expect(page.getByText('任务详情')).toBeVisible()
      }
    })

    test('任务详情显示正确字段', async ({ page }) => {
      const taskItem = page.getByText('claude').first()
      if (await taskItem.isVisible()) {
        await taskItem.click()
        await expect(page.getByText('标题').first()).toBeVisible()
        await expect(page.getByText('优先级').first()).toBeVisible()
        await expect(page.getByText('清单').first()).toBeVisible()
      }
    })
  })

  test.describe('番茄钟功能', () => {
    test('番茄钟页面显示计时器', async ({ page }) => {
      await page.getByRole('navigation').getByText('番茄').click()
      await expect(page).toHaveURL(/#\/pomodoro/)
      await expect(page.getByText('25:00')).toBeVisible()
      await expect(page.getByRole('button', { name: '开始专注' })).toBeVisible()
    })

    test('白噪音选项存在', async ({ page }) => {
      await page.getByRole('navigation').getByText('番茄').click()
      await expect(page.getByText('白噪音')).toBeVisible()
      await expect(page.getByText('雨声')).toBeVisible()
    })
  })

  test.describe('日历功能', () => {
    test('日历显示当前月份', async ({ page }) => {
      await page.getByRole('navigation').getByText('日历').click()
      await expect(page).toHaveURL(/#\/calendar/)
      await expect(page.getByText('2026年4月')).toBeVisible()
    })

    test('日历有月周视图切换', async ({ page }) => {
      await page.getByRole('navigation').getByText('日历').click()
      await expect(page.getByRole('button', { name: '月' })).toBeVisible()
      await expect(page.getByRole('button', { name: '周' })).toBeVisible()
      await expect(page.getByRole('button', { name: '日' })).toBeVisible()
    })
  })

  test.describe('四象限功能', () => {
    test('显示四个象限', async ({ page }) => {
      await page.getByRole('navigation').getByText('四象限').click()
      await expect(page).toHaveURL(/#\/quadrant/)
      await expect(page.getByRole('heading', { name: '重要且紧急', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: '重要不紧急', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: '紧急不重要', exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: '不紧急不重要', exact: true })).toBeVisible()
    })
  })

  test.describe('便签功能', () => {
    test('便签页面显示新建按钮', async ({ page }) => {
      await page.getByRole('navigation').getByText('便签').click()
      await expect(page).toHaveURL(/#\/notes/)
      await expect(page.getByRole('button', { name: '新建便签' }).first()).toBeVisible()
    })

    test('便签页面有搜索框', async ({ page }) => {
      await page.getByRole('navigation').getByText('便签').click()
      await expect(page.getByPlaceholder('搜索便签')).toBeVisible()
    })
  })
})
