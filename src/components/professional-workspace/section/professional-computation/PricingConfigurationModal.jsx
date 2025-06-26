// PricingConfigurationModal.jsx - Main Modal Component

'use client'

import ModalHeader from './ModalHeader'
import ModalBody from './ModalBody'
import ModalFooter from './ModalFooter'

const PricingConfigurationModal = ({ 
  // Modal state
  isOpen,
  onClose,
  
  // Core data
  service,
  displayedUnit,
  serviceCategory,
  
  // Pricing result and calculation
  quantificationResult,
  isCalculating,
  quantError,
  formatPrice,
  getRecommendedPrice,
  getPriceChange,
  performCalculation,
  hasValidService,
  
  // Form state and handlers
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
  
  // Tab management
  activeTab,
  setActiveTab,
  
  // Save functionality
  handleSavePricing,
  isSaving,
  saveMessage,
  savingProgress,
  
  // Optimistic updates
  optimisticUpdate,
  rollbackData,
  rollbackOptimisticUpdate,
  
  // Styling
  formStyles,
  spacing,
  typography,
  colors
}) => {
  if (!isOpen) return null

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white position-relative"
        style={{
          width: '90%',
          maxWidth: '900px',
          maxHeight: '90vh',
          borderRadius: '20px',
          border: `1px solid ${colors.border.default}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Enhanced Modal Header with Progress */}
        <ModalHeader
          service={service}
          isSaving={isSaving}
          savingProgress={savingProgress}
          optimisticUpdate={optimisticUpdate}
          rollbackData={rollbackData}
          rollbackOptimisticUpdate={rollbackOptimisticUpdate}
          onClose={onClose}
          spacing={spacing}
          typography={typography}
          colors={colors}
        />

        {/* Modal Body - Scrollable */}
        <ModalBody
          // Pricing result props
          quantificationResult={quantificationResult}
          isCalculating={isCalculating}
          quantError={quantError}
          
          // Service and display props
          service={service}
          displayedUnit={displayedUnit}
          serviceCategory={serviceCategory}
          
          // Tab management
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          
          // Form data and handlers
          attributes={attributes}
          updateAttribute={updateAttribute}
          config={config}
          marketConditions={marketConditions}
          updateConfig={updateConfig}
          updateMarketConditions={updateMarketConditions}
          notes={notes}
          setNotes={setNotes}
          
          // Available units
          availableUnits={availableUnits}
          loadingUnits={loadingUnits}
          
          // Actions
          performCalculation={performCalculation}
          
          // Pricing functions
          formatPrice={formatPrice}
          getRecommendedPrice={getRecommendedPrice}
          getPriceChange={getPriceChange}
          
          // State flags
          hasValidService={hasValidService}
          isSaving={isSaving}
          
          // Styling
          formStyles={formStyles}
          spacing={spacing}
          typography={typography}
          colors={colors}
        />

        {/* Enhanced Modal Footer with Save Progress */}
        <ModalFooter
          saveMessage={saveMessage}
          isSaving={isSaving}
          savingProgress={savingProgress}
          rollbackData={rollbackData}
          rollbackOptimisticUpdate={rollbackOptimisticUpdate}
          quantificationResult={quantificationResult}
          onSave={handleSavePricing}
          onCancel={onClose}
          spacing={spacing}
          typography={typography}
          colors={colors}
        />
      </div>
    </div>
  )
}

export default PricingConfigurationModal