import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Search,
  Download,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  FileText,
  Globe,
  PenTool
} from "lucide-react"
import { getUsageStats, getContentAnalytics, getRecentQuestions } from "@/api/analytics"
import { useToast } from "@/hooks/useToast"
import { formatRelativeTime } from "@/lib/format"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function Analytics() {
  const [usageStats, setUsageStats] = useState<any>(null)
  const [contentAnalytics, setContentAnalytics] = useState<any>(null)
  const [recentQuestions, setRecentQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log("Fetching analytics data")
        const [usageRes, contentRes, questionsRes] = await Promise.all([
          getUsageStats(),
          getContentAnalytics(),
          getRecentQuestions()
        ])

        setUsageStats(usageRes.stats)
        setContentAnalytics(contentRes.analytics)
        setRecentQuestions(questionsRes.questions)
        setFilteredQuestions(questionsRes.questions)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  useEffect(() => {
    if (searchTerm) {
      const filtered = recentQuestions.filter(q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredQuestions(filtered)
    } else {
      setFilteredQuestions(recentQuestions)
    }
  }, [searchTerm, recentQuestions])

  const getHelpfulIcon = (helpful: boolean | null) => {
    if (helpful === true) return <ThumbsUp className="h-4 w-4 text-green-600" />
    if (helpful === false) return <ThumbsDown className="h-4 w-4 text-red-600" />
    return <HelpCircle className="h-4 w-4 text-slate-400" />
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'url':
        return <Globe className="h-4 w-4 text-green-600" />
      case 'manual':
        return <PenTool className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
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
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor bot performance and user engagement
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {usageStats?.daily || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Questions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {usageStats?.weekly || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {usageStats?.monthly || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {usageStats?.topUsers?.length || 0}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              unique users this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
                <CardDescription>
                  Bot activity throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageStats?.peakHours || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle>Top Active Users</CardTitle>
                <CardDescription>
                  Users with most bot interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usageStats?.topUsers?.map((user: any, index: number) => (
                    <div key={user.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {user.username}
                        </span>
                      </div>
                      <Badge variant="secondary">{user.count} questions</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle>Top Topics</CardTitle>
                <CardDescription>
                  Most frequently queried topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentAnalytics?.topTopics || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ topic, percent }) => `${topic} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(contentAnalytics?.topTopics || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle>Source Utilization</CardTitle>
                <CardDescription>
                  How often each source is referenced
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentAnalytics?.sourceUtilization?.map((source: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSourceIcon(source.type)}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {source.source}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {source.type}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{source.count} refs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 md:col-span-2">
              <CardHeader>
                <CardTitle>Knowledge Gaps</CardTitle>
                <CardDescription>
                  Questions that couldn't be answered - consider adding this content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentAnalytics?.knowledgeGaps?.map((gap: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-slate-900 dark:text-slate-100">{gap.question}</span>
                      </div>
                      <Badge variant="outline">{gap.count} times asked</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
            <CardHeader>
              <CardTitle>Recent Questions</CardTitle>
              <CardDescription>
                Latest questions asked to the bot with user feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredQuestions.map((question) => (
                  <div key={question._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          by {question.user}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatRelativeTime(question.timestamp)}
                        </span>
                      </div>
                      {getHelpfulIcon(question.helpful)}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Question:
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {question.question}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Answer:
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      {searchTerm ? "No questions match your search" : "No questions found"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}