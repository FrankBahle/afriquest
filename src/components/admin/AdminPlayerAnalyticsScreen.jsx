import { styles } from '../game/gameStyles'
import { DataTable, MetricCard, SectionHeader, Pill } from '../game/ui'
import { adminPlayers } from './adminMockData'

function AdminPlayerAnalyticsScreen() {
  const active = adminPlayers.filter((player) => player.status === 'Active').length
  const certified = adminPlayers.filter((player) => player.certificate === 'Issued').length
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Admin player analytics" title="View player progress and certification activity." />
      <div style={styles.metricGrid}>
        <MetricCard title="Players in table" value={adminPlayers.length} />
        <MetricCard title="Active Players" value={active} />
        <MetricCard title="Certificates Issued" value={certified} />
        <MetricCard title="Average Completion" value="10.6" />
      </div>
      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <DataTable rows={adminPlayers} columns={[{ key: 'name', label: 'Player' }, { key: 'status', label: 'Status' }, { key: 'completed', label: 'Completed' }, { key: 'average', label: 'Average' }, { key: 'coin', label: 'GLA Coin' }, { key: 'certificate', label: 'Certificate', render: (row) => <Pill tone={row.certificate === 'Issued' ? 'success' : 'default'}>{row.certificate}</Pill> }]} />
      </div>
    </div>
  )
}

export default AdminPlayerAnalyticsScreen
