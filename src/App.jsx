import { useEffect, useState } from 'react'
import './App.css'
import AuthModal from './components/AuthModal'
import { useAuth } from './context/AuthContext'
import GameHome from './components/GameHome'
import AdminApp from './components/admin/AdminApp'

import logo from './assets/images/logo.png'
import city1 from './assets/images/city1.png'
import city2 from './assets/images/city2.png'
import mountain from './assets/images/mountain.png'
import farm1 from './assets/images/farm1.png'
import farm2 from './assets/images/farm2.png'
import LoadingScreen from './components/LoadingScreen'

const backgroundMedia = [
  {
    src: mountain
  },
  {
    src: farm1
  },
  {
    src: mountain
  },
  {
    src: city1
  },
  {
    src: city2
  },
  {
    src: farm1
  },
  {
    src: farm2
  }
]



function App() {
  const [appLoading, setAppLoading] = useState(true)
  const isAdminRoute = window.location.pathname.toLowerCase().startsWith('/admin')

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false)
    }, 1600)

    return () => clearTimeout(timer)
  }, [])

  if (appLoading) {
    return <LoadingScreen />
  }

  if (isAdminRoute) {
    return <AdminApp />
  }

  return <PlayerApp />
}

function PlayerApp() {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const currentMedia = backgroundMedia[currentMediaIndex]
  const { currentUser, logout } = useAuth()

  async function handleAuthClick() {
    if (currentUser) {
      await logout()
    } else {
      setAuthMode('login')
      setShowAuthModal(true)
    }
  }

  function handleStartQuest() {
    if (!currentUser) {
      setAuthMode('register')
      setShowAuthModal(true)
      return
    }

    alert('Game dashboard coming next.')
  }

  useEffect(() => {
    let timeout

    const interval = setInterval(() => {
      setIsFading(true)

      timeout = setTimeout(() => {
        setCurrentMediaIndex((previousIndex) =>
          previousIndex === backgroundMedia.length - 1 ? 0 : previousIndex + 1
        )

        setIsFading(false)
      }, 700)
    }, 7000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <main className="app">
      <nav className="navbar">
        <a href="/" className="brand">
          <img src={logo} alt="GRIT Lab Africa logo" />
          <span>GRIT Lab Africa</span>
        </a>

        <div className="navLinks">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="navActions">
          {!currentUser && (
            <a href="/admin" style={adminNavButtonStyle}>
              Admin Login
            </a>
          )}

          <button onClick={handleAuthClick} className="loginButton">
            {currentUser ? 'Logout' : 'Login'}
          </button>

 {!currentUser && (
            <button onClick={handleStartQuest} className="startButton">
              Start Quest
            </button>
          )}
        </div>
      </nav>

      {currentUser ? (
        <GameHome currentUser={currentUser} />
      ) : (
        <>
          <section className="heroArea" id="about">
            <div className="heroMediaCard">
              <img
  key={currentMedia.src}
  className={`heroMedia ${isFading ? 'mediaFadeOut' : 'mediaFadeIn'}`}
  src={currentMedia.src}
  alt="African innovation background"
/>

              <div className="heroOverlay"></div>

              <div className="heroContentCard">
                <p className="heroTag">GRIT Lab Africa AI Demo Project</p>

                <h2
                  style={{
                    color: '#b8860b',
                    fontSize: '3.2rem',
                    lineHeight: '1.05',
                    letterSpacing: '-0.04em',
                    margin: '0 0 20px',
                    fontWeight: '800'
                  }}
                >
                  Solving African challenges through smart technology.
                </h2>

                <p>
                  GRIT Lab Africa presents a gamified AI-powered platform
                  inspired by digital skills development, youth innovation and
                  practical technology solutions. The application presents real
                  African challenges and allows users to match each problem with
                  possible AI and digital solutions.
                </p>

                <div className="heroButtons">
                  <button onClick={handleStartQuest} className="startButton">
                    Start Quest
                  </button>

                  <button className="glassButton">Explore Project</button>
                </div>

                <div style={entryCardsGridStyle}>
                  <button type="button" onClick={handleStartQuest} style={entryCardStyle}>
                    <span style={entryCardIconStyle}>🎮</span>
                    <span>
                      <strong style={entryCardTitleStyle}>Player / Student</strong>
                      <span style={entryCardTextStyle}>Register or login to play the AI for SDGs card game.</span>
                    </span>
                  </button>

                  <a href="/admin" style={{ ...entryCardStyle, textDecoration: 'none' }}>
                    <span style={entryCardIconStyle}>🛡️</span>
                    <span>
                      <strong style={entryCardTitleStyle}>Admin Access</strong>
                      <span style={entryCardTextStyle}>Open the admin login for card, rubric, language and analytics management.</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section
            id="contact"
            style={{
              width: 'min(1250px, calc(100vw - 48px))',
              margin: '60px auto 90px'
            }}
          >
            <div
              style={{
                width: '100%',
                padding: '52px',
                borderRadius: '34px',
                background: 'rgba(255, 255, 255, 0.72)',
                border: '1px solid rgba(139, 92, 40, 0.22)',
                boxShadow: '0 28px 70px rgba(80, 52, 20, 0.18)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)'
              }}
            >
              <div
                style={{
                  marginBottom: '34px'
                }}
              >
                <h3
                  style={{
                    margin: '0 0 16px',
                    color: '#5c3512',
                    fontSize: '3rem',
                    lineHeight: '0.95',
                    letterSpacing: '-0.065em',
                    fontWeight: '650'
                  }}
                >
                  Contact us
                </h3>

                <h3
                  style={{
                    margin: '0',
                    maxWidth: '760px',
                    color: '#4b3a2a',
                    fontSize: '1.18rem',
                    lineHeight: '1.7',
                    fontWeight: '500'
                  }}
                >
                  This application is connected to GRIT Lab Africa’s innovation
                  environment, exploring how AI, digital skills and gamified
                  learning can support real African problem-solving.
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '18px'
                }}
              >
                <div
                  style={{
                    minHeight: '190px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '26px',
                    background: 'rgba(255, 255, 255, 0.62)',
                    border: '1px solid rgba(139, 92, 40, 0.16)',
                    boxShadow: '0 16px 36px rgba(80, 52, 20, 0.1)'
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 10px',
                        color: '#9a6a22',
                        fontSize: '0.74rem',
                        fontWeight: '850',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Email
                    </p>

                    <h4
                      style={{
                        margin: '0',
                        color: '#3b2817',
                        fontSize: '1.45rem',
                        lineHeight: '1.1',
                        letterSpacing: '-0.04em'
                      }}
                    >
                      General Enquiries
                    </h4>
                  </div>

                  <a
                    href="mailto:info@gritlabafrica.org"
                    style={{
                      color: '#5c3512',
                      fontWeight: '800',
                      fontSize: '1rem'
                    }}
                  >
                    info@gritlabafrica.org
                  </a>
                </div>

                <a
                  href="https://gritlabafrica.org/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    minHeight: '190px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '26px',
                    background:
                      'linear-gradient(135deg, rgba(92, 53, 18, 0.95), rgba(154, 106, 34, 0.9))',
                    color: '#fff8eb',
                    textDecoration: 'none',
                    boxShadow: '0 18px 42px rgba(92, 53, 18, 0.22)'
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 10px',
                        color: '#f4d28a',
                        fontSize: '0.74rem',
                        fontWeight: '850',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Official Website
                    </p>

                    <h4
                      style={{
                        margin: '0',
                        color: '#fff8eb',
                        fontSize: '1.45rem',
                        lineHeight: '1.1',
                        letterSpacing: '-0.04em'
                      }}
                    >
                      Visit GRIT Lab Africa
                    </h4>
                  </div>

                  <p
                    style={{
                      margin: '18px 0 0',
                      color: 'rgba(255, 248, 235, 0.82)',
                      lineHeight: '1.55',
                      fontSize: '0.95rem'
                    }}
                  >
                    View GRIT Lab Africa’s programmes, mission, leadership and
                    innovation work.
                  </p>
                </a>

                <a
                  href="https://showroom.gritlabafrica.org/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    minHeight: '190px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: '26px',
                    background: 'rgba(255, 255, 255, 0.62)',
                    border: '1px solid rgba(139, 92, 40, 0.16)',
                    color: '#3b2817',
                    textDecoration: 'none',
                    boxShadow: '0 16px 36px rgba(80, 52, 20, 0.1)'
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 10px',
                        color: '#9a6a22',
                        fontSize: '0.74rem',
                        fontWeight: '850',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Project Showroom
                    </p>

                    <h4
                      style={{
                        margin: '0',
                        color: '#3b2817',
                        fontSize: '1.45rem',
                        lineHeight: '1.1',
                        letterSpacing: '-0.04em'
                      }}
                    >
                      Explore the Showroom
                    </h4>
                  </div>

                  <p
                    style={{
                      margin: '18px 0 0',
                      color: '#5c4632',
                      lineHeight: '1.55',
                      fontSize: '0.95rem'
                    }}
                  >
                    Browse GRIT Lab Africa’s project showcase and real-world
                    technology solutions.
                  </p>
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="footer">
        <p>
          <strong>GRIT Lab Africa</strong> © 2026
        </p>

        <p>Powered by GRIT Lab Africa</p>
      </footer>

      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </main>
  )
}


const adminNavButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.22)',
  borderRadius: '999px',
  padding: '10px 18px',
  background: 'rgba(255, 255, 255, 0.68)',
  color: '#5c3512',
  textDecoration: 'none',
  fontWeight: '850',
  boxShadow: '0 12px 26px rgba(80, 52, 20, 0.1)'
}

const entryCardsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '14px',
  marginTop: '22px'
}

const entryCardStyle = {
  width: '100%',
  minHeight: '112px',
  padding: '18px',
  border: '1px solid rgba(244, 210, 138, 0.24)',
  borderRadius: '24px',
  display: 'grid',
  gridTemplateColumns: '44px 1fr',
  gap: '13px',
  alignItems: 'center',
  textAlign: 'left',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.13)',
  color: '#fff8eb',
  boxShadow: '0 18px 38px rgba(0, 0, 0, 0.18)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)'
}

const entryCardIconStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #f4d28a, #9a6a22)',
  color: '#3b2817',
  fontSize: '1.15rem',
  fontWeight: '900'
}

const entryCardTitleStyle = {
  display: 'block',
  color: '#fff8eb',
  fontSize: '1rem',
  fontWeight: '900',
  lineHeight: '1.15'
}

const entryCardTextStyle = {
  display: 'block',
  marginTop: '5px',
  color: 'rgba(255, 248, 235, 0.76)',
  fontSize: '0.86rem',
  lineHeight: '1.45'
}

export default App