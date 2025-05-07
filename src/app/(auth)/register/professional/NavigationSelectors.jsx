// NavigationButtons.jsx
'use client'

export default function NavigationSelectors({
  currentStep,
  nextStep,
  prevStep,
  totalSteps = 8
}) {
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div className="position-fixed bottom-0 start-0 end-0 bg-white px-3 py-3 border-top zindex-sticky">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-4 text-start">
            {currentStep > 1 && (
              <button
                className="ud-btn btn-white btn-sm"
                type="button"
                onClick={prevStep}
              >
                <i className="fal fa-arrow-left-long me-2"></i>
                Back
              </button>
            )}
          </div>
          <div className="col-4 text-center">
            <div
              className="progress rounded-pill"
              style={{ height: '4px', backgroundColor: '#e9ecef' }}
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
            <div className="text-center mt-1">
              <small className="text-muted">
                {currentStep} of {totalSteps}
              </small>
            </div>
          </div>
          <div className="col-4 text-end">
            {currentStep < totalSteps ? (
              <button
                className="ud-btn btn-thm btn-sm"
                type="button"
                onClick={nextStep}
              >
                Continue
                <i className="fal fa-arrow-right-long ms-2"></i>
              </button>
            ) : (
              <button
                className="ud-btn btn-thm btn-sm"
                type="submit"
              >
                Create Account
                <i className="fal fa-arrow-right-long ms-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
