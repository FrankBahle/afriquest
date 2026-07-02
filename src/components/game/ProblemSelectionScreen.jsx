import { styles } from './gameStyles'
import { ActionButton, MetricCard, Pill, SectionHeader } from './ui'

function ProblemSelectionScreen({ cards, selectedProblemIds, onToggleProblem, onStartGame }) {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Problem card selection" title="Build your active problem stack.">
        Choose at least 10 problem cards. The game will randomly present cards from this stack. You can choose more than 10 if you want more variety.
      </SectionHeader>

      <div style={styles.metricGrid}>
        <MetricCard title="Selected" value={selectedProblemIds.length} />
        <MetricCard title="Required" value="10" />
        <MetricCard title="Total Cards" value={cards.length} />
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
                border: selected ? '2px solid rgba(154, 106, 34, 0.75)' : '1px solid rgba(139, 92, 40, 0.18)',
                background: selected
                  ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.96), rgba(244, 210, 138, 0.44))'
                  : 'rgba(255, 255, 255, 0.64)',
                boxShadow: selected ? '0 20px 42px rgba(80, 52, 20, 0.18)' : '0 12px 28px rgba(80, 52, 20, 0.08)'
              }}
            >
              <p style={styles.eyebrow}>{selected ? 'Selected' : 'Problem Card'}</p>
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

      <div style={styles.centerButtonRow}>
        <ActionButton onClick={onStartGame} disabled={selectedProblemIds.length < 10}>
          Start Game with Selected Problems
        </ActionButton>
      </div>

      {selectedProblemIds.length < 10 && (
        <p style={{ ...styles.dangerText, textAlign: 'center' }}>
          Select {10 - selectedProblemIds.length} more problem card(s) before starting.
        </p>
      )}
    </div>
  )
}

export default ProblemSelectionScreen
