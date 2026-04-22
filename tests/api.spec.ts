/**
 * API 测试说明：
 * 这些测试需要通过 Electron 的 CDP (Chrome DevTools Protocol) 运行
 * 不能在普通 Playwright 浏览器上下文中运行
 *
 * 运行方式：
 * 1. 启动 Electron: npx electron dist-electron/electron/main.js --remote-debugging-port=9222
 * 2. 使用 CDP 连接到 ws://localhost:9222/devtools/page/xxx
 * 3. 通过 CDP 的 Runtime.evaluate 执行 API 调用
 *
 * 或者运行 CDP 测试脚本 (见 TEST_PLAN.md)
 */

import { test, expect } from '@playwright/test'

test.describe('Electron API 测试 (需要CDP连接)', () => {
  test('placeholder - API 测试需要通过 CDP 运行', () => {
    // API 测试通过 window.electronAPI 调用
    // 这只在 Electron 渲染进程中有效
    // 使用 CDP 脚本进行测试 (见 TEST_PLAN.md)
    expect(true).toBe(true)
  })
})
