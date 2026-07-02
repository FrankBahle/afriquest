import { styles, colors } from './gameStyles'
import { rubricRows } from '../../data/mockUiData'
import { ActionButton, EmptyState, MetricCard, ProgressBar, SectionHeader } from './ui'

function ScoringFeedbackScreen({ currentAttempt, currentProblemAttemptStats, glaCoinBalance, onOpenRetry, onNextProblem, onOpenDashboard, onOpenCoinHistory }) {
  if (!currentAttempt) {
    return (
      <div style={styles.panel}>
        <SectionHeader eyebrow="Scoring and feedback" title="No score yet.">
          Submit a solution first. DeepSeek feedback and the detailed sub-score breakdown will appear here.
        </SectionHeader>
        <div style={styles.centerButtonRow}><ActionButton onClick={onOpenDashboard}>Go to Dashboard</ActionButton></div>
      </div>
    )
  }

  const subScores = currentAttempt.subScores || {}

  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Scoring and feedback" title="DeepSeek reviewed your solution." />
      <div style={scoreHeroStyle}>
        <div style={scoreCircleStyle}>{currentAttempt.totalScore}</div>
        <div>
          <p style={{ ...styles.eyebrow, color: colors.lightGold }}>{currentAttempt.totalScore >= 75 ? 'Strong certification-level attempt' : currentAttempt.totalScore >= 50 ? 'Good start, improve the details' : 'Needs more practical detail'}</p>
          <h2 style={scoreTitleStyle}>{currentAttempt.glaCoinEarned} GLA coin earned</h2>
          <p style={scoreTextStyle}>Current balance: <strong>{glaCoinBalance} GLA coin</strong></p>
        </div>
      </div>

      <div style={styles.twoColumnGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Problem solved</p>
          <h3 style={styles.smallCardTitle}>{currentAttempt.problemTitle}</h3>
          <p style={styles.smallCardText}>Attempt #{currentAttempt.attemptNumber} submitted on {currentAttempt.createdAt}.</p>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>AI cards used</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(currentAttempt.selectedAiCards || []).map((card) => <span key={card.id} style={styles.chip}>{card.title}</span>)}
          </div>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>Feedback</p>
        <h3 style={styles.smallCardTitle}>Overall feedback</h3>
        <p style={styles.smallCardText}>{currentAttempt.feedback}</p>
        <h3 style={{ ...styles.smallCardTitle, marginTop: '18px' }}>How to improve</h3>
        <p style={styles.smallCardText}>{currentAttempt.improvement}</p>
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>Detailed sub-score breakdown</p>
        <div style={subScoreGridStyle}>
          {rubricRows.map((row) => {
            const score = Number(subScores[row.key] || 0)
            return (
              <div key={row.key} style={subScoreCardStyle}>
                <div style={styles.rowBetween}><strong style={{ color: colors.brown }}>{row.label}</strong><span style={styles.chip}>{score}/{row.max}</span></div>
                <ProgressBar value={score} max={row.max} />
                <p style={{ ...styles.smallCardText, fontSize: '0.86rem', marginTop: '10px' }}>{row.meaning}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>First / latest / best score</p>
        {currentProblemAttemptStats ? (
          <div style={styles.metricGrid}>
            <MetricCard title="First Score" value={`${currentProblemAttemptStats.first?.totalScore || 0}/100`} />
            <MetricCard title="Latest Score" value={`${currentProblemAttemptStats.latest?.totalScore || 0}/100`} />
            <MetricCard title="Best Score" value={`${currentProblemAttemptStats.best?.totalScore || 0}/100`} />
            <MetricCard title="Attempts" value={currentProblemAttemptStats.count || 0} />
          </div>
        ) : <EmptyState title="No history">No score history found for this problem yet.</EmptyState>}
      </div>

      <div style={styles.centerButtonRow}>
        <ActionButton onClick={onOpenRetry}>Retry This Problem</ActionButton>
        <ActionButton variant="secondary" onClick={onNextProblem}>Next Problem</ActionButton>
        <ActionButton variant="secondary" onClick={onOpenDashboard}>Dashboard</ActionButton>
        <ActionButton variant="secondary" onClick={onOpenCoinHistory}>GLA Coin History</ActionButton>
      </div>
    </div>
  )
}

const scoreHeroStyle = { marginTop: '24px', padding: '26px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', background: 'linear-gradient(135deg, rgba(92,53,18,0.96), rgba(154,106,34,0.92))', color: colors.cream, boxShadow: '0 24px 60px rgba(92,53,18,0.2)' }
const scoreCircleStyle = { width: '92px', height: '92px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,248,235,0.16)', border: '2px solid rgba(244,210,138,0.45)', color: colors.lightGold, fontSize: '2rem', fontWeight: '950' }
const scoreTitleStyle = { margin: '0 0 8px', color: colors.cream, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: '1.05', letterSpacing: '-0.05em' }
const scoreTextStyle = { margin: 0, color: 'rgba(255,248,235,0.88)', lineHeight: '1.6' }
const subScoreGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '16px' }
const subScoreCardStyle = { padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(139,92,40,0.14)' }

export default ScoringFeedbackScreen
