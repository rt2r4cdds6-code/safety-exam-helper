import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Questions from './pages/Questions'
import Exam from './pages/Exam'
import Stats from './pages/Stats'
import Chapters from './pages/Chapters'
import Practice from './pages/Practice'
import Settings from './pages/Settings'
import { setupDailyReminder } from './utils/reminder'

export default function App() {
  useEffect(() => {
    setupDailyReminder()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/practice/:chapterId" element={<Practice />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  )
}
