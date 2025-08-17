import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Globe, 
  PenTool, 
  Bot, 
  BarChart3, 
  FileText, 
  Users, 
  MessageSquare,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { getBotStatus } from "@/api/bot-config"
import { getFiles } from "@/api/files"
import { getUrls } from "@/api/urls"
import { getManualEntries } from "@/api/manual-entries"
import { getUsageStats } from "@/api/analytics"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
  const [botStatus, setBotStatus] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("Fetching dashboard data")
        const [statusRes, statsRes, filesRes, urlsRes, entriesRes] = await Promise.all([
          getBotStatus(),
          getUsageStats(),
          getFiles(),
          getUrls(),
          getManualEntries()
        ])

        setBotStatus(statusRes.status)
        setStats({
          ...statsRes.stats,
          files: filesRes.files.length,
          urls: urlsRes.urls.length,
          entries: entriesRes.entries.length
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor your Discord RAG bot and knowledge base
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={botStatus?.online ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            <Activity className="h-3 w-3" />
            {botStatus?.online ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.daily || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base Size</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {botStatus?.knowledgeBaseSize || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              documents indexed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.topUsers?.length || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              94%
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              successful responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              File Upload
            </CardTitle>
            <CardDescription>
              Upload documents to expand the knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Files uploaded: {stats?.files || 0}</span>
                <span className="text-green-600">Ready</span>
              </div>
              <Progress value={75} className="h-2" />
              <Button 
                onClick={() => navigate('/files')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Upload Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              URL Scraping
            </CardTitle>
            <CardDescription>
              Scrape websites to add content to knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>URLs scraped: {stats?.urls || 0}</span>
                <span className="text-green-600">Active</span>
              </div>
              <Progress value={60} className="h-2" />
              <Button 
                onClick={() => navigate('/urls')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Add URLs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              Manual Entries
            </CardTitle>
            <CardDescription>
              Add custom knowledge base entries manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Entries: {stats?.entries || 0}</span>
                <span className="text-green-600">Updated</span>
              </div>
              <Progress value={85} className="h-2" />
              <Button 
                onClick={() => navigate('/manual')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest bot interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: "Bot responded to 15 questions", time: "2 minutes ago", color: "text-green-600" },
                { icon: Upload, text: "New file uploaded: api-guide.pdf", time: "1 hour ago", color: "text-blue-600" },
                { icon: Globe, text: "URL scraped: Discord.js documentation", time: "3 hours ago", color: "text-green-600" },
                { icon: AlertCircle, text: "Rate limit warning resolved", time: "5 hours ago", color: "text-orange-600" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-slate-100">{activity.text}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader>
            <CardTitle>Bot Status</CardTitle>
            <CardDescription>Current bot configuration and health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                <Badge variant={botStatus?.online ? "default" : "destructive"}>
                  {botStatus?.online ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Version</span>
                <span className="text-sm font-medium">{botStatus?.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Last Activity</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(botStatus?.lastActivity).toLocaleTimeString()}
                </span>
              </div>
              <Button 
                onClick={() => navigate('/bot-config')}
                variant="outline" 
                className="w-full"
              >
                Configure Bot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}