import { Home, BookOpen, List, FileText, BarChart3, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: '今日任务', icon: Home },
  { path: '/chapters', label: '章节练习', icon: List },
  { path: '/questions', label: '题库管理', icon: BookOpen },
  { path: '/exam', label: '模拟考试', icon: FileText },
  { path: '/stats', label: '进度统计', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
]

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
            >
              {({ isActive }) => (
                <div
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </div>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
