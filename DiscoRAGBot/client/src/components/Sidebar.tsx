import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Upload, 
  Globe, 
  PenTool, 
  Bot, 
  BarChart3,
  Database
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "File Upload", href: "/files", icon: Upload },
  { name: "URL Scraping", href: "/urls", icon: Globe },
  { name: "Manual Entry", href: "/manual", icon: PenTool },
  { name: "Bot Configuration", href: "/bot-config", icon: Bot },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

export function Sidebar() {
  console.log("Rendering Sidebar")
  
  return (
    <div className="w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <Database className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Discord RAG Bot
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Knowledge Base Manager
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  "hover:bg-indigo-50 dark:hover:bg-slate-800/50 hover:text-indigo-700 dark:hover:text-indigo-300",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  isActive
                    ? "bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-300"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}