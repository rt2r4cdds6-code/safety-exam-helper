import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Clock, Flag, CheckCircle, XCircle, RotateCcw, ArrowRight, FileText, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getRealAndVariantQuestions, addExamRecord, getExamRecords, generateId } from '../db'
import type { Question, ExamRecord } from '../types'

export type ExamStatus = 'idle' | 'ongoing' | 'finished'

const subjects = ['全部科目', '法规', '管理', '技术', '实务']
const questionCounts = [50, 100]
const durationOptions = [60, 120]

const examQuestions: Question[] = [
  { id: 'exam-1', type: 'single', chapter: '安全生产法', content: '根据《安全生产法》，生产经营单位应当建立健全（），加强安全生产标准化、信息化建设。', options: ['全员安全生产责任制', '安全生产管理制度', '安全生产培训体系', '安全风险管理制度'], answer: 'A', analysis: '根据《安全生产法》第四条规定，生产经营单位应当建立健全全员安全生产责任制和安全生产规章制度。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-2', type: 'single', chapter: '安全生产法', content: '依据《安全生产法》，从业人员超过（）人的生产经营单位，应当设置安全生产管理机构或者配备专职安全生产管理人员。', options: ['50', '100', '200', '300'], answer: 'B', analysis: '根据《安全生产法》第二十四条规定，从业人员超过一百人的，应当设置安全生产管理机构或者配备专职安全生产管理人员。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-3', type: 'single', chapter: '危险化学品安全管理条例', content: '根据《危险化学品安全管理条例》，危险化学品生产企业应当提供与其生产的危险化学品相符的（）。', options: ['化学品安全技术说明书', '产品质量合格证', '安全操作规程', '应急处置预案'], answer: 'A', analysis: '根据《危险化学品安全管理条例》第十五条规定，危险化学品生产企业应当提供与其生产的危险化学品相符的化学品安全技术说明书。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-4', type: 'single', chapter: '消防法', content: '依据《消防法》，消防安全重点单位应当实行（）防火巡查，并建立巡查记录。', options: ['每日', '每周', '每月', '每季度'], answer: 'A', analysis: '根据《消防法》第十七条规定，消防安全重点单位应当实行每日防火巡查，并建立巡查记录。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-5', type: 'single', chapter: '特种设备安全法', content: '根据《特种设备安全法》，特种设备使用单位应当在检验合格有效期届满前（）向特种设备检验机构提出定期检验要求。', options: ['15天', '一个月', '两个月', '三个月'], answer: 'B', analysis: '根据《特种设备安全法》第四十条规定，特种设备使用单位应当在检验合格有效期届满前一个月向特种设备检验机构提出定期检验要求。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-6', type: 'single', chapter: '安全生产法', content: '生产经营单位的主要负责人未履行安全生产管理职责导致发生一般事故的，应急管理部门应当处以（）的罚款。', options: ['上一年年收入30%', '上一年年收入40%', '上一年年收入60%', '上一年年收入80%'], answer: 'B', analysis: '根据《安全生产法》第九十五条规定，发生一般事故的，处上一年年收入百分之四十的罚款。', difficulty: 2, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-7', type: 'single', chapter: '生产安全事故报告和调查处理条例', content: '依据《生产安全事故报告和调查处理条例》，造成3人以下死亡的事故属于（）。', options: ['特别重大事故', '重大事故', '较大事故', '一般事故'], answer: 'D', analysis: '根据《生产安全事故报告和调查处理条例》第三条规定，一般事故是指造成3人以下死亡，或者10人以下重伤，或者1000万元以下直接经济损失的事故。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-8', type: 'single', chapter: '建设工程安全生产管理条例', content: '根据《建设工程安全生产管理条例》，施工单位应当设立（），配备专职安全生产管理人员。', options: ['安全生产管理机构', '安全生产委员会', '安全生产领导小组', '安全生产办公室'], answer: 'A', analysis: '根据《建设工程安全生产管理条例》第二十三条规定，施工单位应当设立安全生产管理机构，配备专职安全生产管理人员。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-9', type: 'single', chapter: '职业病防治法', content: '依据《职业病防治法》，用人单位应当为劳动者建立（），并按照规定的期限妥善保存。', options: ['职业健康监护档案', '职业病防治档案', '健康检查记录', '职业卫生档案'], answer: 'A', analysis: '根据《职业病防治法》第三十六条规定，用人单位应当为劳动者建立职业健康监护档案，并按照规定的期限妥善保存。', difficulty: 2, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-10', type: 'single', chapter: '工伤保险条例', content: '根据《工伤保险条例》，职工发生事故伤害或者按照职业病防治法规定被诊断、鉴定为职业病，所在单位应当自事故伤害发生之日起（）日内，向统筹地区社会保险行政部门提出工伤认定申请。', options: ['15', '30', '45', '60'], answer: 'B', analysis: '根据《工伤保险条例》第十七条规定，职工发生事故伤害或者按照职业病防治法规定被诊断、鉴定为职业病，所在单位应当自事故伤害发生之日起30日内，向统筹地区社会保险行政部门提出工伤认定申请。', difficulty: 2, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-11', type: 'single', chapter: '安全生产法', content: '依据《安全生产法》，生产经营单位使用被派遣劳动者的，被派遣劳动者（）本法规定的从业人员的权利，并应当履行本法规定的从业人员的义务。', options: ['享有', '不享有', '部分享有', '视情况享有'], answer: 'A', analysis: '根据《安全生产法》第五十八条规定，生产经营单位使用被派遣劳动者的，被派遣劳动者享有本法规定的从业人员的权利，并应当履行本法规定的从业人员的义务。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-12', type: 'single', chapter: '危险化学品安全管理条例', content: '依据《危险化学品安全管理条例》，危险化学品经营企业应当向所在地（）人民政府安全生产监督管理部门提出申请。', options: ['县级', '设区的市级', '省级', '国务院'], answer: 'B', analysis: '根据《危险化学品安全管理条例》第三十五条规定，从事危险化学品经营的企业应当向所在地设区的市级人民政府安全生产监督管理部门提出申请。', difficulty: 2, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-13', type: 'single', chapter: '消防法', content: '根据《消防法》，消防设施、器材或者消防安全标志的配置、设置不符合国家标准、行业标准，或者未保持完好有效的，责令改正，处（）罚款。', options: ['一千元以上一万元以下', '五千元以上五万元以下', '一万元以上十万元以下', '五万元以上五十万元以下'], answer: 'B', analysis: '根据《消防法》第六十条规定，单位违反本法规定，有下列行为之一的，责令改正，处五千元以上五万元以下罚款。', difficulty: 2, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-14', type: 'single', chapter: '特种设备安全法', content: '依据《特种设备安全法》，特种设备安全管理人员、检测人员和作业人员应当按照国家有关规定取得（）资格，方可从事相关工作。', options: ['相应', '初级', '中级', '高级'], answer: 'A', analysis: '根据《特种设备安全法》第十四条规定，特种设备安全管理人员、检测人员和作业人员应当按照国家有关规定取得相应资格，方可从事相关工作。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'exam-15', type: 'single', chapter: '生产安全事故报告和调查处理条例', content: '根据《生产安全事故报告和调查处理条例》，事故发生后，事故现场有关人员应当立即向本单位负责人报告；单位负责人接到报告后，应当于（）内向事故发生地县级以上人民政府安全生产监督管理部门报告。', options: ['1小时', '2小时', '12小时', '24小时'], answer: 'A', analysis: '根据《生产安全事故报告和调查处理条例》第九条规定，单位负责人接到报告后，应当于1小时内向事故发生地县级以上人民政府安全生产监督管理部门报告。', difficulty: 1, tags: [], isRealQuestion: true, createdAt: Date.now(), updatedAt: Date.now() },
]

