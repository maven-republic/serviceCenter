// ModalBody.jsx - Modal Body Component

'use client'

import PricingResultDisplay from './PricingResultDisplay'
import TabNavigation from './TabNavigation'
import ParametersTab from './ParametersTab'
import ConfigurationTab from './ConfigurationTab'
import NotesTab from './NotesTab'

const ModalBody = ({ 
  // Pricing result props
  quantificationResult,
  isCalculating,
  quantError,
  
  // Service and display props
  service,
  displayedUnit,
  serviceCategory,
  
  // Tab management
  activeTab,
  setActiveTab,
  
  // Form data and handlers
  attributes,
  updateAttribute,
  config,
  marketConditions,
  updateConfig,
  updateMarketConditions,
  notes,
  setNotes,
  
  // Available units
  availableUnits,
  loadingUnits,
  
  // Actions
  performCalculation,
  
  // Pricing functions
  formatPrice,
  getRecommendedPrice,
  getPriceChange,
  
  // State flags
  hasValidService,
  isSaving,
  
  // Styling
  formStyles,
  spacing,
  typography,
  colors
}) => {
  return (
    <div 
      style={{
        maxHeight: 'calc(90vh - 200px)',
        overflowY: 'auto',
        padding: spacing.xl
      }}
    >
      {/* Enhanced Pricing Result Display with skeleton loading */}
      <PricingResultDisplay
        quantificationResult={quantificationResult}
        isCalculating={isCalculating}
        quantError={quantError}
        service={service}
        displayedUnit={displayedUnit}
        formatPrice={formatPrice}
        getRecommendedPrice={getRecommendedPrice}
        getPriceChange={getPriceChange}
        spacing={spacing}
        typography={typography}
        colors={colors}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSaving={isSaving}
        spacing={spacing}
        typography={typography}
        colors={colors}
      />

      {/* Tab Content with Save State Overlay */}
      <div style={{ opacity: isSaving ? 0.6 : 1, position: 'relative' }}>
        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <ParametersTab
            serviceCategory={serviceCategory}
            attributes={attributes}
            updateAttribute={updateAttribute}
            config={config}
            marketConditions={marketConditions}
            updateConfig={updateConfig}
            updateMarketConditions={updateMarketConditions}
            performCalculation={performCalculation}
            isCalculating={isCalculating}
            hasValidService={hasValidService}
            isSaving={isSaving}
            formStyles={formStyles}
            spacing={spacing}
            typography={typography}
            colors={colors}
          />
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (
          <ConfigurationTab
            config={config}
            marketConditions={marketConditions}
            availableUnits={availableUnits}
            service={service}
            loadingUnits={loadingUnits}
            updateConfig={updateConfig}
            updateMarketConditions={updateMarketConditions}
            isSaving={isSaving}
            formStyles={formStyles}
            spacing={spacing}
            typography={typography}
            colors={colors}
          />
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            setNotes={setNotes}
            service={service}
            displayedUnit={displayedUnit}
            isSaving={isSaving}
            formStyles={formStyles}
            spacing={spacing}
            typography={typography}
            colors={colors}
          />
        )}

        {/* Saving Overlay */}
        {isSaving && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              zIndex: 10
            }}
          >
            <div 
              className="text-center p-4"
              style={{
                backgroundColor: colors.background.primary,
                borderRadius: '12px',
                border: `1px solid ${colors.border.default}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="spinner-border mb-2"
                style={{ 
                  width: '32px', 
                  height: '32px',
                  color: colors.interactive.primary 
                }}
              ></div>
              <div 
                style={{
                  fontSize: typography.secondaryText,
                  color: colors.text.primary,
                  fontWeight: '500'
                }}
              >
                Saving Configuration
              </div>
              <div 
                style={{
                  fontSize: typography.small,
                  color: colors.text.muted
                }}
              >
                Please wait...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalBody