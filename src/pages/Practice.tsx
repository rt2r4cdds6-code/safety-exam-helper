import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { updateChapterAccuracy, getRealAndVariantQuestions } from '../db'
import type { Question } from '../types'

const chapterQuestions: Record<string, Question[]> = {
  '安全生产法': [
    {
      id: 'law-1',
      type: 'single',
      chapter: '安全生产法',
      content: '根据《安全生产法》，生产经营单位应当建立健全（），加强安全生产标准化、信息化建设。',
      options: ['全员安全生产责任制', '安全生产管理制度', '安全生产培训体系', '安全风险管理制度'],
      answer: 'A',
      analysis: '根据《安全生产法》第四条规定，生产经营单位应当建立健全全员安全生产责任制和安全生产规章制度。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'law-2',
      type: 'single',
      chapter: '安全生产法',
      content: '依据《安全生产法》，从业人员超过（）人的生产经营单位，应当设置安全生产管理机构或者配备专职安全生产管理人员。',
      options: ['50', '100', '200', '300'],
      answer: 'B',
      analysis: '根据《安全生产法》第二十四条规定，从业人员超过一百人的，应当设置安全生产管理机构或者配备专职安全生产管理人员。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'law-3',
      type: 'single',
      chapter: '安全生产法',
      content: '生产经营单位的主要负责人未履行安全生产管理职责导致发生一般事故的，应急管理部门应当处以（）的罚款。',
      options: ['上一年年收入30%', '上一年年收入40%', '上一年年收入60%', '上一年年收入80%'],
      answer: 'B',
      analysis: '根据《安全生产法》第九十五条规定，发生一般事故的，处上一年年收入百分之四十的罚款。',
      difficulty: 2,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'law-4',
      type: 'single',
      chapter: '安全生产法',
      content: '依据《安全生产法》，生产经营单位使用被派遣劳动者的，被派遣劳动者（）本法规定的从业人员的权利，并应当履行本法规定的从业人员的义务。',
      options: ['享有', '不享有', '部分享有', '视情况享有'],
      answer: 'A',
      analysis: '根据《安全生产法》第五十八条规定，生产经营单位使用被派遣劳动者的，被派遣劳动者享有本法规定的从业人员的权利，并应当履行本法规定的从业人员的义务。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'law-5',
      type: 'single',
      chapter: '安全生产法',
      content: '根据《安全生产法》，生产经营单位应当建立（）制度，按照安全风险分级采取相应的管控措施。',
      options: ['安全风险分级管控', '隐患排查治理', '安全生产责任制', '安全教育培训'],
      answer: 'A',
      analysis: '根据《安全生产法》第四十一条规定，生产经营单位应当建立安全风险分级管控制度，按照安全风险分级采取相应的管控措施。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  '危险化学品安全管理条例': [
    {
      id: 'chem-1',
      type: 'single',
      chapter: '危险化学品安全管理条例',
      content: '根据《危险化学品安全管理条例》，危险化学品生产企业应当提供与其生产的危险化学品相符的（）。',
      options: ['化学品安全技术说明书', '产品质量合格证', '安全操作规程', '应急处置预案'],
      answer: 'A',
      analysis: '根据《危险化学品安全管理条例》第十五条规定，危险化学品生产企业应当提供与其生产的危险化学品相符的化学品安全技术说明书。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'chem-2',
      type: 'single',
      chapter: '危险化学品安全管理条例',
      content: '依据《危险化学品安全管理条例》，危险化学品经营企业应当向所在地（）人民政府安全生产监督管理部门提出申请。',
      options: ['县级', '设区的市级', '省级', '国务院'],
      answer: 'B',
      analysis: '根据《危险化学品安全管理条例》第三十五条规定，从事危险化学品经营的企业应当向所在地设区的市级人民政府安全生产监督管理部门提出申请。',
      difficulty: 2,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'chem-3',
      type: 'single',
      chapter: '危险化学品安全管理条例',
      content: '根据《危险化学品安全管理条例》，运输危险化学品的车辆应当配备必要的（）器材和防护用品。',
      options: ['应急救援', '防火防爆', '通讯联络', '安全防护'],
      answer: 'A',
      analysis: '根据《危险化学品安全管理条例》第四十八条规定，运输危险化学品的车辆应当配备必要的应急救援器材和防护用品。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  '消防法': [
    {
      id: 'fire-1',
      type: 'single',
      chapter: '消防法',
      content: '依据《消防法》，消防安全重点单位应当实行（）防火巡查，并建立巡查记录。',
      options: ['每日', '每周', '每月', '每季度'],
      answer: 'A',
      analysis: '根据《消防法》第十七条规定，消防安全重点单位应当实行每日防火巡查，并建立巡查记录。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'fire-2',
      type: 'single',
      chapter: '消防法',
      content: '根据《消防法》，消防设施、器材或者消防安全标志的配置、设置不符合国家标准、行业标准，或者未保持完好有效的，责令改正，处（）罚款。',
      options: ['一千元以上一万元以下', '五千元以上五万元以下', '一万元以上十万元以下', '五万元以上五十万元以下'],
      answer: 'B',
      analysis: '根据《消防法》第六十条规定，单位违反本法规定，有下列行为之一的，责令改正，处五千元以上五万元以下罚款。',
      difficulty: 2,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  '特种设备安全法': [
    {
      id: 'equip-1',
      type: 'single',
      chapter: '特种设备安全法',
      content: '根据《特种设备安全法》，特种设备使用单位应当在检验合格有效期届满前（）向特种设备检验机构提出定期检验要求。',
      options: ['15天', '一个月', '两个月', '三个月'],
      answer: 'B',
      analysis: '根据《特种设备安全法》第四十条规定，特种设备使用单位应当在检验合格有效期届满前一个月向特种设备检验机构提出定期检验要求。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'equip-2',
      type: 'single',
      chapter: '特种设备安全法',
      content: '依据《特种设备安全法》，特种设备安全管理人员、检测人员和作业人员应当按照国家有关规定取得（）资格，方可从事相关工作。',
      options: ['相应', '初级', '中级', '高级'],
      answer: 'A',
      analysis: '根据《特种设备安全法》第十四条规定，特种设备安全管理人员、检测人员和作业人员应当按照国家有关规定取得相应资格，方可从事相关工作。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  '生产安全事故报告和调查处理条例': [
    {
      id: 'accident-1',
      type: 'single',
      chapter: '生产安全事故报告和调查处理条例',
      content: '依据《生产安全事故报告和调查处理条例》，造成3人以下死亡的事故属于（）。',
      options: ['特别重大事故', '重大事故', '较大事故', '一般事故'],
      answer: 'D',
      analysis: '根据《生产安全事故报告和调查处理条例》第三条规定，一般事故是指造成3人以下死亡，或者10人以下重伤，或者1000万元以下直接经济损失的事故。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'accident-2',
      type: 'single',
      chapter: '生产安全事故报告和调查处理条例',
      content: '根据《生产安全事故报告和调查处理条例》，事故发生后，事故现场有关人员应当立即向本单位负责人报告；单位负责人接到报告后，应当于（）内向事故发生地县级以上人民政府安全生产监督管理部门报告。',
      options: ['1小时', '2小时', '12小时', '24小时'],
      answer: 'A',
      analysis: '根据《生产安全事故报告和调查处理条例》第九条规定，单位负责人接到报告后，应当于1小时内向事故发生地县级以上人民政府安全生产监督管理部门报告。',
      difficulty: 1,
      tags: [],
      isRealQuestion: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
}

const defaultQuestions: Question[] = [
  {
    id: 'default-1',
    type: 'single',
    chapter: '',
    content: '根据《安全生产法》，生产经营单位应当建立健全（），加强安全生产标准化、信息化建设。',
    options: ['全员安全生产责任制', '安全生产管理制度', '安全生产培训体系', '安全风险管理制度'],
    answer: 'A',
    analysis: '根据《安全生产法》第四条规定，生产经营单位应当建立健全全员安全生产责任制和安全生产规章制度。',
    difficulty: 1,
    tags: [],
    isRealQuestion: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-2',
    type: 'single',
    chapter: '',
    content: '依据《安全生产法》，从业人员超过（）人的生产经营单位，应当设置安全生产管理机构或者配备专职安全生产管理人员。',
    options: ['50', '100', '200', '300'],
    answer: 'B',
    analysis: '根据《安全生产法》第二十四条规定，从业人员超过一百人的，应当设置安全生产管理机构或者配备专职安全生产管理人员。',
    difficulty: 1,
    tags: [],
    isRealQuestion: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-3',
    type: 'single',
    chapter: '',
    content: '根据《危险化学品安全管理条例》，危险化学品生产企业应当提供与其生产的危险化学品相符的（）。',
    options: ['化学品安全技术说明书', '产品质量合格证', '安全操作规程', '应急处置预案'],
    answer: 'A',
    analysis: '根据《危险化学品安全管理条例》第十五条规定，危险化学品生产企业应当提供与其生产的危险化学品相符的化学品安全技术说明书。',
    difficulty: 1,
    tags: [],
    isRealQuestion: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-4',
    type: 'single',
    chapter: '',
    content: '依据《消防法》，消防安全重点单位应当实行（）防火巡查，并建立巡查记录。',
    options: ['每日', '每周', '每月', '每季度'],
    answer: 'A',
    analysis: '根据《消防法》第十七条规定，消防安全重点单位应当实行每日防火巡查，并建立巡查记录。',
    difficulty: 1,
    tags: [],
    isRealQuestion: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-5',
    type: 'single',
    chapter: '',
    content: '根据《特种设备安全法》，特种设备使用单位应当在检验合格有效期届满前（）向特种设备检验机构提出定期检验要求。',
    options: ['15天', '一个月', '两个月', '三个月'],
    answer: 'B',
    analysis: '根据《特种设备安全法》第四十条规定，特种设备使用单位应当在检验合格有效期届满前一个月向特种设备检验机构提出定期检验要求。',
    difficulty: 1,
    tags: [],
    isRealQuestion: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

export default function Practice() {
  const { chapterId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const chapterName = (location.state as { chapterName?: string })?.chapterName || '章节练习'
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState<'ready' | 'ongoing' | 'finished'>('ready')
  const [showAnalysis, setShowAnalysis] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      if (chapterName && chapterQuestions[chapterName]) {
        const shuffled = [...chapterQuestions[chapterName]].sort(() => Math.random() - 0.5)
        setQuestions(shuffled.slice(0, Math.min(10, shuffled.length)))
      } else {
        const dbQuestions = await getRealAndVariantQuestions()
        const filtered = dbQuestions.filter((q) => q.chapter === chapterName)
        
        if (filtered.length > 0) {
          const shuffled = [...filtered].sort(() => Math.random() - 0.5)
          setQuestions(shuffled.slice(0, Math.min(10, shuffled.length)))
        } else {
          const shuffled = [...defaultQuestions].sort(() => Math.random() - 0.5)
          setQuestions(shuffled.slice(0, 10))
        }
      }
    }
    loadQuestions()
  }, [chapterName])

  useEffect(() => {
    if (status === 'ongoing') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (autoAdvanceRef.current) {
        clearTimeout(autoAdvanceRef.current)
      }
    }
  }, [status])

  const startPractice = () => {
    setStatus('ongoing')
    setAnswers({})
    setDuration(0)
    setCurrentIndex(0)
    setShowAnalysis(false)
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const calculateScore = useCallback(() => {
    if (questions.length === 0) return 0
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++
      }
    })
    return Math.round((correct / questions.length) * 100)
  }, [questions, answers])

  const finishPractice = async () => {
    const accuracy = calculateScore()
    setStatus('finished')
    if (chapterId) {
      await updateChapterAccuracy(chapterId, accuracy)
    }
  }

  const resetPractice = () => {
    setStatus('ready')
    setAnswers({})
    setDuration(0)
    setCurrentIndex(0)
    setShowAnalysis(false)
    
    if (chapterName && chapterQuestions[chapterName]) {
      const shuffled = [...chapterQuestions[chapterName]].sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, Math.min(10, shuffled.length)))
    } else {
      const shuffled = [...defaultQuestions].sort(() => Math.random() - 0.5)
      setQuestions(shuffled.slice(0, 10))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnalysis(false)
    } else {
      finishPractice()
    }
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect = currentQuestion ? answers[currentQuestion.id] === currentQuestion.answer : false

  return (
    <div className="p-4 pb-20">
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800">{chapterName}</h1>
          <p className="text-gray-500 text-xs">章节练习</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={16} />
          <span>{formatTime(duration)}</span>
        </div>
      </header>

      {status === 'ready' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary-200" />
              <div>
                <h2 className="text-lg font-semibold">{chapterName}</h2>
                <p className="text-primary-100 text-sm">专项练习模式</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-xs text-primary-100">题目数</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">单选</div>
                <div className="text-xs text-primary-100">题型</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">不限时</div>
                <div className="text-xs text-primary-100">用时</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">练习说明</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-600 text-sm">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>本章练习涵盖该章节的所有题目，包括真题和变型题</span>
              </li>
              <li className="flex items-start text-gray-600 text-sm">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>答题后即时显示答案和解析，帮助您快速掌握知识点</span>
              </li>
              <li className="flex items-start text-gray-600 text-sm">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>错题会自动记录，方便后续复习巩固</span>
              </li>
            </ul>
          </div>

          <button
            onClick={startPractice}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <BookOpen size={18} />
            开始练习
          </button>
        </div>
      )}

      {status === 'ongoing' && currentQuestion && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                第 {currentIndex + 1}/{questions.length} 题
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                currentQuestion.difficulty === 1 ? 'bg-green-100 text-green-600' :
                currentQuestion.difficulty === 2 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {currentQuestion.difficulty === 1 ? '简单' :
                 currentQuestion.difficulty === 2 ? '中等' : '困难'}
              </span>
            </div>
            <h3 className="text-gray-800 font-medium leading-relaxed">
              {currentQuestion.content}
            </h3>
          </div>

          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index)
              const isSelected = answers[currentQuestion.id] === optionLabel
              
              return (
                <button
                  key={optionLabel}
                  onClick={() => handleAnswer(currentQuestion.id, optionLabel)}
                  disabled={showAnalysis}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showAnalysis
                      ? isSelected
                        ? answers[currentQuestion.id] === currentQuestion.answer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : currentQuestion.answer === optionLabel
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-100 bg-gray-50'
                      : isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      showAnalysis
                        ? isSelected
                          ? answers[currentQuestion.id] === currentQuestion.answer
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : currentQuestion.answer === optionLabel
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        : isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {optionLabel}
                    </span>
                    <span className="text-gray-700">{option}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {showAnalysis && (
            <div className={`rounded-xl p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '回答正确' : '回答错误'}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">正确答案：</span>{currentQuestion.answer}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-medium">解析：</span>{currentQuestion.analysis}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1)
                  setShowAnalysis(false)
                }
              }}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft size={18} />
              上一题
            </button>

            {!showAnalysis ? (
              <button
                onClick={() => {
                  if (answers[currentQuestion.id]) {
                    setShowAnalysis(true)
                  }
                }}
                disabled={!answers[currentQuestion.id]}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !answers[currentQuestion.id]
                    ? 'bg-primary-200 text-primary-400 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                查看解析
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600"
              >
                {currentIndex < questions.length - 1 ? '下一题' : '提交试卷'}
                {currentIndex < questions.length - 1 && <ChevronRight size={18} />}
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setShowAnalysis(false)
                }}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-500 text-white'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === 'finished' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              calculateScore() >= 60 ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {calculateScore() >= 60 ? (
                <CheckCircle className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="text-4xl font-bold mb-2">{calculateScore()}%</div>
            <div className={`text-lg ${calculateScore() >= 60 ? 'text-green-200' : 'text-red-200'}`}>
              {calculateScore() >= 80 ? '优秀！继续保持' :
               calculateScore() >= 60 ? '及格！还需努力' : '不及格，需要加强练习'}
            </div>
            {calculateScore() < 60 && (
              <p className="text-primary-100 text-sm mt-2">该章节已标记为薄弱章节</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">答题统计</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {questions.filter((q) => answers[q.id] === q.answer).length}
                </div>
                <div className="text-sm text-gray-500">正确</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">
                  {questions.filter((q) => answers[q.id] !== q.answer).length}
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
            <h3 className="font-semibold text-gray-800 mb-4">题目解析</h3>
            <div className="space-y-4">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id]
                const isCorrect = userAnswer === q.answer
                return (
                  <div key={q.id} className={`rounded-xl p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">第{index + 1}题</span>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-gray-800 text-sm mb-2">{q.content}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        你的答案：<span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userAnswer || '未作答'}</span>
                      </span>
                      <span className="text-gray-600">
                        正确答案：<span className="text-green-600 font-medium">{q.answer}</span>
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">解析：{q.analysis}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetPractice}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <RotateCcw size={18} />
              重新练习
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl font-medium bg-primary-500 text-white hover:bg-primary-600"
            >
              返回首页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
