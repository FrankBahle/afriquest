import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function AuthModal({ onClose, initialMode = 'login' }) {  const { login, register } = useAuth()

  const [isRegistering, setIsRegistering] = useState(initialMode === 'register') ;
   const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegistering) {
        await register(firstName, lastName, phone, email, password)
      } else {
        await login(email, password)
      }

      onClose()
    } catch (err) {
      setError('Authentication failed. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      <div
        style={{
          width: 'min(460px, 100%)',
          padding: '32px',
          borderRadius: '28px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(139, 92, 40, 0.22)',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.25)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            float: 'right',
            border: '0',
            background: 'transparent',
            color: '#5c3512',
            fontSize: '1.4rem',
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <p
          style={{
            margin: '0 0 10px',
            color: '#9a6a22',
            fontSize: '0.75rem',
            fontWeight: '850',
            letterSpacing: '0.14em',
            textTransform: 'uppercase'
          }}
        >
          AfriQuest Access
        </p>

        <h2
          style={{
            margin: '0 0 10px',
            color: '#5c3512',
            fontSize: '2.2rem',
            lineHeight: '1',
            letterSpacing: '-0.05em'
          }}
        >
          {isRegistering ? 'Create account' : 'Welcome back'}
        </h2>

        <p
          style={{
            margin: '0 0 24px',
            color: '#5c4632',
            lineHeight: '1.6'
          }}
        >
          {isRegistering
            ? 'Register to start playing the AfriQuest challenge demo.'
            : 'Log in to continue your AfriQuest challenge journey.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="text"
                placeholder="Surname"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                style={inputStyle}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={inputStyle}
          />

          {error && (
            <p
              style={{
                margin: '0 0 14px',
                color: '#9f1d1d',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '999px',
              border: '0',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
              color: '#fff8eb',
              fontWeight: '850',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? 'Please wait...'
              : isRegistering
                ? 'Create Account'
                : 'Login'}
          </button>
        </form>

        <button
          onClick={() => {
            setError('')
            setIsRegistering(!isRegistering)
          }}
          style={{
            width: '100%',
            marginTop: '16px',
            border: '0',
            background: 'transparent',
            color: '#5c3512',
            fontWeight: '750',
            cursor: 'pointer'
          }}
        >
          {isRegistering
            ? 'Already have an account? Login'
            : 'No account yet? Register'}
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  marginBottom: '12px',
  padding: '15px 16px',
  borderRadius: '16px',
  border: '1px solid rgba(139, 92, 40, 0.2)',
  background: 'rgba(255, 255, 255, 0.75)',
  color: '#3b2817',
  outline: 'none'
}

export default AuthModal