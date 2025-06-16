'use client'

import Calendar from './Calendar'
import CertificationSearch from './CertificationSearch'
import InstitutionSearch from './InstitutionSearch'

export default function Certification({ data, onChange, onRemove }) {
  return (
    <div>
      <CertificationSearch
        value={data.certificationName}
        onChange={(value) => onChange('certificationName', value)}
      />

      <InstitutionSearch
        value={data.issuingOrganization}
        onChange={(value) => onChange('issuingOrganization', value)}
      />

      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label small text-muted">Issue Date</label>
          <Calendar
            value={data.issueDate}
            onChange={(value) => onChange('issueDate', value)}
            placeholder="Select issue date"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small text-muted">Expiration Date</label>
          <Calendar
            value={data.expirationDate}
            onChange={(value) => onChange('expirationDate', value)}
            placeholder="Select expiration date"
          />
        </div>
      </div>

      {typeof onRemove === 'function' && (
        <div className="text-end">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}