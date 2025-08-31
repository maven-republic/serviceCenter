'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
  Check,
  Plus,
  Trash2,
  Eye,
  MoreHorizontal
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

// Enhanced PURPOSE_OPTIONS with better mobile descriptions
const PURPOSE_OPTIONS = [
  { 
    value: 'reference', 
    label: 'Reference Photos', 
    description: 'Examples or inspiration images',
    mobileLabel: 'Reference',
    category: 'Visual',
    icon: Image
  },
  { 
    value: 'requirement', 
    label: 'Requirements', 
    description: 'Specific requirements or specifications',
    mobileLabel: 'Requirements',
    category: 'Documentation',
    icon: FileText
  },
  { 
    value: 'measurement', 
    label: 'Measurements', 
    description: 'Dimensions or measurements',
    mobileLabel: 'Measurements',
    category: 'Technical',
    icon: FileText
  },
  { 
    value: 'damage', 
    label: 'Damage Assessment', 
    description: 'Photos showing current condition',
    mobileLabel: 'Damage',
    category: 'Assessment',
    icon: AlertCircle
  },
  { 
    value: 'specification', 
    label: 'Specifications', 
    description: 'Technical documents or specs',
    mobileLabel: 'Specs',
    category: 'Technical',
    icon: FileText
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
  const [isMobile, setIsMobile] = useState(false)
  const [expandedFileId, setExpandedFileId] = useState(null)
  const fileInputRef = useRef(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Toggle file expansion on mobile
  const toggleFileExpansion = useCallback((fileId) => {
    if (isMobile) {
      setExpandedFileId(prev => prev === fileId ? null : fileId)
    }
  }, [isMobile])

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get purpose option details
  const getPurposeOption = useCallback((value) => {
    return PURPOSE_OPTIONS.find(opt => opt.value === value) || PURPOSE_OPTIONS[0]
  }, [])

  // Mobile File Card Component
  const MobileFileCard = ({ file }) => {
    const fileType = ALLOWED_TYPES[file.type]
    const FileIcon = fileType?.icon || FileText
    const purposeOption = getPurposeOption(file.purpose)
    const isExpanded = expandedFileId === file.id

    return (
      <Card className="overflow-hidden">
        <div 
          className="p-3 cursor-pointer"
          onClick={() => toggleFileExpansion(file.id)}
        >
          <div className="flex items-center gap-3">
            {/* File Preview/Icon */}
            <div className="flex-shrink-0">
              {file.preview ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
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

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {purposeOption.mobileLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t bg-muted/30 p-3 space-y-3">
            {/* Purpose Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                File Purpose
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PURPOSE_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    variant={file.purpose === option.value ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-xs h-8"
                    onClick={() => updateFilePurpose(file.id, option.value)}
                  >
                    {file.purpose === option.value && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {option.mobileLabel}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {file.preview && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => window.open(file.preview, '_blank')}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => removeFile(file.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>

            {/* Upload Progress */}
            {file.uploadProgress > 0 && file.uploadProgress < 100 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span>{file.uploadProgress}%</span>
                </div>
                <Progress value={file.uploadProgress} className="h-1" />
              </div>
            )}

            {/* Upload Status */}
            {file.uploaded && (
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">Uploaded</span>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  // Desktop File Card Component
  const DesktopFileCard = ({ file }) => {
    const fileType = ALLOWED_TYPES[file.type]
    const FileIcon = fileType?.icon || FileText
    const purposeOption = getPurposeOption(file.purpose)

    return (
      <Card className="p-4">
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
                className="text-muted-foreground hover:text-destructive ml-2"
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
                      <purposeOption.icon className="h-3 w-3" />
                      {purposeOption.label}
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="start">
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    Choose File Purpose
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Group by category */}
                  {['Visual', 'Documentation', 'Technical', 'Assessment'].map(category => (
                    <DropdownMenuGroup key={category}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                        {category}
                      </DropdownMenuLabel>
                      {PURPOSE_OPTIONS.filter(opt => opt.category === category).map(option => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => updateFilePurpose(file.id, option.value)}
                          className="flex items-start gap-2 p-3 cursor-pointer"
                        >
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
                      ))}
                      <DropdownMenuSeparator />
                    </DropdownMenuGroup>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Selected purpose description */}
              <div className="mt-2 p-2 bg-muted/30 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">
                    {purposeOption.label}:
                  </span>{" "}
                  {purposeOption.description}
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
  }

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
          dragActive && "border-primary bg-primary/5",
          files.length > 0 && "border-border",
          isMobile && "touch-target"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className={`text-center ${isMobile ? 'p-6' : 'p-8'}`}>
          <div className="space-y-4">
            <div className={`mx-auto bg-primary/10 rounded-full flex items-center justify-center ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}>
              {uploading ? (
                <Loader2 className={`text-primary animate-spin ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              ) : (
                <Upload className={`text-primary ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className={`font-medium text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                {files.length > 0 ? 'Add More Files' : 'Upload Project Files'}
              </h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
                {isMobile ? 'Tap to browse or drag files here' : 'Drag and drop files here, or click to browse'}
              </p>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                Supports: Images (JPEG, PNG, WebP, HEIC), PDF documents up to 25MB
              </p>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              disabled={uploading}
              className={`gap-2 ${isMobile ? 'h-12 px-6' : ''}`}
            >
              {isMobile ? <Plus className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              {isMobile ? 'Add Files' : 'Choose Files'}
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
                <li key={index} className={isMobile ? 'text-sm' : ''}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-foreground ${isMobile ? 'text-base' : ''}`}>
              {isMobile ? `Files (${files.length}/${maxFiles})` : ` Files (${files.length}/${maxFiles})`}
            </h4>
           
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              isMobile ? (
                <MobileFileCard key={file.id} file={file} />
              ) : (
                <DesktopFileCard key={file.id} file={file} />
              )
            ))}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
          <p>
            Files will be uploaded when you submit your appointment request. 
            You can remove or modify files before submitting.
          </p>
        </div>
      )}
    </div>
  )
}