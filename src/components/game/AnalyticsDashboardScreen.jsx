import { styles } from './gameStyles'
import { DataTable, MetricCard, SectionHeader } from './ui'

function AnalyticsDashboardScreen({ cards, attempts, selectedProblemStack, coinTransactions, completedProblems, certificateUnlocked }) {
  const hints = coinTransactions.filter((item) => item.type === 'spent')
  const usedAiCards = attempts.flatMap((attempt) => attempt.selectedAiCards || [])
  const avgScore = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.totalScore, 0) / attempts.length) : 0
  const categoryAverages = ['AI relevance', 'Feasibility', 'African context', 'SDG alignment', 'Creativity', 'Ethics'].map((name, index) => ({ id: index, name, average: Math.max(0, avgScore - index * 3) }))
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Analytics dashboard" title="Learning analytics and reporting view." />
      <div style={styles.metricGrid}>
        <MetricCard title="Registered Players" value="124" helper="UI demo metric" />
        <MetricCard title="Active Players" value="38" helper="UI demo metric" />
        <MetricCard title="Most Selected Problems" value={selectedProblemStack.length || 0} />
        <MetricCard title="Most Used AI Cards" value={usedAiCards.length || 0} />
        <MetricCard title="Common AI Combos" value={Math.max(0, attempts.length)} />
        <MetricCard title="Avg Score / Problem" value={`${avgScore}%`} />
        <MetricCard title="Hints Requested" value={hints.length} />
        <MetricCard title="Certificates Issued" value={certificateUnlocked ? 1 : 0} />
        <MetricCard title="Completion Rate" value={`${Math.round((completedProblems / 10) * 100)}%`} />
        <MetricCard title="Replay Rate" value={`${attempts.filter((a) => a.attemptNumber > 1).length}`} />
      </div>
      <div style={styles.twoColumnGrid}>
        <div style={{ ...styles.smallCard, marginTop: 18 }}><p style={styles.eyebrow}>Average score per scoring category</p><DataTable columns={[{ key: 'name', label: 'Category' }, { key: 'average', label: 'Average', render: (r) => `${r.average}%` }]} rows={categoryAverages} /></div>
        <div style={{ ...styles.smallCard, marginTop: 18 }}><p style={styles.eyebrow}>Problem card analytics</p><DataTable columns={[{ key: 'title', label: 'Problem' }, { key: 'problem_type', label: 'Type' }]} rows={cards.slice(0, 8)} /></div>
      </div>
    </div>
  )
}

export default AnalyticsDashboardScreen
