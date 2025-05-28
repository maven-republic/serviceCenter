'use client'

export default function NavigationSelectors({
  currentStep,
  nextStep,
  prevStep,
  totalSteps = 10,
  onSubmit,
    loading = false

}) {
  const progressPercent = (currentStep / totalSteps) * 100

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 bg-white border-top py-3"
      style={{ zIndex: 9999 }}
    >
      <div className="container">
        <div className="row align-items-center gx-3 gy-2">

          {/* Back Button */}
          <div className="col-12 col-md-4 text-md-start text-center">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-pill border border-secondary text-secondary px-4 py-2 w-100 w-md-auto bg-transparent hover:bg-secondary-subtle hover:text-dark transition"
              >
                <i className="fas fa-arrow-left me-2" />
                {/* Back */}
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="col-12 col-md-4 text-center">
            <div className="mx-auto" style={{ maxWidth: '240px' }}>
              <div className="bg-light rounded-pill" style={{ height: '6px', overflow: 'hidden' }}>
                <div
                  className="bg-primary rounded-pill"
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div className="mt-1 small text-muted">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          </div>

          {/* Next / Submit Button */}
          <div className="col-12 col-md-4 text-md-end text-center">
            {currentStep < totalSteps ? (
              
              <button
  type="button"
  onClick={nextStep}
  className="rounded-pill bg-black text-white px-4 py-2 w-100 w-md-auto border-0 hover:opacity-90 transition"
>
  Continue
  <i className="fas fa-arrow-right ms-2" />
</button>

              
              
              
            ) : (
              
              
          <button
  type="button"
  onClick={onSubmit}
  disabled={loading}
  className="rounded-pill bg-secondary text-light px-4 py-2 w-100 w-md-auto border-0 hover:opacity-90 transition d-flex align-items-center justify-content-center"
>
  {loading ? (
    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
  ) : (
    <>
      Create Account
    </>
  )}
</button>
              
              
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

