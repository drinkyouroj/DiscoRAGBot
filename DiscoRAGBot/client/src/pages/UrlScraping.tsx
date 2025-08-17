import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import {
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react"
import { getUrls, scrapeUrl, rescrapeUrl, deleteUrl } from "@/api/urls"
import { useToast } from "@/hooks/useToast"
import { formatRelativeTime } from "@/lib/format"

interface UrlItem {
  _id: string
  url: string
  title: string
  scrapedDate: string
  status: 'processing' | 'ready' | 'failed'
  preview: string
}

interface UrlForm {
  url: string
}

export function UrlScraping() {
  const [urls, setUrls] = useState<UrlItem[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UrlForm>()

  const fetchUrls = useCallback(async () => {
    try {
      console.log("Fetching URLs")
      const response = await getUrls()
      setUrls(response.urls)
    } catch (error) {
      console.error("Error fetching URLs:", error)
      toast({
        title: "Error",
        description: "Failed to load URLs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUrls()
  }, [fetchUrls])

  const onSubmit = async (data: UrlForm) => {
    setScraping(true)
    try {
      console.log(`Adding URL for scraping: ${data.url}`)
      await scrapeUrl(data.url)
      toast({
        title: "Success",
        description: "URL added for scraping"
      })
      reset()
      fetchUrls()
    } catch (error) {
      console.error("Error scraping URL:", error)
      toast({
        title: "Error",
        description: "Failed to scrape URL",
        variant: "destructive"
      })
    } finally {
      setScraping(false)
    }
  }

  const handleRescrape = async (urlId: string, url: string) => {
    try {
      console.log(`Re-scraping URL: ${url}`)
      await rescrapeUrl(urlId)
      toast({
        title: "Success",
        description: "URL re-scraping initiated"
      })
      fetchUrls()
    } catch (error) {
      console.error("Error re-scraping URL:", error)
      toast({
        title: "Error",
        description: "Failed to re-scrape URL",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (urlId: string, url: string) => {
    try {
      console.log(`Deleting URL: ${url}`)
      await deleteUrl(urlId)
      toast({
        title: "Success",
        description: "URL deleted successfully"
      })
      fetchUrls()
    } catch (error) {
      console.error("Error deleting URL:", error)
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Globe className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ready</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Processing</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          URL Scraping
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Scrape websites to add content to your knowledge base
        </p>
      </div>

      {/* Add URL Form */}
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
        <CardHeader>
          <CardTitle>Add New URL</CardTitle>
          <CardDescription>
            Enter a website URL to scrape its content for the knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  {...register("url", {
                    required: "URL is required",
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL starting with http:// or https://"
                    }
                  })}
                  placeholder="https://example.com"
                  className="bg-white/50 dark:bg-slate-800/50"
                />
                {errors.url && (
                  <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={scraping}
                className="bg-green-600 hover:bg-green-700"
              >
                {scraping ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scraping...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add URL
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* URLs List */}
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
        <CardHeader>
          <CardTitle>Scraped URLs</CardTitle>
          <CardDescription>
            Manage your scraped websites and their content status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No URLs scraped yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((urlItem) => (
                <div key={urlItem._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(urlItem.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {urlItem.title}
                          </h3>
                          <a
                            href={urlItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 truncate">
                          {urlItem.url}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                          {urlItem.preview}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Scraped {formatRelativeTime(urlItem.scrapedDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {getStatusBadge(urlItem.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRescrape(urlItem._id, urlItem.url)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(urlItem._id, urlItem.url)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}