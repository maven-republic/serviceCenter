'use client'

import { useRef } from 'react'

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
    fileInputRef.current.value = null // reset input
  }

  return (
    <div className="mb-3">
      <p className="form-label">Supporting Media (Optional)</p>

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        + Upload Media
      </button>
      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {media?.length > 0 && (
        <div className="mt-3 d-flex flex-wrap gap-3">
          {media.map((item, index) => (
            <div key={index} className="border rounded p-2 shadow-sm d-flex flex-column align-items-center" style={{ width: '150px' }}>
              {item.media_type === 'image' ? (
                <img src={item.previewUrl} alt={item.title} className="img-fluid rounded mb-2" />
              ) : (
                <div className="text-center mb-2 w-100" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={item.title}>
                  <i className="fas fa-file-alt fa-2x text-muted" />
                  <div className="small mt-1 mb-0">{item.title}</div>
                </div>
              )}
              <button
                className="btn btn-outline-danger btn-sm mt-1"
                onClick={() => onDelete(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
