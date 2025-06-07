// src/artifacts/HeadingArtifact.jsx

export default function HeadingArtifact({ data }) {
  const Tag = `h${data.config?.level || 2}`
  return (
    <Tag className="fw-bold text-dark mb-2">
      {data.content}
    </Tag>
  )
}
