import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCheck } from '@fortawesome/free-solid-svg-icons'

export default function ProfessionalAccountCreationSuccess() {
  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
      
      {/* Left Column */}
      <div className="d-flex align-items-center justify-content-center w-100 w-md-50 bg-white px-4 px-md-5 py-5">
        <div className="w-100" style={{ maxWidth: '460px' }}>
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-circle mb-4"
            style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}
          >
            <FontAwesomeIcon icon={faUserCheck} />
          </div>

          <h2 className="fw-bold mb-2">Welcome to maven republic</h2>
          <h4 className="fw-semibold text-secondary mb-4">Get paid for good work.</h4>

          <p className="text-muted mb-2">Your account has been created successfully.</p>
          <p className="small text-secondary mb-4">
            Please check your email to verify your account.<br />
            Look in your <strong>spamfolder</strong> if you don't see it.
          </p>

          <a href="/login" className="btn btn-dark rounded-pill px-4 py-2">
            SIGN IN
          </a>
        </div>
      </div>

      {/* Right Column (Image area) */}
      <div
        className="d-none d-md-block w-100 w-md-50 bg-cover bg-center"
        style={{
          backgroundImage: "url('/your-image.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  )
}
