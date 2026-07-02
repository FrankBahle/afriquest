import { styles } from './gameStyles'
import { MetricCard, ProgressBar, SectionHeader } from './ui'

function LevelsProgressionScreen({ totalGlaCoinEarned, completedProblems, averageScore }) {
  const level = Math.max(1, Math.floor(totalGlaCoinEarned / 250) + 1)
  const nextLevelAt = level * 250
  const currentLevelStart = (level - 1) * 250
  const progress = totalGlaCoinEarned - currentLevelStart
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Levels / progression" title="Grow from beginner to AI innovation leader." />
      <div style={styles.metricGrid}><MetricCard title="Current Level" value={level} /><MetricCard title="GLA Coin XP" value={totalGlaCoinEarned} /><MetricCard title="Completed" value={completedProblems} /><MetricCard title="Average" value={`${averageScore}%`} /></div>
      <div style={{ ...styles.smallCard, marginTop: 18 }}><h3 style={styles.smallCardTitle}>Progress to Level {level + 1}</h3><p style={styles.smallCardText}>{nextLevelAt - totalGlaCoinEarned} more GLA coin needed.</p><ProgressBar value={progress} max={250} /></div>
      <div style={styles.cardGrid}>{['AI Explorer', 'SDG Solver', 'Community Innovator', 'Ethical AI Builder', 'African Innovation Leader'].map((name, index) => <div key={name} style={{ ...styles.smallCard, opacity: level >= index + 1 ? 1 : 0.5 }}><p style={styles.eyebrow}>Level {index + 1}</p><h3 style={styles.smallCardTitle}>{name}</h3><p style={styles.smallCardText}>{level >= index + 1 ? 'Reached' : 'Locked'}</p></div>)}</div>
    </div>
  )
}

export default LevelsProgressionScreen
