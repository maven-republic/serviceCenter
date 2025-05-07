'use client'

export default function AvailabilityInterface({ formData, updateFormData }) {
  const calUsername = formData.calcomUsername || ''

  const handleChange = (e) => {
    updateFormData({
      target: { name: 'calcomUsername', value: e.target.value }
    })
  }

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-3">Set Your Availability</h4>

      <div className="mb-3">
        <label className="form-label">Your Cal.com Username</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. john-electrician"
          value={calUsername}
          onChange={handleChange}
        />
        <small className="text-muted">
          We’ll embed your <code>https://cal.com/username/availability</code> link below.
        </small>
      </div>

      {calUsername && (
        <div className="mt-4">
          <iframe
            src={`https://cal.com/${calUsername}/availability`}
            style={{
              width: '100%',
              height: '700px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
            allow="clipboard-write"
          ></iframe>
        </div>
      )}
    </div>
  )
}
