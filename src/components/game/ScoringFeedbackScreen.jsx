const rubricRows = [
  {
    key: 'ai_card_relevance',
    label: 'AI Card Relevance',
    max: 20,
    meaning: 'Checks if the selected AI cards fit the problem.'
  },
  {
    key: 'combination_strength',
    label: 'Combination Strength',
    max: 15,
    meaning: 'Checks if the selected AI cards work well together.'
  },
  {
    key: 'practical_feasibility',
    label: 'Practical Feasibility',
    max: 15,
    meaning:
      'Checks if the idea can realistically work with available tools and resources.'
  },
  {
    key: 'african_context_and_feasibility',
    label: 'African Context and Feasibility',
    max: 15,
    meaning:
      'Checks if the idea considers African realities such as cost, access, language and infrastructure.'
  },
  {
    key: 'sdg_alignment',
    label: 'SDG Alignment',
    max: 15,
    meaning: 'Checks if the idea supports the linked Sustainable Development Goals.'
  },
  {
    key: 'creativity_and_innovation',
    label: 'Creativity and Innovation',
    max: 10,
    meaning: 'Checks if the idea is useful, original and innovative.'
  },
  {
    key: 'ethical_and_responsible_use',
    label: 'Ethical and Responsible Use',
    max: 10,
    meaning:
      'Checks privacy, fairness, safety, inclusion and responsible AI use.'
  }
]

function getScoreLevel(score) {
  if (score >= 75) return 'Strong certification-level attempt'
  if (score >= 50) return 'Good start, but needs improvement'
  return 'Needs more practical detail'
}

