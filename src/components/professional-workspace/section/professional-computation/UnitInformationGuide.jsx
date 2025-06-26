// UnitInformationGuide.jsx - Unit Information Guide Component

'use client'

const UnitInformationGuide = ({ 
  selectedUnit,
  spacing,
  typography,
  colors
}) => {
  const getUnitDescription = () => {
    const unitCode = selectedUnit?.unit_code || 'fixed'
    const unitDescription = selectedUnit?.description
    
    // Use custom description if available, otherwise use built-in logic
    if (unitDescription) {
      return unitDescription
    }
    
    switch(unitCode) {
      case 'hour':
        return 'Hourly pricing is ideal for services where time is the primary factor. Consider minimum hour requirements and travel time.'
      case 'square_foot':
      case 'square_meter':
        return 'Per area pricing works well for flooring, painting, cleaning, and similar coverage-based services.'
      case 'linear_foot':
      case 'linear_meter':
        return 'Linear pricing is common for fencing, plumbing runs, electrical conduit, and trim work.'
      case 'room':
        return 'Per room pricing simplifies estimates for painting, cleaning, flooring, and electrical work in residential settings.'
      case 'fixture':
        return 'Per fixture pricing is ideal for plumbing and electrical installations where each unit requires similar work.'
      case 'outlet':
        return 'Per outlet pricing standardizes electrical work for switches, receptacles, and electrical connections.'
      case 'per_item':
        return 'Per item pricing works well for appliance installations, equipment setups, and individual component work.'
      case 'fixed':
        return 'Flat rate pricing provides certainty for both you and your customers. Best for well-defined scope services.'
      case 'per_trip':
        return 'Per trip pricing is suitable for mobile services, delivery, and location-based work.'
      case 'cubic_yard':
      case 'gallon':
        return 'Volume-based pricing is ideal for material-intensive services like concrete, excavation, or liquid services.'
      case 'per_pound':
      case 'per_ton':
        return 'Weight-based pricing is common for material handling, waste removal, and freight services.'
      case 'per_day':
        return 'Daily rate pricing works well for equipment rental, project-based work, and extended service contracts.'
      case 'per_week':
      case 'per_month':
        return 'Long-term rate pricing is ideal for ongoing maintenance contracts and subscription-based services.'
      case 'per_mile':
        return 'Mileage-based pricing is perfect for delivery services, transportation, and mobile service calls.'
      case 'per_unit':
        return 'Unit-based pricing provides flexibility for services with variable quantities or modular components.'
      case 'percentage':
        return 'Percentage-based pricing scales with project value and is common for consulting and commission-based work.'
      default:
        return 'Choose the valuation unit that best matches how your service is typically measured and quoted.'
    }
  }

  const getUnitExamples = () => {
    const unitCode = selectedUnit?.unit_code || 'fixed'
    
    switch(unitCode) {
      case 'hour':
        return 'Examples: Consulting, repairs, maintenance work'
      case 'square_foot':
      case 'square_meter':
        return 'Examples: Flooring, painting, cleaning, landscaping'
      case 'linear_foot':
      case 'linear_meter':
        return 'Examples: Fencing, trim work, piping, wiring runs'
      case 'room':
        return 'Examples: Interior painting, carpet cleaning, electrical upgrades'
      case 'fixture':
        return 'Examples: Light installation, faucet replacement, outlet installation'
      case 'outlet':
        return 'Examples: Electrical work, switch installation, receptacle upgrades'
      case 'per_item':
        return 'Examples: Appliance installation, equipment setup, component replacement'
      case 'fixed':
        return 'Examples: Diagnostics, inspections, small repairs'
      case 'per_trip':
        return 'Examples: Delivery, pickup, service calls'
      case 'cubic_yard':
      case 'gallon':
        return 'Examples: Concrete work, excavation, liquid services'
      case 'per_pound':
      case 'per_ton':
        return 'Examples: Waste removal, material handling, freight'
      case 'per_day':
        return 'Examples: Equipment rental, project management, temporary services'
      case 'per_mile':
        return 'Examples: Transportation, delivery, mobile services'
      case 'percentage':
        return 'Examples: Project management, consulting, commission work'
      default:
        return 'Consider how your customers typically think about and measure your service'
    }
  }

  return (
    <div 
      className="mt-4 p-3 border"
      style={{
        borderColor: colors.border.subtle,
        borderRadius: '8px',
        backgroundColor: colors.background.secondary
      }}
    >
      <div 
        className="fw-medium mb-2"
        style={{
          fontSize: typography.caption,
          color: colors.text.primary
        }}
      >
        <i className="fas fa-info-circle me-2" style={{ color: colors.interactive.primary }}></i>
        Valuation Unit Guide
        {selectedUnit?.display_name && (
          <span 
            className="badge bg-transparent ms-2"
            style={{
              border: `1px solid ${colors.interactive.primary}`,
              color: colors.interactive.primary,
              fontSize: typography.micro,
              padding: `2px ${spacing.sm}`
            }}
          >
            {selectedUnit.display_name}
          </span>
        )}
      </div>
      
      <div 
        className="mb-2"
        style={{
          fontSize: typography.small,
          color: colors.text.secondary,
          lineHeight: '1.4'
        }}
      >
        {getUnitDescription()}
      </div>
      
      <div 
        style={{
          fontSize: typography.micro,
          color: colors.text.muted,
          lineHeight: '1.3',
          fontStyle: 'italic'
        }}
      >
        {getUnitExamples()}
      </div>
      
      {selectedUnit?.unit_code && ['hour', 'square_foot', 'linear_foot'].includes(selectedUnit.unit_code) && (
        <div 
          className="mt-3 p-2 border-start"
          style={{
            borderLeftColor: colors.interactive.warning,
            borderLeftWidth: '3px',
            backgroundColor: '#fffbeb'
          }}
        >
          <div 
            style={{
              fontSize: typography.micro,
              color: '#92400e',
              fontWeight: '500'
            }}
          >
            <i className="fas fa-lightbulb me-1"></i>
            Pro Tip: Consider setting minimum quantities to ensure profitability on small jobs.
          </div>
        </div>
      )}
    </div>
  )
}

export default UnitInformationGuide