// src/artifacts/ArtifactInterface.jsx

import HeadingArtifact from './HeadingArtifact'
import ParagraphArtifact from './ParagraphArtifact'
import EducationArtifact from './EducationArtifact'

export default function ArtifactInterface({ artifacts }) {
  return (
    <div className="space-y-4">
      {artifacts.map((artifact) => (
        <ArtifactManifest key={artifact.id} artifact={artifact} />
      ))}
    </div>
  )
}

function ArtifactManifest({ artifact }) {
  switch (artifact.type) {
    case 'heading':
      return <HeadingArtifact data={artifact} />
    case 'paragraph':
      return <ParagraphArtifact data={artifact} />
    case 'education':
      return <EducationArtifact data={artifact} />
    default:
      return <div className="text-muted">⚠️ Unknown artifact type: {artifact.type}</div>
  }
}  
