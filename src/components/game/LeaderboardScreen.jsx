import { styles } from './gameStyles'
import { demoPlayers } from '../../data/mockUiData'
import { DataTable, SectionHeader } from './ui'

function LeaderboardScreen({ fullName, averageScore, completedProblems, totalGlaCoinEarned }) {
  const rows = [...demoPlayers.filter((p) => p.name !== 'You'), { id: 'you', name: fullName, average: averageScore, completed: completedProblems, coin: totalGlaCoinEarned, badge: 'Current Player' }].sort((a, b) => b.average - a.average)
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Leaderboard" title="Compare learning progress." />
      <DataTable columns={[{ key: 'rank', label: 'Rank', render: (_, index) => index + 1 }, { key: 'name', label: 'Player' }, { key: 'average', label: 'Average', render: (r) => `${r.average}%` }, { key: 'completed', label: 'Completed' }, { key: 'coin', label: 'GLA Coin' }, { key: 'badge', label: 'Title' }]} rows={rows} />
    </div>
  )
}

export default LeaderboardScreen
