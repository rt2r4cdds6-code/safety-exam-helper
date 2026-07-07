export interface Chapter {
  id: string
  subject: string
  name: string
  totalQuestions: number
  createdAt: number
  updatedAt: number
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'judge' | 'fill'
  chapter: string
  content: string
  options?: string[]
  answer: string | string[]
  analysis: string
  difficulty: 1 | 2 | 3
  tags: string[]
  isRealQuestion: boolean
  sourceYear?: number
  sourceExam?: 'primary' | 'intermediate'
  sourceChapter?: string
  createdAt: number
  updatedAt: number
}

export interface DailyTaskChapter {
  chapterId: string
  chapterName: string
  subject: string
  completed: boolean
  accuracy?: number
  isWeak?: boolean
}

export interface DailyTask {
  id: string
  date: string
  chapters: DailyTaskChapter[]
  targetQuestions: number
  completedQuestions: number
  targetTime: number
  completedTime: number
  createdAt: number
  updatedAt: number
}

export interface ExamRecord {
  id: string
  title: string
  subject: string
  questionCount: number
  durationLimit: number
  questions: string[]
  userAnswers: Record<string, string | string[]>
  correctAnswers: Record<string, string | string[]>
  score: number
  totalScore: number
  duration: number
  createdAt: number
}

export interface StudyProgress {
  id: string
  questionId: string
  status: 'unanswered' | 'correct' | 'wrong' | 'bookmarked'
  attempts: number
  lastAttemptAt: number
  createdAt: number
  updatedAt: number
}

export interface WeakChapter {
  chapterId: string
  chapterName: string
  subject: string
  consecutiveDays: number
  avgAccuracy: number
}
