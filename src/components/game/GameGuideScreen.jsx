import { styles } from './gameStyles'
import { ActionButton, SectionHeader } from './ui'

function GameGuideScreen({ firstName, onChooseProblems }) {
  const guideItems = [
    { title: '1. Choose problems', text: 'Select at least 10 problem cards to create your active problem stack.' },
    { title: '2. Pick AI cards', text: 'Use one, two or three AI cards as solution tools for each problem.' },
    { title: '3. Explain your idea', text: 'Write a short explanation of why the selected AI cards can solve the problem.' },
    { title: '4. Earn GLA coin', text: 'DeepSeek gives a score out of 100. That score becomes your GLA coin.' },
    { title: '5. Use hints', text: 'Request hints when stuck. Each hint costs GLA coin.' },
    { title: '6. Unlock certificate', text: 'Complete 10 problem cards with an average score of at least 75.' }
  ]

  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Game explanation" title="Use AI cards to solve African problem cards." centered>
        Hi {firstName}, choose real African problem cards, select one to three AI cards, explain your idea in 100 words or less, and get scored on practicality, ethics, creativity, SDG alignment and African context.
      </SectionHeader>

      <div style={{ ...styles.cardGrid, maxWidth: '980px', marginLeft: 'auto', marginRight: 'auto' }}>
        {guideItems.map((item) => (
          <div key={item.title} style={styles.smallCard}>
            <h3 style={styles.smallCardTitle}>{item.title}</h3>
            <p style={styles.smallCardText}>{item.text}</p>
          </div>
        ))}
      </div>

      <div style={styles.centerButtonRow}>
        <ActionButton onClick={onChooseProblems}>Choose Problem Cards</ActionButton>
      </div>
    </div>
  )
}

export default GameGuideScreen
