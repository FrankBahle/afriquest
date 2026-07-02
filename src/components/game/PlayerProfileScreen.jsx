import { styles } from './gameStyles'
import { DataTable, MetricCard, SectionHeader } from './ui'

function PlayerProfileScreen({ fullName, email, selectedProblemStack, completedProblemRows, attempts, glaCoinBalance, certificateUnlocked }) {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Player profile" title={`${fullName}'s profile`}>
        This screen gives a full profile view for the player, including identity, stack, progress and activity.
      </SectionHeader>
      <div style={styles.metricGrid}>
        <MetricCard title="Name" value={fullName} />
        <MetricCard title="Email" value={email || 'Demo user'} />
        <MetricCard title="Selected Stack" value={selectedProblemStack.length} />
        <MetricCard title="Attempts" value={attempts.length} />
        <MetricCard title="GLA Coin" value={glaCoinBalance} />
        <MetricCard title="Certificate" value={certificateUnlocked ? 'Unlocked' : 'Locked'} />
      </div>
      <div style={{ ...styles.smallCard, marginTop: '18px' }}>
        <p style={styles.eyebrow}>Completed problem cards</p>
        <DataTable columns={[{ key: 'problemTitle', label: 'Problem' }, { key: 'bestScore', label: 'Best' }, { key: 'attempts', label: 'Attempts' }]} rows={completedProblemRows} />
      </div>
    </div>
  )
}

export default PlayerProfileScreen
