'use client'

import tagDESIGN from '../ServiceTag.module.css'

export default function ServiceTag({ service, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`${tagDESIGN.tag} ${selected ? tagDESIGN.tagSelected : ''}`}
      onClick={() => onToggle(service.service_id)}
      title={service.name}
      aria-pressed={selected}
    >
      {service.name}
    </button>
  )
}
