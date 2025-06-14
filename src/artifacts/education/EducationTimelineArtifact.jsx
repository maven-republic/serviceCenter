'use client'

export default function EducationTimelineArtifact({ start, end }) {
  const startYear = start ? start.slice(0, 4) : 'Start'
  const endYear = end ? end.slice(0, 4) : 'Present'

  return (
    <div className="mb-2 text-muted" style={{ fontSize: '0.9rem' }}>
      {startYear} – {endYear}
    </div>
  )
}
