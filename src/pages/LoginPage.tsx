import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!userName.trim()) {
      setError('Please enter Username')
      return
    }

    if (!password) {
      setError('Please enter Password')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await loginUser({ userName, password })

      if (!response.success) {
        setError(response.message ?? 'Login failed')
        return
      }

      if (response.command === 'ShowDBList') {
        navigate('/user-db-list')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Unable to reach login service')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-card login-card">
      <h2>Sign in</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Username" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</button>
      </form>
    </section>
  )
}
