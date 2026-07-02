import { styles, colors } from './gameStyles'
import { ActionButton, MetricCard } from './ui'

function PlayGameScreen({
  round,
  aiCards,
  selectedAiCards,
  flippedProblem,
  flippedAiCards,
  userExplanation,
  wordCount,
  explanationTooLong,
  hasSubmittedExplanation,
  aiLoading,
  aiError,
  hintMessage,
  showHintConfirm,
  glaCoinBalance,
  certificationProgress,
  averageScore,
  fullName,
  card1,
  card2,
  isChanging,
  onToggleProblemFlip,
  onToggleAiCard,
  onRemoveSelectedAiCard,
  onToggleAiFlip,
  onDragStart,
  onDrop,
  onExplanationChange,
  onSubmit,
  onShowHintConfirm,
  onCancelHint,
  onConfirmHint,
  onOpenLatestScore,
  onNextRound,
  latestAttempt,
  onGoToSelection
}) {
  if (!round.card) {
    return (
      <div style={styles.panel}>
        <p style={styles.eyebrow}>No active game yet</p>
        <h1 style={styles.sectionTitle}>Choose your problem cards first.</h1>
        <div style={styles.centerButtonRow}>
          <ActionButton onClick={onGoToSelection}>Go to Problem Selection</ActionButton>
        </div>
      </div>
    )
  }

  return (
    <section className="gameSection" style={{ width: '100%', margin: '0 auto' }}>
      <div className="gameShell" style={gameShellStyle}>
        <div
          className="gameLeft"
          style={{
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? 'translateY(14px)' : 'translateY(0)',
            transition: 'all 0.45s ease'
          }}
        >
          <p style={styles.eyebrow}>Welcome back, {fullName}</p>
          <h1 style={styles.sectionTitle}>Build your AI solution.</h1>
          <p style={styles.paragraph}>First choose your AI cards, then explain why those cards can solve the problem.</p>

          <div style={currentPromptStyle}>
            <p style={{ ...styles.eyebrow, color: colors.lightGold }}>Current Problem</p>
            <h3 style={promptTitleStyle}>{round.card.title}</h3>
            <p style={promptTextStyle}>{round.card.problem}</p>
            <p style={promptQuestionStyle}>{round.card.think_about_it}</p>
          </div>

          <div className="gameStats" style={styles.metricGrid}>
            <MetricCard title="GLA Coin" value={glaCoinBalance} />
            <MetricCard title="Completed" value={`${certificationProgress}/10`} />
            <MetricCard title="Average" value={`${averageScore}%`} />
          </div>

          <button onClick={onToggleProblemFlip} style={transparentCardButtonStyle} type="button">
            <div className="problemCardVisual" style={problemCardVisualStyle}>
              <img src={flippedProblem ? card1 : card2} alt="Problem card design" style={cardImageStyle} />
              <div
                style={{
                  ...cardOverlayStyle,
                  background: flippedProblem
                    ? 'linear-gradient(135deg, rgba(3, 8, 20, 0.82), rgba(8, 22, 46, 0.74))'
                    : 'linear-gradient(180deg, rgba(3, 8, 20, 0.08), rgba(3, 8, 20, 0.72))'
                }}
              ></div>
              <div style={cardTextOverlayStyle}>
                {flippedProblem ? (
                  <>
                    <p style={{ ...styles.eyebrow, color: colors.lightGold }}>Problem Card Back</p>
                    <h3 style={largeCardTitleStyle}>GRIT Lab Africa</h3>
                    <p style={largeCardTextStyle}>Click again to view the current problem card.</p>
                  </>
                ) : (
                  <>
                    <p style={{ ...styles.eyebrow, color: colors.lightGold }}>{round.card.problem_type}</p>
                    <h3 style={largeCardTitleStyle}>{round.card.title}</h3>
                    <p style={largeCardTextStyle}>{round.card.problem}</p>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>

        <div
          className="gameRight"
          style={{
            display: 'grid',
            gap: '18px',
            opacity: isChanging ? 0 : 1,
            transform: isChanging ? 'translateY(14px)' : 'translateY(0)',
            transition: 'all 0.45s ease'
          }}
        >
          <div style={styles.panelInner}>
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.eyebrow}>Step 1</p>
                <h3 style={styles.smallCardTitle}>Choose your AI cards first.</h3>
              </div>
              <strong style={{ color: colors.brown }}>{selectedAiCards.length}/3 selected</strong>
            </div>

            <div style={aiLibraryStyle}>
              {aiCards.map((card) => {
                const selected = selectedAiCards.some((selectedCard) => selectedCard.id === card.id)
                const flipped = flippedAiCards.includes(card.id)
                return (
                  <div key={card.id} style={{ display: 'grid', gap: '8px' }}>
                    <button
                      type="button"
                      draggable={!hasSubmittedExplanation}
                      onDragStart={(event) => onDragStart(event, card.id)}
                      onClick={() => onToggleAiCard(card)}
                      aria-pressed={selected}
                      style={{
                        ...aiCardStyle,
                        border: selected ? '2px solid rgba(154, 106, 34, 0.78)' : '1px solid rgba(139, 92, 40, 0.18)',
                        background: selected
                          ? 'linear-gradient(135deg, rgba(154, 106, 34, 0.92), rgba(92, 53, 18, 0.96))'
                          : 'rgba(255, 255, 255, 0.68)',
                        color: selected ? colors.cream : colors.dark
                      }}
                    >
                      {flipped ? (
                        <>
                          <p style={{ ...styles.eyebrow, color: selected ? colors.lightGold : colors.gold }}>AI Card Back</p>
                          <h3 style={{ margin: 0 }}>GRIT Lab Africa</h3>
                          <p style={{ margin: '10px 0 0', lineHeight: '1.5' }}>Golden AI capability card.</p>
                        </>
                      ) : (
                        <>
                          <p style={{ ...styles.eyebrow, color: selected ? colors.lightGold : colors.gold }}>{card.type}</p>
                          <h3 style={{ margin: '0 0 8px', lineHeight: '1.2' }}>{card.title}</h3>
                          <p style={{ margin: 0, lineHeight: '1.5' }}>{card.canDo}</p>
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => onToggleAiFlip(card.id)} style={miniButtonStyle}>
                      {flipped ? 'Show Front' : 'Flip Card'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            style={{
              ...solutionBoardStyle,
              background: selectedAiCards.length > 0
                ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.9), rgba(244, 210, 138, 0.42))'
                : 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <p style={styles.eyebrow}>Step 2</p>
            <h3 style={styles.smallCardTitle}>Selected AI solution cards.</h3>
            <div style={selectedAiGridStyle}>
              {selectedAiCards.length === 0 && <div style={emptyDropStyle}>Choose or drag up to 3 AI cards here.</div>}
              {selectedAiCards.map((card) => (
                <button key={card.id} type="button" onClick={() => onRemoveSelectedAiCard(card.id)} style={selectedAiCardStyle}>
                  <p style={{ ...styles.eyebrow, color: colors.lightGold }}>Selected AI</p>
                  <strong>{card.title}</strong>
                  <p style={selectedAiTypeStyle}>{card.type}</p>
                </button>
              ))}
            </div>
          </div>

          <div style={styles.panelInner}>
            <div style={styles.rowBetween}>
              <div>
                <p style={styles.eyebrow}>Step 3</p>
                <h3 style={styles.smallCardTitle}>Explain why you chose those AI cards.</h3>
              </div>
              <strong style={{ color: explanationTooLong ? colors.danger : colors.brown }}>{wordCount}/100 words</strong>
            </div>

            <textarea
              value={userExplanation}
              onChange={(event) => onExplanationChange(event.target.value)}
              disabled={hasSubmittedExplanation || aiLoading}
              placeholder="Explain why your selected AI card(s) can solve this problem in a realistic African context..."
              style={{
                ...textAreaStyle,
                border: explanationTooLong ? '2px solid rgba(185, 28, 28, 0.5)' : '1px solid rgba(139, 92, 40, 0.22)'
              }}
            />
            {explanationTooLong && <p style={styles.dangerText}>Your explanation is too long. Please keep it to 100 words or less.</p>}
            {aiError && <p style={styles.dangerText}>{aiError}</p>}

            <div style={styles.centerButtonRow}>
              <ActionButton
                onClick={onSubmit}
                disabled={selectedAiCards.length === 0 || !userExplanation.trim() || explanationTooLong || hasSubmittedExplanation || aiLoading}
              >
                {aiLoading ? 'Scoring with DeepSeek...' : 'Submit Solution'}
              </ActionButton>
              <ActionButton variant="secondary" onClick={onShowHintConfirm} disabled={aiLoading}>Request Hint - 20 GLA</ActionButton>
              {latestAttempt && <ActionButton variant="secondary" onClick={onOpenLatestScore}>View Latest Score</ActionButton>}
              <ActionButton variant="secondary" onClick={onNextRound}>Next Problem</ActionButton>
            </div>

            {showHintConfirm && (
              <div style={hintBoxStyle}>
                <h3 style={styles.smallCardTitle}>Confirm hint purchase</h3>
                <p style={styles.smallCardText}>A hint costs 20 GLA coin. Your current balance is <strong>{glaCoinBalance}</strong> GLA coin.</p>
                <div style={styles.centerButtonRow}>
                  <ActionButton onClick={onConfirmHint}>Yes, use 20 GLA coin</ActionButton>
                  <ActionButton variant="secondary" onClick={onCancelHint}>Cancel</ActionButton>
                </div>
              </div>
            )}

            {hintMessage && (
              <div style={hintBoxStyle}>
                <p style={styles.eyebrow}>Hint</p>
                <p style={styles.smallCardText}>{hintMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const gameShellStyle = {
  minHeight: '720px',
  padding: '34px',
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 0.85fr) minmax(320px, 1.15fr)',
  gap: '28px',
  alignItems: 'start',
  borderRadius: '38px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(232, 214, 170, 0.72))',
  border: '1px solid rgba(139, 92, 40, 0.22)',
  boxShadow: '0 30px 80px rgba(80, 52, 20, 0.2)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  overflow: 'hidden'
}

const currentPromptStyle = { marginTop: '18px', padding: '22px', borderRadius: '26px', background: 'linear-gradient(135deg, rgba(92, 53, 18, 0.96), rgba(154, 106, 34, 0.9))', color: colors.cream, boxShadow: '0 18px 42px rgba(92, 53, 18, 0.22)' }
const promptTitleStyle = { margin: '0 0 12px', fontSize: '1.25rem', lineHeight: '1.35' }
const promptTextStyle = { margin: '0 0 12px', lineHeight: '1.6', color: 'rgba(255, 248, 235, 0.9)' }
const promptQuestionStyle = { margin: '0', lineHeight: '1.6', color: colors.lightGold, fontWeight: '750' }
const transparentCardButtonStyle = { width: '100%', border: '0', padding: '0', background: 'transparent', cursor: 'pointer', textAlign: 'left', marginTop: '20px' }
const problemCardVisualStyle = { position: 'relative', minHeight: '510px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 28px 60px rgba(0,0,0,0.26)', transform: 'rotate(-1.5deg)' }
const cardImageStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
const cardOverlayStyle = { position: 'absolute', inset: 0 }
const cardTextOverlayStyle = { position: 'absolute', left: '24px', right: '24px', bottom: '28px', color: colors.cream }
const largeCardTitleStyle = { margin: '0 0 12px', fontSize: '1.75rem', lineHeight: '1.1' }
const largeCardTextStyle = { margin: '0', color: 'rgba(255,248,235,0.88)', lineHeight: '1.65' }
const solutionBoardStyle = { padding: '24px', borderRadius: '28px', border: '2px dashed rgba(154,106,34,0.38)', boxShadow: '0 18px 42px rgba(80,52,20,0.12)' }
const selectedAiGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginTop: '16px' }
const emptyDropStyle = { padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.58)', color: colors.brown2, lineHeight: '1.55' }
const selectedAiCardStyle = { padding: '16px', border: '1px solid rgba(154,106,34,0.3)', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(154,106,34,0.96), rgba(92,53,18,0.96))', color: colors.cream, textAlign: 'left', cursor: 'pointer' }
const selectedAiTypeStyle = { margin: '8px 0 0', lineHeight: '1.5' }
const textAreaStyle = { width: '100%', minHeight: '150px', marginTop: '14px', padding: '16px', borderRadius: '20px', resize: 'vertical', background: 'rgba(255,255,255,0.78)', color: colors.dark, outline: 'none', lineHeight: '1.6' }
const hintBoxStyle = { marginTop: '18px', padding: '18px', borderRadius: '22px', background: 'rgba(244,210,138,0.24)', border: '1px solid rgba(154,106,34,0.22)' }
const aiLibraryStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', maxHeight: '620px', overflowY: 'auto', paddingRight: '6px', marginTop: '16px' }
const aiCardStyle = { minHeight: '190px', padding: '16px', borderRadius: '22px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 14px 30px rgba(80,52,20,0.1)' }
const miniButtonStyle = { border: '1px solid rgba(139,92,40,0.18)', borderRadius: '999px', padding: '8px 12px', cursor: 'pointer', background: 'rgba(255,255,255,0.65)', color: colors.brown, fontWeight: '800', fontSize: '0.82rem' }

export default PlayGameScreen
