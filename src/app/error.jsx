'use client'

export default function ErrorPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Something went wrong</h1>
      <p>Please check your input and try again.</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go back to the homepage
      </a>
    </div>
  )
}