import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Bot,
  Settings,
  MessageSquare,
  Activity,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { getBotConfig, updateBotConfig, getBotStatus } from "@/api/bot-config"
import { useToast } from "@/hooks/useToast"

interface BotConfigForm {
  personality: string
  customPersonality: string
  tone: string
  responseLength: string
  responseFormat: string
  confidenceThreshold: number
  includeCitations: boolean
  enabledChannels: string
}

export function BotConfiguration() {
  const [config, setConfig] = useState<any>(null)
  const [botStatus, setBotStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7])
  const { toast } = useToast()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BotConfigForm>()

  const watchedPersonality = watch("personality")
  const watchedTone = watch("tone")
  const watchedResponseLength = watch("responseLength")

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching bot configuration and status")
        const [configRes, statusRes] = await Promise.all([
          getBotConfig(),
          getBotStatus()
        ])

        setConfig(configRes.config)
        setBotStatus(statusRes.status)

        // Set form values
        setValue("personality", configRes.config.personality)
        setValue("customPersonality", configRes.config.customPersonality)
        setValue("tone", configRes.config.tone)
        setValue("responseLength", configRes.config.responseLength)
        setValue("responseFormat", configRes.config.responseFormat)
        setValue("includeCitations", configRes.config.includeCitations)
        setValue("enabledChannels", configRes.config.enabledChannels.join(", "))
        setConfidenceThreshold([configRes.config.confidenceThreshold])
      } catch (error) {
        console.error("Error fetching bot data:", error)
        toast({
          title: "Error",
          description: "Failed to load bot configuration",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setValue, toast])

  const onSubmit = async (data: BotConfigForm) => {
    setSaving(true)
    try {
      console.log("Updating bot configuration")
      const configData = {
        ...data,
        confidenceThreshold: confidenceThreshold[0],
        enabledChannels: data.enabledChannels.split(',').map(channel => channel.trim()).filter(channel => channel.length > 0)
      }

      await updateBotConfig(configData)
      toast({
        title: "Success",
        description: "Bot configuration updated successfully"
      })
    } catch (error) {
      console.error("Error updating bot config:", error)
      toast({
        title: "Error",
        description: "Failed to update bot configuration",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getPreviewResponse = () => {
    const personality = watchedPersonality || "friendly"
    const tone = watchedTone || "conversational"
    const length = watchedResponseLength || "medium"

    let response = ""
    
    if (personality === "professional") {
      response = "I can assist you with that inquiry. "
    } else if (personality === "friendly") {
      response = "Hi there! I'd be happy to help you with that. "
    } else if (personality === "technical") {
      response = "Based on the documentation, "
    } else {
      response = "Sure thing! "
    }

    if (length === "short") {
      response += "Here's the answer: Bot setup requires admin permissions."
    } else if (length === "long") {
      response += "To set up the Discord bot properly, you'll need to follow several important steps. First, ensure you have administrator permissions in your Discord server. Then, create a new application in the Discord Developer Portal, generate a bot token, and configure the necessary permissions including read messages, send messages, and embed links. Finally, invite the bot to your server using the generated invite link with the appropriate permission scope."
    } else {
      response += "To set up the bot, you'll need admin permissions in your Discord server. Create a new application in the Developer Portal, generate a bot token, and invite it with the necessary permissions."
    }

    return response
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader className="animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
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
            Bot Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configure your Discord bot's personality and behavior
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personality" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="personality" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    Personality Settings
                  </CardTitle>
                  <CardDescription>
                    Define how your bot should interact with users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality Type</Label>
                    <Select onValueChange={(value) => setValue("personality", value)} defaultValue={config?.personality}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                        <SelectValue placeholder="Select personality" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900">
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customPersonality">Custom Personality Description</Label>
                    <Textarea
                      {...register("customPersonality")}
                      placeholder="Describe how the bot should behave..."
                      rows={4}
                      className="bg-white/50 dark:bg-slate-800/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone">Response Tone</Label>
                    <Select onValueChange={(value) => setValue("tone", value)} defaultValue={config?.tone}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900">
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="helpful">Helpful</SelectItem>
                        <SelectItem value="concise">Concise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Response Preview
                  </CardTitle>
                  <CardDescription>
                    See how your bot will respond with current settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Discord Bot
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getPreviewResponse()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    Response Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure how the bot formats and delivers responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="responseLength">Response Length</Label>
                    <Select onValueChange={(value) => setValue("responseLength", value)} defaultValue={config?.responseLength}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900">
                        <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                        <SelectItem value="medium">Medium (1-2 paragraphs)</SelectItem>
                        <SelectItem value="long">Long (Detailed explanations)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responseFormat">Response Format</Label>
                    <Select onValueChange={(value) => setValue("responseFormat", value)} defaultValue={config?.responseFormat}>
                      <SelectTrigger className="bg-white/50 dark:bg-slate-800/50">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900">
                        <SelectItem value="plain">Plain text</SelectItem>
                        <SelectItem value="bullets">Bullet points</SelectItem>
                        <SelectItem value="numbered">Numbered lists</SelectItem>
                        <SelectItem value="mixed">Mixed format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Confidence Threshold: {confidenceThreshold[0].toFixed(2)}</Label>
                    <Slider
                      value={confidenceThreshold}
                      onValueChange={setConfidenceThreshold}
                      max={1}
                      min={0.1}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Minimum confidence level required for the bot to provide an answer
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
                <CardHeader>
                  <CardTitle>Additional Settings</CardTitle>
                  <CardDescription>
                    Extra configuration options for bot behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="citations">Include Source Citations</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Add source references to bot responses
                      </p>
                    </div>
                    <Switch
                      id="citations"
                      defaultChecked={config?.includeCitations}
                      onCheckedChange={(checked) => setValue("includeCitations", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enabledChannels">Enabled Channels</Label>
                    <Input
                      {...register("enabledChannels")}
                      placeholder="general, help, support (comma-separated)"
                      className="bg-white/50 dark:bg-slate-800/50"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Discord channels where the bot should respond
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardHeader>
                <CardTitle>Bot Status & Information</CardTitle>
                <CardDescription>
                  Current bot status and system information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${botStatus?.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-slate-500">{botStatus?.online ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Knowledge Base</p>
                      <p className="text-xs text-slate-500">{botStatus?.knowledgeBaseSize} documents</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Version</p>
                      <p className="text-xs text-slate-500">{botStatus?.version}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Last Activity</p>
                      <p className="text-xs text-slate-500">
                        {new Date(botStatus?.lastActivity).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}