import { useEffect, useState } from 'react'
import authService from '../services/auth'
import pageViewsService from '../services/pageViews'
import { Button, FormField, Alert } from './ui'

const LoginPage = ({ onSuccess }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewCount, setViewCount] = useState(null)

  useEffect(() => {
    pageViewsService
      .record()
      .then(({ count }) => setViewCount(count))
      .catch(() => {})
  }, [])

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
        <FormField label="Password" htmlFor="login-password">
          <input
            id="login-password"
            className="text-input"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            autoFocus
          />
        </FormField>
        <Button type="submit" disabled={submitting || password.length === 0}>
          Log in
        </Button>
      </form>

      {error && <Alert>{error}</Alert>}

      {viewCount !== null && <p>{viewCount} visits so far</p>}
    </div>
  )
}

export default LoginPage
