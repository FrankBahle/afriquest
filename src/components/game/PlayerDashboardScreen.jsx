function PlayerDashboardScreen({
  firstName,
  selectedProblemCount,
  completedProblems,
  averageScore,
  certificateUnlocked,
  certificationProgress,
  glaCoinBalance,
  totalGlaCoinEarned,
  glaCoinSpentOnHints,
  attempts,
  attemptStatsByProblem,
  bestScoringProblems,
  latestAttempt,
  onOpenCoinHistory,
  onOpenLatestScore,
  onOpenCertificate
}) {
  return (
    <div style={panelStyle}>
      <p style={eyebrowStyle}>Player dashboard</p>

      <h1 style={sectionTitleStyle}>Your GRIT Lab Africa progress.</h1>

      <p style={paragraphStyle}>
        This dashboard shows your selected cards, completed problems, score
        progress, attempts, best scores and GLA coin balance.
      </p>

      <div style={metricGridStyle}>
        <MetricCard title="Player" value={firstName} />
        <MetricCard title="Selected Problems" value={selectedProblemCount} />
        <MetricCard title="Completed Problems" value={completedProblems} />
        <MetricCard title="Average Score" value={`${averageScore}%`} />
        <MetricCard title="Current GLA Coin" value={glaCoinBalance} />
        <MetricCard title="Total Earned" value={totalGlaCoinEarned} />
        <MetricCard title="Spent on Hints" value={glaCoinSpentOnHints} />
        <MetricCard
          title="Certificate"
          value={certificateUnlocked ? 'Unlocked' : 'Locked'}
        />
      </div>

      <div style={twoColumnGridStyle}>
        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>Best-scoring problem cards</p>

          {bestScoringProblems.length === 0 ? (
            <p style={smallCardTextStyle}>
              No best scores yet. Submit your first solution to start tracking.
            </p>
          ) : (
            <div style={listGridStyle}>
              {bestScoringProblems.map((item, index) => (
                <div key={item.problemId} style={historyItemStyle}>
                  <strong style={{ color: '#5c3512' }}>
                    {index + 1}. {item.problemTitle}
                  </strong>
                  <span style={scoreBadgeStyle}>{item.bestScore}/100</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>Certificate status</p>

          <h3 style={smallCardTitleStyle}>
            {certificateUnlocked ? 'Certificate unlocked' : 'Certificate locked'}
          </h3>

          <p style={smallCardTextStyle}>
            Complete 10 problem cards with an average score of 75 or higher.
            Current progress: {certificationProgress}/10 with an average of{' '}
            {averageScore}%.
          </p>
        </div>
      </div>

      <div style={{ ...smallCardStyle, marginTop: '18px' }}>
        <p style={eyebrowStyle}>First / latest / best score view</p>

        {Object.values(attemptStatsByProblem).length === 0 ? (
          <p style={smallCardTextStyle}>
            No attempt history yet. Submit a solution first.
          </p>
        ) : (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Problem</th>
                  <th style={thStyle}>First</th>
                  <th style={thStyle}>Latest</th>
                  <th style={thStyle}>Best</th>
                  <th style={thStyle}>Attempts</th>
                </tr>
              </thead>

              <tbody>
                {Object.values(attemptStatsByProblem).map((stats) => (
                  <tr key={stats.problemId}>
                    <td style={tdStyle}>{stats.problemTitle}</td>
                    <td style={tdStyle}>{stats.first.totalScore}/100</td>
                    <td style={tdStyle}>{stats.latest.totalScore}/100</td>
                    <td style={tdStyle}>{stats.best.totalScore}/100</td>
                    <td style={tdStyle}>{stats.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ ...smallCardStyle, marginTop: '18px' }}>
        <p style={eyebrowStyle}>Attempt history</p>

        {attempts.length === 0 ? (
          <p style={smallCardTextStyle}>
            Your attempts will appear here after you submit solutions.
          </p>
        ) : (
          <div style={listGridStyle}>
            {[...attempts].reverse().map((attempt) => (
              <div key={attempt.id} style={attemptCardStyle}>
                <div style={rowBetweenStyle}>
                  <div>
                    <h3 style={smallCardTitleStyle}>{attempt.problemTitle}</h3>

                    <p style={smallCardTextStyle}>
                      Attempt #{attempt.attemptNumber} • {attempt.createdAt}
                    </p>
                  </div>

                  <span style={scoreBadgeStyle}>{attempt.totalScore}/100</span>
                </div>

                <p style={{ ...smallCardTextStyle, marginTop: '10px' }}>
                  {attempt.feedback}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={centerButtonRowStyle}>
        <button onClick={onOpenCoinHistory} style={primaryButtonStyle}>
          View GLA Coin History
        </button>

        <button
          onClick={onOpenLatestScore}
          disabled={!latestAttempt}
          style={{
            ...secondaryButtonStyle,
            opacity: latestAttempt ? 1 : 0.45,
            cursor: latestAttempt ? 'pointer' : 'default'
          }}
        >
          View Latest Score
        </button>

        <button onClick={onOpenCertificate} style={secondaryButtonStyle}>
          View Certificate
        </button>
      </div>
    </div>
  )
}

function MetricCard({ title, value }) {
  return (
    <div style={metricCardStyle}>
      <strong style={metricValueStyle}>{value}</strong>
      <span style={metricTitleStyle}>{title}</span>
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

const metricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginTop: '18px'
}

const metricCardStyle = {
  padding: '18px',
  borderRadius: '22px',
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(139, 92, 40, 0.16)'
}

const metricValueStyle = {
  display: 'block',
  color: '#5c3512',
  fontSize: '1.55rem',
  lineHeight: '1.1',
  overflowWrap: 'anywhere'
}

const metricTitleStyle = {
  color: '#6b5540',
  fontSize: '0.9rem',
  fontWeight: '650'
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

const listGridStyle = {
  display: 'grid',
  gap: '12px',
  marginTop: '12px'
}

const historyItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
  padding: '14px',
  borderRadius: '18px',
  background: 'rgba(255, 255, 255, 0.62)',
  border: '1px solid rgba(139, 92, 40, 0.12)'
}

const scoreBadgeStyle = {
  display: 'inline-flex',
  padding: '9px 12px',
  borderRadius: '999px',
  background: 'rgba(154, 106, 34, 0.13)',
  color: '#5c3512',
  fontWeight: '900'
}

const tableWrapperStyle = {
  width: '100%',
  overflowX: 'auto',
  marginTop: '14px'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '680px'
}

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  color: '#5c3512',
  borderBottom: '1px solid rgba(139, 92, 40, 0.2)',
  background: 'rgba(255, 255, 255, 0.5)'
}

const tdStyle = {
  padding: '12px',
  color: '#5c4632',
  borderBottom: '1px solid rgba(139, 92, 40, 0.12)'
}

const attemptCardStyle = {
  padding: '16px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.58)',
  border: '1px solid rgba(139, 92, 40, 0.14)'
}

const rowBetweenStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '14px',
  flexWrap: 'wrap'
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

export default PlayerDashboardScreen