// steps/ServiceTag.jsx
'use client'

import styles from '../ProfessionalForm.module.css'

export default function ServiceTag({ service, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`
        ${styles.serviceTag}
        badge rounded-pill py-2 px-3 d-flex align-items-center
        ${selected ? 'bg-primary text-white' : 'bg-light text-dark border'}
      `}
      onClick={() => onToggle(service.service_id)}
      title={service.name}
      aria-pressed={selected}
    >
      {service.name}
    </button>
  )
}
