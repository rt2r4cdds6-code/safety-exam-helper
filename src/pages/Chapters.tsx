import { useState, useEffect } from 'react'
import { Search, Plus, ChevronRight, Edit3, Trash2, BookOpen, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getChaptersWithQuestionCount, addChapter, deleteChapter, generateId } from '../db'
import type { Chapter } from '../types'

export default function Chapters() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [newChapter, setNewChapter] = useState<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>>({
    subject: '法规',
    name: '',
    totalQuestions: 0,
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadChapters()
  }, [])

  const loadChapters = async () => {
    const data = await getChaptersWithQuestionCount()
    setChapters(data)
  }

  const filteredChapters = chapters.filter((ch) => {
    const matchesSearch = ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterSubject === 'all' || ch.subject === filterSubject
    return matchesSearch && matchesFilter
  })

  const handleSaveChapter = async () => {
    const now = Date.now()
    const chapter: Chapter = {
      ...newChapter,
      id: editingChapter?.id || generateId(),
      createdAt: editingChapter?.createdAt || now,
      updatedAt: now,
    }
    await addChapter(chapter)
    setShowAddModal(false)
    setEditingChapter(null)
    setNewChapter({
      subject: '法规',
      name: '',
      totalQuestions: 0,
    })
    loadChapters()
  }

  const handleDeleteChapter = async (id: string) => {
    if (confirm('确定要删除这个章节吗？')) {
      await deleteChapter(id)
      loadChapters()
    }
  }

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter)
    setNewChapter({
      subject: chapter.subject,
      name: chapter.name,
      totalQuestions: chapter.totalQuestions,
    })
    setShowAddModal(true)
  }

  const handlePracticeChapter = (chapterId: string, chapterName: string) => {
    navigate(`/practice/${chapterId}`, { state: { chapterName } })
  }

  const subjects = ['法规', '管理', '技术', '实务']

  const subjectColors: Record<string, string> = {
    '法规': 'bg-blue-100 text-blue-600',
    '管理': 'bg-green-100 text-green-600',
    '技术': 'bg-purple-100 text-purple-600',
    '实务': 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="p-4 pb-20">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">章节管理</h1>
        <p className="text-gray-500 text-sm mt-1">共 {chapters.length} 个章节</p>
      </header>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索章节..."
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
          onClick={() => setFilterSubject('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
            filterSubject === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          全部科目
        </button>
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setFilterSubject(subject)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              filterSubject === subject
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredChapters.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>暂无章节</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-primary-500 text-sm font-medium"
            >
              添加第一个章节
            </button>
          </div>
        ) : (
          filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColors[chapter.subject]}`}>
                    {chapter.subject}
                  </span>
                  <h3 className="font-medium text-gray-800">{chapter.name}</h3>
                </div>
                <span className="text-sm text-gray-500">{chapter.totalQuestions} 题</span>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePracticeChapter(chapter.id, chapter.name)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-50 text-primary-600 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  <FileText size={16} />
                  开始练习
                </button>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => handleEditChapter(chapter)}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-2"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingChapter ? '编辑章节' : '添加章节'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingChapter(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                <select
                  value={newChapter.subject}
                  onChange={(e) => setNewChapter({ ...newChapter, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">章节名称</label>
                <input
                  type="text"
                  value={newChapter.name}
                  onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  placeholder="如：安全生产法"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目数量</label>
                <input
                  type="number"
                  value={newChapter.totalQuestions}
                  onChange={(e) => setNewChapter({ ...newChapter, totalQuestions: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  min="0"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingChapter(null)
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
              >
                取消
              </button>
              <button
                onClick={handleSaveChapter}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium"
              >
                {editingChapter ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
