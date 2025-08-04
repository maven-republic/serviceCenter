'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Image, 
  FileText, 
  Camera,
  AlertCircle,
  Loader2,
  ChevronDown, 
  Check
} from 'lucide-react'


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from '@/lib/utils'

const ALLOWED_TYPES = {
  'image/jpeg': { icon: Image, label: 'JPEG Image', maxSize: 10 },
  'image/png': { icon: Image, label: 'PNG Image', maxSize: 10 },
  'image/webp': { icon: Image, label: 'WebP Image', maxSize: 10 },
  'application/pdf': { icon: FileText, label: 'PDF Document', maxSize: 25 },
  'image/heic': { icon: Image, label: 'HEIC Image', maxSize: 10 }
}

// Enhanced PURPOSE_OPTIONS with icons
const PURPOSE_OPTIONS = [
  { 
    value: 'reference', 
    label: 'Reference Photos', 
    description: 'Examples or inspiration images',
    // icon: Image,
    category: 'Visual'
  },
  { 
    value: 'requirement', 
    label: 'Requirements', 
    description: 'Specific requirements or specifications',
    // icon: FileText,
    category: 'Documentation'
  },
  { 
    value: 'measurement', 
    label: 'Measurements', 
    description: 'Dimensions or measurements',
    // icon: Ruler,
    category: 'Technical'
  },
  { 
    value: 'damage', 
    label: 'Damage Assessment', 
    description: 'Photos showing current condition',
    // icon: AlertTriangle,
    category: 'Assessment'
  },
  { 
    value: 'specification', 
    label: 'Specifications', 
    description: 'Technical documents or specs',
    // icon: Settings,
    category: 'Technical'
  }
]

