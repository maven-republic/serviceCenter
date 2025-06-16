'use client'

import Calendar from '../professional-certification/Calendar'

export default function WorkExperience({ data, onChange, onRemove }) {
  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter or select a company"
          value={data.freeform_company_name}
          onChange={(e) => onChange('freeform_company_name', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Position</label>
        <input
          type="text"
          className="form-control"
          value={data.position}
          onChange={(e) => onChange('position', e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows="3"
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
        ></textarea>
      </div>

      <div className="row">
        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <Calendar
            value={data.start_date}
            onChange={(value) => onChange('start_date', value)}
            placeholder="Select start date"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">End Date</label>
          <Calendar
            value={data.end_date}
            onChange={(value) => onChange('end_date', value)}
            placeholder="Select end date"
          />
        </div>
      </div>

      <div className="text-end mt-3">
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  )
}