import { useEffect, useMemo, useState } from 'react'
import { gradeExplanation } from '../services/deepseekService'
import problemCards from '../assets/json/grit_lab_africa_problem_cards.json'
import card1 from '../assets/images/card1.jpeg'
import card2 from '../assets/images/card2.jpeg'
import { aiCards } from '../data/aiCards'
import GameSidebar from './game/GameSidebar'
import JourneyTabs from './game/JourneyTabs'
import GameGuideScreen from './game/GameGuideScreen'
import ProblemSelectionScreen from './game/ProblemSelectionScreen'
import PlayGameScreen from './game/PlayGameScreen'
import ScoringFeedbackScreen from './game/ScoringFeedbackScreen'
import RetryAttemptScreen from './game/RetryAttemptScreen'
import PlayerDashboardScreen from './game/PlayerDashboardScreen'
import CoinHistoryScreen from './game/CoinHistoryScreen'
import CertificateScreen from './game/CertificateScreen'
import PlayerProfileScreen from './game/PlayerProfileScreen'
import AchievementsBadgesScreen from './game/AchievementsBadgesScreen'
import LevelsProgressionScreen from './game/LevelsProgressionScreen'
import LeaderboardScreen from './game/LeaderboardScreen'
import HintCenterScreen from './game/HintCenterScreen'
import AnalyticsDashboardScreen from './game/AnalyticsDashboardScreen'
import MultilingualScreen from './game/MultilingualScreen'
import AccessibilityScreen from './game/AccessibilityScreen'
import CardDesignShowcaseScreen from './game/CardDesignShowcaseScreen'
import MultiplayerHubScreen from './game/MultiplayerHubScreen'
import RewardsLaunchScreen from './game/RewardsLaunchScreen'