export default function Exam() {
  const [status, setStatus] = useState<ExamStatus>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [duration, setDuration] = useState(0)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([])
  
  const [selectedSubject, setSelectedSubject] = useState('全部科目')
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(50)
  const [selectedDuration, setSelectedDuration] = useState(60)
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)
  const endExamRef = useRef<() => Promise<void>>(async () => {})

  useEffect(() => {
    const loadRecords = async () => {
      const records = await getExamRecords()
      setExamRecords(records.reverse())
    }
    loadRecords()
  }, [])

  useEffect(() => {
    durationRef.current = duration
  }, [duration])

  useEffect(() => {
    endExamRef.current = endExam
  }, [endExam])

  useEffect(() => {
    if (status === 'ongoing') {
      durationRef.current = 0
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        setDuration(durationRef.current)
        
        if (durationRef.current >= selectedDuration * 60) {
          if (timerRef.current) clearInterval(timerRef.current)
          endExamRef.current()
        }
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status, selectedDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeRemaining = () => {
    const totalSeconds = selectedDuration * 60
    const remaining = totalSeconds - duration
    if (remaining <= 0) return '00:00'
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startExam = async () => {
    let filtered = [...examQuestions]
    if (selectedSubject !== '全部科目') {
      filtered = filtered.filter((q) => {
        const chapterSubjectMap: Record<string, string> = {
          '安全生产法': '法规',
          '危险化学品安全管理条例': '法规',
          '消防法': '法规',
          '特种设备安全法': '法规',
          '生产安全事故报告和调查处理条例': '法规',
          '建设工程安全生产管理条例': '法规',
          '职业病防治法': '法规',
          '工伤保险条例': '法规',
        }
        return chapterSubjectMap[q.chapter] === selectedSubject
      })
    }

    const dbQuestions = await getRealAndVariantQuestions()
    const dbFiltered = selectedSubject !== '全部科目'
      ? dbQuestions.filter((q) => {
          const chapterSubjectMap: Record<string, string> = {
            '安全生产法': '法规',
            '危险化学品安全管理条例': '法规',
            '消防法': '法规',
            '特种设备安全法': '法规',
          }
          return chapterSubjectMap[q.chapter] === selectedSubject
        })
      : dbQuestions

    const allQuestions = [...filtered, ...dbFiltered]
    const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, selectedQuestionCount)
    
    setQuestions(shuffled)
    setCurrentIndex(0)
    setAnswers({})
    setDuration(0)
    setFlagged(new Set())
    setStatus('ongoing')
  }

  const endExam = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    const correctAnswers: Record<string, string | string[]> = {}
    let correctCount = 0

    questions.forEach((q) => {
      correctAnswers[q.id] = q.answer
      const userAnswer = answers[q.id]
      if (Array.isArray(q.answer)) {
        if (Array.isArray(userAnswer) &&
          q.answer.length === userAnswer.length &&
          q.answer.every((a) => userAnswer.includes(a))) {
          correctCount++
        }
      } else if (userAnswer === q.answer) {
        correctCount++
      }
    })

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0

    const record: ExamRecord = {
      id: generateId(),
      title: `模拟考试 ${new Date().toLocaleString('zh-CN')}`,
      subject: selectedSubject,
      questionCount: selectedQuestionCount,
      durationLimit: selectedDuration,
      questions: questions.map((q) => q.id),
      userAnswers: answers,
      correctAnswers,
      score,
      totalScore: 100,
      duration,
      createdAt: Date.now(),
    }

    await addExamRecord(record)
    setStatus('finished')
    
    const records = await getExamRecords()
    setExamRecords(records.reverse())
  }, [questions, answers, duration, selectedSubject, selectedQuestionCount, selectedDuration])

  const handleOptionClick = (option: string) => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    if (currentQuestion.type === 'multiple') {
      const current = (answers[currentQuestion.id] as string[]) || []
      const newAnswer = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option].sort()
      setAnswers({ ...answers, [currentQuestion.id]: newAnswer })
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: option })
    }
  }

  const toggleFlag = () => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    const newFlagged = new Set(flagged)
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id)
    } else {
      newFlagged.add(currentQuestion.id)
    }
    setFlagged(newFlagged)
  }

  const currentQuestion = questions[currentIndex]

  const typeLabels: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
  }

  const countCorrectAnswers = () => {
    let count = 0
    questions.forEach((q) => {
      const userAnswer = answers[q.id]
      if (Array.isArray(q.answer)) {
        if (Array.isArray(userAnswer) &&
          q.answer.length === userAnswer.length &&
          q.answer.every((a) => userAnswer.includes(a))) {
          count++
        }
      } else if (userAnswer === q.answer) {
        count++
      }
    })
    return count
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const chartData = examRecords.slice(0, 10).reverse().map((record, index) => ({
    name: `第${index + 1}次`,
    score: record.score,
    fullMark: 100,
  }))

  return (
    <div className="p-4 pb-20">
      {status === 'idle' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">模拟考试</h1>
                <p className="text-primary-100 text-sm">检验学习成果，提升答题能力</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">选择科目</h3>
            <div className="grid grid-cols-3 gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">题目数量</h3>
            <div className="grid grid-cols-2 gap-3">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedQuestionCount(count)}
                  className={`py-3 rounded-xl text-lg font-medium transition-colors ${
                    selectedQuestionCount === count
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {count} 题
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">考试时长</h3>
            <div className="grid grid-cols-2 gap-3">
              {durationOptions.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedDuration(time)}
                  className={`py-3 rounded-xl text-lg font-medium transition-colors ${
                    selectedDuration === time
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {time} 分钟
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6" />
            开始考试
          </button>

          {examRecords.length > 0 && (
            <>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">成绩趋势</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number) => [`${value}分`, '得分']}
                        contentStyle={{ borderRadius: '8px', border: 'none' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 4 }}
                        name="得分"
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

              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">历史成绩</h3>
                <div className="space-y-3">
                  {examRecords.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {record.subject}
                          </span>
                          <span className="text-xs text-gray-400">
                            {record.questionCount}题 / {record.durationLimit}分钟
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(record.createdAt)}</span>
                      </div>
                      <div className={`text-xl font-bold ${
                        record.score >= 60 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {record.score}分
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {status === 'ongoing' && questions.length > 0 && (
        <>
          <header className="flex justify-between items-center mb-4">
            <div className={`flex items-center gap-2 ${duration >= selectedDuration * 60 * 0.8 ? 'text-red-500' : 'text-gray-500'}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-bold">{getTimeRemaining()}</span>
            </div>
            <button
              onClick={endExam}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              交卷
            </button>
          </header>

          <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(index)}
                className={`w-8 h-8 rounded-lg text-sm font-medium flex-shrink-0 transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-500 text-white'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-600'
                    : flagged.has(q.id)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  currentQuestion.type === 'single' ? 'bg-blue-100 text-blue-600' :
                  currentQuestion.type === 'multiple' ? 'bg-purple-100 text-purple-600' :
                  currentQuestion.type === 'judge' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {typeLabels[currentQuestion.type]}
                </span>
                <span className="text-sm text-gray-500">第 {currentIndex + 1}/{questions.length} 题</span>
              </div>
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  flagged.has(currentQuestion.id)
                    ? 'text-yellow-600'
                    : 'text-gray-400'
                }`}
              >
                <Flag size={16} />
                {flagged.has(currentQuestion.id) ? '已标记' : '标记'}
              </button>
            </div>

            <p className="text-gray-800 text-base mb-6">{currentQuestion.content}</p>

            {currentQuestion.type === 'fill' ? (
              <input
                type="text"
                value={(answers[currentQuestion.id] as string) || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:border-primary-500"
                placeholder="请输入答案"
              />
            ) : currentQuestion.type === 'judge' ? (
              <div className="flex gap-4">
                <button
                  onClick={() => handleOptionClick('正确')}
                  className={`flex-1 py-4 rounded-xl text-lg font-medium transition-colors ${
                    answers[currentQuestion.id] === '正确'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  正确
                </button>
                <button
                  onClick={() => handleOptionClick('错误')}
                  className={`flex-1 py-4 rounded-xl text-lg font-medium transition-colors ${
                    answers[currentQuestion.id] === '错误'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-6 h-6 mx-auto mb-2" />
                  错误
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index)
                  const isSelected = currentQuestion.type === 'multiple'
                    ? (answers[currentQuestion.id] as string[])?.includes(optionLabel)
                    : answers[currentQuestion.id] === optionLabel

                  return (
                    <button
                      key={optionLabel}
                      onClick={() => handleOptionClick(optionLabel)}
                      className={`w-full p-4 rounded-xl text-left transition-colors flex items-center gap-3 ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isSelected ? 'bg-white text-primary-500' : 'bg-white text-gray-400'
                      }`}>
                        {optionLabel}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                currentIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              上一题
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-primary-500 text-white flex items-center justify-center gap-2"
              disabled={currentIndex === questions.length - 1}
            >
              {currentIndex === questions.length - 1 ? '检查答案' : '下一题'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {status === 'finished' && questions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              countCorrectAnswers() / questions.length >= 0.6
                ? 'bg-green-400'
                : 'bg-red-400'
            }`}>
              <span className="text-3xl font-bold text-white">
                {questions.length > 0 ? Math.round((countCorrectAnswers() / questions.length) * 100) : 0}
              </span>
            </div>
            <div className="text-4xl font-bold mb-2">考试完成</div>
            <p className="text-primary-100">
              用时 {formatTime(duration)}，答对 {countCorrectAnswers()}/{questions.length} 题
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">答题统计</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {countCorrectAnswers()}
                </div>
                <div className="text-sm text-gray-500">正确</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {questions.length - countCorrectAnswers()}
                </div>
                <div className="text-sm text-gray-500">错误</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {formatTime(duration)}
                </div>
                <div className="text-sm text-gray-500">用时</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">答题详情</h3>
            <div className="space-y-4">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id]
                const isCorrect = Array.isArray(q.answer)
                  ? Array.isArray(userAnswer) &&
                    q.answer.length === userAnswer.length &&
                    q.answer.every((a) => userAnswer.includes(a))
                  : userAnswer === q.answer

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg ${
                      isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                      }`}>
                        {isCorrect ? '正确' : '错误'}
                      </span>
                      <span className="text-sm text-gray-500">第 {index + 1} 题</span>
                    </div>
                    <p className="text-gray-800 text-sm mb-2">{q.content}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-600">
                        你的答案：<span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {userAnswer || '未作答'}
                        </span>
                      </span>
                      {!isCorrect && (
                        <span className="text-gray-600">
                          正确答案：<span className="text-green-600">{q.answer}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setStatus('idle')}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            返回首页
          </button>
        </div>
      )}
    </div>
  )
}
