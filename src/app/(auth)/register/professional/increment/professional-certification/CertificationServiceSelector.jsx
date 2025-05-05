'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../../../../../utils/supabase/client'

export default function CertificationServiceSelector({ selected, onSelect, onRemove }) {
  const [allServices, setAllServices] = useState([])
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('service')
        .select('service_id, name')
        .order('name')

      if (!error) setAllServices(data)
    }

    fetchServices()
  }, [])

  const suggestions = allServices
    .filter(service =>
      service.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(service.service_id)
    )
    .slice(0, 5)

  return (
    <div className="mb-3">
      <p className="text-muted mb-2">
        Tag services or work types this credential qualifies you for.
      </p>

      {!showInput ? (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setShowInput(true)}
        >
          + Add Service
        </button>
      ) : (
        <>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Search services..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <ul className="list-group mb-2">
            {suggestions.map(service => (
              <li
                key={service.service_id}
                className="list-group-item list-group-item-action"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onSelect(service.service_id)
                  setInput('')
                  setShowInput(false)
                }}
              >
                {service.name}
              </li>
            ))}
          </ul>
        </>
      )}

      {selected.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {selected.map(id => {
            const svc = allServices.find(s => s.service_id === id)
            if (!svc) return null
            return (
              <button
                key={id}
                type="button"
                className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-light border rounded-pill text-primary small fw-medium shadow-sm"
                onClick={() => onRemove(id)}
              >
                {svc.name}
                <i className="fas fa-times-circle ms-2" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
