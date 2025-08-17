import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Download
} from "lucide-react"
import { getFiles, uploadFile, deleteFile } from "@/api/files"
import { useToast } from "@/hooks/useToast"
import { formatBytes } from "@/lib/format"

interface FileItem {
  _id: string
  name: string
  size: number
  uploadDate: string
  status: 'processing' | 'ready' | 'failed'
  type: string
}

// Further reduced file size limit to work with very restrictive proxy
const MAX_FILE_SIZE = 1024 * 1024; // 1MB to work with proxy constraints

export function FileUpload() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const fetchFiles = useCallback(async () => {
    try {
      console.log("Fetching files")
      const response = await getFiles()
      setFiles(response.files)
    } catch (error) {
      console.error("Error fetching files:", error)
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await handleFileUpload(droppedFiles)
  }, [])

  const validateFile = (file: File): string | null => {
    console.log("Validating file:", file.name, "Size:", file.size, "Type:", file.type)
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}.`
    }

    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      return `File "${file.name}" has an unsupported format. Allowed formats: PDF, DOC, DOCX, TXT, MD.`
    }

    return null
  }

  const handleFileUpload = async (fileList: File[]) => {
    if (fileList.length === 0) return

    console.log("handleFileUpload called with files:", fileList.map(f => ({ name: f.name, size: f.size, type: f.type })))

    // Validate all files first
    const validationErrors: string[] = []
    const validFiles: File[] = []

    for (const file of fileList) {
      const error = validateFile(file)
      if (error) {
        validationErrors.push(error)
      } else {
        validFiles.push(file)
      }
    }

    // Show validation errors
    for (const error of validationErrors) {
      toast({
        title: "File Validation Error",
        description: error,
        variant: "destructive"
      })
    }

    if (validFiles.length === 0) return

    setUploading(true)

    for (const file of validFiles) {
      try {
        console.log(`Uploading file: ${file.name} (${formatBytes(file.size)})`)
        console.log("File object details:", {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          constructor: file.constructor.name
        })

        const formData = new FormData()
        formData.append('file', file)

        // Log FormData details
        console.log("FormData created, entries:")
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value)
          if (value instanceof File) {
            console.log(`    File details: name=${value.name}, size=${value.size}, type=${value.type}`)
          }
        }

        await uploadFile(formData)

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully`
        })
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error)

        // Check if it's a 413 error (Request Entity Too Large)
        if (error.message.includes('413') || error.message.includes('Request Entity Too Large')) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds the server upload limit. Please try a smaller file (max ${formatBytes(MAX_FILE_SIZE)}).`,
            variant: "destructive"
          })
        } else {
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}: ${error.message}`,
            variant: "destructive"
          })
        }
      }
    }

    setUploading(false)
    fetchFiles()
  }

  const handleDelete = async (fileId: string, fileName: string) => {
    try {
      console.log(`Deleting file: ${fileName}`)
      await deleteFile(fileId)
      toast({
        title: "Success",
        description: `${fileName} deleted successfully`
      })
      fetchFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
      toast({
        title: "Error",
        description: "Failed to delete file",
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
        return <FileText className="h-4 w-4 text-slate-400" />
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
          File Upload
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Upload documents to expand your knowledge base
        </p>
      </div>

      {/* Upload Area */}
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse. Supported formats: PDF, DOC, DOCX, TXT, MD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Maximum file size: {formatBytes(MAX_FILE_SIZE)} per file
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => {
                console.log("File input onChange triggered")
                const files = Array.from(e.target.files || [])
                console.log("Selected files:", files.map(f => ({ name: f.name, size: f.size, type: f.type })))
                handleFileUpload(files)
              }}
              className="hidden"
              id="file-upload"
            />
            <Button
              asChild
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              disabled={uploading}
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploading ? "Uploading..." : "Select Files"}
              </label>
            </Button>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Uploading files...</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files List */}
      <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50">
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            Manage your uploaded documents and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(file.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file._id, file.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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