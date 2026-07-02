import { styles } from './gameStyles'
import { achievementTemplates } from '../../data/mockUiData'
import { MetricCard, Pill, SectionHeader } from './ui'

function AchievementsBadgesScreen({ attempts, completedProblems, totalGlaCoinEarned }) {
  function unlocked(id) {
    if (id === 'first') return attempts.length > 0
    if (id === 'ten') return completedProblems >= 10
    if (id === 'coin') return totalGlaCoinEarned >= 500
    if (id === 'ethics') return attempts.some((a) => Number(a.subScores?.ethical_and_responsible_use || 0) >= 8)
    if (id === 'creative') return attempts.some((a) => Number(a.subScores?.creativity_and_innovation || 0) >= 8)
    return false
  }
  const unlockedCount = achievementTemplates.filter((item) => unlocked(item.id)).length
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Achievements / badges" title="Reward learning milestones." />
      <div style={styles.metricGrid}><MetricCard title="Unlocked Badges" value={`${unlockedCount}/${achievementTemplates.length}`} /><MetricCard title="Total Attempts" value={attempts.length} /><MetricCard title="Completed Problems" value={completedProblems} /></div>
      <div style={styles.cardGrid}>
        {achievementTemplates.map((badge) => {
          const isUnlocked = unlocked(badge.id)
          return <div key={badge.id} style={{ ...styles.smallCard, opacity: isUnlocked ? 1 : 0.55 }}><p style={{ fontSize: '2rem', margin: 0 }}>{badge.icon}</p><h3 style={styles.smallCardTitle}>{badge.title}</h3><p style={styles.smallCardText}>{badge.requirement}</p><div style={{ marginTop: 12 }}><Pill tone={isUnlocked ? 'success' : 'default'}>{isUnlocked ? 'Unlocked' : 'Locked'}</Pill></div></div>
        })}
      </div>
    </div>
  )
}

export default AchievementsBadgesScreen
