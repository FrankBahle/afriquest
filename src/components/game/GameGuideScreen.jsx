import { styles } from './gameStyles'
import { ActionButton, SectionHeader } from './ui'

function GameGuideScreen({ firstName, onChooseProblems }) {
  const guideItems = [
    { title: '1. Choose problems', text: 'Select at least 10 problem cards to create your active problem stack.' },
    { title: '2. Pick AI cards', text: 'Use one, two or three AI cards as solution tools for each problem.' },
    { title: '3. Explain your idea', text: 'Write a short explanation of why the selected AI cards can solve the problem.' },
    { title: '4. Earn GLA coin', text: 'DeepSeek gives a score out of 100. That score becomes your GLA coin.' },
    { title: '5. Track progress', text: 'Your score, completed cards, achievements, levels and wallet update as you play.' },
    { title: '6. Unlock certificate', text: 'Complete 10 problem cards with an average score of at least 75.' }
  ]

  return (
    <div style={styles.panel}>
      <div style={stickyHeroActionStyle}>
        <div>
          <p style={styles.eyebrow}>Ready to start</p>
          <h2 style={stickyHeroTitleStyle}>AfriQuest journey guide</h2>
          <p style={stickyHeroTextStyle}>Read the steps, then start choosing your SDG problem cards.</p>
        </div>

        <ActionButton onClick={onChooseProblems}>Choose Problem Cards</ActionButton>
      </div>

      <SectionHeader eyebrow="Game explanation" title="Use AI cards to solve African problem cards." centered>
        Hi {firstName}, choose real African problem cards, select one to three AI cards, explain your idea in 100 words or less, and get scored on practicality, ethics, creativity, SDG alignment and African context.
      </SectionHeader>

      <div style={heroStripStyle}>
        <div>
          <p style={styles.eyebrow}>Mission</p>
          <h3 style={heroStripTitleStyle}>Solve SDG challenges like a real innovation game.</h3>
          <p style={styles.smallCardText}>
            AfriQuest is built around progress. Every card you complete updates your dashboard, GLA coin, level, achievements and certificate journey.
          </p>
        </div>
        <div style={scorePreviewStyle}>
          <span style={scorePreviewNumberStyle}>100</span>
          <span style={scorePreviewLabelStyle}>Max score per problem</span>
        </div>
      </div>

      <div style={{ ...styles.cardGrid, maxWidth: '980px', marginLeft: 'auto', marginRight: 'auto' }}>
        {guideItems.map((item) => (
          <div key={item.title} style={guideCardStyle}>
            <h3 style={styles.smallCardTitle}>{item.title}</h3>
            <p style={styles.smallCardText}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const stickyHeroActionStyle = {
  position: 'sticky',
  top: 104,
  zIndex: 20,
  marginBottom: 24,
  padding: '16px 18px',
  borderRadius: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  background: 'linear-gradient(135deg, rgba(255, 248, 235, 0.96), rgba(244, 210, 138, 0.92))',
  border: '1px solid rgba(154, 106, 34, 0.34)',
  boxShadow: '0 18px 44px rgba(80, 52, 20, 0.18)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)'
}

const stickyHeroTitleStyle = {
  margin: 0,
  color: '#4b2b10',
  fontSize: '1.25rem',
  letterSpacing: '-0.04em'
}

const stickyHeroTextStyle = {
  margin: '4px 0 0',
  color: '#6b5540',
  lineHeight: 1.5,
  fontSize: '0.92rem'
}

const heroStripStyle = {
  marginTop: 26,
  padding: 24,
  borderRadius: 30,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 18,
  alignItems: 'center',
  background: 'linear-gradient(135deg, rgba(92, 53, 18, 0.94), rgba(154, 106, 34, 0.9))',
  boxShadow: '0 24px 54px rgba(80, 52, 20, 0.22)'
}

const heroStripTitleStyle = {
  margin: '0 0 10px',
  color: '#fff8eb',
  fontSize: '1.6rem',
  letterSpacing: '-0.045em'
}

const scorePreviewStyle = {
  minWidth: 150,
  padding: 18,
  borderRadius: 26,
  textAlign: 'center',
  background: 'rgba(255, 248, 235, 0.18)',
  border: '1px solid rgba(255, 248, 235, 0.24)'
}

const scorePreviewNumberStyle = {
  display: 'block',
  color: '#f4d28a',
  fontSize: '3rem',
  lineHeight: 1,
  fontWeight: 950
}

const scorePreviewLabelStyle = {
  display: 'block',
  marginTop: 8,
  color: '#fff8eb',
  fontWeight: 850,
  fontSize: '0.82rem'
}

const guideCardStyle = {
  ...styles.smallCard,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,248,235,0.66))',
  border: '1px solid rgba(154, 106, 34, 0.18)'
}

export default GameGuideScreen
