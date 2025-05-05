'use client'

export default function CertificationForm({ data, onChange }) {
  return (
    <>
      <div className="mb-3">
        <label className="form-label">Certification or License Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g., Red Cross First Aid"
          value={data.certificationName}
          onChange={(e) => onChange('certificationName', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Issuing Organization</label>
        <input
          type="text"
          className="form-control"
          placeholder="e.g., Red Cross"
          value={data.issuingOrganization}
          onChange={(e) => onChange('issuingOrganization', e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Issue Date</label>
          <input
            type="date"
            className="form-control"
            value={data.issueDate}
            onChange={(e) => onChange('issueDate', e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Expiration Date</label>
          <input
            type="date"
            className="form-control"
            value={data.expirationDate}
            onChange={(e) => onChange('expirationDate', e.target.value)}
          />
        </div>
      </div>

      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id={`accredited-${data.certificationId}`}
          checked={data.isAccredited}
          onChange={(e) => onChange('isAccredited', e.target.checked)}
        />
        <label className="form-check-label" htmlFor={`accredited-${data.certificationId}`}>
          This is an accredited credential
        </label>
      </div>

      <div className="mb-3">
        <label className="form-label">Verification URL (Optional)</label>
        <input
          type="url"
          className="form-control"
          placeholder="https://..."
          value={data.verificationUrl}
          onChange={(e) => onChange('verificationUrl', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Type</label>
        <select
          className="form-select"
          value={data.certificationType}
          onChange={(e) => onChange('certificationType', e.target.value)}
        >
          <option value="certification">Certification</option>
          <option value="license">License</option>
        </select>
      </div>
    </>
  )
}
