import { useState, useEffect } from 'react'
import { Target, Clock, CheckCircle, TrendingUp, BookOpen, AlertCircle, Award, ArrowRight, CheckCircle2, AlertTriangle, X, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { generateDailyTask, updateDailyTaskChapter, getStudyProgressByStatus, getRealAndVariantQuestions, checkYesterdayTaskCompletion, findWeakChapters, checkLongTimeNoStudy } from '../db'
import type { DailyTask, WeakChapter } from '../types'

export default function Home() {
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null)
  const [wrongCount, setWrongCount] = useState(0)
  const [bookmarkedCount, setBookmarkedCount] = useState(0)
  const [realQuestionCount, setRealQuestionCount] = useState(0)
  const [showYesterdayWarning, setShowYesterdayWarning] = useState(false)
  const [weakChapters, setWeakChapters] = useState<WeakChapter[]>([])
  const [showLongTimeWarning, setShowLongTimeWarning] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')

  const navigate = useNavigate()

  useEffect(() => {
    const checkPermissions = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          const longTimeNoStudy = await checkLongTimeNoStudy()
          const lastNotifDate = localStorage.getItem('lastNotifDate')
          const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
          
          if (longTimeNoStudy && lastNotifDate !== todayStr) {
            new Notification('注安师备考助手', {
              body: '您已经超过2天未学习了，请尽快制定学习计划！',
              icon: '/icon-192x192.png',
            })
            localStorage.setItem('lastNotifDate', todayStr)
          }
        }
      }
    }
    checkPermissions()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const task = await generateDailyTask()
      setDailyTask(task)

      const wrongProgress = await getStudyProgressByStatus('wrong')
      setWrongCount(wrongProgress.length)

      const bookmarkedProgress = await getStudyProgressByStatus('bookmarked')
      setBookmarkedCount(bookmarkedProgress.length)

      const realQuestions = await getRealAndVariantQuestions()
      setRealQuestionCount(realQuestions.length)

      const yesterdayCompleted = await checkYesterdayTaskCompletion()
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const lastAlertDate = localStorage.getItem('lastAlertDate')
      const dismissedAlertDate = localStorage.getItem('dismissedAlertDate')
      
      if (now.getHours() >= 9 && !yesterdayCompleted && lastAlertDate !== todayStr) {
        setShowYesterdayWarning(true)
        localStorage.setItem('lastAlertDate', todayStr)
      } else if (lastAlertDate === todayStr && !yesterdayCompleted && dismissedAlertDate !== todayStr) {
        setShowYesterdayWarning(true)
      }

      const chapters = await findWeakChapters()
      setWeakChapters(chapters)

      const longTimeNoStudy = await checkLongTimeNoStudy()
      if (longTimeNoStudy) {
        setShowLongTimeWarning(true)
      }
    }

    loadData()
  }, [])

  const handleCompleteChapter = async (chapterId: string) => {
    if (!dailyTask) return
    const chapter = dailyTask.chapters.find((ch) => ch.chapterId === chapterId)
    if (!chapter) return

    await updateDailyTaskChapter(dailyTask, chapterId, !chapter.completed)
    const updatedTask = await generateDailyTask()
    setDailyTask(updatedTask)

    const chapters = await findWeakChapters()
    setWeakChapters(chapters)
  }

  const handleStartChapter = (chapterId: string, chapterName: string) => {
    navigate(`/practice/${chapterId}`, { state: { chapterName } })
  }

  const taskProgress = dailyTask
    ? Math.min((dailyTask.completedQuestions / dailyTask.targetQuestions) * 100, 100)
    : 0

  const subjectColors: Record<string, string> = {
    '法规': 'bg-blue-100 text-blue-600',
    '管理': 'bg-green-100 text-green-600',
    '技术': 'bg-purple-100 text-purple-600',
    '实务': 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="p-4 pb-20">
      {showYesterdayWarning && (
        <div className="bg-red-500 text-white rounded-xl p-4 mb-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-medium">昨日有未完成任务，请尽快补上</span>
          </div>
          <button
            onClick={() => {
              setShowYesterdayWarning(false)
              const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
              localStorage.setItem('dismissedAlertDate', todayStr)
            }}
            className="p-1 hover:bg-red-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {showLongTimeWarning && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-4 flex items-start gap-3">
          <Bell className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-yellow-800">您已经超过2天未学习了</span>
            <p className="text-sm text-yellow-700 mt-1">建议尽快制定学习计划，保持良好的学习习惯</p>
          </div>
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">注安师备考助手</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </p>
      </header>

      {weakChapters.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            以下薄弱章节需强化
          </h3>
          <div className="space-y-2">
            {weakChapters.map((chapter) => (
              <div
                key={chapter.chapterId}
                className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4 border-red-500"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{chapter.chapterName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColors[chapter.subject]}`}>
                      {chapter.subject}
                    </span>
                    <span className="text-xs text-red-600">
                      连续{chapter.consecutiveDays}天正确率{chapter.avgAccuracy}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChapter(chapter.chapterId, chapter.chapterName)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  强化练习
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">今日任务</h2>
            <p className="text-primary-100 text-sm">坚持就是胜利</p>
          </div>
          <Target className="w-10 h-10 text-primary-200" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>任务完成</span>
              <span>{dailyTask?.completedQuestions || 0}/{dailyTask?.targetQuestions || 0} 章</span>
            </div>
            <div className="h-3 bg-primary-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>学习时长</span>
              <span>{dailyTask?.completedTime || 0}/{dailyTask?.targetTime || 60} 分钟</span>
            </div>
            <div className="h-3 bg-primary-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((dailyTask?.completedTime || 0) / 60) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {dailyTask && dailyTask.chapters.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 text-primary-500 mr-2" />
            今日学习清单
          </h3>
          <div className="space-y-3">
            {dailyTask.chapters.map((chapter) => (
              <div
                key={chapter.chapterId}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  chapter.completed ? 'bg-green-50' : chapter.isWeak ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCompleteChapter(chapter.chapterId)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      chapter.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {chapter.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div>
                    <h4 className={`font-medium ${chapter.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {chapter.chapterName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColors[chapter.subject]}`}>
                        {chapter.subject}
                      </span>
                      {chapter.isWeak && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          薄弱
                        </span>
                      )}
                      {chapter.completed && chapter.accuracy !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          chapter.accuracy >= 60 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {chapter.accuracy}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChapter(chapter.chapterId, chapter.chapterName)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    chapter.completed
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : chapter.isWeak
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {chapter.completed ? '去练习' : '开始学习'}
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!dailyTask || dailyTask.chapters.length === 0) && (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">暂无今日任务</h3>
          <p className="text-gray-500 text-sm">
            当前题库中没有带题目数的章节，请先在题库中添加题目
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-xl font-bold text-red-500">{wrongCount}</span>
          </div>
          <p className="text-gray-600 text-xs">待复习错题</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-bold text-yellow-500">{bookmarkedCount}</span>
          </div>
          <p className="text-gray-600 text-xs">已收藏题目</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-blue-500">{realQuestionCount}</span>
          </div>
          <p className="text-gray-600 text-xs">真题/变型题</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          学习建议
        </h3>
        <ul className="space-y-3">
          {taskProgress < 50 && dailyTask && dailyTask.chapters.length > 0 && (
            <li className="flex items-start text-gray-600 text-sm">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>今天的学习任务还未完成一半，继续加油！</span>
            </li>
          )}
          {wrongCount > 0 && (
            <li className="flex items-start text-gray-600 text-sm">
              <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>还有 {wrongCount} 道错题需要复习，建议优先处理。</span>
            </li>
          )}
          <li className="flex items-start text-gray-600 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <span>每天坚持学习，保持良好的学习习惯。</span>
          </li>
          <li className="flex items-start text-gray-600 text-sm">
            <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
            <span>定期进行模拟考试，检验学习成果。</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
