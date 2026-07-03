import { styles } from './gameStyles'
import { ActionButton, MetricCard, Pill, SectionHeader } from './ui'

function ProblemSelectionScreen({ cards, selectedProblemIds, onToggleProblem, onStartGame }) {
  const selectedCount = selectedProblemIds.length
  const remainingCount = Math.max(0, 10 - selectedCount)
  const canStart = selectedCount >= 10

  return (
    <div style={styles.panel}>
      <div style={stickySelectionBarStyle}>
        <div style={selectionSummaryStyle}>
          <div>
            <p style={styles.eyebrow}>Problem stack</p>
            <h2 style={stickyTitleStyle}>{selectedCount}/10 selected</h2>
          </div>

          <div style={miniProgressTrackStyle}>
            <div style={{ ...miniProgressFillStyle, width: `${Math.min(100, (selectedCount / 10) * 100)}%` }}></div>
          </div>

          <p style={stickyHelpStyle}>
            {canStart ? 'Your stack is ready. Start the game whenever you are ready.' : `Choose ${remainingCount} more card${remainingCount === 1 ? '' : 's'} to unlock the game.`}
          </p>
        </div>

        <ActionButton onClick={onStartGame} disabled={!canStart}>
          Start Game
        </ActionButton>
      </div>

      <SectionHeader eyebrow="Problem card selection" title="Build your active problem stack.">
        Choose at least 10 problem cards. The game will randomly present cards from this stack. You can choose more than 10 if you want more variety.
      </SectionHeader>

      <div style={styles.metricGrid}>
        <MetricCard title="Selected" value={selectedCount} helper={canStart ? 'Ready to play' : `${remainingCount} more needed`} />
        <MetricCard title="Required" value="10" helper="Minimum stack size" />
        <MetricCard title="Total Cards" value={cards.length} helper="Available from Firebase" />
      </div>

      <div style={styles.cardGrid}>
        {cards.map((card) => {
          const selected = selectedProblemIds.includes(card.id)
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onToggleProblem(card.id)}
              aria-pressed={selected}
              style={{
                padding: '18px',
                minHeight: '180px',
                borderRadius: '24px',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#3b2817',
                border: selected ? '2px solid rgba(154, 106, 34, 0.82)' : '1px solid rgba(139, 92, 40, 0.18)',
                background: selected
                  ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.98), rgba(244, 210, 138, 0.62))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255,248,235,0.44))',
                boxShadow: selected ? '0 22px 48px rgba(80, 52, 20, 0.22)' : '0 12px 28px rgba(80, 52, 20, 0.08)',
                transform: selected ? 'translateY(-2px)' : 'none'
              }}
            >
              <div style={styles.rowBetween}>
                <p style={styles.eyebrow}>{selected ? 'Selected' : 'Problem Card'}</p>
                {selected && <span style={selectedBadgeStyle}>✓</span>}
              </div>
              <h3 style={styles.smallCardTitle}>{card.title}</h3>
              <p style={styles.smallCardText}>{card.problem}</p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Pill>{card.problem_type}</Pill>
                {card.linked_sdgs && <Pill>{String(card.linked_sdgs).split(',')[0]}</Pill>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const stickySelectionBarStyle = {
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

const selectionSummaryStyle = {
  display: 'grid',
  gap: 8,
  flex: '1 1 340px'
}

const stickyTitleStyle = {
  margin: 0,
  color: '#4b2b10',
  fontSize: '1.35rem',
  letterSpacing: '-0.045em'
}

const stickyHelpStyle = {
  margin: 0,
  color: '#6b5540',
  fontWeight: 750,
  lineHeight: 1.45,
  fontSize: '0.9rem'
}

const miniProgressTrackStyle = {
  width: '100%',
  maxWidth: 520,
  height: 10,
  borderRadius: 999,
  background: 'rgba(139, 92, 40, 0.16)',
  overflow: 'hidden'
}

const miniProgressFillStyle = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  transition: 'width 180ms ease'
}

const selectedBadgeStyle = {
  width: 30,
  height: 30,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: 950
}

export default ProblemSelectionScreen
