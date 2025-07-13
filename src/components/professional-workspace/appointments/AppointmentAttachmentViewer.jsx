'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Image, 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar,
  User,
  Eye,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PURPOSE_LABELS = {
  'reference': { label: 'Reference Photos', color: 'bg-blue-100 text-blue-800' },
  'requirement': { label: 'Requirements', color: 'bg-purple-100 text-purple-800' },
  'measurement': { label: 'Measurements', color: 'bg-orange-100 text-orange-800' },
  'damage': { label: 'Damage Assessment', color: 'bg-red-100 text-red-800' },
  'specification': { label: 'Specifications', color: 'bg-green-100 text-green-800' }
}

export default function AppointmentAttachmentViewer({ 
  appointment, 
  isOpen, 
  onClose 
}) {
  const [selectedAttachment, setSelectedAttachment] = useState(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)

  if (!appointment || !appointment.attachments) {
    return null
  }

  const attachments = appointment.attachments || []
  const imageAttachments = attachments.filter(att => att.asset?.type === 'image')
  const documentAttachments = attachments.filter(att => att.asset?.type === 'document')

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = (attachment) => {
    if (attachment.asset?.path) {
      const link = document.createElement('a')
      link.href = attachment.asset.path
      link.download = attachment.asset.original || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleImagePreview = (attachment) => {
    setSelectedAttachment(attachment)
    setImagePreviewOpen(true)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Customer Files - {appointment.service?.name}
            </DialogTitle>
            <div className="text-sm text-muted-foreground">
              Customer: {appointment.customer?.account?.first_name} {appointment.customer?.account?.last_name}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{attachments.length}</div>
                    <div className="text-sm text-muted-foreground">Total Files</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{imageAttachments.length}</div>
                    <div className="text-sm text-muted-foreground">Images</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{documentAttachments.length}</div>
                    <div className="text-sm text-muted-foreground">Documents</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Image Attachments */}
            {imageAttachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Images ({imageAttachments.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageAttachments.map((attachment) => (
                    <Card key={attachment.id} className="overflow-hidden">
                      <div className="aspect-square relative group">
                        <img
                          src={attachment.asset.path}
                          alt={attachment.asset.original}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleImagePreview(attachment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(attachment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <p className="font-medium text-sm truncate">
                            {attachment.asset.original}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", PURPOSE_LABELS[attachment.purpose]?.color)}
                            >
                              {PURPOSE_LABELS[attachment.purpose]?.label || attachment.purpose}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.asset.size)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Document Attachments */}
            {documentAttachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({documentAttachments.length})
                </h3>
                <div className="space-y-2">
                  {documentAttachments.map((attachment) => (
                    <Card key={attachment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{attachment.asset.original}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(attachment.asset.size)} • 
                                Uploaded {new Date(attachment.asset.created).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary"
                              className={cn("text-xs", PURPOSE_LABELS[attachment.purpose]?.color)}
                            >
                              {PURPOSE_LABELS[attachment.purpose]?.label || attachment.purpose}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(attachment)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(attachment.asset.path, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {attachments.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No files uploaded by the customer</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedAttachment?.asset?.original}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImagePreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedAttachment && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedAttachment.asset.path}
                  alt={selectedAttachment.asset.original}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  className={cn(PURPOSE_LABELS[selectedAttachment.purpose]?.color)}
                >
                  {PURPOSE_LABELS[selectedAttachment.purpose]?.label || selectedAttachment.purpose}
                </Badge>
                <Button
                  onClick={() => handleDownload(selectedAttachment)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}