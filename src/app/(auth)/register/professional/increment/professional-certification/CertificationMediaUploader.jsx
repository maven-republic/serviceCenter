'use client'

import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Image, X } from "lucide-react"

export default function CertificationMediaUploader({ media, onAdd, onDelete }) {
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    const mediaType = file.type.startsWith('image/') ? 'image' : 'file'

    const mediaItem = {
      file,
      previewUrl,
      media_type: mediaType,
      title: file.name
    }

    onAdd(mediaItem)
    fileInputRef.current.value = null
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Supporting Media
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="border-dashed"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
        
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {media?.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Uploaded Files:</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-3">
                  {item.media_type === 'image' ? (
                    <div className="space-y-2">
                      <img
                        src={item.previewUrl}
                        alt={item.title}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Image className="h-3 w-3" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full h-20 bg-muted rounded-md flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(index)}
                    className="w-full mt-2 h-6 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}