export default function AppointmentFileUpload({ 
  onFilesChange, 
  initialFiles = [],
  maxFiles = 10,
  className = '' 
}) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  // Validate file
  const validateFile = useCallback((file) => {
    const errors = []
    
    if (!ALLOWED_TYPES[file.type]) {
      errors.push(`File type ${file.type} not supported`)
    }
    
    const maxSize = ALLOWED_TYPES[file.type]?.maxSize || 10
    if (file.size > maxSize * 1024 * 1024) {
      errors.push(`File size must be under ${maxSize}MB`)
    }
    
    return errors
  }, [])

  // Handle file selection
  const handleFiles = useCallback(async (fileList) => {
    if (files.length + fileList.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed`])
      return
    }

    setUploading(true)
    setErrors([])
    
    const newFiles = []
    const validationErrors = []

    for (const file of fileList) {
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        validationErrors.push(...fileErrors)
        continue
      }

      try {
        // Create preview for images
        let preview = null
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file)
        }

        const fileData = {
          id: `temp_${Date.now()}_${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          purpose: 'reference', // Default purpose
          preview,
          uploaded: false,
          uploadProgress: 0
        }

        newFiles.push(fileData)
      } catch (error) {
        validationErrors.push(`Error processing ${file.name}: ${error.message}`)
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    }

    setUploading(false)
  }, [files, maxFiles, onFilesChange, validateFile])

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [handleFiles])

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
      e.target.value = '' // Reset input
    }
  }, [handleFiles])

  // Remove file
  const removeFile = useCallback((fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
    
    // Clean up preview URLs
    const removedFile = files.find(f => f.id === fileId)
    if (removedFile?.preview) {
      URL.revokeObjectURL(removedFile.preview)
    }
  }, [files, onFilesChange])

  // Update file purpose
  const updateFilePurpose = useCallback((fileId, purpose) => {
    const updatedFiles = files.map(f => 
      f.id === fileId ? { ...f, purpose } : f
    )
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }, [files, onFilesChange])

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
          dragActive && "border-primary bg-primary/5",
          files.length > 0 && "border-border"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                {files.length > 0 ? 'Add More Files' : 'Upload Project Files'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: Images (JPEG, PNG, WebP, HEIC), PDF documents up to 25MB
              </p>
            </div>

            <Button variant="outline" type="button" disabled={uploading}>
              <Camera className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.keys(ALLOWED_TYPES).join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            <Badge variant="secondary" className="text-xs">
              {files.filter(f => f.uploaded).length} uploaded
            </Badge>
          </div>

          <div className="space-y-2">
            {files.map((file) => {
              const fileType = ALLOWED_TYPES[file.type]
              const FileIcon = fileType?.icon || FileText

              return (
                <Card key={file.id} className="p-4">
                  <div className="flex items-start gap-4">
                    
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={file.preview} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <FileIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {fileType?.label}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Purpose Selector */}
      <div className="mt-3">
  <label className="text-xs font-medium text-muted-foreground">
    File Purpose
  </label>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="outline" 
        className="mt-1 w-full justify-between text-sm h-9 px-3"
      >
        <div className="flex items-center gap-2">
          {(() => {
            const selectedOption = PURPOSE_OPTIONS.find(opt => opt.value === file.purpose);
            const IconComponent = selectedOption?.icon || FileText;
            return (
              <>
                <IconComponent className="h-3 w-3" />
                {selectedOption?.label || 'Select purpose'}
              </>
            );
          })()}
        </div>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-64" align="start">
      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
        Choose File Purpose
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {/* Visual Category */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          Visual
        </DropdownMenuLabel>
        {PURPOSE_OPTIONS.filter(opt => opt.category === 'Visual').map(option => {
          const IconComponent = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilePurpose(file.id, option.value)}
              className="flex items-start gap-2 p-3 cursor-pointer"
            >
              {/* <IconComponent className="h-4 w-4 mt-0.5 text-muted-foreground" /> */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{option.label}</span>
                  {file.purpose === option.value && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Documentation Category */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          Documentation
        </DropdownMenuLabel>
        {PURPOSE_OPTIONS.filter(opt => opt.category === 'Documentation').map(option => {
          const IconComponent = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilePurpose(file.id, option.value)}
              className="flex items-start gap-2 p-3 cursor-pointer"
            >
              {/* <IconComponent className="h-4 w-4 mt-0.5 text-muted-foreground" /> */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{option.label}</span>
                  {file.purpose === option.value && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Technical Category */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          Technical
        </DropdownMenuLabel>
        {PURPOSE_OPTIONS.filter(opt => opt.category === 'Technical').map(option => {
          const IconComponent = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilePurpose(file.id, option.value)}
              className="flex items-start gap-2 p-3 cursor-pointer"
            >
              {/* <IconComponent className="h-4 w-4 mt-0.5 text-muted-foreground" /> */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{option.label}</span>
                  {file.purpose === option.value && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Assessment Category */}
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          Assessment
        </DropdownMenuLabel>
        {PURPOSE_OPTIONS.filter(opt => opt.category === 'Assessment').map(option => {
          const IconComponent = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilePurpose(file.id, option.value)}
              className="flex items-start gap-2 p-3 cursor-pointer"
            >
              {/* <IconComponent className="h-4 w-4 mt-0.5 text-muted-foreground" /> */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{option.label}</span>
                  {file.purpose === option.value && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
  
  {/* Selected purpose description */}
  <div className="mt-2 p-2 bg-muted/30 rounded-md">
    <p className="text-xs text-muted-foreground">
      <span className="font-medium">
        {PURPOSE_OPTIONS.find(opt => opt.value === file.purpose)?.label}:
      </span>{" "}
      {PURPOSE_OPTIONS.find(opt => opt.value === file.purpose)?.description}
    </p>
  </div>
</div>
                      {/* Upload Progress */}
                      {file.uploadProgress > 0 && file.uploadProgress < 100 && (
                        <div className="mt-2">
                          <Progress value={file.uploadProgress} className="h-1" />
                        </div>
                      )}

                      {/* Upload Status */}
                      {file.uploaded && (
                        <div className="flex items-center gap-1 mt-2">
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p>
            Files will be uploaded when you submit your appointment request. 
            You can remove or modify files before submitting.
          </p>
        </div>
      )}
    </div>
  )
}