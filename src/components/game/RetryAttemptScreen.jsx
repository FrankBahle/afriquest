function RetryAttemptScreen({
  currentProblem,
  currentProblemAttemptStats,
  onStartRetry,
  onCancel,
  onNextProblem
}) {
  if (!currentProblem) {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Retry attempt</p>
        <h1 style={sectionTitleStyle}>No active problem to retry.</h1>
        <p style={paragraphStyle}>Start the game first, then submit an attempt.</p>

        <div style={centerButtonRowStyle}>
          <button onClick={onCancel} style={secondaryButtonStyle}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <p style={eyebrowStyle}>Retry attempt</p>

      <h1 style={sectionTitleStyle}>Try the same problem again.</h1>

      <p style={paragraphStyle}>
        You can retry this problem to improve your solution. Your old attempt is
        kept in the history. Your best score for this problem will still be easy
        to see on the dashboard.
      </p>

      <div style={{ ...smallCardStyle, marginTop: '24px' }}>
        <p style={eyebrowStyle}>Problem card</p>
        <h3 style={smallCardTitleStyle}>{currentProblem.title}</h3>
        <p style={smallCardTextStyle}>{currentProblem.problem}</p>
      </div>

      {currentProblemAttemptStats && (
        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>Your score history</p>
          <h3 style={smallCardTitleStyle}>First, latest and best score</h3>

          <div style={metricGridStyle}>
            <MiniMetric
              title="First Score"
              value={`${currentProblemAttemptStats.first?.totalScore || 0}/100`}
            />
            <MiniMetric
              title="Latest Score"
              value={`${currentProblemAttemptStats.latest?.totalScore || 0}/100`}
            />
            <MiniMetric
              title="Best Score"
              value={`${currentProblemAttemptStats.best?.totalScore || 0}/100`}
            />
            <MiniMetric
              title="Attempts"
              value={currentProblemAttemptStats.count || 0}
            />
          </div>
        </div>
      )}

      <div style={{ ...smallCardStyle, marginTop: '18px' }}>
        <p style={eyebrowStyle}>What will happen now?</p>
        <ul style={listStyle}>
          <li>Your selected AI cards will be cleared.</li>
          <li>Your explanation box will be cleared.</li>
          <li>The same problem card will stay active.</li>
          <li>You can submit again and try to improve your score.</li>
        </ul>
      </div>

      <div style={centerButtonRowStyle}>
        <button onClick={onStartRetry} style={primaryButtonStyle}>
          Start Retry Attempt
        </button>

        <button onClick={onCancel} style={secondaryButtonStyle}>
          Cancel
        </button>

        <button onClick={onNextProblem} style={secondaryButtonStyle}>
          Skip to Next Problem
        </button>
      </div>
    </div>
  )
}

function MiniMetric({ title, value }) {
  return (
    <div style={miniMetricStyle}>
      <strong style={{ display: 'block', color: '#5c3512', fontSize: '1.45rem' }}>
        {value}
      </strong>
      <span style={{ color: '#6b5540', fontSize: '0.86rem', fontWeight: '750' }}>
        {title}
      </span>
    </div>
  )
}

const panelStyle = {
  padding: '36px',
  borderRadius: '34px',
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(232, 214, 170, 0.68))',
  border: '1px solid rgba(139, 92, 40, 0.22)',
  boxShadow: '0 30px 80px rgba(80, 52, 20, 0.18)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
}

const eyebrowStyle = {
  margin: '0 0 10px',
  color: '#9a6a22',
  fontSize: '0.74rem',
  fontWeight: '850',
  letterSpacing: '0.14em',
  textTransform: 'uppercase'
}

const sectionTitleStyle = {
  margin: '0 0 18px',
  color: '#4b2b10',
  fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
  lineHeight: '1',
  letterSpacing: '-0.06em',
  fontWeight: '900'
}

const paragraphStyle = {
  margin: '0',
  color: '#5c4632',
  fontSize: '1rem',
  lineHeight: '1.7'
}

const smallCardStyle = {
  padding: '20px',
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.66)',
  border: '1px solid rgba(139, 92, 40, 0.18)',
  boxShadow: '0 14px 34px rgba(80, 52, 20, 0.1)'
}

const smallCardTitleStyle = {
  margin: '0 0 10px',
  color: '#5c3512',
  fontSize: '1.2rem',
  lineHeight: '1.2',
  letterSpacing: '-0.035em'
}

const smallCardTextStyle = {
  margin: '0',
  color: '#5c4632',
  lineHeight: '1.6',
  fontSize: '0.94rem'
}

const listStyle = {
  margin: '0',
  paddingLeft: '20px',
  color: '#5c4632',
  lineHeight: '1.8'
}

const metricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginTop: '18px'
}

const miniMetricStyle = {
  padding: '16px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.68)',
  border: '1px solid rgba(139, 92, 40, 0.14)'
}

const centerButtonRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '26px'
}

const primaryButtonStyle = {
  border: '0',
  borderRadius: '999px',
  padding: '13px 24px',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: '850',
  fontSize: '0.95rem',
  boxShadow: '0 14px 30px rgba(92, 53, 18, 0.22)'
}

const secondaryButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.22)',
  borderRadius: '999px',
  padding: '13px 20px',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.68)',
  color: '#5c3512',
  fontWeight: '850'
}

export default RetryAttemptScreen