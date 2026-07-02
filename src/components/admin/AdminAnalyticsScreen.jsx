import { styles } from '../game/gameStyles'
import { DataTable, MetricCard, SectionHeader } from '../game/ui'
import { adminAnalytics } from './adminMockData'

function AdminAnalyticsScreen() {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Analytics dashboard" title="Learning analytics and impact reporting.">
        Includes registered players, active players, card usage, hints, certificates, completion and replay metrics.
      </SectionHeader>

      <div style={styles.metricGrid}>
        <MetricCard title="Registered Players" value={adminAnalytics.registeredPlayers} />
        <MetricCard title="Active Players" value={adminAnalytics.activePlayers} />
        <MetricCard title="Hints Requested" value={adminAnalytics.hintsRequested} />
        <MetricCard title="Certificates Issued" value={adminAnalytics.certificatesIssued} />
        <MetricCard title="Completion Rate" value={adminAnalytics.completionRate} />
        <MetricCard title="Replay Rate" value={adminAnalytics.replayRate} />
      </div>

      <AnalyticsTable title="Most Selected Problem Cards Analytics" rows={adminAnalytics.mostSelectedProblems} columns={[{ key: 'title', label: 'Problem Card' }, { key: 'count', label: 'Selections' }]} />
      <AnalyticsTable title="Most Used AI Cards Analytics" rows={adminAnalytics.mostUsedAiCards} columns={[{ key: 'title', label: 'AI Card' }, { key: 'count', label: 'Uses' }]} />
      <AnalyticsTable title="Common AI Card Combinations Analytics" rows={adminAnalytics.commonCombinations} columns={[{ key: 'combination', label: 'Combination' }, { key: 'count', label: 'Uses' }]} />
      <AnalyticsTable title="Average Score Per Problem Card Analytics" rows={adminAnalytics.averageScoreByProblem} columns={[{ key: 'title', label: 'Problem' }, { key: 'average', label: 'Average Score' }]} />
      <AnalyticsTable title="Average Score Per Scoring Category Analytics" rows={adminAnalytics.averageScoreByCategory} columns={[{ key: 'category', label: 'Scoring Category' }, { key: 'average', label: 'Average' }]} />
    </div>
  )
}

function AnalyticsTable({ title, rows, columns }) {
  return (
    <div style={{ ...styles.smallCard, marginTop: 18 }}>
      <p style={styles.eyebrow}>{title}</p>
      <DataTable rows={rows} columns={columns} />
    </div>
  )
}

export default AdminAnalyticsScreen
