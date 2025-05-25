// components/AcademicExperienceOverview.jsx
export default function AcademicExperienceOverview({ value, onChange }) {
    return (
      <div className="mb-3">
        <label className="form-label">Academic Overview (Optional)</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Include any highlights such as honors, societies, relevant projects, or coursework."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }
  

