import { styles } from './gameStyles'
import { Pill, SectionHeader } from './ui'

function CardDesignShowcaseScreen({ problemCardBack, aiCardBack, cards, aiCards }) {
  const sampleProblem = cards[0]
  const sampleAi = aiCards[0]
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Card image / illustration view" title="Problem cards, AI cards and SDG badges." />
      <div style={styles.twoColumnGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Proper Problem Card Dark Blue Back Design</p>
          <img src={problemCardBack} alt="Problem card dark blue back design" style={imageStyle} />
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Proper AI Card Golden Back Design</p>
          <img src={aiCardBack} alt="AI card golden back design" style={imageStyle} />
        </div>
      </div>
      <div style={styles.twoColumnGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Problem Card Image / Illustration View</p>
          <h3 style={styles.smallCardTitle}>{sampleProblem?.title || 'Problem card'}</h3>
          <p style={styles.smallCardText}>{sampleProblem?.problem || 'Problem description will appear here.'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}><Pill>{sampleProblem?.problem_type || 'Problem Type'}</Pill><Pill>SDG Badge</Pill></div>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>AI Card Image / Illustration View</p>
          <h3 style={styles.smallCardTitle}>{sampleAi?.title}</h3>
          <p style={styles.smallCardText}>{sampleAi?.canDo}</p>
          <div style={{ marginTop: 12 }}><Pill>{sampleAi?.type}</Pill></div>
        </div>
      </div>
    </div>
  )
}

const imageStyle = { width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: 24, boxShadow: '0 18px 44px rgba(80,52,20,0.18)' }

export default CardDesignShowcaseScreen
