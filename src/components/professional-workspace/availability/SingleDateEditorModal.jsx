'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { AVAILABILITY_RULES } from '@/config/availabilityRules'

function hasDuplicateBlock(blocks) {
  const seen = new Set()
  for (const block of blocks) {
    const key = `${block.start_time}-${block.end_time}`
    if (seen.has(key)) return true
    seen.add(key)
  }
  return false
}

function generateNextTimeBlock(existingBlocks, increment = 60) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toTime = (m) => {
    const h = Math.floor(m / 60)
    const mins = m % 60
    return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
  if (!existingBlocks.length) {
    return {
      start_time: AVAILABILITY_RULES.DEFAULT_BLOCK_START,
      end_time: AVAILABILITY_RULES.DEFAULT_BLOCK_END
    }
  }

  const sorted = [...existingBlocks].sort((a, b) => toMinutes(a.end_time) - toMinutes(b.end_time))
  const lastEnd = toMinutes(sorted[sorted.length - 1].end_time)
  const start = lastEnd
  const end = Math.min(start + increment, 1440)
  if (end <= start || end > 1440) return null

  return { start_time: toTime(start), end_time: toTime(end) }
}

export default function SingleDateEditorModal({ date, existing = [], onSave, onReset, onClose, noShadow }) {
  const [blocks, setBlocks] = useState(
    existing.length > 0 ? existing.map(b => ({ ...b })) : [{
      start_time: AVAILABILITY_RULES.DEFAULT_BLOCK_START,
      end_time: AVAILABILITY_RULES.DEFAULT_BLOCK_END
    }]
  )

  const handleChange = (index, field, value) => {
    const updated = [...blocks]
    updated[index][field] = value
    setBlocks(updated)
  }

  const handleAdd = () => {
    const next = generateNextTimeBlock(blocks)
    if (!next || hasDuplicateBlock([...blocks, next])) return
    setBlocks(prev => [...prev, next])
  }

  const handleRemove = (index) => {
    setBlocks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(blocks)
  }

  return (
    <Modal show onHide={onClose} centered contentClassName={noShadow ? 'no-shadow-modal' : ''}>
      <Modal.Header closeButton>
        <Modal.Title className="h6 fw-bold">
          Edit Availability for {format(date, 'EEEE, MMM d, yyyy')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex flex-column gap-3">
          {blocks.map((block, index) => (
            <div key={index} className="d-flex align-items-center gap-2">
              <input
                type="time"
                className="form-control"
                value={block.start_time}
                onChange={(e) => handleChange(index, 'start_time', e.target.value)}
              />
              <span>to</span>
              <input
                type="time"
                className="form-control"
                value={block.end_time}
                onChange={(e) => handleChange(index, 'end_time', e.target.value)}
              />
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemove(index)}
                title="Remove"
              >
                ✕
              </Button>
            </div>
          ))}

          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleAdd}
            className="align-self-start"
          >
            + Add Time Block
          </Button>

          {existing.length > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onReset}
              className="align-self-start"
            >
              Reset to Weekly Hours
            </Button>
          )}

          {hasDuplicateBlock(blocks) && (
            <div className="text-danger small mt-2">
              Duplicate time block detected.
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={hasDuplicateBlock(blocks)}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

