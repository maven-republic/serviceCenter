// src/app/(auth)/layout.jsx
import './auth.css' // Bootstrap styles for auth pages

export const metadata = {
  title: "Authentication",
}

export default function AuthLayout({ children }) {
  return (
    <div className="auth-workspace">
      {children}
    </div>
  )
}