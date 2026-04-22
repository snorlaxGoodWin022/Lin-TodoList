# Lin-TodoList 测试指南

## Playwright 测试

### 安装依赖

```bash
pnpm install
npx playwright install chromium
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定文件
pnpm test tests/app.spec.ts

# 运行特定测试
pnpm test --grep "任务"

# 交互模式 (UI)
pnpm test --ui

# 浏览器中显示
pnpm test --headed
```

### 测试文件

- `tests/app.spec.ts` - UI 和导航测试
- `tests/api.spec.ts` - Electron IPC API 测试

### 报告

运行后生成 `playwright-report/` 目录，可用浏览器打开查看详细报告。

```bash
npx playwright show-report
```

### 调试

```bash
# 生成 trace 文件
pnpm test --trace on

# 查看 trace
npx playwright show-trace trace.zip
```

## 注意事项

1. 测试会自动启动 `pnpm dev` (Vite 开发服务器)
2. 如果端口 5173 被占用，测试会复用已有服务器
3. API 测试通过 `window.electronAPI` 调用 Electron 主进程的数据库操作
