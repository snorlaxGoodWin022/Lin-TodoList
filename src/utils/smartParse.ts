/**
 * 智能任务解析器 - 从标题中自动识别任务属性
 *
 * 支持的格式:
 * - 日期: 今天, 明天, 后天, 昨天, 4月22日, 2024-04-22
 * - 时间: 下午3点, 3点, 15:00, 下午3点到5点, 15:00-17:00
 * - 优先级: #高, #中, #低
 * - 四象限: #第一象限, #第二象限, #重要紧急, #紧急不重要
 * - 标签: #工作, #重要
 */

export interface ParsedTask {
  title: string
  due_date?: string
  start_time?: string
  end_time?: string
  priority?: number
  quadrant?: number
  tags?: string
}

// 日期关键词映射
const DATE_KEYWORDS: Record<string, number> = {
  今天: 0,
  明天: 1,
  后天: 2,
  昨天: -1,
  前天: -2,
}

// 月日格式正则
const MONTH_DAY_REGEX = /(\d{1,2})月(\d{1,2})日?/
const DATE_REGEX = /(\d{4})年(\d{1,2})月(\d{1,2})日?/

// 时间格式正则
const TIME_REGEX = /(?:上午?|下午?|晚上?|凌晨?|早上?|中午?|傍晚?)?(\d{1,2})[:时](\d{0,2})/
const TIME_RANGE_REGEX =
  /(?:上午?|下午?|晚上?|凌晨?|早上?|中午?|傍晚?)?(\d{1,2})[:时](\d{0,2})?\s*[-~至到]\s*(?:上午?|下午?|晚上?|凌晨?|早上?|中午?|傍晚?)?(\d{1,2})[:时](\d{0,2})?/

// 优先级关键词
const PRIORITY_KEYWORDS: Record<string, number> = {
  '#高': 3,
  '#高优先级': 3,
  '#高优': 3,
  '#中': 2,
  '#中优先级': 2,
  '#中优': 2,
  '#低': 1,
  '#低优先级': 1,
  '#低优': 1,
  高优先级: 3,
  中优先级: 2,
  低优先级: 1,
}

// 四象限关键词
const QUADRANT_KEYWORDS: Record<string, number> = {
  '#第一象限': 1,
  '#第二象限': 2,
  '#第三象限': 3,
  '#第四象限': 4,
  '#重要紧急': 1,
  '#重要不紧急': 2,
  '#紧急不重要': 3,
  '#不紧急不重要': 4,
  第一象限: 1,
  第二象限: 2,
  第三象限: 3,
  第四象限: 4,
  重要紧急: 1,
  重要不紧急: 2,
  紧急不重要: 3,
  不紧急不重要: 4,
}

// 标签正则
const TAG_REGEX = /#[\w\u4e00-\u9fa5]+/g

/**
 * 解析日期字符串，返回 YYYY-MM-DD 格式
 */
function parseDate(dateStr: string): string | undefined {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()

  // 处理相对日期
  if (DATE_KEYWORDS[dateStr] !== undefined) {
    const offset = DATE_KEYWORDS[dateStr]
    const targetDate = new Date(year, month, day + offset)
    return formatDate(targetDate)
  }

  // 处理月日格式: 4月22日
  const monthDayMatch = dateStr.match(MONTH_DAY_REGEX)
  if (monthDayMatch) {
    const m = parseInt(monthDayMatch[1], 10)
    const d = parseInt(monthDayMatch[2], 10)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const targetDate = new Date(year, m - 1, d)
      // 如果日期已过，视为明年
      if (targetDate < today) {
        targetDate.setFullYear(year + 1)
      }
      return formatDate(targetDate)
    }
  }

  // 处理完整日期: 2024-04-22
  const fullDateMatch = dateStr.match(DATE_REGEX)
  if (fullDateMatch) {
    const y = parseInt(fullDateMatch[1], 10)
    const m = parseInt(fullDateMatch[2], 10)
    const d = parseInt(fullDateMatch[3], 10)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

  return undefined
}

/**
 * 解析时间字符串，返回 HH:mm 格式
 */
function parseTime(timeStr: string): string | undefined {
  const match = timeStr.match(TIME_REGEX)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = match[2] ? parseInt(match[2], 10) : 0

    // 处理下午/晚上等
    if (timeStr.includes('下午') || timeStr.includes('晚上') || timeStr.includes('傍晚')) {
      if (hours < 12) hours += 12
    } else if (timeStr.includes('凌晨') || timeStr.includes('早上')) {
      if (hours === 12) hours = 0
    }

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
  }
  return undefined
}

