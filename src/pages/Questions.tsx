import { useState, useEffect } from 'react'
import { Search, Filter, Plus, ChevronRight, Star, Trash2, Edit3 } from 'lucide-react'
import { getQuestions, addQuestion, deleteQuestion, generateId } from '../db'
import type { Question } from '../types'

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Omit<Question, 'id' | 'createdAt' | 'updatedAt'>>({
    type: 'single',
    chapter: '',
    content: '',
    options: ['', '', '', ''],
    answer: '',
    analysis: '',
    difficulty: 1,
    tags: [],
    isRealQuestion: false,
    sourceYear: undefined,
    sourceExam: undefined,
    sourceChapter: '',
  })

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    const data = await getQuestions()
    setQuestions(data)
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || q.type === filterType
    let matchesSource = true
    if (filterSource === 'real') {
      matchesSource = q.isRealQuestion
    } else if (filterSource === 'variant') {
      matchesSource = q.tags.includes('变型题')
    } else if (filterSource === 'real-variant') {
      matchesSource = q.isRealQuestion || q.tags.includes('变型题')
    }
    return matchesSearch && matchesFilter && matchesSource
  })

  const handleAddQuestion = async () => {
    const question: Question = {
      ...newQuestion,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await addQuestion(question)
    setShowAddModal(false)
    setNewQuestion({
      type: 'single',
      chapter: '',
      content: '',
      options: ['', '', '', ''],
      answer: '',
      analysis: '',
      difficulty: 1,
      tags: [],
      isRealQuestion: false,
      sourceYear: undefined,
      sourceExam: undefined,
      sourceChapter: '',
    })
    loadQuestions()
  }

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('确定要删除这道题目吗？')) {
      await deleteQuestion(id)
      loadQuestions()
    }
  }

  const typeLabels: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
  }

  const difficultyLabels = ['', '简单', '中等', '困难']

  return (
    <div className="p-4 pb-20">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">题库管理</h1>
        <p className="text-gray-500 text-sm mt-1">共 {questions.length} 道题目</p>
      </header>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索题目..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
        >
          <Plus size={18} />
          添加
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            filterType === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          全部
        </button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              filterType === key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterSource('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            filterSource === 'all'
              ? 'bg-secondary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          全部来源
        </button>
        <button
          onClick={() => setFilterSource('real')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            filterSource === 'real'
              ? 'bg-secondary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          真题
        </button>
        <button
          onClick={() => setFilterSource('variant')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            filterSource === 'variant'
              ? 'bg-secondary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          变型题
        </button>
        <button
          onClick={() => setFilterSource('real-variant')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            filterSource === 'real-variant'
              ? 'bg-secondary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          真题+变型题
        </button>
      </div>

      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无题目</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary-500 text-sm font-medium"
            >
              添加第一道题目
            </button>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    question.type === 'single' ? 'bg-blue-100 text-blue-600' :
                    question.type === 'multiple' ? 'bg-purple-100 text-purple-600' :
                    question.type === 'judge' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {typeLabels[question.type]}
                  </span>
                  <span className="text-xs text-gray-500">{question.chapter}</span>
                  <span className={`text-xs ${
                    question.difficulty === 1 ? 'text-green-500' :
                    question.difficulty === 2 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {difficultyLabels[question.difficulty]}
                  </span>
                  {question.isRealQuestion && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      真题 {question.sourceYear}
                    </span>
                  )}
                  {question.tags.includes('变型题') && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                      变型题
                    </span>
                  )}
                </div>
                <p className="text-gray-800 text-sm line-clamp-2">{question.content}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                  <Star size={20} />
                </button>
                <button className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Edit3 size={20} />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
                <ChevronRight className="text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">添加题目</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目类型</label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as Question['type'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">章节</label>
                <input
                  type="text"
                  value={newQuestion.chapter}
                  onChange={(e) => setNewQuestion({ ...newQuestion, chapter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  placeholder="如：安全生产法"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label>
                <textarea
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  rows={3}
                  placeholder="输入题目内容..."
                />
              </div>

              {(newQuestion.type === 'single' || newQuestion.type === 'multiple') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选项</label>
                  {newQuestion.options?.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(newQuestion.options || [])]
                        newOptions[index] = e.target.value
                        setNewQuestion({ ...newQuestion, options: newOptions })
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 mb-2"
                      placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">答案</label>
                <input
                  type="text"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  placeholder="如：A 或 AB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">解析</label>
                <textarea
                  value={newQuestion.analysis}
                  onChange={(e) => setNewQuestion({ ...newQuestion, analysis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  rows={3}
                  placeholder="输入答案解析..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: Number(e.target.value) as Question['difficulty'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  {difficultyLabels.slice(1).map((label, index) => (
                    <option key={index + 1} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">是否真题</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newQuestion.isRealQuestion}
                      onChange={(e) => setNewQuestion({ ...newQuestion, isRealQuestion: true })}
                      className="w-4 h-4 text-primary-500"
                    />
                    <span className="text-sm">是</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!newQuestion.isRealQuestion}
                      onChange={(e) => setNewQuestion({ ...newQuestion, isRealQuestion: false, tags: [...newQuestion.tags.filter(t => t !== '变型题')] })}
                      className="w-4 h-4 text-primary-500"
                    />
                    <span className="text-sm">否</span>
                  </label>
                </div>
              </div>

              {newQuestion.isRealQuestion ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">真题年份</label>
                    <input
                      type="number"
                      value={newQuestion.sourceYear || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, sourceYear: Number(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      placeholder="如：2021"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">考试级别</label>
                    <select
                      value={newQuestion.sourceExam || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, sourceExam: e.target.value as Question['sourceExam'] || undefined })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="">请选择</option>
                      <option value="primary">初级</option>
                      <option value="intermediate">中级</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">真题章节</label>
                    <input
                      type="text"
                      value={newQuestion.sourceChapter || ''}
                      onChange={(e) => setNewQuestion({ ...newQuestion, sourceChapter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      placeholder="如：第一章 总则"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">是否变型题</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuestion.tags.includes('变型题')}
                      onChange={(e) => {
                        const newTags = e.target.checked
                          ? [...newQuestion.tags, '变型题']
                          : newQuestion.tags.filter(t => t !== '变型题')
                        setNewQuestion({ ...newQuestion, tags: newTags })
                      }}
                      className="w-4 h-4 text-primary-500"
                    />
                    <span className="text-sm">标记为变型题（基于真题改编）</span>
                  </label>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
