import { useState } from 'react'
import authService from '../services/auth'

const LoginPage = ({ onSuccess }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authService.login(password)
      onSuccess()
    } catch {
      setError('Incorrect password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2>Log in</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          autoFocus
        />
        <button type="submit" disabled={submitting || password.length === 0}>
          Log in
        </button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  )
}

export default LoginPage
