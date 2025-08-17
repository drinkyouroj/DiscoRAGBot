import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  PenTool,
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  FileText,
  Calendar
} from "lucide-react"
import { getManualEntries, createManualEntry, updateManualEntry, deleteManualEntry } from "@/api/manual-entries"
import { useToast } from "@/hooks/useToast"
import { formatRelativeTime } from "@/lib/format"

interface ManualEntryItem {
  _id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdDate: string
  updatedDate: string
}

interface EntryForm {
  title: string
  content: string
  category: string
  tags: string
}

export function ManualEntry() {
  const [entries, setEntries] = useState<ManualEntryItem[]>([])
  const [filteredEntries, setFilteredEntries] = useState<ManualEntryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingEntry, setEditingEntry] = useState<ManualEntryItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EntryForm>()

  const fetchEntries = useCallback(async () => {
    try {
      console.log("Fetching manual entries")
      const response = await getManualEntries()
      setEntries(response.entries)
      setFilteredEntries(response.entries)
    } catch (error) {
      console.error("Error fetching entries:", error)
      toast({
        title: "Error",
        description: "Failed to load entries",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  useEffect(() => {
    let filtered = entries

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(entry => entry.category === selectedCategory)
    }

    setFilteredEntries(filtered)
  }, [entries, searchTerm, selectedCategory])

  const categories = Array.from(new Set(entries.map(entry => entry.category)))

  const onSubmit = async (data: EntryForm) => {
    setSaving(true)
    try {
      const tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      const entryData = { ...data, tags }

      if (editingEntry) {
        console.log(`Updating entry: ${data.title}`)
        await updateManualEntry(editingEntry._id, entryData)
        toast({
          title: "Success",
          description: "Entry updated successfully"
        })
      } else {
        console.log(`Creating entry: ${data.title}`)
        await createManualEntry(entryData)
        toast({
          title: "Success",
          description: "Entry created successfully"
        })
      }

      reset()
      setEditingEntry(null)
      setDialogOpen(false)
      fetchEntries()
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (entry: ManualEntryItem) => {
    setEditingEntry(entry)
    setValue("title", entry.title)
    setValue("content", entry.content)
    setValue("category", entry.category)
    setValue("tags", entry.tags.join(", "))
    setDialogOpen(true)
  }

  const handleDelete = async (entryId: string, title: string) => {
    try {
      console.log(`Deleting entry: ${title}`)
      await deleteManualEntry(entryId)
      toast({
        title: "Success",
        description: "Entry deleted successfully"
      })
      fetchEntries()
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      })
    }
  }

  const handleNewEntry = () => {
    setEditingEntry(null)
    reset()
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Manual Entries
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create and manage custom knowledge base entries
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewEntry} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit Entry" : "Create New Entry"}
              </DialogTitle>
              <DialogDescription>
                {editingEntry ? "Update the entry details below." : "Add a new entry to your knowledge base."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter entry title"
                  className="bg-white/50 dark:bg-slate-800/50"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register("category", { required: "Category is required" })}
                  placeholder="e.g., Setup, Troubleshooting, Technical"
                  className="bg-white/50 dark:bg-slate-800/50"
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...register("tags")}
                  placeholder="bot, setup, discord (comma-separated)"
                  className="bg-white/50 dark:bg-slate-800/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...register("content", { required: "Content is required" })}
                  placeholder="Enter the detailed content for this entry..."
                  rows={8}
                  className="bg-white/50 dark:bg-slate-800/50"
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? "Saving..." : editingEntry ? "Update Entry" : "Create Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-800/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="grid gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredEntries.length === 0 ? (
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
            <CardContent className="text-center py-8">
              <PenTool className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || selectedCategory !== "all" ? "No entries match your search" : "No entries created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry._id} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                      {entry.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {entry.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {formatRelativeTime(entry.updatedDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry._id, entry.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                  {entry.content}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-3 w-3 text-slate-400" />
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}