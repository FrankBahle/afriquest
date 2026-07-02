import { styles } from '../game/gameStyles'
import { MetricCard, SectionHeader, Pill, ProgressBar } from '../game/ui'
import { adminAnalytics, adminPlayers, adminProblemCards, adminAiCards } from './adminMockData'

function AdminDashboardScreen() {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Admin dashboard" title="GRIT Lab Africa administration overview.">
        UI-only overview for content management, player activity, analytics and certification.
      </SectionHeader>

      <div style={styles.metricGrid}>
        <MetricCard title="Registered Players" value={adminAnalytics.registeredPlayers} />
        <MetricCard title="Active Players" value={adminAnalytics.activePlayers} />
        <MetricCard title="Problem Cards" value={adminProblemCards.length} />
        <MetricCard title="AI Cards" value={adminAiCards.length} />
        <MetricCard title="Certificates Issued" value={adminAnalytics.certificatesIssued} />
        <MetricCard title="Hints Requested" value={adminAnalytics.hintsRequested} />
      </div>

      <div style={styles.twoColumnGrid}>
        <div style={{ ...styles.smallCard, marginTop: 18 }}>
          <p style={styles.eyebrow}>Platform readiness</p>
          <h3 style={styles.smallCardTitle}>Admin tools included</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Pill>Cards</Pill>
            <Pill>SDGs</Pill>
            <Pill>Rubrics</Pill>
            <Pill>Languages</Pill>
            <Pill>Reports</Pill>
            <Pill>Analytics</Pill>
          </div>
        </div>

        <div style={{ ...styles.smallCard, marginTop: 18 }}>
          <p style={styles.eyebrow}>Completion rate</p>
          <h3 style={styles.smallCardTitle}>{adminAnalytics.completionRate}</h3>
          <ProgressBar value={42} />
          <p style={{ ...styles.smallCardText, marginTop: 10 }}>
            Placeholder value for learners who complete the certification set.
          </p>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <p style={styles.eyebrow}>Recent player activity</p>
        <div style={styles.listGrid}>
          {adminPlayers.slice(0, 4).map((player) => (
            <div key={player.id} style={styles.rowBetween}>
              <div>
                <h3 style={styles.smallCardTitle}>{player.name}</h3>
                <p style={styles.smallCardText}>{player.completed} completed • {player.average}% average</p>
              </div>
              <Pill tone={player.certificate === 'Issued' ? 'success' : 'default'}>{player.certificate}</Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardScreen
