import { useState, useEffect } from 'react'
import { BookOpen, Award, Calendar, Target, Clock, CheckCircle, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getExamRecords, getDailyTasks, getChapters, getStudyProgressByStatus } from '../db'
import type { ExamRecord, DailyTask, Chapter } from '../types'

const COLORS = {
  '法规': '#3B82F6',
  '管理': '#10B981',
  '技术': '#8B5CF6',
  '实务': '#F59E0B',
}

export default function Stats() {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([])
  const [wrongCount, setWrongCount] = useState(0)
  const [bookmarkedCount, setBookmarkedCount] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const tasks = await getDailyTasks()
      setDailyTasks(tasks)

      const chaps = await getChapters()
      setChapters(chaps)

      const records = await getExamRecords()
      setExamRecords(records)

      const wrongProgress = await getStudyProgressByStatus('wrong')
      setWrongCount(wrongProgress.length)

      const bookmarkedProgress = await getStudyProgressByStatus('bookmarked')
      setBookmarkedCount(bookmarkedProgress.length)
    }

    loadData()
  }, [])

  const subjectStats = () => {
    const stats: Record<string, { total: number; completed: number }> = {
      '法规': { total: 0, completed: 0 },
      '管理': { total: 0, completed: 0 },
      '技术': { total: 0, completed: 0 },
      '实务': { total: 0, completed: 0 },
    }

    chapters.forEach((ch) => {
      if (stats[ch.subject]) {
        stats[ch.subject].total++
      }
    })

    const completedChapters = new Set<string>()
    dailyTasks.forEach((task) => {
      task.chapters.forEach((ch) => {
        if (ch.completed) {
          completedChapters.add(ch.chapterId)
        }
      })
    })

    chapters.forEach((ch) => {
      if (completedChapters.has(ch.id) && stats[ch.subject]) {
        stats[ch.subject].completed++
      }
    })

    return stats
  }

  const getLast7DaysData = () => {
    const today = new Date()
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      const dayTasks = dailyTasks.filter((t) => t.date === dateStr)
      
      let totalAccuracy = 0
      let count = 0
      dayTasks.forEach((task) => {
        task.chapters.forEach((ch) => {
          if (ch.accuracy !== undefined) {
            totalAccuracy += ch.accuracy
            count++
          }
        })
      })
      
      const avgAccuracy = count > 0 ? Math.round(totalAccuracy / count) : 0
      
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        accuracy: avgAccuracy,
        fullMark: 100,
      })
    }
    
    return data
  }

  const lastExamRecord = examRecords.length > 0 
    ? examRecords[examRecords.length - 1]
    : null

  const stats = subjectStats()
  const weekData = getLast7DaysData()

  const totalCompleted = Object.values(stats).reduce((sum, s) => sum + s.completed, 0)
  const totalChapters = Object.values(stats).reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">进度统计</h1>
        <p className="text-gray-500 text-sm mt-1">查看您的学习数据</p>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            <span className="text-xs text-gray-500">总章节</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalChapters}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500">已完成</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{totalCompleted}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500">完成率</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">
            {totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="w-5 h-5 text-primary-500 mr-2" />
          各科目进度
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats).map(([subject, data]) => (
            <div key={subject} className="flex items-center gap-4">
              <div className="w-20 h-20 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '已完成', value: data.completed },
                        { name: '未完成', value: data.total - data.completed },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={24}
                      outerRadius={36}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={COLORS[subject as keyof typeof COLORS]} />
                      <Cell fill="#F3F4F6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">
                    {data.completed}/{data.total}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[subject as keyof typeof COLORS] }}
                  />
                  <span className="font-medium text-gray-800">{subject}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%`,
                      backgroundColor: COLORS[subject as keyof typeof COLORS],
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1 block">
                  {data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 text-primary-500 mr-2" />
          近7天练习正确率趋势
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, '正确率']}
                contentStyle={{ borderRadius: '8px', border: 'none' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                name="正确率"
              />
              <Line
                type="monotone"
                dataKey="fullMark"
                stroke="#E5E7EB"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="满分"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">待复习错题</span>
          </div>
          <div className="text-3xl font-bold text-red-500">{wrongCount}</div>
          <div className="text-xs text-gray-400 mt-1">需要重点复习</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600">已收藏题目</span>
          </div>
          <div className="text-3xl font-bold text-yellow-500">{bookmarkedCount}</div>
          <div className="text-xs text-gray-400 mt-1">重点关注内容</div>
        </div>
      </div>

      {lastExamRecord && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white">
          <h3 className="font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 text-primary-200 mr-2" />
            最近一次模拟考试
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-primary-100">{lastExamRecord.subject}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {lastExamRecord.questionCount}题 / {lastExamRecord.durationLimit}分钟
                </span>
              </div>
              <span className="text-xs text-primary-100">
                {new Date(lastExamRecord.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${
                lastExamRecord.score >= 60 ? 'text-green-300' : 'text-red-300'
              }`}>
                {lastExamRecord.score}分
              </div>
              <div className="text-xs text-primary-100">
                用时 {Math.floor(lastExamRecord.duration / 60)}:{String(lastExamRecord.duration % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}

      {!lastExamRecord && (
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <h3 className="font-semibold text-gray-800 mb-2">暂无模拟考试记录</h3>
          <p className="text-gray-500 text-sm">建议定期进行模拟考试，检验学习成果</p>
        </div>
      )}
    </div>
  )
}
