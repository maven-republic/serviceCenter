// steps/PortfolioGroup.jsx
'use client'

import ServiceTag from './ServiceTag'
import tagDESIGN from '../ServiceTag.module.css'

export default function Portfolio({
  portfolio,        // ✅ Changed from category
  services,
  selectedServices,
  onToggle
}) {
  return (
    <div>
      <div className={tagDESIGN.dropdownCategoryHeader}>
        {portfolio.name}  {/* ✅ Updated property */}
      </div>
      <div className={tagDESIGN.dropdownServicesGrid}>
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