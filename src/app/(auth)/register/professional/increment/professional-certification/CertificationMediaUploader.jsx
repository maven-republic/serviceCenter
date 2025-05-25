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
    fileInputRef.current.value = null
  }

  return (
<div className="mb-3 d-flex flex-column align-items-start gap-2">
<label className="form-label small text-muted">
    Supporting Media <span className="text-muted">(Optional)</span>
  </label>
  <button
    type="button"
    className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 shadow-sm"
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
        <div className="mt-4 d-flex flex-wrap gap-3">
          {media.map((item, index) => (
            <div
              key={index}
              className="border rounded-3 bg-white shadow-sm p-3 d-flex flex-column align-items-center text-center"
              style={{ width: '160px' }}
            >
              {item.media_type === 'image' ? (
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="img-fluid rounded mb-2"
                  style={{ maxHeight: '100px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="text-muted mb-2 d-flex flex-column align-items-center justify-content-center"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}
                  title={item.title}
                >
                  <i className="fas fa-file-alt fa-2x mb-2" />
                  <small className="fw-semibold text-truncate">{item.title}</small>
                </div>
              )}
              <button
                className="btn btn-outline-danger btn-sm rounded-pill mt-2"
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