/**
 * 解析时间范围，返回开始时间和结束时间
 */
function parseTimeRange(rangeStr: string): { start_time?: string; end_time?: string } {
  const match = rangeStr.match(TIME_RANGE_REGEX)
  if (match) {
    // 开始时间
    let startHours = parseInt(match[1], 10)
    const startMinutes = match[2] ? parseInt(match[2], 10) : 0

    // 结束时间
    let endHours = parseInt(match[3], 10)
    const endMinutes = match[4] ? parseInt(match[4], 10) : 0

    // 处理下午/晚上等
    const isAfternoonStart =
      rangeStr.includes('下午') || rangeStr.includes('晚上') || rangeStr.includes('傍晚')
    const isAfternoonEnd =
      (match[0].match(/[-~至到]/)?.index ?? 0) >
      (rangeStr.indexOf('下午') ?? rangeStr.indexOf('晚上') ?? rangeStr.indexOf('傍晚') ?? -1)

    if (isAfternoonStart && startHours < 12) startHours += 12
    if (isAfternoonEnd && endHours < 12) endHours += 12

    // 凌晨/早上的情况
    if ((rangeStr.includes('凌晨') || rangeStr.includes('早上')) && startHours === 12)
      startHours = 0

    return {
      start_time: `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`,
      end_time: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
    }
  }

  // 单个时间
  const singleTime = parseTime(rangeStr)
  if (singleTime) {
    return { start_time: singleTime }
  }

  return {}
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 解析任务标题，提取所有可识别的属性
 *
 * @param input 原始输入字符串
 * @returns 解析后的任务对象和清理后的标题
 */
export function parseTaskInput(input: string): ParsedTask {
  const result: ParsedTask = { title: input }
  let title = input

  // 1. 解析日期关键词 (今天, 明天, 后天, 昨天)
  for (const keyword of Object.keys(DATE_KEYWORDS)) {
    if (title.includes(keyword)) {
      const date = parseDate(keyword)
      if (date) {
        result.due_date = date
        title = title.replace(keyword, '')
      }
    }
  }

  // 2. 解析月日格式 (4月22日)
  const monthDayMatch = title.match(MONTH_DAY_REGEX)
  if (monthDayMatch) {
    const date = parseDate(monthDayMatch[0])
    if (date) {
      result.due_date = date
      title = title.replace(MONTH_DAY_REGEX, '')
    }
  }

  // 3. 解析完整日期 (2024-04-22)
  if (DATE_REGEX.test(title)) {
    const match = title.match(DATE_REGEX)
    if (match) {
      const date = parseDate(match[0])
      if (date) {
        result.due_date = date
        title = title.replace(DATE_REGEX, '')
      }
    }
  }

  // 4. 解析时间范围 (下午3点到5点, 15:00-17:00)
  if (TIME_RANGE_REGEX.test(title)) {
    const match = title.match(TIME_RANGE_REGEX)
    if (match) {
      const times = parseTimeRange(match[0])
      if (times.start_time) result.start_time = times.start_time
      if (times.end_time) result.end_time = times.end_time
      title = title.replace(TIME_RANGE_REGEX, '')
    }
  }

  // 5. 解析单个时间 (下午3点, 3点)
  if (TIME_REGEX.test(title)) {
    const match = title.match(TIME_REGEX)
    if (match && !TIME_RANGE_REGEX.test(title)) {
      const time = parseTime(match[0])
      if (time) {
        result.start_time = time
        title = title.replace(TIME_REGEX, '')
      }
    }
  }

  // 6. 解析优先级
  for (const [keyword, priority] of Object.entries(PRIORITY_KEYWORDS)) {
    if (title.includes(keyword)) {
      result.priority = priority
      title = title.replace(keyword, '')
      break
    }
  }

  // 7. 解析四象限
  for (const [keyword, quadrant] of Object.entries(QUADRANT_KEYWORDS)) {
    if (title.includes(keyword)) {
      result.quadrant = quadrant
      title = title.replace(keyword, '')
      break
    }
  }

  // 8. 解析标签
  const tags: string[] = []
  const tagMatches = title.match(TAG_REGEX)
  if (tagMatches) {
    for (const tag of tagMatches) {
      tags.push(tag.replace('#', ''))
      title = title.replace(tag, '')
    }
  }
  if (tags.length > 0) {
    result.tags = JSON.stringify(tags)
  }

  // 9. 清理标题
  // 移除多余空格
  result.title = title.replace(/\s+/g, ' ').trim()
  // 移除多余的分隔符
  result.title = result.title.replace(/[-~至到:：]\s*$/, '').trim()

  return result
}
