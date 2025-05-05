'use client'

import { useState } from 'react'

export default function EducationCompetenceSelector({ selected, allCompetences, onSelect, onRemove }) {
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  const suggestions = (allCompetences || [])
    .filter(c =>
      c.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(c.competence_id)
    )
    .slice(0, 5)

  return (
    <div className="mb-3">
      <p className="text-muted mb-2">
What  soft skills do you have that would make you likeable to our customers?
 </p>

      {!showInput ? (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setShowInput(true)}
        >
          + Add Competence
        </button>
      ) : (
        <>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Type a competence..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <ul className="list-group mb-2">
            {suggestions.map(c => (
              <li
                key={c.competence_id}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  onSelect(c.competence_id)
                  setInput('')
                  setShowInput(false)
                }}
                style={{ cursor: 'pointer' }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {selected.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {selected.map(id => {
            const comp = allCompetences.find(c => c.competence_id === id)
            if (!comp) return null
            return (
              <button
                key={id}
                type="button"
                className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-light border rounded-pill text-primary small fw-medium shadow-sm"
                onClick={() => onRemove(id)}
              >
                {comp.name}
                <i className="fas fa-times-circle ms-2" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
