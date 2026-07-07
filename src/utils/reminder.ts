import { getDailyTasks } from '../db'

let reminderInterval: ReturnType<typeof setInterval> | null = null

export async function setupDailyReminder(): Promise<void> {
  if (reminderInterval) {
    clearInterval(reminderInterval)
  }

  const checkAndNotify = async () => {
    const enabled = localStorage.getItem('dailyReminderEnabled') === 'true'
    if (!enabled) return

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const reminderTimesStr = localStorage.getItem('reminderTimes')
    const reminderTimes: string[] = reminderTimesStr ? JSON.parse(reminderTimesStr) : ['08:30', '20:00']

    if (!reminderTimes.includes(currentTime)) {
      return
    }

    const lastNotifiedTime = localStorage.getItem('lastNotifiedTime')
    if (lastNotifiedTime === `${todayStr}-${currentTime}`) {
      return
    }

    try {
      const tasks = await getDailyTasks()
      const todayTask = tasks.find((t) => t.date === todayStr)

      let hasUncompletedChapters = false
      if (todayTask && todayTask.chapters) {
        hasUncompletedChapters = todayTask.chapters.some((ch) => !ch.completed)
      }

      if (hasUncompletedChapters) {
        new Notification('注安师备考助手', {
          body: '今天的复习任务还未完成，记得学习哦！',
          icon: '/icon-192x192.png',
          tag: 'daily-reminder',
        })
        localStorage.setItem('lastNotifiedTime', `${todayStr}-${currentTime}`)
      }
    } catch (error) {
      console.error('Failed to check daily tasks:', error)
    }
  }

  checkAndNotify()

  reminderInterval = setInterval(checkAndNotify, 60000)
}

export function clearDailyReminder(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
  }
}
