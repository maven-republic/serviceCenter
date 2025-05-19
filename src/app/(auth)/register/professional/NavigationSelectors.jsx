'use client'

export default function NavigationSelectors({
  currentStep,
  nextStep,
  prevStep,
  totalSteps = 10,
  onSubmit
}) {
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 bg-white border-top py-3"
      style={{ zIndex: 9999 }}
    >
      <div className="container">
        <div className="row align-items-center gy-2">
          {/* Back Button */}
          <div className="col-12 col-md-4 text-start">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-outline-secondary w-100 w-md-auto"
                onClick={prevStep}
              >
                <i className="fal fa-arrow-left me-2" />
                Back
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="col-12 col-md-4 text-center">
            <div
              className="progress mx-auto rounded-pill"
              style={{ height: '4px', backgroundColor: '#e9ecef', maxWidth: '240px' }}
            >
              <div
                className="progress-bar rounded-pill"
                role="progressbar"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: '#0d6efd',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div className="mt-1">
              <small className="text-muted">
                {currentStep} of {totalSteps}
              </small>
            </div>
          </div>

          {/* Next/Submit Button */}
          <div className="col-12 col-md-4 text-end">
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary w-100 w-md-auto"
                onClick={nextStep}
              >
                Continue
                <i className="fal fa-arrow-right ms-2" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary w-100 w-md-auto"
                onClick={onSubmit}
                
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
