// TradeInputs.jsx - Trade-Specific Input Forms Component

'use client'

const TradeInputs = ({ 
  serviceCategory,
  attributes,
  updateAttribute,
  formStyles
}) => {
  switch (serviceCategory) {
    case 'plumbing':
      return (
        <div className="row g-3">
          <div className="col-lg-6">
            <label {...formStyles.label}>Pipe Diameter</label>
            <select
              {...formStyles.select}
              value={attributes.pipeDiameter || ''}
              onChange={(e) => updateAttribute('pipeDiameter', parseFloat(e.target.value))}
              aria-label="Select pipe diameter"
            >
              <option value="">Select diameter</option>
              <option value="0.5">1/2 inch</option>
              <option value="0.75">3/4 inch</option>
              <option value="1">1 inch</option>
              <option value="1.25">1 1/4 inch</option>
              <option value="1.5">1 1/2 inch</option>
              <option value="2">2 inch</option>
            </select>
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Pipe Length (feet)</label>
            <input
              type="number"
              {...formStyles.input}
              placeholder="Enter length"
              value={attributes.pipeLength || ''}
              onChange={(e) => updateAttribute('pipeLength', parseFloat(e.target.value))}
              aria-label="Enter pipe length in feet"
            />
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Material</label>
            <select
              {...formStyles.select}
              value={attributes.pipeMaterial || 'copper'}
              onChange={(e) => updateAttribute('pipeMaterial', e.target.value)}
              aria-label="Select pipe material"
            >
              <option value="copper">Copper</option>
              <option value="pvc">PVC</option>
              <option value="pex">PEX</option>
            </select>
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Accessibility</label>
            <select
              {...formStyles.select}
              value={attributes.accessibility || 'standard'}
              onChange={(e) => updateAttribute('accessibility', e.target.value)}
              aria-label="Select accessibility level"
            >
              <option value="easy">Easy Access</option>
              <option value="standard">Standard</option>
              <option value="difficult">Difficult</option>
              <option value="crawlspace">Crawlspace</option>
              <option value="wallaccess">Behind Wall</option>
            </select>
          </div>
        </div>
      )

    case 'welding':
      return (
        <div className="row g-3">
          <div className="col-lg-6">
            <label {...formStyles.label}>Metal Type</label>
            <select
              {...formStyles.select}
              value={attributes.metalType || 'steel'}
              onChange={(e) => updateAttribute('metalType', e.target.value)}
              aria-label="Select metal type"
            >
              <option value="steel">Steel</option>
              <option value="aluminum">Aluminum</option>
              <option value="stainless">Stainless Steel</option>
            </select>
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Thickness (inches)</label>
            <input
              type="number"
              step="0.125"
              {...formStyles.input}
              placeholder="Enter thickness"
              value={attributes.thickness || ''}
              onChange={(e) => updateAttribute('thickness', parseFloat(e.target.value))}
              aria-label="Enter metal thickness in inches"
            />
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Joint Length (inches)</label>
            <input
              type="number"
              {...formStyles.input}
              placeholder="Enter length"
              value={attributes.jointLength || ''}
              onChange={(e) => updateAttribute('jointLength', parseFloat(e.target.value))}
              aria-label="Enter joint length in inches"
            />
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Joint Type</label>
            <select
              {...formStyles.select}
              value={attributes.jointType || 'butt'}
              onChange={(e) => updateAttribute('jointType', e.target.value)}
              aria-label="Select joint type"
            >
              <option value="butt">Butt Joint</option>
              <option value="fillet">Fillet</option>
              <option value="groove">Groove</option>
              <option value="lap">Lap Joint</option>
              <option value="corner">Corner</option>
            </select>
          </div>
        </div>
      )

    case 'electrical':
      return (
        <div className="row g-3">
          <div className="col-lg-6">
            <label {...formStyles.label}>Wire Gauge</label>
            <select
              {...formStyles.select}
              value={attributes.wireGauge || '12'}
              onChange={(e) => updateAttribute('wireGauge', e.target.value)}
              aria-label="Select wire gauge"
            >
              <option value="14">14 AWG</option>
              <option value="12">12 AWG</option>
              <option value="10">10 AWG</option>
              <option value="8">8 AWG</option>
              <option value="6">6 AWG</option>
            </select>
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Circuit Length (feet)</label>
            <input
              type="number"
              {...formStyles.input}
              placeholder="Enter length"
              value={attributes.circuitLength || ''}
              onChange={(e) => updateAttribute('circuitLength', parseFloat(e.target.value))}
              aria-label="Enter circuit length in feet"
            />
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Voltage</label>
            <select
              {...formStyles.select}
              value={attributes.voltage || '120'}
              onChange={(e) => updateAttribute('voltage', e.target.value)}
              aria-label="Select voltage"
            >
              <option value="120">120V</option>
              <option value="240">240V</option>
              <option value="480">480V</option>
            </select>
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Installation Type</label>
            <select
              {...formStyles.select}
              value={attributes.installationType || 'standard'}
              onChange={(e) => updateAttribute('installationType', e.target.value)}
              aria-label="Select installation type"
            >
              <option value="surface">Surface Mount</option>
              <option value="standard">Standard</option>
              <option value="recessed">Recessed</option>
              <option value="underground">Underground</option>
            </select>
          </div>
        </div>
      )

    default:
      return (
        <div className="row g-3">
          <div className="col-lg-6">
            <label {...formStyles.label}>Complexity Level</label>
            <select
              {...formStyles.select}
              value={attributes.complexityLevel || 'standard'}
              onChange={(e) => updateAttribute('complexityLevel', e.target.value)}
              aria-label="Select complexity level"
            >
              <option value="simple">Simple</option>
              <option value="standard">Standard</option>
              <option value="complex">Complex</option>
              <option value="expert">Expert Level</option>
            </select>
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Material Quantity</label>
            <input
              type="number"
              {...formStyles.input}
              placeholder="Enter quantity"
              value={attributes.materialQuantity || ''}
              onChange={(e) => updateAttribute('materialQuantity', parseFloat(e.target.value))}
              aria-label="Enter material quantity"
            />
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Service Duration (hours)</label>
            <input
              type="number"
              step="0.5"
              {...formStyles.input}
              placeholder="Estimated hours"
              value={attributes.estimatedHours || ''}
              onChange={(e) => updateAttribute('estimatedHours', parseFloat(e.target.value))}
              aria-label="Enter estimated service duration"
            />
          </div>
          <div className="col-lg-6">
            <label {...formStyles.label}>Special Requirements</label>
            <select
              {...formStyles.select}
              value={attributes.specialRequirements || 'none'}
              onChange={(e) => updateAttribute('specialRequirements', e.target.value)}
              aria-label="Select special requirements"
            >
              <option value="none">None</option>
              <option value="permit">Permit Required</option>
              <option value="inspection">Inspection Required</option>
              <option value="specialty_tools">Specialty Tools</option>
              <option value="hazardous">Hazardous Materials</option>
            </select>
          </div>
        </div>
      )
  }
}

export default TradeInputs