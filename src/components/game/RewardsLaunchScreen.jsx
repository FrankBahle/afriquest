import { styles } from './gameStyles'
import { MetricCard, Pill, SectionHeader } from './ui'

function RewardsLaunchScreen() {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Rewards and launch" title="Unlockables, sponsor rewards and public landing page." />
      <div style={styles.metricGrid}><MetricCard title="Avatar Unlocks" value="8" /><MetricCard title="Card Skins" value="12" /><MetricCard title="Sponsor Reward Status" value="Policy controlled" /></div>
      <div style={styles.cardGrid}>
        <div style={styles.smallCard}><p style={styles.eyebrow}>Avatar / Card Skin Unlock Screen</p><h3 style={styles.smallCardTitle}>Cosmetic rewards</h3><p style={styles.smallCardText}>Unlock avatars, titles and card skins using progression, not real-money purchases.</p><div style={{ marginTop: 12 }}><Pill>UI only</Pill></div></div>
        <div style={styles.smallCard}><p style={styles.eyebrow}>Sponsor Reward Information Screen</p><h3 style={styles.smallCardTitle}>Sponsor-supported rewards</h3><p style={styles.smallCardText}>Rewards must remain subject to partnership availability, sponsor support and platform policy.</p></div>
        <div style={styles.smallCard}><p style={styles.eyebrow}>Public Launch / Programme Landing Page</p><h3 style={styles.smallCardTitle}>Launch page preview</h3><p style={styles.smallCardText}>Public-facing page for GRIT Lab Africa programmes, schools, bootcamps and hackathons.</p></div>
      </div>
    </div>
  )
}

export default RewardsLaunchScreen
