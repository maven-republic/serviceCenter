'use client'

import { useRef, useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

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
  }

  return (
    <div className="mt-4">
      <label className="form-label">Add media like images, documents, or presentations.</label>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* <i className="fas fa-upload" /> */}
          <span>+ Add Media</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="d-none"
        />
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Media</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFile && (
            <div className="mb-3">
              {selectedFile.type.startsWith('image') ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  className="img-thumbnail"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              ) : (
                <div className="bg-light border rounded p-3 text-center">
                  <i className="fas fa-file-alt fa-2x text-secondary" />
                  <p className="small mt-2 mb-0">{selectedFile.name}</p>
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDraftUpload}>
            Save Draft
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
