import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Question, DailyTask, ExamRecord, StudyProgress, Chapter, WeakChapter } from '../types'
import { realQuestions } from '../data/questions'

const initialChapters: Chapter[] = [
  { id: 'law-1', subject: '法规', name: '安全生产法', totalQuestions: 5, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'law-2', subject: '法规', name: '危险化学品安全管理条例', totalQuestions: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'law-3', subject: '法规', name: '消防法', totalQuestions: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'law-4', subject: '法规', name: '特种设备安全法', totalQuestions: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'law-5', subject: '法规', name: '生产安全事故报告和调查处理条例', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'law-6', subject: '法规', name: '建设工程安全生产管理条例', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  
  { id: 'manage-1', subject: '管理', name: '安全生产管理基本理论', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'manage-2', subject: '管理', name: '生产经营单位的安全生产管理', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'manage-3', subject: '管理', name: '安全生产监管监察', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'manage-4', subject: '管理', name: '安全评价', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'manage-5', subject: '管理', name: '职业病危害预防和管理', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'manage-6', subject: '管理', name: '应急管理', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  
  { id: 'tech-1', subject: '技术', name: '机械安全技术', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'tech-2', subject: '技术', name: '电气安全技术', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'tech-3', subject: '技术', name: '特种设备安全技术', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'tech-4', subject: '技术', name: '防火防爆安全技术', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'tech-5', subject: '技术', name: '危险化学品安全技术', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'tech-6', subject: '技术', name: '矿山安全技术', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  
  { id: 'practice-1', subject: '实务', name: '危险化学品安全实务', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'practice-2', subject: '实务', name: '金属非金属矿山安全实务', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'practice-3', subject: '实务', name: '建筑施工安全实务', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'practice-4', subject: '实务', name: '煤矿安全实务', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'practice-5', subject: '实务', name: '金属冶炼安全实务', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'practice-6', subject: '实务', name: '道路运输安全实务', totalQuestions: 0, createdAt: Date.now(), updatedAt: Date.now() },
]

interface SafetyExamDB extends DBSchema {
  questions: {
    key: string
    value: Question
    indexes: {
      'by-chapter': string
      'by-type': string
      'by-difficulty': number
    }
  }
  chapters: {
    key: string
    value: Chapter
    indexes: {
      'by-subject': string
    }
  }
  dailyTasks: {
    key: string
    value: DailyTask
    indexes: {
      'by-date': string
    }
  }
  examRecords: {
    key: string
    value: ExamRecord
    indexes: {
      'by-createdAt': number
    }
  }
  studyProgress: {
    key: string
    value: StudyProgress
    indexes: {
      'by-questionId': string
      'by-status': string
    }
  }
}

let db: IDBPDatabase<SafetyExamDB> | null = null

export async function getDB(): Promise<IDBPDatabase<SafetyExamDB>> {
  if (db) return db

  db = await openDB<SafetyExamDB>('SafetyExamDB', 5, {
    upgrade(database, oldVersion) {
      if (!database.objectStoreNames.contains('questions')) {
        const questionStore = database.createObjectStore('questions', { keyPath: 'id' })
        questionStore.createIndex('by-chapter', 'chapter')
        questionStore.createIndex('by-type', 'type')
        questionStore.createIndex('by-difficulty', 'difficulty')

        realQuestions.forEach((question) => {
          questionStore.put(question)
        })
      }

      if (!database.objectStoreNames.contains('chapters')) {
        const chapterStore = database.createObjectStore('chapters', { keyPath: 'id' })
        chapterStore.createIndex('by-subject', 'subject')

        initialChapters.forEach((chapter) => {
          chapterStore.put(chapter)
        })
      }

      if (!database.objectStoreNames.contains('dailyTasks')) {
        const dailyTaskStore = database.createObjectStore('dailyTasks', { keyPath: 'id' })
        dailyTaskStore.createIndex('by-date', 'date')
      }

      if (oldVersion < 3 && database.objectStoreNames.contains('dailyTasks')) {
        const dailyTaskStore = database.transaction('dailyTasks', 'readwrite').objectStore('dailyTasks')
        dailyTaskStore.openCursor().then(async (cursor) => {
          while (cursor) {
            const task = cursor.value
            if (!task.chapters) {
              task.chapters = []
              await cursor.update(task)
            }
            cursor = await cursor.continue()
          }
        })
      }

      if (oldVersion < 4 && database.objectStoreNames.contains('dailyTasks')) {
        const dailyTaskStore = database.transaction('dailyTasks', 'readwrite').objectStore('dailyTasks')
        dailyTaskStore.openCursor().then(async (cursor) => {
          while (cursor) {
            const task = cursor.value
            if (task.chapters) {
              task.chapters = task.chapters.map((ch: any) => ({
                ...ch,
                accuracy: ch.accuracy || undefined,
                isWeak: ch.isWeak || false,
              }))
              await cursor.update(task)
            }
            cursor = await cursor.continue()
          }
        })
      }

      if (!database.objectStoreNames.contains('examRecords')) {
        const examRecordStore = database.createObjectStore('examRecords', { keyPath: 'id' })
        examRecordStore.createIndex('by-createdAt', 'createdAt')
      }

      if (oldVersion < 5 && database.objectStoreNames.contains('examRecords')) {
        const examRecordStore = database.transaction('examRecords', 'readwrite').objectStore('examRecords')
        examRecordStore.openCursor().then(async (cursor) => {
          while (cursor) {
            const record = cursor.value
            if (!record.subject) {
              record.subject = '全部科目'
              record.questionCount = record.questions?.length || 20
              record.durationLimit = 60
              await cursor.update(record)
            }
            cursor = await cursor.continue()
          }
        })
      }

      if (!database.objectStoreNames.contains('studyProgress')) {
        const studyProgressStore = database.createObjectStore('studyProgress', { keyPath: 'id' })
        studyProgressStore.createIndex('by-questionId', 'questionId')
        studyProgressStore.createIndex('by-status', 'status')
      }
    },
  })

  return db
}

export async function addQuestion(question: Question): Promise<void> {
  const database = await getDB()
  await database.put('questions', question)
}

export async function getQuestions(): Promise<Question[]> {
  const database = await getDB()
  return database.getAll('questions')
}

export async function getRealAndVariantQuestions(): Promise<Question[]> {
  const database = await getDB()
  const questions = await database.getAll('questions')
  return questions.filter((q) => q.isRealQuestion || q.tags.includes('变型题'))
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  const database = await getDB()
  return database.get('questions', id)
}

export async function deleteQuestion(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('questions', id)
}

export async function addChapter(chapter: Chapter): Promise<void> {
  const database = await getDB()
  await database.put('chapters', chapter)
}

export async function getChapters(): Promise<Chapter[]> {
  const database = await getDB()
  return database.getAll('chapters')
}

export async function getChaptersBySubject(subject: string): Promise<Chapter[]> {
  const database = await getDB()
  return database.getAllFromIndex('chapters', 'by-subject', subject)
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
  const database = await getDB()
  return database.get('chapters', id)
}

export async function deleteChapter(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('chapters', id)
}

export async function getChaptersWithQuestionCount(): Promise<(Chapter & { totalQuestions: number })[]> {
  const database = await getDB()
  const chapters = await database.getAll('chapters')
  const questions = await database.getAll('questions')

  return chapters.map((chapter) => ({
    ...chapter,
    totalQuestions: questions.filter((q) => q.chapter === chapter.name).length,
  }))
}

export async function addDailyTask(task: DailyTask): Promise<void> {
  const database = await getDB()
  await database.put('dailyTasks', task)
}

export async function getDailyTaskByDate(date: string): Promise<DailyTask | undefined> {
  const database = await getDB()
  const tasks = await database.getAllFromIndex('dailyTasks', 'by-date', date)
  return tasks[0]
}

export async function getDailyTasks(): Promise<DailyTask[]> {
  const database = await getDB()
  return database.getAllFromIndex('dailyTasks', 'by-date')
}

export async function updateDailyTaskChapter(task: DailyTask, chapterId: string, completed: boolean): Promise<void> {
  const updatedChapters = task.chapters.map((ch) =>
    ch.chapterId === chapterId ? { ...ch, completed } : ch
  )
  const completedCount = updatedChapters.filter((ch) => ch.completed).length
  const updatedTask: DailyTask = {
    ...task,
    chapters: updatedChapters,
    completedQuestions: completedCount,
    targetQuestions: task.chapters.length,
    updatedAt: Date.now(),
  }
  await addDailyTask(updatedTask)
}

export async function updateChapterAccuracy(chapterId: string, accuracy: number): Promise<void> {
  const today = getLocalDateString()
  const task = await getDailyTaskByDate(today)
  if (!task) return

  const updatedChapters = task.chapters.map((ch) => {
    if (ch.chapterId === chapterId) {
      return {
        ...ch,
        accuracy,
        isWeak: accuracy < 60,
        completed: true,
      }
    }
    return ch
  })

  const completedCount = updatedChapters.filter((ch) => ch.completed).length
  const updatedTask: DailyTask = {
    ...task,
    chapters: updatedChapters,
    completedQuestions: completedCount,
    targetQuestions: task.chapters.length,
    updatedAt: Date.now(),
  }
  await addDailyTask(updatedTask)
}

export async function generateDailyTask(): Promise<DailyTask | null> {
  const today = getLocalDateString()
  const existingTask = await getDailyTaskByDate(today)
  if (existingTask) {
    return existingTask
  }

  const chapters = await getChaptersWithQuestionCount()
  const dailyTasks = await getDailyTasks()

  const chapterLastCompleted: Record<string, string> = {}
  dailyTasks.forEach((task) => {
    task.chapters.forEach((ch) => {
      if (ch.completed && (!chapterLastCompleted[ch.chapterId] || task.date > chapterLastCompleted[ch.chapterId])) {
        chapterLastCompleted[ch.chapterId] = task.date
      }
    })
  })

  const sortedChapters = chapters
    .filter((ch) => ch.totalQuestions > 0)
    .sort((a, b) => {
      const aDate = chapterLastCompleted[a.id] || '2000-01-01'
      const bDate = chapterLastCompleted[b.id] || '2000-01-01'
      return aDate.localeCompare(bDate)
    })

  const selectedChapters = sortedChapters.slice(0, 3)

  if (selectedChapters.length === 0) {
    return null
  }

  const newTask: DailyTask = {
    id: generateId(),
    date: today,
    chapters: selectedChapters.map((ch) => ({
      chapterId: ch.id,
      chapterName: ch.name,
      subject: ch.subject,
      completed: false,
    })),
    targetQuestions: selectedChapters.length,
    completedQuestions: 0,
    targetTime: 60,
    completedTime: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await addDailyTask(newTask)
  return newTask
}

export async function addExamRecord(record: ExamRecord): Promise<void> {
  const database = await getDB()
  await database.put('examRecords', record)
}

export async function getExamRecords(): Promise<ExamRecord[]> {
  const database = await getDB()
  return database.getAllFromIndex('examRecords', 'by-createdAt')
}

export async function addStudyProgress(progress: StudyProgress): Promise<void> {
  const database = await getDB()
  await database.put('studyProgress', progress)
}

export async function getStudyProgressByQuestionId(questionId: string): Promise<StudyProgress | undefined> {
  const database = await getDB()
  const progresses = await database.getAllFromIndex('studyProgress', 'by-questionId', questionId)
  return progresses[0]
}

export async function getStudyProgressByStatus(status: string): Promise<StudyProgress[]> {
  const database = await getDB()
  return database.getAllFromIndex('studyProgress', 'by-status', status)
}

export function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function checkYesterdayTaskCompletion(): Promise<boolean> {
  const today = getLocalDateString()
  const todayDate = new Date(today)
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`

  const task = await getDailyTaskByDate(yesterday)
  if (!task || task.chapters.length === 0) {
    return true
  }

  return task.chapters.every((ch) => ch.completed)
}

export async function findWeakChapters(): Promise<WeakChapter[]> {
  const dailyTasks = await getDailyTasks()
  
  const chapterStats: Record<string, { weakDays: number[]; accuracies: number[] }> = {}
  
  const today = new Date(getLocalDateString())
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const task = dailyTasks.find((t) => t.date === dateStr)
    if (!task) continue
    
    task.chapters.forEach((ch) => {
      if (!chapterStats[ch.chapterId]) {
        chapterStats[ch.chapterId] = { weakDays: [], accuracies: [] }
      }
      
      if (ch.accuracy !== undefined && ch.accuracy < 60) {
        chapterStats[ch.chapterId].weakDays.push(i)
        chapterStats[ch.chapterId].accuracies.push(ch.accuracy)
      }
    })
  }
  
  const weakChapters: WeakChapter[] = []
  const chapters = await getChapters()
  
  Object.entries(chapterStats).forEach(([chapterId, stats]) => {
    if (stats.weakDays.length === 0) return
    
    const sortedDays = [...stats.weakDays].sort((a, b) => b - a)
    
    let maxConsecutive = 1
    let currentConsecutive = 1
    
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] === sortedDays[i - 1] - 1) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else {
        currentConsecutive = 1
      }
    }
    
    if (maxConsecutive >= 3) {
      const chapter = chapters.find((ch) => ch.id === chapterId)
      if (chapter) {
        weakChapters.push({
          chapterId,
          chapterName: chapter.name,
          subject: chapter.subject,
          consecutiveDays: maxConsecutive,
          avgAccuracy: Math.round(stats.accuracies.reduce((a, b) => a + b, 0) / stats.accuracies.length),
        })
      }
    }
  })
  
  return weakChapters
}

export async function checkLongTimeNoStudy(): Promise<boolean> {
  const dailyTasks = await getDailyTasks()
  if (dailyTasks.length === 0) {
    return true
  }
  
  const today = new Date(getLocalDateString())
  const latestTaskDate = new Date(dailyTasks[dailyTasks.length - 1].date)
  
  const diffDays = Math.floor((today.getTime() - latestTaskDate.getTime()) / (1000 * 60 * 60 * 24))
  
  return diffDays >= 2
}
