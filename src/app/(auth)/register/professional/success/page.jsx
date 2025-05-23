export default function ProfessionalAccountCreationSuccess() {
  return (
    <div className="container py-5">
      <h2 className="mb-3">Registration Successful 🎉</h2>
      <p className="lead">Your account has been created.</p>
      <p className="text-muted">
        Please check your email to verify your account.
        Make sure to look in your <strong>spam or junk folder</strong> if you don't see it in your inbox.
      </p>
      <p className="mt-4">
        After verifying, you can <a href="/login" className="text-primary fw-semibold">log in here</a>.
      </p>
    </div>
  )
}
