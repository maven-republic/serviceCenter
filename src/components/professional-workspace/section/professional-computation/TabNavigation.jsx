// TabNavigation.jsx - Tab Navigation Component

'use client'

const TabNavigation = ({ 
  activeTab,
  setActiveTab,
  isSaving,
  spacing,
  typography,
  colors
}) => {
  const tabs = [
    { 
      id: 'parameters', 
      label: 'Parameters', 
      icon: 'fas fa-cogs',
      description: 'Service-specific inputs and market conditions'
    },
    { 
      id: 'configuration', 
      label: 'Configuration', 
      icon: 'fas fa-sliders-h',
      description: 'Pricing model and valuation unit settings'
    },
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: 'fas fa-sticky-note',
      description: 'Additional comments and service information'
    }
  ]

  const handleTabClick = (tabId) => {
    if (!isSaving) {
      setActiveTab(tabId)
    }
  }

  return (
    <div className="mb-4">
      <div 
        className="d-flex gap-1 bg-white p-1 justify-content-center border"
        style={{
          borderRadius: '12px',
          borderColor: colors.border.default
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          const isDisabled = isSaving
          
          return (
            <button
              key={tab.id}
              className={`btn fw-medium transition-all duration-150 ease-in-out ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}
              onClick={() => handleTabClick(tab.id)}
              disabled={isDisabled}
              title={tab.description}
              style={{
                minWidth: '140px',
                padding: `${spacing.md} ${spacing.xl}`,
                fontSize: typography.secondaryText,
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? colors.text.primary : 'transparent',
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  e.target.style.backgroundColor = colors.background.muted
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  e.target.style.backgroundColor = 'transparent'
                }
              }}
            >
              <i 
                className={`${tab.icon} me-2`} 
                style={{ fontSize: typography.caption }} 
              />
              {tab.label}
              
              {/* Active indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '2px',
                    backgroundColor: 'white',
                    borderRadius: '2px'
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
      
      {/* Tab Description Helper */}
      <div 
        className="text-center mt-2"
        style={{
          fontSize: typography.small,
          color: colors.text.muted,
          fontStyle: 'italic'
        }}
      >
        {tabs.find(tab => tab.id === activeTab)?.description}
      </div>
      
      {/* Save Progress Indicator */}
      {isSaving && (
        <div 
          className="text-center mt-2"
          style={{
            fontSize: typography.small,
            color: colors.interactive.warning
          }}
        >
          <i className="fas fa-lock me-1"></i>
          Tabs locked during save operation
        </div>
      )}
    </div>
  )
}

export default TabNavigation