// StepIndicator.jsx
'use client'

import styles from './ProfessionalForm.module.css'

const PROGRESSION_LABELS = [
  'Account',
  'Identity',
  'Education',
  'Address',
  'Services',
  'Pricing',
  'Contact'
]

export default function ProgressionIndicator({ currentStep, onStepClick }) {
  return (
    <div className="row mb-4">
      <div className="col-lg-8 mx-auto">
        <div className="d-flex justify-content-between">
          {PROGRESSION_LABELS.map((label, idx) => {
            const stepNum = idx + 1
            const isCompleted = currentStep > stepNum
            const isActive = currentStep === stepNum

            return (
              <div
                key={label}
                className={`
                  ${styles.stepIndicator}
                  ${isCompleted ? styles.completed : ''}
                  ${isActive ? styles.active : ''}
                `}
                style={{ cursor: onStepClick && currentStep > stepNum ? 'pointer' : 'default' }}
                onClick={() => {
                  if (onStepClick && currentStep > stepNum) {
                    onStepClick(stepNum)
                  }
                }}
              >
                {label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