function createRound(cards) {
  if (!cards.length) return { card: null }
  return { card: cards[Math.floor(Math.random() * cards.length)] }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function toSafeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function getAiResultScore(result) {
  if (!result) return 0
  if (result.total_score !== undefined) return toSafeNumber(result.total_score)
  if (result.totalScore !== undefined) return toSafeNumber(result.totalScore)
  if (result.score !== undefined) return toSafeNumber(result.score)
  if (result.GLA_coin_earned !== undefined) return toSafeNumber(result.GLA_coin_earned)
  if (result.grade !== undefined) return Math.round(toSafeNumber(result.grade) * 10)
  return 0
}

function normaliseAiResult(result) {
  const totalScore = Math.max(0, Math.min(100, Math.round(getAiResultScore(result))))
  return {
    totalScore,
    glaCoinEarned: toSafeNumber(result?.GLA_coin_earned || result?.glaCoinEarned || result?.gla_coin_earned || totalScore),
    overallFeedback: result?.feedback?.overall || result?.overallFeedback || (typeof result?.feedback === 'string' ? result.feedback : '') || 'DeepSeek has reviewed the idea. Use the feedback to improve your solution.',
    improvement: result?.feedback?.improvement || result?.improvement || 'Make the explanation more specific about how the solution will work in real life.',
    subScores: result?.sub_scores || result?.subScores || {}
  }
}

function generateBasicHint(problemCard) {
  if (!problemCard) return 'Choose AI cards that connect clearly to the problem.'
  return `Look at the problem type: "${problemCard.problem_type}". Choose one AI card that understands the problem, one that helps people access support, and one that makes the solution practical in the community.`
}

function GameHome({ currentUser }) {
  const cards = problemCards.cards || []

  const [screen, setScreen] = useState('intro')
  const [selectedProblemIds, setSelectedProblemIds] = useState([])
  const [round, setRound] = useState(() => createRound([]))
  const [selectedAiCards, setSelectedAiCards] = useState([])
  const [flippedProblem, setFlippedProblem] = useState(false)
  const [flippedAiCards, setFlippedAiCards] = useState([])
  const [userExplanation, setUserExplanation] = useState('')
  const [hasSubmittedExplanation, setHasSubmittedExplanation] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [attempts, setAttempts] = useState([])
  const [glaCoinBalance, setGlaCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState([])
  const [hintMessage, setHintMessage] = useState('')
  const [showHintConfirm, setShowHintConfirm] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState({ highContrast: false, lowBandwidth: false, keyboardMode: true, screenReaderLabels: true, mobileOptimized: true })

  const fullName = useMemo(() => currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Player', [currentUser])
  const firstName = fullName.split(' ')[0]
  const email = currentUser?.email || ''
  const activeProblemStack = cards.filter((card) => selectedProblemIds.includes(card.id))
  const wordCount = countWords(userExplanation)
  const explanationTooLong = wordCount > 100

  const completedProblemScores = useMemo(() => {
    const scoresByProblem = {}
    attempts.forEach((attempt) => {
      const previousBest = scoresByProblem[attempt.problemId] || 0
      scoresByProblem[attempt.problemId] = Math.max(previousBest, attempt.totalScore)
    })
    return scoresByProblem
  }, [attempts])

  const completedProblems = Object.keys(completedProblemScores).length
  const averageScore = completedProblems > 0 ? Math.round(Object.values(completedProblemScores).reduce((total, score) => total + score, 0) / completedProblems) : 0
  const certificateUnlocked = completedProblems >= 10 && averageScore >= 75
  const certificationProgress = Math.min(10, completedProblems)

  const attemptStatsByProblem = useMemo(() => {
    const stats = {}
    attempts.forEach((attempt) => {
      if (!stats[attempt.problemId]) {
        stats[attempt.problemId] = { problemId: attempt.problemId, problemTitle: attempt.problemTitle, first: attempt, latest: attempt, best: attempt, count: 1 }
        return
      }
      const currentStats = stats[attempt.problemId]
      currentStats.latest = attempt
      currentStats.count += 1
      if (attempt.totalScore > currentStats.best.totalScore) currentStats.best = attempt
    })
    return stats
  }, [attempts])

  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null
  const currentProblemAttemptStats = round.card ? attemptStatsByProblem[round.card.id] || null : null
  const latestAttemptProblemStats = latestAttempt ? attemptStatsByProblem[latestAttempt.problemId] || null : null

  const bestScoringProblems = useMemo(() => Object.values(attemptStatsByProblem).map((stats) => ({ problemId: stats.problemId, problemTitle: stats.problemTitle, bestScore: stats.best.totalScore, bestAttempt: stats.best })).sort((a, b) => b.bestScore - a.bestScore).slice(0, 5), [attemptStatsByProblem])
  const completedProblemRows = useMemo(() => Object.values(attemptStatsByProblem).map((stats) => ({ id: stats.problemId, problemTitle: stats.problemTitle, bestScore: stats.best.totalScore, latestScore: stats.latest.totalScore, attempts: stats.count })), [attemptStatsByProblem])

  const totalGlaCoinEarned = coinTransactions.filter((transaction) => transaction.type === 'earned').reduce((total, transaction) => total + transaction.amount, 0)
  const glaCoinSpentOnHints = coinTransactions.filter((transaction) => transaction.type === 'spent').reduce((total, transaction) => total + transaction.amount, 0)
  const certificateId = `GLA-AI-${String(fullName).slice(0, 3).toUpperCase()}-${completedProblems}-${averageScore}`.replace(/\s/g, '')
  const issueDate = certificateUnlocked ? new Date().toLocaleDateString() : 'Pending'

  function resetRound() {
    setSelectedAiCards([])
    setFlippedProblem(false)
    setFlippedAiCards([])
    setUserExplanation('')
    setHasSubmittedExplanation(false)
    setAiError('')
    setAiLoading(false)
    setHintMessage('')
    setShowHintConfirm(false)
  }

  function startGame() {
    const stack = cards.filter((card) => selectedProblemIds.includes(card.id))
    if (stack.length < 10) {
      setScreen('select')
      return
    }
    setRound(createRound(stack))
    resetRound()
    setScreen('play')
  }

  function handleNextRound() {
    if (activeProblemStack.length < 10) {
      setScreen('select')
      return
    }
    setIsChanging(true)
    setTimeout(() => {
      setRound(createRound(activeProblemStack))
      resetRound()
      setScreen('play')
      setIsChanging(false)
    }, 400)
  }

  function handleRetryCurrentProblem() {
    resetRound()
    setScreen('play')
  }

  function handleSidebarNavigation(value) {
    if (value === 'journey') setScreen('intro')
    else setScreen(value)
    setSidebarOpen(false)
  }

  function handleJourneyNavigation(value) {
    if (value === 'play') {
      if (!round.card) startGame()
      else setScreen('play')
      return
    }
    if (value === 'score' && !latestAttempt) return
    setScreen(value)
  }

  function toggleProblemCard(cardId) {
    setSelectedProblemIds((previousIds) => previousIds.includes(cardId) ? previousIds.filter((id) => id !== cardId) : [...previousIds, cardId])
  }

  function toggleAiCard(aiCard) {
    const alreadySelected = selectedAiCards.some((card) => card.id === aiCard.id)
    if (alreadySelected) {
      setSelectedAiCards((previousCards) => previousCards.filter((card) => card.id !== aiCard.id))
      return
    }
    if (selectedAiCards.length >= 3 || hasSubmittedExplanation) return
    setSelectedAiCards((previousCards) => [...previousCards, aiCard])
  }

  function removeSelectedAiCard(cardId) {
    if (hasSubmittedExplanation) return
    setSelectedAiCards((previousCards) => previousCards.filter((card) => card.id !== cardId))
  }

  function handleDragStart(event, aiCardId) {
    event.dataTransfer.setData('text/plain', String(aiCardId))
  }

  function handleDrop(event) {
    event.preventDefault()
    const aiCardId = Number(event.dataTransfer.getData('text/plain'))
    const aiCard = aiCards.find((card) => card.id === aiCardId)
    if (aiCard) toggleAiCard(aiCard)
  }

  function toggleAiFlip(cardId) {
    setFlippedAiCards((previousIds) => previousIds.includes(cardId) ? previousIds.filter((id) => id !== cardId) : [...previousIds, cardId])
  }

  async function submitExplanation() {
    const trimmedExplanation = userExplanation.trim()
    if (!round.card) return setAiError('No problem card is active. Please start the game first.')
    if (selectedAiCards.length === 0) return setAiError('Please select at least one AI card before submitting.')
    if (selectedAiCards.length > 3) return setAiError('You can only select up to 3 AI cards.')
    if (!trimmedExplanation) return setAiError('Please write your explanation before submitting.')
    if (explanationTooLong) return setAiError('Your explanation must be 100 words or less.')
    if (hasSubmittedExplanation) return
    setAiError('')
    setAiLoading(true)
    try {
      const selectedSolutionForCurrentBackend = { cardId: selectedAiCards[0].id, title: selectedAiCards.map((card) => card.title).join(' + '), description: selectedAiCards.map((card) => `${card.title}: ${card.canDo}`).join('\n') }
      const result = await gradeExplanation({ problemCard: round.card, selectedSolution: selectedSolutionForCurrentBackend, selectedAiCards, userExplanation: trimmedExplanation })
      const normalisedResult = normaliseAiResult(result)
      const createdAt = new Date().toLocaleString()
      const attemptNumber = attempts.filter((attempt) => attempt.problemId === round.card.id).length + 1
      const balanceAfter = glaCoinBalance + normalisedResult.glaCoinEarned
      const attemptRecord = { id: Date.now(), problemId: round.card.id, problemTitle: round.card.title, selectedAiCards, explanation: trimmedExplanation, totalScore: normalisedResult.totalScore, glaCoinEarned: normalisedResult.glaCoinEarned, feedback: normalisedResult.overallFeedback, improvement: normalisedResult.improvement, subScores: normalisedResult.subScores, attemptNumber, createdAt }
      const coinTransaction = { id: `earned-${Date.now()}`, type: 'earned', amount: normalisedResult.glaCoinEarned, balanceAfter, reason: 'DeepSeek score reward', problemId: round.card.id, problemTitle: round.card.title, createdAt }
      setHasSubmittedExplanation(true)
      setGlaCoinBalance(balanceAfter)
      setAttempts((previousAttempts) => [...previousAttempts, attemptRecord])
      setCoinTransactions((previousTransactions) => [coinTransaction, ...previousTransactions])
      setScreen('score')
    } catch (err) {
      setAiError(err.message || 'DeepSeek could not score the explanation.')
    } finally {
      setAiLoading(false)
    }
  }

  function confirmHintPurchase() {
    if (glaCoinBalance < 20) {
      setHintMessage('You need at least 20 GLA coin to request a hint.')
      setShowHintConfirm(false)
      return
    }
    const createdAt = new Date().toLocaleString()
    const balanceAfter = glaCoinBalance - 20
    setGlaCoinBalance(balanceAfter)
    setCoinTransactions((previousTransactions) => [{ id: `spent-${Date.now()}`, type: 'spent', amount: 20, balanceAfter, reason: 'Hint request', problemId: round.card?.id || null, problemTitle: round.card?.title || 'No active problem', createdAt }, ...previousTransactions])
    setHintMessage(generateBasicHint(round.card))
    setShowHintConfirm(false)
  }

  function updateAccessibilitySetting(key, value) {
    setAccessibilitySettings((previous) => ({ ...previous, [key]: value }))
  }

  useEffect(() => {
    const originalOverflow = document.body.style.overflow

    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [sidebarOpen])

  const journeyActive = ['intro', 'select', 'play', 'score'].includes(screen)

  return (
    <section style={gameHomeWrapperStyle} className={accessibilitySettings.highContrast ? 'glaHighContrast' : ''}>
      <style>{pageCss}</style>
      <div className="glaGamePageHeader">
        <button type="button" onClick={() => setSidebarOpen(true)} className="glaMenuButton"><span className="glaMenuIcon">☰</span> Menu</button>
        <p className="glaPageTitle">GRIT Lab Africa AI for SDGs Card Game</p>
      </div>
      <div className={`glaSidebarOverlay ${sidebarOpen ? 'open' : ''}`}>
        <button type="button" aria-label="Close menu" className="glaSidebarBackdrop" onClick={() => setSidebarOpen(false)}></button>
        <div className="glaSidebarDrawer">
          <GameSidebar screen={screen} onNavigate={handleSidebarNavigation} onClose={() => setSidebarOpen(false)} selectedProblemCount={selectedProblemIds.length} completedProblems={completedProblems} certificationProgress={certificationProgress} averageScore={averageScore} glaCoinBalance={glaCoinBalance} certificateUnlocked={certificateUnlocked} latestAttempt={latestAttempt} />
        </div>
      </div>
      <main className="glaGameContent">
        {journeyActive && <JourneyTabs screen={screen} selectedProblemCount={selectedProblemIds.length} roundActive={Boolean(round.card)} latestAttempt={latestAttempt} onNavigate={handleJourneyNavigation} />}
        {screen === 'intro' && <GameGuideScreen firstName={firstName} onChooseProblems={() => setScreen('select')} />}
        {screen === 'select' && <ProblemSelectionScreen cards={cards} selectedProblemIds={selectedProblemIds} onToggleProblem={toggleProblemCard} onStartGame={startGame} />}
        {screen === 'play' && <PlayGameScreen round={round} aiCards={aiCards} selectedAiCards={selectedAiCards} flippedProblem={flippedProblem} flippedAiCards={flippedAiCards} userExplanation={userExplanation} wordCount={wordCount} explanationTooLong={explanationTooLong} hasSubmittedExplanation={hasSubmittedExplanation} aiLoading={aiLoading} aiError={aiError} hintMessage={hintMessage} showHintConfirm={showHintConfirm} glaCoinBalance={glaCoinBalance} certificationProgress={certificationProgress} averageScore={averageScore} fullName={fullName} card1={card1} card2={card2} isChanging={isChanging} onToggleProblemFlip={() => setFlippedProblem(!flippedProblem)} onToggleAiCard={toggleAiCard} onRemoveSelectedAiCard={removeSelectedAiCard} onToggleAiFlip={toggleAiFlip} onDragStart={handleDragStart} onDrop={handleDrop} onExplanationChange={setUserExplanation} onSubmit={submitExplanation} onShowHintConfirm={() => setShowHintConfirm(true)} onCancelHint={() => setShowHintConfirm(false)} onConfirmHint={confirmHintPurchase} onOpenLatestScore={() => setScreen('score')} onNextRound={handleNextRound} latestAttempt={latestAttempt} onGoToSelection={() => setScreen('select')} />}
        {screen === 'score' && <ScoringFeedbackScreen currentAttempt={latestAttempt} currentProblem={round.card} currentProblemAttemptStats={latestAttemptProblemStats} glaCoinBalance={glaCoinBalance} onOpenRetry={() => setScreen('retry')} onNextProblem={handleNextRound} onOpenDashboard={() => setScreen('dashboard')} onOpenCoinHistory={() => setScreen('coins')} />}
        {screen === 'retry' && <RetryAttemptScreen currentProblem={round.card} currentProblemAttemptStats={currentProblemAttemptStats} onStartRetry={handleRetryCurrentProblem} onCancel={() => setScreen(latestAttempt ? 'score' : 'play')} onNextProblem={handleNextRound} />}
        {screen === 'dashboard' && <PlayerDashboardScreen firstName={firstName} selectedProblemStack={activeProblemStack} completedProblemRows={completedProblemRows} completedProblems={completedProblems} averageScore={averageScore} certificateUnlocked={certificateUnlocked} certificationProgress={certificationProgress} glaCoinBalance={glaCoinBalance} totalGlaCoinEarned={totalGlaCoinEarned} glaCoinSpentOnHints={glaCoinSpentOnHints} attempts={attempts} attemptStatsByProblem={attemptStatsByProblem} bestScoringProblems={bestScoringProblems} latestAttempt={latestAttempt} onOpenCoinHistory={() => setScreen('coins')} onOpenLatestScore={() => setScreen(latestAttempt ? 'score' : 'play')} onOpenCertificate={() => setScreen('certificate')} onOpenProfile={() => setScreen('profile')} />}
        {screen === 'coins' && <CoinHistoryScreen glaCoinBalance={glaCoinBalance} totalGlaCoinEarned={totalGlaCoinEarned} glaCoinSpentOnHints={glaCoinSpentOnHints} coinTransactions={coinTransactions} onBackToDashboard={() => setScreen('dashboard')} />}
        {screen === 'certificate' && <CertificateScreen fullName={fullName} completedProblems={completedProblems} averageScore={averageScore} certificateUnlocked={certificateUnlocked} certificateId={certificateId} issueDate={issueDate} onBackToDashboard={() => setScreen('dashboard')} />}
        {screen === 'profile' && <PlayerProfileScreen fullName={fullName} email={email} selectedProblemStack={activeProblemStack} completedProblemRows={completedProblemRows} attempts={attempts} glaCoinBalance={glaCoinBalance} certificateUnlocked={certificateUnlocked} />}
        {screen === 'achievements' && <AchievementsBadgesScreen attempts={attempts} completedProblems={completedProblems} totalGlaCoinEarned={totalGlaCoinEarned} />}
        {screen === 'levels' && <LevelsProgressionScreen totalGlaCoinEarned={totalGlaCoinEarned} completedProblems={completedProblems} averageScore={averageScore} />}
        {screen === 'leaderboard' && <LeaderboardScreen fullName={fullName} averageScore={averageScore} completedProblems={completedProblems} totalGlaCoinEarned={totalGlaCoinEarned} />}
        {screen === 'hints' && <HintCenterScreen coinTransactions={coinTransactions} glaCoinSpentOnHints={glaCoinSpentOnHints} />}
        {screen === 'analytics' && <AnalyticsDashboardScreen cards={cards} attempts={attempts} selectedProblemStack={activeProblemStack} coinTransactions={coinTransactions} completedProblems={completedProblems} certificateUnlocked={certificateUnlocked} />}
        {screen === 'multilingual' && <MultilingualScreen />}
        {screen === 'accessibility' && <AccessibilityScreen settings={accessibilitySettings} onChange={updateAccessibilitySetting} />}
        {screen === 'designs' && <CardDesignShowcaseScreen problemCardBack={card2} aiCardBack={card1} cards={cards} aiCards={aiCards} />}
        {screen === 'multiplayer' && <MultiplayerHubScreen />}
        {screen === 'rewards' && <RewardsLaunchScreen />}
      </main>
    </section>
  )
}

const gameHomeWrapperStyle = { width: 'min(1450px, calc(100vw - 48px))', margin: '34px auto 0' }
const pageCss = `
  .glaGamePageHeader { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
  .glaMenuButton { border:0; border-radius:999px; padding:12px 18px; display:inline-flex; align-items:center; gap:10px; cursor:pointer; background:linear-gradient(135deg,#9a6a22,#5c3512); color:#fff8eb; font-weight:900; box-shadow:0 16px 34px rgba(92,53,18,0.22); }
  .glaMenuIcon { font-size:1.15rem; line-height:1; }
  .glaPageTitle { margin:0; color:#5c3512; font-size:0.9rem; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; }
  .glaSidebarOverlay { position:fixed; inset:0; z-index:9999; pointer-events:none; overflow:hidden; }
  .glaSidebarOverlay.open { pointer-events:auto; }
  .glaSidebarBackdrop { position:absolute; inset:0; border:0; padding:0; cursor:pointer; background:rgba(20,13,8,0); transition:background 0.28s ease; }
  .glaSidebarOverlay.open .glaSidebarBackdrop { background:rgba(20,13,8,0.42); }
  .glaSidebarDrawer { position:fixed; top:0; left:0; bottom:0; height:100dvh; width:min(360px, 90vw); transform:translateX(-105%); opacity:0; transition:transform 0.32s cubic-bezier(0.2,0.8,0.2,1), opacity 0.24s ease; will-change:transform; }
  .glaSidebarOverlay.open .glaSidebarDrawer { transform:translateX(0); opacity:1; }
  .glaGameContent { width:100%; min-width:0; }
  .glaJourneyTabs { display:grid; grid-template-columns:repeat(4,minmax(140px,1fr)); gap:10px; margin-bottom:18px; padding:10px; border-radius:26px; background:rgba(255,255,255,0.58); border:1px solid rgba(139,92,40,0.16); box-shadow:0 18px 42px rgba(80,52,20,0.1); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); }
  .glaJourneyTabButton { border:1px solid rgba(139,92,40,0.14); border-radius:20px; padding:13px 14px; text-align:left; cursor:pointer; background:rgba(255,255,255,0.62); color:#5c3512; transition:transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
  .glaJourneyTabButton:hover { transform:translateY(-2px); border-color:rgba(154,106,34,0.35); box-shadow:0 14px 28px rgba(80,52,20,0.12); }
  .glaJourneyTabButton.active { background:linear-gradient(135deg,#9a6a22,#5c3512); color:#fff8eb; border-color:rgba(244,210,138,0.4); box-shadow:0 18px 36px rgba(92,53,18,0.22); }
  .glaJourneyTabButton.disabled { opacity:0.45; cursor:default; }
  .glaJourneyTabButton.disabled:hover { transform:none; box-shadow:none; }
  .glaJourneyTabLabel { display:block; font-size:0.92rem; font-weight:900; line-height:1.2; }
  .glaJourneyTabDescription { display:block; margin-top:4px; font-size:0.72rem; font-weight:750; color:rgba(92,53,18,0.65); }
  .glaJourneyTabButton.active .glaJourneyTabDescription { color:rgba(255,248,235,0.72); }
  .glaHighContrast { filter: contrast(1.06); }
  @media (max-width: 980px) { .glaJourneyTabs { grid-template-columns:repeat(2,minmax(0,1fr)); } .gameShell { grid-template-columns: 1fr !important; } }
  @media (max-width: 520px) { .glaGamePageHeader { align-items:flex-start; flex-direction:column; } .glaJourneyTabs { grid-template-columns:1fr; } }
`

export default GameHome
