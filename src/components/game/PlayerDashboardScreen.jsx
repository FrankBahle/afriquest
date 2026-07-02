import { styles } from './gameStyles'
import { ActionButton, DataTable, EmptyState, MetricCard, Pill, SectionHeader } from './ui'

function PlayerDashboardScreen({
  firstName,
  selectedProblemStack,
  completedProblemRows,
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
  onOpenCertificate,
  onOpenProfile
}) {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Player dashboard" title="Your GRIT Lab Africa progress.">
        This dashboard shows your selected problem stack, completed problems, best scores, attempts and GLA coin activity.
      </SectionHeader>

      <div style={styles.metricGrid}>
        <MetricCard title="Player" value={firstName} />
        <MetricCard title="Selected Problems" value={selectedProblemStack.length} />
        <MetricCard title="Completed Problems" value={completedProblems} />
        <MetricCard title="Average Score" value={`${averageScore}%`} />
        <MetricCard title="Current GLA Coin" value={glaCoinBalance} />
        <MetricCard title="Total Earned" value={totalGlaCoinEarned} />
        <MetricCard title="Spent on Hints" value={glaCoinSpentOnHints} />
        <MetricCard title="Certificate" value={certificateUnlocked ? 'Unlocked' : 'Locked'} />
      </div>

      <div style={styles.twoColumnGrid}>
        <div style={{ ...styles.smallCard, marginTop: '18px' }}>
          <p style={styles.eyebrow}>Best-scoring problem cards</p>
          {bestScoringProblems.length === 0 ? (
            <EmptyState title="No best scores yet">Submit your first solution to start tracking best-scoring problem cards.</EmptyState>
          ) : (
            <div style={styles.listGrid}>
              {bestScoringProblems.map((item, index) => (
                <div key={item.problemId} style={historyItemStyle}>
                  <strong style={{ color: '#5c3512' }}>{index + 1}. {item.problemTitle}</strong>
                  <Pill>{item.bestScore}/100</Pill>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...styles.smallCard, marginTop: '18px' }}>
          <p style={styles.eyebrow}>Certificate status</p>
          <h3 style={styles.smallCardTitle}>{certificateUnlocked ? 'Certificate unlocked' : 'Certificate locked'}</h3>
          <p style={styles.smallCardText}>Complete 10 problem cards with an average score of 75 or higher. Current progress: {certificationProgress}/10 with an average of {averageScore}%.</p>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>Completed problem cards list</p>
        <DataTable
          columns={[
            { key: 'problemTitle', label: 'Problem' },
            { key: 'bestScore', label: 'Best Score', render: (row) => `${row.bestScore}/100` },
            { key: 'latestScore', label: 'Latest Score', render: (row) => `${row.latestScore}/100` },
            { key: 'attempts', label: 'Attempts' }
          ]}
          rows={completedProblemRows}
          emptyText="Completed problem cards will appear here after submissions."
        />
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>Selected problem stack full view</p>
        <div style={{ ...styles.cardGrid, marginTop: '12px' }}>
          {selectedProblemStack.map((card) => (
            <div key={card.id} style={styles.smallCard}>
              <h3 style={styles.smallCardTitle}>{card.title}</h3>
              <p style={styles.smallCardText}>{card.problem}</p>
              <div style={{ marginTop: '10px' }}><Pill>{card.problem_type}</Pill></div>
            </div>
          ))}
          {selectedProblemStack.length === 0 && <EmptyState title="No selected cards">Select problem cards from the Play Journey screen.</EmptyState>}
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>First / latest / best score view</p>
        <DataTable
          columns={[
            { key: 'problemTitle', label: 'Problem' },
            { key: 'first', label: 'First', render: (row) => `${row.first.totalScore}/100` },
            { key: 'latest', label: 'Latest', render: (row) => `${row.latest.totalScore}/100` },
            { key: 'best', label: 'Best', render: (row) => `${row.best.totalScore}/100` },
            { key: 'count', label: 'Attempts' }
          ]}
          rows={Object.values(attemptStatsByProblem)}
          emptyText="Submit a solution first."
        />
      </div>

      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>Attempt history</p>
        {attempts.length === 0 ? <EmptyState title="No attempts yet">Your attempts will appear here after you submit solutions.</EmptyState> : (
          <div style={styles.listGrid}>
            {[...attempts].reverse().map((attempt) => (
              <div key={attempt.id} style={attemptCardStyle}>
                <div style={styles.rowBetween}>
                  <div><h3 style={styles.smallCardTitle}>{attempt.problemTitle}</h3><p style={styles.smallCardText}>Attempt #{attempt.attemptNumber} • {attempt.createdAt}</p></div>
                  <Pill>{attempt.totalScore}/100</Pill>
                </div>
                <p style={{ ...styles.smallCardText, marginTop: '10px' }}>{attempt.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.centerButtonRow}>
        <ActionButton onClick={onOpenCoinHistory}>View GLA Coin History</ActionButton>
        <ActionButton variant="secondary" onClick={onOpenLatestScore} disabled={!latestAttempt}>View Latest Score</ActionButton>
        <ActionButton variant="secondary" onClick={onOpenCertificate}>View Certificate</ActionButton>
        <ActionButton variant="secondary" onClick={onOpenProfile}>Player Profile</ActionButton>
      </div>
    </div>
  )
}

const historyItemStyle = { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', padding: '14px', borderRadius: '18px', background: 'rgba(255,255,255,0.62)', border: '1px solid rgba(139,92,40,0.12)' }
const attemptCardStyle = { padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(139,92,40,0.14)' }

export default PlayerDashboardScreen