function safeScore(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function ScoringFeedbackScreen({
  currentAttempt,
  currentProblem,
  currentProblemAttemptStats,
  glaCoinBalance,
  onOpenRetry,
  onNextProblem,
  onOpenDashboard,
  onOpenCoinHistory
}) {
  if (!currentAttempt) {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Scoring and feedback</p>
        <h1 style={sectionTitleStyle}>No score yet.</h1>

        <p style={paragraphStyle}>
          Submit a solution first. After DeepSeek scores your answer, this screen
          will show the total score, GLA coin earned, sub-scores, feedback and
          retry options.
        </p>

        <div style={centerButtonRowStyle}>
          <button onClick={onOpenDashboard} style={secondaryButtonStyle}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const subScores = currentAttempt.subScores || {}
  const problemTitle =
    currentAttempt.problemTitle || currentProblem?.title || 'Current problem'
  const selectedAiCards = currentAttempt.selectedAiCards || []

  return (
    <div style={panelStyle}>
      <p style={eyebrowStyle}>Scoring and feedback</p>
      <h1 style={sectionTitleStyle}>DeepSeek reviewed your solution.</h1>

      <div style={scoreHeroStyle}>
        <div style={scoreCircleStyle}>{currentAttempt.totalScore}</div>

        <div>
          <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
            {getScoreLevel(currentAttempt.totalScore)}
          </p>

          <h2 style={scoreTitleStyle}>
            {currentAttempt.glaCoinEarned} GLA coin earned
          </h2>

          <p style={scoreTextStyle}>
            Current balance: <strong>{glaCoinBalance} GLA coin</strong>
          </p>
        </div>
      </div>

      <div style={twoColumnGridStyle}>
        <div style={smallCardStyle}>
          <p style={eyebrowStyle}>Problem solved</p>
          <h3 style={smallCardTitleStyle}>{problemTitle}</h3>
          <p style={smallCardTextStyle}>
            Attempt submitted on {currentAttempt.createdAt}.
          </p>
        </div>

        <div style={smallCardStyle}>
          <p style={eyebrowStyle}>AI cards used</p>

          {selectedAiCards.length === 0 ? (
            <p style={smallCardTextStyle}>No AI cards were recorded.</p>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {selectedAiCards.map((card) => (
                <div key={card.id} style={chipStyle}>
                  {card.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ ...smallCardStyle, marginTop: '18px' }}>
        <p style={eyebrowStyle}>Feedback</p>

        <h3 style={smallCardTitleStyle}>Overall feedback</h3>
        <p style={smallCardTextStyle}>{currentAttempt.feedback}</p>

        <h3 style={{ ...smallCardTitleStyle, marginTop: '18px' }}>
          How to improve
        </h3>
        <p style={smallCardTextStyle}>{currentAttempt.improvement}</p>
      </div>

      <div style={{ ...smallCardStyle, marginTop: '18px' }}>
        <p style={eyebrowStyle}>Detailed sub-score breakdown</p>
        <h3 style={smallCardTitleStyle}>Your score by rubric area</h3>

        <div style={subScoreGridStyle}>
          {rubricRows.map((row) => {
            const score = safeScore(subScores[row.key])
            const percentage =
              row.max > 0 ? Math.round((score / row.max) * 100) : 0

            return (
              <div key={row.key} style={subScoreCardStyle}>
                <div style={rowBetweenStyle}>
                  <strong style={{ color: '#5c3512' }}>{row.label}</strong>
                  <span style={{ color: '#9a6a22', fontWeight: '900' }}>
                    {score}/{row.max}
                  </span>
                </div>

                <div style={progressTrackStyle}>
                  <div
                    style={{
                      ...progressFillStyle,
                      width: `${Math.min(100, Math.max(0, percentage))}%`
                    }}
                  ></div>
                </div>

                <p style={{ ...smallCardTextStyle, fontSize: '0.86rem' }}>
                  {row.meaning}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ ...smallCardStyle, marginTop: '18px' }}>
        <p style={eyebrowStyle}>First / latest / best score</p>
        <h3 style={smallCardTitleStyle}>Score history for this problem</h3>

        {currentProblemAttemptStats ? (
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
        ) : (
          <p style={smallCardTextStyle}>
            No score history found for this problem yet.
          </p>
        )}
      </div>

      <div style={centerButtonRowStyle}>
        <button onClick={onOpenRetry} style={primaryButtonStyle}>
          Retry This Problem
        </button>

        <button onClick={onNextProblem} style={secondaryButtonStyle}>
          Next Problem
        </button>

        <button onClick={onOpenDashboard} style={secondaryButtonStyle}>
          Dashboard
        </button>

        <button onClick={onOpenCoinHistory} style={secondaryButtonStyle}>
          GLA Coin History
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

const scoreHeroStyle = {
  marginTop: '24px',
  padding: '26px',
  borderRadius: '30px',
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  flexWrap: 'wrap',
  background:
    'linear-gradient(135deg, rgba(92, 53, 18, 0.96), rgba(154, 106, 34, 0.92))',
  color: '#fff8eb',
  boxShadow: '0 24px 60px rgba(92, 53, 18, 0.2)'
}

const scoreCircleStyle = {
  width: '92px',
  height: '92px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 248, 235, 0.16)',
  border: '2px solid rgba(244, 210, 138, 0.45)',
  color: '#f4d28a',
  fontSize: '2rem',
  fontWeight: '950'
}

const scoreTitleStyle = {
  margin: '0 0 8px',
  color: '#fff8eb',
  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
  lineHeight: '1.05',
  letterSpacing: '-0.05em'
}

const scoreTextStyle = {
  margin: 0,
  color: 'rgba(255, 248, 235, 0.88)',
  lineHeight: '1.6'
}

const twoColumnGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '16px',
  marginTop: '18px'
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

const chipStyle = {
  padding: '10px 12px',
  borderRadius: '999px',
  background: 'rgba(154, 106, 34, 0.12)',
  color: '#5c3512',
  fontSize: '0.88rem',
  fontWeight: '850'
}

const subScoreGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '12px',
  marginTop: '16px'
}

const subScoreCardStyle = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255, 255, 255, 0.72)',
  border: '1px solid rgba(139, 92, 40, 0.14)'
}

const rowBetweenStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  alignItems: 'center'
}

const progressTrackStyle = {
  width: '100%',
  height: '9px',
  margin: '12px 0',
  borderRadius: '999px',
  background: 'rgba(139, 92, 40, 0.16)',
  overflow: 'hidden'
}

const progressFillStyle = {
  height: '100%',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)'
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

export default ScoringFeedbackScreen