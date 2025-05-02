// steps/ServiceCategoryGroup.jsx
'use client'

import ServiceTag from './ServiceTag'
import styles from '../ProfessionalForm.module.css'

export default function ServiceCategoryGroup({
  category,
  services,
  selectedServices,
  onToggle
}) {
  return (
    <div>
      <div className={styles.dropdownCategoryHeader}>
        {category.name}
      </div>
      <div className={styles.dropdownServicesGrid}>
        {services.map(service => (
          <ServiceTag
            key={service.service_id}
            service={service}
            selected={selectedServices.includes(service.service_id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
