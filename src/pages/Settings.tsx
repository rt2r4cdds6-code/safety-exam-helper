import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, Clock, Info, Volume2, VolumeX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false)
  const [reminderTimes, setReminderTimes] = useState(['08:30', '20:00'])
  const [notificationPermission, setNotificationPermission] = useState('default')

  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('dailyReminderEnabled')
    setDailyReminderEnabled(saved === 'true')

    const savedTimes = localStorage.getItem('reminderTimes')
    if (savedTimes) {
      setReminderTimes(JSON.parse(savedTimes))
    }

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const handleDailyReminderToggle = async () => {
    const newValue = !dailyReminderEnabled
    setDailyReminderEnabled(newValue)
    localStorage.setItem('dailyReminderEnabled', String(newValue))

    if (newValue && notificationPermission === 'default') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const handleAddTime = () => {
    if (reminderTimes.length < 4) {
      setReminderTimes([...reminderTimes, '08:30'])
    }
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...reminderTimes]
    newTimes[index] = value
    setReminderTimes(newTimes)
    localStorage.setItem('reminderTimes', JSON.stringify(newTimes))
  }

  const handleRemoveTime = (index: number) => {
    if (reminderTimes.length > 1) {
      const newTimes = reminderTimes.filter((_, i) => i !== index)
      setReminderTimes(newTimes)
      localStorage.setItem('reminderTimes', JSON.stringify(newTimes))
    }
  }

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  return (
    <div className="p-4 pb-20">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">设置</h1>
      </header>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-3 rounded-xl">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">每日提醒</h3>
              <p className="text-sm text-gray-500">定时提醒您完成每日学习任务</p>
            </div>
          </div>
          <button
            onClick={handleDailyReminderToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              dailyReminderEnabled ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                dailyReminderEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {dailyReminderEnabled && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-primary-500 mr-2" />
            提醒时间
          </h3>
          <div className="space-y-3">
            {reminderTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => handleRemoveTime(index)}
                  disabled={reminderTimes.length === 1}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <VolumeX className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          {reminderTimes.length < 4 && (
            <button
              onClick={handleAddTime}
              className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              添加提醒时间
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Info className="w-5 h-5 text-primary-500 mr-2" />
          通知权限
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            {notificationPermission === 'granted'
              ? '已允许'
              : notificationPermission === 'denied'
              ? '已拒绝'
              : '未设置'}
          </span>
          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
            >
              {notificationPermission === 'denied' ? '前往设置' : '允许通知'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3">关于应用</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>版本：1.0.0</p>
          <p>名称：注安师备考助手</p>
          <p>描述：帮助您备考注册安全工程师考试</p>
          <p className="text-xs text-gray-400 mt-4">
            本应用基于 React + TypeScript + Vite 构建，支持离线使用
          </p>
        </div>
      </div>
    </div>
  )
}
