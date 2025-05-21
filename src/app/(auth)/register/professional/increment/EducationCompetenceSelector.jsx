'use client'

import { useState } from 'react'
import styles from './Education.module.css' // or './EducationCompetence.module.css'

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
        What soft skills do you have that would make you likeable to our customers?
      </p>

      {!showInput ? (
        <button
          type="button"
          className={styles.mediaButton}
          onClick={() => setShowInput(true)}
        >
          + Add Competence
        </button>
      ) : (
        <>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a competence..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <ul className="mt-2">
            {suggestions.map(c => (
              <li
                key={c.competence_id}
                className={styles.suggestion}
                onClick={() => {
                  onSelect(c.competence_id)
                  setInput('')
                  setShowInput(false)
                }}
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
                className={styles.tag}
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
