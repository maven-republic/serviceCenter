'use client'

import { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Image } from "lucide-react"

export default function EducationMediaUploader({ onUploadDraft }) {
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setTitle(file.name)
    setDescription('')
    setShowModal(true)
  }

  const handleDraftUpload = () => {
    if (!selectedFile) return

    const mediaDraft = {
      file: selectedFile,
      title,
      description,
      media_type: selectedFile.type.startsWith('image') ? 'image' : 'document',
      previewUrl: URL.createObjectURL(selectedFile)
    }

    onUploadDraft(mediaDraft)
    setShowModal(false)
    setSelectedFile(null)
    setTitle('')
    setDescription('')
  }

  const resetModal = () => {
    setShowModal(false)
    setSelectedFile(null)
    setTitle('')
    setDescription('')
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Add media like images, documents, or presentations to support your education entry.
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="border-dashed"
      >
        <Upload className="h-4 w-4 mr-2" />
        Add Media
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Dialog open={showModal} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Add Media
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedFile && (
              <Card>
                <CardContent className="p-4">
                  {selectedFile.type.startsWith('image') ? (
                    <div className="space-y-3">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Image className="h-4 w-4" />
                        {selectedFile.name}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-md">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="media-title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="media-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="media-description"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add a description or context for this media"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDraftUpload}
              disabled={!title.trim()}
            >
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}