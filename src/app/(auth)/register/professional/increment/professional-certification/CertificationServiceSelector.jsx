'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function CertificationServiceSelector({ selected, onSelect, onRemove }) {
  const supabase = useSupabaseClient()
  const [allServices, setAllServices] = useState([])
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('service')
        .select('service_id, name')
        .order('name')

      if (!error) setAllServices(data)
    }

    fetchServices()
  }, [supabase])

  const suggestions = allServices
    .filter(service =>
      service.name.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(service.service_id)
    )
    .slice(0, 5)

  return (
    <div className="mb-4">
      <div className="d-flex flex-column gap-2 align-items-start mb-3">
        <label className="form-label small text-muted">
          Tag services or work types this credential qualifies you for
        </label>

        {!showInput ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 shadow-sm"
            onClick={() => setShowInput(true)}
          >
            + Add Service
          </button>
        ) : (
          <>
            <input
              type="text"
              className="form-control rounded-pill px-3 py-2 shadow-sm"
              placeholder="Search services..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            {suggestions.length > 0 && (
              <ul className="list-group w-100 shadow-sm mt-2">
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
            )}
          </>
        )}
      </div>

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
                <i className="fas fa-times-circle ms-1" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

