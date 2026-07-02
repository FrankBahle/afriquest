import { useMemo, useState } from 'react'
import { gradeExplanation } from '../services/deepseekService'
import problemCards from '../assets/json/grit_lab_africa_problem_cards.json'
import card1 from '../assets/images/card1.jpeg'
import card2 from '../assets/images/card2.jpeg'
import PlayerDashboardScreen from './game/PlayerDashboardScreen'

const aiCards = [
  {
    id: 1,
    title: 'AI that Understands Text',
    type: 'Natural Language AI',
    canDo: 'Reads, analyses, summarises and writes text.',
    examples: ['Chatbots', 'Essay helpers', 'Translation tools'],
    question: 'How could this AI help people understand information better?'
  },
  {
    id: 2,
    title: 'AI Career Guidance Chatbot',
    type: 'Guidance AI',
    canDo: 'Guides learners through careers, subjects, study paths and future planning.',
    examples: ['Career advice', 'Subject choices', 'Study pathways'],
    question: 'How could this AI help a learner make better career decisions?'
  },
  {
    id: 3,
    title: 'AI Early-Warning Dashboard',
    type: 'Prediction AI',
    canDo: 'Identifies learners or communities that may need support early.',
    examples: ['Dropout risk alerts', 'Support tracking', 'Performance patterns'],
    question: 'How could early warnings prevent bigger problems later?'
  },
  {
    id: 4,
    title: 'AI Tutoring Assistant',
    type: 'Education AI',
    canDo: 'Provides homework support, revision help and step-by-step explanations.',
    examples: ['Math help', 'Study revision', 'Exam practice'],
    question: 'How could this AI support learners outside the classroom?'
  },
  {
    id: 5,
    title: 'Offline Learning AI Hub',
    type: 'Low-Bandwidth AI',
    canDo: 'Makes learning resources available even with limited internet.',
    examples: ['Offline lessons', 'Cached content', 'Community learning devices'],
    question: 'How could this AI help areas with expensive data?'
  },
  {
    id: 6,
    title: 'AI Device Access Matcher',
    type: 'Resource Matching AI',
    canDo: 'Connects people to shared devices, refurbished devices and tech resources.',
    examples: ['Laptop sharing', 'Device donation', 'Community tech hubs'],
    question: 'How could AI help learners find access to technology?'
  },
  {
    id: 7,
    title: 'AI Image Recognition',
    type: 'Computer Vision AI',
    canDo: 'Recognises objects, damage, safety issues and environmental problems in images.',
    examples: ['Pothole images', 'Illegal dumping photos', 'Broken infrastructure'],
    question: 'How could images help prove that a problem exists?'
  },
  {
    id: 8,
    title: 'AI Waste Collection Tracker',
    type: 'Service Monitoring AI',
    canDo: 'Uses reports and data to detect missed collections and overflowing bins.',
    examples: ['Waste reports', 'Bin tracking', 'Cleanup alerts'],
    question: 'How could AI improve municipal service delivery?'
  },
  {
    id: 9,
    title: 'AI Safety Alert System',
    type: 'Community Safety AI',
    canDo: 'Helps communities report unsafe areas and receive useful safety alerts.',
    examples: ['Crime hotspots', 'Safety messages', 'Community warnings'],
    question: 'How can safety AI help without encouraging harmful surveillance?'
  },
  {
    id: 10,
    title: 'AI Fault Reporting Map',
    type: 'Civic Reporting AI',
    canDo: 'Maps broken infrastructure and helps teams prioritise repairs.',
    examples: ['Streetlights', 'Leaks', 'Road damage'],
    question: 'How could mapping make public problems easier to fix?'
  },
  {
    id: 11,
    title: 'AI Road Damage Reporter',
    type: 'Infrastructure AI',
    canDo: 'Collects road damage reports using photos, locations and repair tracking.',
    examples: ['Potholes', 'Road cracks', 'Repair queues'],
    question: 'How could AI help municipalities know what to fix first?'
  },
  {
    id: 12,
    title: 'AI Route Optimisation',
    type: 'Transport AI',
    canDo: 'Uses transport data to suggest better routes and reduce delays.',
    examples: ['Traffic prediction', 'Route planning', 'Public transport movement'],
    question: 'How could route AI save time and money for commuters?'
  },
  {
    id: 13,
    title: 'AI Public Transport Assistant',
    type: 'Transport Information AI',
    canDo: 'Gives commuters information about routes, stops, taxi availability and safer travel.',
    examples: ['Taxi routes', 'Bus stops', 'Travel guidance'],
    question: 'How could AI make public transport less confusing?'
  },
  {
    id: 14,
    title: 'AI Local Business Finder',
    type: 'Marketplace AI',
    canDo: 'Helps small businesses become visible to nearby customers.',
    examples: ['Business discovery', 'Local adverts', 'Customer matching'],
    question: 'How could AI help small businesses grow?'
  },
  {
    id: 15,
    title: 'AI Entrepreneurship Support',
    type: 'Business Support AI',
    canDo: 'Connects entrepreneurs to mentors, funding information, tools and markets.',
    examples: ['Mentorship', 'Funding alerts', 'Business planning'],
    question: 'How could AI support young business owners?'
  },
  {
    id: 16,
    title: 'AI Financial Literacy Coach',
    type: 'Finance Education AI',
    canDo: 'Teaches budgeting, saving, debt management and basic money skills.',
    examples: ['Budget plans', 'Saving tips', 'Debt education'],
    question: 'How could AI help people make better money decisions?'
  },
  {
    id: 17,
    title: 'AI Food Access Coordinator',
    type: 'Community Support AI',
    canDo: 'Connects households, donors, gardens and local support services.',
    examples: ['Food donations', 'Community gardens', 'Support matching'],
    question: 'How could AI reduce food waste and improve food access?'
  },
  {
    id: 18,
    title: 'AI Mental Health Support Guide',
    type: 'Wellbeing AI',
    canDo: 'Provides safe early emotional support and guidance to proper help.',
    examples: ['Coping tips', 'Support contacts', 'Awareness messages'],
    question: 'How can AI support people without replacing professionals?'
  },
  {
    id: 19,
    title: 'AI Substance Abuse Prevention Tool',
    type: 'Prevention AI',
    canDo: 'Shares prevention resources, support contacts and safe guidance.',
    examples: ['Awareness content', 'Support referrals', 'Youth prevention'],
    question: 'How could AI guide people to safe support?'
  },
  {
    id: 20,
    title: 'AI Health Information Assistant',
    type: 'Health Information AI',
    canDo: 'Provides clear health information and helps users know where to access services.',
    examples: ['Clinic info', 'Health education', 'Prevention advice'],
    question: 'How can AI share health information responsibly?'
  },
  {
    id: 21,
    title: 'AI Queue Management',
    type: 'Service Flow AI',
    canDo: 'Helps clinics and public offices manage queues, appointments and waiting times.',
    examples: ['Clinic queues', 'Office appointments', 'Waiting time updates'],
    question: 'How could AI make public services less frustrating?'
  },
  {
    id: 22,
    title: 'AI Water Leak Monitor',
    type: 'Infrastructure Monitoring AI',
    canDo: 'Helps residents report leaks and helps teams track water loss and repairs.',
    examples: ['Leak reports', 'Water loss alerts', 'Repair tracking'],
    question: 'How could AI help protect water resources?'
  },
  {
    id: 23,
    title: 'AI Power Planning Assistant',
    type: 'Planning AI',
    canDo: 'Helps families, learners and businesses plan around power interruptions.',
    examples: ['Study planning', 'Backup planning', 'Schedule alerts'],
    question: 'How could AI help people prepare for electricity problems?'
  },
  {
    id: 24,
    title: 'AI Safe-Space Mapper',
    type: 'Community Mapping AI',
    canDo: 'Maps safe recreational, learning and creative spaces for young people.',
    examples: ['Youth centres', 'Libraries', 'Community spaces'],
    question: 'How could AI help young people find safe places?'
  },
  {
    id: 25,
    title: 'AI GBV Support Access Tool',
    type: 'Safety Support AI',
    canDo: 'Provides discreet access to awareness, reporting options and emergency support.',
    examples: ['Support contacts', 'Awareness information', 'Safe reporting'],
    question: 'How can AI support safety while protecting privacy?'
  },
  {
    id: 26,
    title: 'AI Opportunity Notifier',
    type: 'Opportunity Matching AI',
    canDo: 'Sends alerts about jobs, scholarships, events and learning opportunities.',
    examples: ['Job alerts', 'Scholarships', 'Bootcamps'],
    question: 'How could AI help people discover opportunities on time?'
  },
  {
    id: 27,
    title: 'AI Civic Reporting Chatbot',
    type: 'Public Participation AI',
    canDo: 'Makes it easier for residents to report local issues and track responses.',
    examples: ['Report forms', 'Chatbot complaints', 'Response tracking'],
    question: 'How could AI help citizens communicate with service providers?'
  },
  {
    id: 28,
    title: 'AI Small Business Analytics',
    type: 'Business Analytics AI',
    canDo: 'Helps business owners track sales, customers and trends.',
    examples: ['Sales dashboards', 'Customer trends', 'Stock planning'],
    question: 'How could AI help small businesses make better decisions?'
  },
  {
    id: 29,
    title: 'AI Future Skills Recommender',
    type: 'Skills Recommendation AI',
    canDo: 'Recommends courses, skills and career paths based on opportunities.',
    examples: ['Course suggestions', 'Skills gap analysis', 'Career pathways'],
    question: 'How could AI help people prepare for future work?'
  },
  {
    id: 30,
    title: 'AI Community Early-Warning System',
    type: 'Social Problem Prediction AI',
    canDo: 'Helps communities identify small problems before they become bigger.',
    examples: ['Risk patterns', 'Community alerts', 'Prevention planning'],
    question: 'How could AI help communities act earlier?'
  }
]

const rubricRows = [
  {
    key: 'ai_card_relevance',
    label: 'AI Card Relevance',
    max: 20,
    meaning: 'Checks if the selected AI cards fit the problem.'
  },
  {
    key: 'combination_strength',
    label: 'Combination Strength',
    max: 15,
    meaning: 'Checks if the selected AI cards work well together.'
  },
  {
    key: 'practical_feasibility',
    label: 'Practical Feasibility',
    max: 15,
    meaning:
      'Checks if the idea can realistically work with available tools and resources.'
  },
  {
    key: 'african_context_and_feasibility',
    label: 'African Context and Feasibility',
    max: 15,
    meaning:
      'Checks if the idea considers cost, access, language, infrastructure and African realities.'
  },
  {
    key: 'sdg_alignment',
    label: 'SDG Alignment',
    max: 15,
    meaning: 'Checks if the idea supports the linked SDG goals.'
  },
  {
    key: 'creativity_and_innovation',
    label: 'Creativity and Innovation',
    max: 10,
    meaning: 'Checks if the idea is useful, original and innovative.'
  },
  {
    key: 'ethical_and_responsible_use',
    label: 'Ethical and Responsible Use',
    max: 10,
    meaning: 'Checks privacy, fairness, safety, inclusion and responsible AI use.'
  }
]

function createRound(cards) {
  if (!cards.length) {
    return {
      card: null
    }
  }

  const randomCard = cards[Math.floor(Math.random() * cards.length)]

  return {
    card: randomCard
  }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function toSafeNumber(value, fallback = 0) {
  const number = Number(value)

  if (Number.isFinite(number)) {
    return number
  }

  return fallback
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
  const totalScore = Math.max(
    0,
    Math.min(100, Math.round(getAiResultScore(result)))
  )

  return {
    totalScore,
    glaCoinEarned: toSafeNumber(
      result?.GLA_coin_earned ||
        result?.glaCoinEarned ||
        result?.gla_coin_earned ||
        totalScore
    ),
    overallFeedback:
      result?.feedback?.overall ||
      result?.overallFeedback ||
      (typeof result?.feedback === 'string' ? result.feedback : '') ||
      'DeepSeek has reviewed the idea. Use the feedback to improve your solution.',
    improvement:
      result?.feedback?.improvement ||
      result?.improvement ||
      'Make the explanation more specific about how the solution will work in real life.',
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
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [attempts, setAttempts] = useState([])
  const [glaCoinBalance, setGlaCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState([])
  const [hintMessage, setHintMessage] = useState('')
  const [showHintConfirm, setShowHintConfirm] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const fullName = useMemo(() => {
    if (currentUser?.displayName) {
      return currentUser.displayName
    }

    if (currentUser?.email) {
      return currentUser.email.split('@')[0]
    }

    return 'Player'
  }, [currentUser])

  const firstName = fullName.split(' ')[0]

  const activeProblemStack = cards.filter((card) =>
    selectedProblemIds.includes(card.id)
  )

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

  const averageScore =
    completedProblems > 0
      ? Math.round(
          Object.values(completedProblemScores).reduce(
            (total, score) => total + score,
            0
          ) / completedProblems
        )
      : 0

  const certificateUnlocked = completedProblems >= 10 && averageScore >= 75
  const certificationProgress = Math.min(10, completedProblems)

  const attemptStatsByProblem = useMemo(() => {
    const stats = {}

    attempts.forEach((attempt) => {
      if (!stats[attempt.problemId]) {
        stats[attempt.problemId] = {
          problemId: attempt.problemId,
          problemTitle: attempt.problemTitle,
          first: attempt,
          latest: attempt,
          best: attempt,
          count: 1
        }

        return
      }

      const currentStats = stats[attempt.problemId]
      currentStats.latest = attempt
      currentStats.count += 1

      if (attempt.totalScore > currentStats.best.totalScore) {
        currentStats.best = attempt
      }
    })

    return stats
  }, [attempts])

  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null

  const currentProblemAttemptStats = round.card
    ? attemptStatsByProblem[round.card.id] || null
    : null

  const latestAttemptProblemStats = latestAttempt
    ? attemptStatsByProblem[latestAttempt.problemId] || null
    : null

  const bestScoringProblems = useMemo(() => {
    return Object.values(attemptStatsByProblem)
      .map((stats) => ({
        problemId: stats.problemId,
        problemTitle: stats.problemTitle,
        bestScore: stats.best.totalScore,
        bestAttempt: stats.best
      }))
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 5)
  }, [attemptStatsByProblem])

  const totalGlaCoinEarned = coinTransactions
    .filter((transaction) => transaction.type === 'earned')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const glaCoinSpentOnHints = coinTransactions
    .filter((transaction) => transaction.type === 'spent')
    .reduce((total, transaction) => total + transaction.amount, 0)

  function startGame() {
    const stack = cards.filter((card) => selectedProblemIds.includes(card.id))

    if (stack.length < 10) {
      return
    }

    setRound(createRound(stack))
    resetRound()
    setScreen('play')
  }

  function resetRound() {
    setSelectedAiCards([])
    setFlippedProblem(false)
    setFlippedAiCards([])
    setUserExplanation('')
    setHasSubmittedExplanation(false)
    setAiResult(null)
    setAiError('')
    setAiLoading(false)
    setHintMessage('')
    setShowHintConfirm(false)
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

  function toggleProblemCard(cardId) {
    setSelectedProblemIds((previousIds) => {
      if (previousIds.includes(cardId)) {
        return previousIds.filter((id) => id !== cardId)
      }

      return [...previousIds, cardId]
    })
  }

  function toggleAiCard(aiCard) {
    const alreadySelected = selectedAiCards.some((card) => card.id === aiCard.id)

    if (alreadySelected) {
      setSelectedAiCards((previousCards) =>
        previousCards.filter((card) => card.id !== aiCard.id)
      )
      return
    }

    if (selectedAiCards.length >= 3 || hasSubmittedExplanation) {
      return
    }

    setSelectedAiCards((previousCards) => [...previousCards, aiCard])
  }

  function removeSelectedAiCard(cardId) {
    if (hasSubmittedExplanation) return

    setSelectedAiCards((previousCards) =>
      previousCards.filter((card) => card.id !== cardId)
    )
  }

  function handleDragStart(event, aiCardId) {
    event.dataTransfer.setData('text/plain', String(aiCardId))
  }

  function handleDrop(event) {
    event.preventDefault()

    const aiCardId = Number(event.dataTransfer.getData('text/plain'))
    const aiCard = aiCards.find((card) => card.id === aiCardId)

    if (aiCard) {
      toggleAiCard(aiCard)
    }
  }

  function toggleAiFlip(cardId) {
    setFlippedAiCards((previousIds) => {
      if (previousIds.includes(cardId)) {
        return previousIds.filter((id) => id !== cardId)
      }

      return [...previousIds, cardId]
    })
  }

  async function submitExplanation() {
    const trimmedExplanation = userExplanation.trim()

    if (!round.card) {
      setAiError('No problem card is active. Please start the game first.')
      return
    }

    if (selectedAiCards.length === 0) {
      setAiError('Please select at least one AI card before submitting.')
      return
    }

    if (selectedAiCards.length > 3) {
      setAiError('You can only select up to 3 AI cards.')
      return
    }

    if (!trimmedExplanation) {
      setAiError('Please write your explanation before submitting.')
      return
    }

    if (explanationTooLong) {
      setAiError('Your explanation must be 100 words or less.')
      return
    }

    if (hasSubmittedExplanation) {
      return
    }

    setAiError('')
    setAiLoading(true)

    try {
      const selectedSolutionForCurrentBackend = {
        cardId: selectedAiCards[0].id,
        title: selectedAiCards.map((card) => card.title).join(' + '),
        description: selectedAiCards
          .map((card) => `${card.title}: ${card.canDo}`)
          .join('\n')
      }

      const result = await gradeExplanation({
        problemCard: round.card,
        selectedSolution: selectedSolutionForCurrentBackend,
        selectedAiCards,
        userExplanation: trimmedExplanation
      })

      const normalisedResult = normaliseAiResult(result)
      const createdAt = new Date().toLocaleString()
      const attemptNumber =
        attempts.filter((attempt) => attempt.problemId === round.card.id).length + 1
      const balanceAfter = glaCoinBalance + normalisedResult.glaCoinEarned

      const attemptRecord = {
        id: Date.now(),
        problemId: round.card.id,
        problemTitle: round.card.title,
        selectedAiCards,
        explanation: trimmedExplanation,
        totalScore: normalisedResult.totalScore,
        glaCoinEarned: normalisedResult.glaCoinEarned,
        feedback: normalisedResult.overallFeedback,
        improvement: normalisedResult.improvement,
        subScores: normalisedResult.subScores,
        attemptNumber,
        createdAt
      }

      const coinTransaction = {
        id: `earned-${Date.now()}`,
        type: 'earned',
        amount: normalisedResult.glaCoinEarned,
        balanceAfter,
        reason: 'DeepSeek score reward',
        problemId: round.card.id,
        problemTitle: round.card.title,
        createdAt
      }

      setAiResult(normalisedResult)
      setHasSubmittedExplanation(true)
      setGlaCoinBalance(balanceAfter)
      setAttempts((previousAttempts) => [...previousAttempts, attemptRecord])
      setCoinTransactions((previousTransactions) => [
        coinTransaction,
        ...previousTransactions
      ])
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

    setCoinTransactions((previousTransactions) => [
      {
        id: `spent-${Date.now()}`,
        type: 'spent',
        amount: 20,
        balanceAfter,
        reason: 'Hint request',
        problemId: round.card?.id || null,
        problemTitle: round.card?.title || 'No active problem',
        createdAt
      },
      ...previousTransactions
    ])

    setHintMessage(generateBasicHint(round.card))
    setShowHintConfirm(false)
  }

  function renderTopNavigation() {
    const navItems = [
      ['intro', 'Game Guide'],
      ['select', 'Problem Selection'],
      ['play', 'Play Game'],
      ['score', 'Scoring'],
      ['dashboard', 'Dashboard'],
      ['coins', 'GLA Coin'],
      ['certificate', 'Certificate']
    ]

    return (
      <div style={topNavStyle}>
        {navItems.map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              if (value === 'play' && !round.card) {
                startGame()
                return
              }

              if (value === 'score' && !latestAttempt) {
                setScreen('dashboard')
                return
              }

              setScreen(value)
            }}
            style={{
              ...topNavButtonStyle,
              background:
                screen === value
                  ? 'linear-gradient(135deg, #9a6a22, #5c3512)'
                  : 'rgba(255, 255, 255, 0.62)',
              color: screen === value ? '#fff8eb' : '#5c3512',
              boxShadow:
                screen === value
                  ? '0 14px 30px rgba(92, 53, 18, 0.2)'
                  : 'none'
            }}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  function renderIntroScreen() {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Game explanation</p>

        <h1 style={bigTitleStyle}>
          Use AI cards to solve African problem cards.
        </h1>

        <p style={paragraphStyle}>
          Hi {firstName}, the goal is simple: choose real African problem cards,
          select one to three AI cards, explain your idea in 100 words or less,
          and let DeepSeek score how practical, ethical, creative and realistic
          your solution is.
        </p>

        <div style={guideGridStyle}>
          {[
            {
              title: '1. Choose problems',
              text: 'Select at least 10 problem cards to create your active problem stack.'
            },
            {
              title: '2. Pick AI cards',
              text: 'Use one, two or three AI cards as solution tools for each problem.'
            },
            {
              title: '3. Explain your idea',
              text: 'Write a short explanation of how the selected AI cards can help.'
            },
            {
              title: '4. Earn GLA coin',
              text: 'DeepSeek gives a score out of 100. That score becomes your GLA coin.'
            },
            {
              title: '5. Use hints',
              text: 'Request hints when stuck. Each hint costs 20 GLA coin.'
            },
            {
              title: '6. Unlock certificate',
              text: 'Complete 10 problem cards with an average score of at least 75.'
            }
          ].map((item) => (
            <div key={item.title} style={smallCardStyle}>
              <h3 style={smallCardTitleStyle}>{item.title}</h3>
              <p style={smallCardTextStyle}>{item.text}</p>
            </div>
          ))}
        </div>

        <div style={centerButtonRowStyle}>
          <button onClick={() => setScreen('select')} style={primaryButtonStyle}>
            Choose Problem Cards
          </button>
        </div>
      </div>
    )
  }

  function renderProblemSelectionScreen() {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Problem card selection</p>

        <h1 style={sectionTitleStyle}>Build your active problem stack.</h1>

        <p style={paragraphStyle}>
          Choose at least 10 problem cards. The game will randomly present cards
          from this stack. You can choose more than 10 if you want more variety.
        </p>

        <div style={metricGridStyle}>
          <MetricCard title="Selected" value={selectedProblemIds.length} />
          <MetricCard title="Required" value="10" />
          <MetricCard title="Total Cards" value={cards.length} />
        </div>

        <div style={cardGridStyle}>
          {cards.map((card) => {
            const selected = selectedProblemIds.includes(card.id)

            return (
              <button
                key={card.id}
                onClick={() => toggleProblemCard(card.id)}
                style={{
                  ...problemSelectCardStyle,
                  border: selected
                    ? '2px solid rgba(154, 106, 34, 0.75)'
                    : '1px solid rgba(139, 92, 40, 0.18)',
                  background: selected
                    ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.96), rgba(244, 210, 138, 0.44))'
                    : 'rgba(255, 255, 255, 0.64)',
                  boxShadow: selected
                    ? '0 20px 42px rgba(80, 52, 20, 0.18)'
                    : '0 12px 28px rgba(80, 52, 20, 0.08)'
                }}
              >
                <p style={eyebrowStyle}>{selected ? 'Selected' : 'Problem Card'}</p>

                <h3 style={smallCardTitleStyle}>{card.title}</h3>

                <p style={smallCardTextStyle}>{card.problem}</p>

                <p style={cardTypeStyle}>{card.problem_type}</p>
              </button>
            )
          })}
        </div>

        <div style={centerButtonRowStyle}>
          <button
            onClick={startGame}
            disabled={selectedProblemIds.length < 10}
            style={{
              ...primaryButtonStyle,
              opacity: selectedProblemIds.length < 10 ? 0.45 : 1,
              cursor: selectedProblemIds.length < 10 ? 'default' : 'pointer'
            }}
          >
            Start Game with Selected Problems
          </button>
        </div>

        {selectedProblemIds.length < 10 && (
          <p style={warningTextStyle}>
            Select {10 - selectedProblemIds.length} more problem card(s) before
            starting.
          </p>
        )}
      </div>
    )
  }

  function renderPlayScreen() {
    if (!round.card) {
      return (
        <div style={panelStyle}>
          <p style={eyebrowStyle}>No active game yet</p>

          <h1 style={sectionTitleStyle}>Choose your problem cards first.</h1>

          <div style={centerButtonRowStyle}>
            <button onClick={() => setScreen('select')} style={primaryButtonStyle}>
              Go to Problem Selection
            </button>
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
            <p style={eyebrowStyle}>Welcome back, {fullName}</p>

            <h1 style={sectionTitleStyle}>Build your AI solution.</h1>

            <p style={paragraphStyle}>
              Select up to three AI cards, explain your idea, then submit it for
              DeepSeek scoring.
            </p>

            <div style={currentPromptStyle}>
              <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>Current Prompt</p>

              <h3 style={promptTitleStyle}>{round.card.title}</h3>

              <p style={promptTextStyle}>{round.card.problem}</p>

              <p style={promptQuestionStyle}>{round.card.think_about_it}</p>
            </div>

            <div className="gameStats" style={metricGridStyle}>
              <MetricCard title="GLA Coin" value={glaCoinBalance} />
              <MetricCard title="Completed" value={`${certificationProgress}/10`} />
              <MetricCard title="Average" value={`${averageScore}%`} />
            </div>

            <button
              onClick={() => setFlippedProblem(!flippedProblem)}
              style={transparentCardButtonStyle}
            >
              <div className="problemCardVisual" style={problemCardVisualStyle}>
                <img
                  src={flippedProblem ? card1 : card2}
                  alt="Problem card design"
                  style={cardImageStyle}
                />

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
                      <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                        Problem Card Back
                      </p>

                      <h3 style={largeCardTitleStyle}>GRIT Lab Africa</h3>

                      <p style={largeCardTextStyle}>
                        Click again to view the current problem card.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                        {round.card.problem_type}
                      </p>

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
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              style={{
                ...solutionBoardStyle,
                background:
                  selectedAiCards.length > 0
                    ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.9), rgba(244, 210, 138, 0.42))'
                    : 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <p style={eyebrowStyle}>Solution Board</p>

              <h3 style={smallCardTitleStyle}>Drop or tap up to 3 AI cards here.</h3>

              <div style={selectedAiGridStyle}>
                {selectedAiCards.length === 0 && (
                  <div style={emptyDropStyle}>No AI cards selected yet.</div>
                )}

                {selectedAiCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => removeSelectedAiCard(card.id)}
                    style={selectedAiCardStyle}
                  >
                    <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                      Selected AI
                    </p>

                    <strong>{card.title}</strong>

                    <p style={selectedAiTypeStyle}>{card.type}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={panelInnerStyle}>
              <div style={rowBetweenStyle}>
                <div>
                  <p style={eyebrowStyle}>Explanation</p>
                  <h3 style={smallCardTitleStyle}>Explain your solution.</h3>
                </div>

                <strong
                  style={{
                    color: explanationTooLong ? '#991b1b' : '#5c3512'
                  }}
                >
                  {wordCount}/100 words
                </strong>
              </div>

              <textarea
                value={userExplanation}
                onChange={(event) => setUserExplanation(event.target.value)}
                disabled={hasSubmittedExplanation || aiLoading}
                placeholder="Write how your selected AI card(s) can help solve the problem in a realistic African context..."
                style={{
                  ...textAreaStyle,
                  border: explanationTooLong
                    ? '2px solid rgba(185, 28, 28, 0.5)'
                    : '1px solid rgba(139, 92, 40, 0.22)'
                }}
              />

              {explanationTooLong && (
                <p style={warningTextStyle}>
                  Your explanation is too long. Please keep it to 100 words or less.
                </p>
              )}

              {aiError && <p style={errorTextStyle}>{aiError}</p>}

              <div style={centerButtonRowStyle}>
                <button
                  onClick={submitExplanation}
                  disabled={
                    selectedAiCards.length === 0 ||
                    !userExplanation.trim() ||
                    explanationTooLong ||
                    hasSubmittedExplanation ||
                    aiLoading
                  }
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      selectedAiCards.length === 0 ||
                      !userExplanation.trim() ||
                      explanationTooLong ||
                      hasSubmittedExplanation ||
                      aiLoading
                        ? 0.45
                        : 1,
                    cursor:
                      selectedAiCards.length === 0 ||
                      !userExplanation.trim() ||
                      explanationTooLong ||
                      hasSubmittedExplanation ||
                      aiLoading
                        ? 'default'
                        : 'pointer'
                  }}
                >
                  {aiLoading ? 'Scoring with DeepSeek...' : 'Submit Solution'}
                </button>

                <button
                  onClick={() => setShowHintConfirm(true)}
                  disabled={aiLoading}
                  style={secondaryButtonStyle}
                >
                  Request Hint - 20 GLA
                </button>

                {latestAttempt && (
                  <button
                    onClick={() => setScreen('score')}
                    style={secondaryButtonStyle}
                  >
                    View Latest Score
                  </button>
                )}

                <button onClick={handleNextRound} style={secondaryButtonStyle}>
                  Next Problem
                </button>
              </div>

              {showHintConfirm && (
                <div style={hintBoxStyle}>
                  <h3 style={smallCardTitleStyle}>Confirm hint purchase</h3>

                  <p style={smallCardTextStyle}>
                    A hint costs 20 GLA coin. Your current balance is{' '}
                    <strong>{glaCoinBalance}</strong> GLA coin.
                  </p>

                  <div style={centerButtonRowStyle}>
                    <button onClick={confirmHintPurchase} style={primaryButtonStyle}>
                      Yes, use 20 GLA coin
                    </button>

                    <button
                      onClick={() => setShowHintConfirm(false)}
                      style={secondaryButtonStyle}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {hintMessage && (
                <div style={hintBoxStyle}>
                  <p style={eyebrowStyle}>Hint</p>
                  <p style={smallCardTextStyle}>{hintMessage}</p>
                </div>
              )}
            </div>

            <div style={panelInnerStyle}>
              <div style={rowBetweenStyle}>
                <div>
                  <p style={eyebrowStyle}>AI Card Library</p>
                  <h3 style={smallCardTitleStyle}>All 30 AI cards are available.</h3>
                </div>

                <strong style={{ color: '#5c3512' }}>
                  {selectedAiCards.length}/3 selected
                </strong>
              </div>

              <div style={aiLibraryStyle}>
                {aiCards.map((card) => {
                  const selected = selectedAiCards.some(
                    (selectedCard) => selectedCard.id === card.id
                  )
                  const flipped = flippedAiCards.includes(card.id)

                  return (
                    <div key={card.id} style={{ display: 'grid', gap: '8px' }}>
                      <button
                        draggable={!hasSubmittedExplanation}
                        onDragStart={(event) => handleDragStart(event, card.id)}
                        onClick={() => toggleAiCard(card)}
                        style={{
                          ...aiCardStyle,
                          border: selected
                            ? '2px solid rgba(154, 106, 34, 0.78)'
                            : '1px solid rgba(139, 92, 40, 0.18)',
                          background: selected
                            ? 'linear-gradient(135deg, rgba(154, 106, 34, 0.92), rgba(92, 53, 18, 0.96))'
                            : 'rgba(255, 255, 255, 0.68)',
                          color: selected ? '#fff8eb' : '#3b2817'
                        }}
                      >
                        {flipped ? (
                          <>
                            <p
                              style={{
                                ...eyebrowStyle,
                                color: selected ? '#f4d28a' : '#9a6a22'
                              }}
                            >
                              AI Card Back
                            </p>
                            <h3 style={{ margin: 0 }}>GRIT Lab Africa</h3>
                            <p style={{ margin: '10px 0 0', lineHeight: '1.5' }}>
                              Golden AI capability card.
                            </p>
                          </>
                        ) : (
                          <>
                            <p
                              style={{
                                ...eyebrowStyle,
                                color: selected ? '#f4d28a' : '#9a6a22'
                              }}
                            >
                              {card.type}
                            </p>

                            <h3 style={{ margin: '0 0 8px', lineHeight: '1.2' }}>
                              {card.title}
                            </h3>

                            <p style={{ margin: 0, lineHeight: '1.5' }}>
                              {card.canDo}
                            </p>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleAiFlip(card.id)}
                        style={miniButtonStyle}
                      >
                        {flipped ? 'Show Front' : 'Flip Card'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  function renderScoringScreen() {
    if (!latestAttempt) {
      return (
        <div style={panelStyle}>
          <p style={eyebrowStyle}>Scoring and feedback</p>
          <h1 style={sectionTitleStyle}>No score yet.</h1>
          <p style={paragraphStyle}>
            Submit a solution first. After DeepSeek scores your answer, this
            screen will show your score, feedback and sub-score breakdown.
          </p>

          <div style={centerButtonRowStyle}>
            <button onClick={() => setScreen('play')} style={primaryButtonStyle}>
              Go to Game
            </button>
          </div>
        </div>
      )
    }

    const subScores = latestAttempt.subScores || {}
    const selectedCards = latestAttempt.selectedAiCards || []

    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Scoring and feedback</p>

        <h1 style={sectionTitleStyle}>DeepSeek reviewed your solution.</h1>

        <div style={scoreHeroStyle}>
          <div style={scoreCircleStyle}>{latestAttempt.totalScore}</div>

          <div>
            <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
              {latestAttempt.totalScore >= 75
                ? 'Strong certification-level attempt'
                : latestAttempt.totalScore >= 50
                  ? 'Good start, improve the details'
                  : 'Needs more practical detail'}
            </p>

            <h2 style={scoreTitleStyle}>
              {latestAttempt.glaCoinEarned} GLA coin earned
            </h2>

            <p style={scoreTextStyle}>
              Current balance: <strong>{glaCoinBalance} GLA coin</strong>
            </p>
          </div>
        </div>

        <div style={twoColumnGridStyle}>
          <div style={smallCardStyle}>
            <p style={eyebrowStyle}>Problem solved</p>
            <h3 style={smallCardTitleStyle}>{latestAttempt.problemTitle}</h3>
            <p style={smallCardTextStyle}>
              Attempt #{latestAttempt.attemptNumber} submitted on{' '}
              {latestAttempt.createdAt}.
            </p>
          </div>

          <div style={smallCardStyle}>
            <p style={eyebrowStyle}>AI cards used</p>

            {selectedCards.length === 0 ? (
              <p style={smallCardTextStyle}>No AI cards were recorded.</p>
            ) : (
              <div style={chipGridStyle}>
                {selectedCards.map((card) => (
                  <span key={card.id} style={chipStyle}>
                    {card.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>Feedback</p>

          <h3 style={smallCardTitleStyle}>Overall feedback</h3>
          <p style={smallCardTextStyle}>{latestAttempt.feedback}</p>

          <h3 style={{ ...smallCardTitleStyle, marginTop: '18px' }}>
            How to improve
          </h3>
          <p style={smallCardTextStyle}>{latestAttempt.improvement}</p>
        </div>

        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>Detailed sub-score breakdown</p>

          <h3 style={smallCardTitleStyle}>Your score by rubric area</h3>

          <div style={subScoreGridStyle}>
            {rubricRows.map((row) => {
              const score = toSafeNumber(subScores[row.key])
              const percentage =
                row.max > 0 ? Math.round((score / row.max) * 100) : 0

              return (
                <div key={row.key} style={subScoreCardStyle}>
                  <div style={rowBetweenStyle}>
                    <strong style={{ color: '#5c3512' }}>{row.label}</strong>
                    <span style={scoreLabelStyle}>
                      {score}/{row.max}
                    </span>
                  </div>

                  <div style={progressTrackStyle}>
                    <div
                      style={{
                        ...progressFillStyle,
                        width: `${Math.min(100, Math.max(0, percentage))}%`
                      }}
                    ></div>
                  </div>

                  <p style={{ ...smallCardTextStyle, fontSize: '0.86rem' }}>
                    {row.meaning}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>First / latest / best score</p>

          <h3 style={smallCardTitleStyle}>Score history for this problem</h3>

          {latestAttemptProblemStats ? (
            <div style={metricGridStyle}>
              <MetricCard
                title="First Score"
                value={`${latestAttemptProblemStats.first?.totalScore || 0}/100`}
              />
              <MetricCard
                title="Latest Score"
                value={`${latestAttemptProblemStats.latest?.totalScore || 0}/100`}
              />
              <MetricCard
                title="Best Score"
                value={`${latestAttemptProblemStats.best?.totalScore || 0}/100`}
              />
              <MetricCard
                title="Attempts"
                value={latestAttemptProblemStats.count || 0}
              />
            </div>
          ) : (
            <p style={smallCardTextStyle}>
              No score history found for this problem yet.
            </p>
          )}
        </div>

        <div style={centerButtonRowStyle}>
          <button onClick={() => setScreen('retry')} style={primaryButtonStyle}>
            Retry This Problem
          </button>

          <button onClick={handleNextRound} style={secondaryButtonStyle}>
            Next Problem
          </button>

          <button onClick={() => setScreen('dashboard')} style={secondaryButtonStyle}>
            Dashboard
          </button>

          <button onClick={() => setScreen('coins')} style={secondaryButtonStyle}>
            GLA Coin History
          </button>
        </div>
      </div>
    )
  }

  function renderRetryAttemptScreen() {
    if (!round.card) {
      return (
        <div style={panelStyle}>
          <p style={eyebrowStyle}>Retry attempt</p>
          <h1 style={sectionTitleStyle}>No active problem to retry.</h1>
          <p style={paragraphStyle}>Start the game first, then submit an attempt.</p>

          <div style={centerButtonRowStyle}>
            <button onClick={() => setScreen('play')} style={primaryButtonStyle}>
              Go to Game
            </button>
          </div>
        </div>
      )
    }

    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Retry attempt</p>

        <h1 style={sectionTitleStyle}>Try the same problem again.</h1>

        <p style={paragraphStyle}>
          You can retry this problem to improve your solution. Your old attempt
          is kept in the history. The dashboard will still show your first,
          latest and best score.
        </p>

        <div style={{ ...smallCardStyle, marginTop: '24px' }}>
          <p style={eyebrowStyle}>Problem card</p>
          <h3 style={smallCardTitleStyle}>{round.card.title}</h3>
          <p style={smallCardTextStyle}>{round.card.problem}</p>
        </div>

        {currentProblemAttemptStats && (
          <div style={{ ...smallCardStyle, marginTop: '18px' }}>
            <p style={eyebrowStyle}>Your score history</p>

            <h3 style={smallCardTitleStyle}>First, latest and best score</h3>

            <div style={metricGridStyle}>
              <MetricCard
                title="First Score"
                value={`${currentProblemAttemptStats.first?.totalScore || 0}/100`}
              />
              <MetricCard
                title="Latest Score"
                value={`${currentProblemAttemptStats.latest?.totalScore || 0}/100`}
              />
              <MetricCard
                title="Best Score"
                value={`${currentProblemAttemptStats.best?.totalScore || 0}/100`}
              />
              <MetricCard
                title="Attempts"
                value={currentProblemAttemptStats.count || 0}
              />
            </div>
          </div>
        )}

        <div style={{ ...smallCardStyle, marginTop: '18px' }}>
          <p style={eyebrowStyle}>What will happen now?</p>

          <ul style={listStyle}>
            <li>Your selected AI cards will be cleared.</li>
            <li>Your explanation box will be cleared.</li>
            <li>The same problem card will stay active.</li>
            <li>You can submit again and try to improve your score.</li>
          </ul>
        </div>

        <div style={centerButtonRowStyle}>
          <button onClick={handleRetryCurrentProblem} style={primaryButtonStyle}>
            Start Retry Attempt
          </button>

          <button onClick={() => setScreen('score')} style={secondaryButtonStyle}>
            Cancel
          </button>

          <button onClick={handleNextRound} style={secondaryButtonStyle}>
            Skip to Next Problem
          </button>
        </div>
      </div>
    )
  }

  function renderDashboardScreen() {
    return (
      <PlayerDashboardScreen
        firstName={firstName}
        selectedProblemCount={selectedProblemIds.length}
        completedProblems={completedProblems}
        averageScore={averageScore}
        certificateUnlocked={certificateUnlocked}
        certificationProgress={certificationProgress}
        glaCoinBalance={glaCoinBalance}
        totalGlaCoinEarned={totalGlaCoinEarned}
        glaCoinSpentOnHints={glaCoinSpentOnHints}
        attempts={attempts}
        attemptStatsByProblem={attemptStatsByProblem}
        bestScoringProblems={bestScoringProblems}
        latestAttempt={latestAttempt}
        onOpenCoinHistory={() => setScreen('coins')}
        onOpenLatestScore={() => setScreen(latestAttempt ? 'score' : 'play')}
        onOpenCertificate={() => setScreen('certificate')}
      />
    )
  }

  function renderCoinHistoryScreen() {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>GLA coin transaction history</p>

        <h1 style={sectionTitleStyle}>Your GLA coin wallet.</h1>

        <p style={paragraphStyle}>
          This screen tracks the coin you earned from DeepSeek scoring and the
          coin you spent on hints.
        </p>

        <div style={metricGridStyle}>
          <MetricCard title="Current Balance" value={glaCoinBalance} />
          <MetricCard title="Total Earned" value={totalGlaCoinEarned} />
          <MetricCard title="Spent on Hints" value={glaCoinSpentOnHints} />
          <MetricCard title="Transactions" value={coinTransactions.length} />
        </div>

        <h2 style={subHeadingStyle}>Transaction list</h2>

        {coinTransactions.length === 0 ? (
          <div style={smallCardStyle}>
            <h3 style={smallCardTitleStyle}>No coin movement yet</h3>
            <p style={smallCardTextStyle}>
              Submit a scored solution to earn GLA coin, or request a hint to
              spend 20 GLA coin.
            </p>
          </div>
        ) : (
          <div style={listGridStyle}>
            {coinTransactions.map((transaction) => {
              const isEarned = transaction.type === 'earned'

              return (
                <div key={transaction.id} style={smallCardStyle}>
                  <div style={rowBetweenStyle}>
                    <div>
                      <p style={eyebrowStyle}>
                        {isEarned ? 'Coin earned' : 'Coin spent'}
                      </p>
                      <h3 style={smallCardTitleStyle}>{transaction.reason}</h3>
                    </div>

                    <strong
                      style={{
                        ...coinBadgeStyle,
                        background: isEarned
                          ? 'rgba(21, 128, 61, 0.12)'
                          : 'rgba(185, 28, 28, 0.1)',
                        color: isEarned ? '#166534' : '#991b1b'
                      }}
                    >
                      {isEarned ? '+' : '-'}
                      {transaction.amount} GLA
                    </strong>
                  </div>

                  <p style={smallCardTextStyle}>
                    Problem: {transaction.problemTitle || 'General game activity'}
                  </p>

                  <p style={dateTextStyle}>
                    Balance after transaction: {transaction.balanceAfter} GLA coin
                  </p>

                  <p style={dateTextStyle}>Date: {transaction.createdAt}</p>
                </div>
              )
            })}
          </div>
        )}

        <div style={centerButtonRowStyle}>
          <button onClick={() => setScreen('dashboard')} style={primaryButtonStyle}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  function renderCertificateScreen() {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Certificate</p>

        <h1 style={sectionTitleStyle}>
          {certificateUnlocked
            ? 'Your certificate is unlocked.'
            : 'Your certificate is not unlocked yet.'}
        </h1>

        <p style={paragraphStyle}>
          Certificate unlocks after 10 completed problem cards with an average
          score of 75 or higher.
        </p>

        <div style={certificatePreviewStyle}>
          <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>GRIT Lab Africa</p>

          <h2 style={certificateTitleStyle}>
            Artificial Intelligence and Practical Applications
          </h2>

          <p style={certificateTextStyle}>
            Gaming SDG Problems and Ideating Solutions for Africa
          </p>

          <div style={certificateNameStyle}>{fullName}</div>

          <p style={certificateTextStyle}>
            Completed Problems: {completedProblems} • Average Score: {averageScore}%
          </p>

          <p style={certificateTextStyle}>
            Status: {certificateUnlocked ? 'Certified' : 'Not Certified Yet'}
          </p>
        </div>

        <div style={centerButtonRowStyle}>
          <button
            disabled={!certificateUnlocked}
            style={{
              ...primaryButtonStyle,
              opacity: certificateUnlocked ? 1 : 0.45,
              cursor: certificateUnlocked ? 'pointer' : 'default'
            }}
          >
            Download Certificate
          </button>

          <button onClick={() => setScreen('dashboard')} style={secondaryButtonStyle}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <section style={gameHomeWrapperStyle}>
      {renderTopNavigation()}

      {screen === 'intro' && renderIntroScreen()}
      {screen === 'select' && renderProblemSelectionScreen()}
      {screen === 'play' && renderPlayScreen()}
      {screen === 'score' && renderScoringScreen()}
      {screen === 'retry' && renderRetryAttemptScreen()}
      {screen === 'dashboard' && renderDashboardScreen()}
      {screen === 'coins' && renderCoinHistoryScreen()}
      {screen === 'certificate' && renderCertificateScreen()}
    </section>
  )
}

function MetricCard({ title, value }) {
  return (
    <div style={metricCardStyle}>
      <strong style={metricValueStyle}>{value}</strong>
      <span style={metricTitleStyle}>{title}</span>
    </div>
  )
}

const gameHomeWrapperStyle = {
  width: 'min(1450px, calc(100vw - 48px))',
  margin: '34px auto 0'
}

const topNavStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginBottom: '24px'
}

const topNavButtonStyle = {
  border: '0',
  borderRadius: '999px',
  padding: '11px 18px',
  cursor: 'pointer',
  fontWeight: '850'
}

const panelStyle = {
  padding: '36px',
  borderRadius: '34px',
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(232, 214, 170, 0.68))',
  border: '1px solid rgba(139, 92, 40, 0.22)',
  boxShadow: '0 30px 80px rgba(80, 52, 20, 0.18)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
}

const panelInnerStyle = {
  padding: '24px',
  borderRadius: '28px',
  background: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(139, 92, 40, 0.18)',
  boxShadow: '0 18px 42px rgba(80, 52, 20, 0.12)'
}

const eyebrowStyle = {
  margin: '0 0 10px',
  color: '#9a6a22',
  fontSize: '0.74rem',
  fontWeight: '850',
  letterSpacing: '0.14em',
  textTransform: 'uppercase'
}

const bigTitleStyle = {
  margin: '0 0 18px',
  color: '#4b2b10',
  fontSize: 'clamp(2.5rem, 5vw, 4.8rem)',
  lineHeight: '0.95',
  letterSpacing: '-0.07em',
  fontWeight: '950',
  textAlign: 'center'
}

const sectionTitleStyle = {
  margin: '0 0 18px',
  color: '#4b2b10',
  fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
  lineHeight: '1',
  letterSpacing: '-0.06em',
  fontWeight: '900'
}

const paragraphStyle = {
  margin: '0',
  color: '#5c4632',
  fontSize: '1rem',
  lineHeight: '1.7'
}

const guideGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
  margin: '28px auto 0',
  maxWidth: '880px',
  justifyContent: 'center'
}

const smallCardStyle = {
  padding: '20px',
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.66)',
  border: '1px solid rgba(139, 92, 40, 0.18)',
  boxShadow: '0 14px 34px rgba(80, 52, 20, 0.1)'
}

const smallCardTitleStyle = {
  margin: '0 0 10px',
  color: '#5c3512',
  fontSize: '1.2rem',
  lineHeight: '1.2',
  letterSpacing: '-0.035em'
}

const smallCardTextStyle = {
  margin: '0',
  color: '#5c4632',
  lineHeight: '1.6',
  fontSize: '0.94rem'
}

const centerButtonRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '26px'
}

const primaryButtonStyle = {
  border: '0',
  borderRadius: '999px',
  padding: '13px 24px',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: '850',
  fontSize: '0.95rem',
  boxShadow: '0 14px 30px rgba(92, 53, 18, 0.22)'
}

const secondaryButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.22)',
  borderRadius: '999px',
  padding: '13px 20px',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.68)',
  color: '#5c3512',
  fontWeight: '850'
}

const metricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginTop: '18px'
}

const metricCardStyle = {
  padding: '18px',
  borderRadius: '22px',
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(139, 92, 40, 0.16)'
}

const metricValueStyle = {
  display: 'block',
  color: '#5c3512',
  fontSize: '1.55rem',
  lineHeight: '1.1',
  overflowWrap: 'anywhere'
}

const metricTitleStyle = {
  color: '#6b5540',
  fontSize: '0.9rem',
  fontWeight: '650'
}

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '14px',
  marginTop: '24px'
}

const problemSelectCardStyle = {
  padding: '18px',
  minHeight: '180px',
  borderRadius: '24px',
  textAlign: 'left',
  cursor: 'pointer',
  color: '#3b2817'
}

const cardTypeStyle = {
  margin: '12px 0 0',
  color: '#9a6a22',
  fontSize: '0.82rem',
  fontWeight: '800'
}

const warningTextStyle = {
  margin: '12px 0 0',
  color: '#7f1d1d',
  lineHeight: '1.6',
  textAlign: 'center',
  fontWeight: '750'
}

const errorTextStyle = {
  margin: '12px 0 0',
  color: '#991b1b',
  lineHeight: '1.6',
  fontWeight: '750'
}

const gameShellStyle = {
  minHeight: '720px',
  padding: '34px',
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 0.85fr) minmax(320px, 1.15fr)',
  gap: '28px',
  alignItems: 'start',
  borderRadius: '38px',
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(232, 214, 170, 0.72))',
  border: '1px solid rgba(139, 92, 40, 0.22)',
  boxShadow: '0 30px 80px rgba(80, 52, 20, 0.2)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  overflow: 'hidden'
}

const currentPromptStyle = {
  marginTop: '18px',
  padding: '22px',
  borderRadius: '26px',
  background:
    'linear-gradient(135deg, rgba(92, 53, 18, 0.96), rgba(154, 106, 34, 0.9))',
  color: '#fff8eb',
  boxShadow: '0 18px 42px rgba(92, 53, 18, 0.22)'
}

const promptTitleStyle = {
  margin: '0 0 12px',
  fontSize: '1.25rem',
  lineHeight: '1.35'
}

const promptTextStyle = {
  margin: '0 0 12px',
  lineHeight: '1.6',
  color: 'rgba(255, 248, 235, 0.9)'
}

const promptQuestionStyle = {
  margin: '0',
  lineHeight: '1.6',
  color: '#f4d28a',
  fontWeight: '750'
}

const transparentCardButtonStyle = {
  width: '100%',
  border: '0',
  padding: '0',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  marginTop: '20px'
}

const problemCardVisualStyle = {
  position: 'relative',
  minHeight: '510px',
  borderRadius: '30px',
  overflow: 'hidden',
  boxShadow: '0 28px 60px rgba(0, 0, 0, 0.26)',
  transform: 'rotate(-1.5deg)'
}

const cardImageStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}

const cardOverlayStyle = {
  position: 'absolute',
  inset: 0
}

const cardTextOverlayStyle = {
  position: 'absolute',
  left: '24px',
  right: '24px',
  bottom: '28px',
  color: '#fff8eb'
}

const largeCardTitleStyle = {
  margin: '0 0 12px',
  fontSize: '1.75rem',
  lineHeight: '1.1'
}

const largeCardTextStyle = {
  margin: '0',
  color: 'rgba(255, 248, 235, 0.88)',
  lineHeight: '1.65'
}

const solutionBoardStyle = {
  padding: '24px',
  borderRadius: '28px',
  border: '2px dashed rgba(154, 106, 34, 0.38)',
  boxShadow: '0 18px 42px rgba(80, 52, 20, 0.12)'
}

const selectedAiGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: '12px',
  marginTop: '16px'
}

const emptyDropStyle = {
  padding: '18px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.58)',
  color: '#6b5540',
  lineHeight: '1.55'
}

const selectedAiCardStyle = {
  padding: '16px',
  border: '1px solid rgba(154, 106, 34, 0.3)',
  borderRadius: '20px',
  background:
    'linear-gradient(135deg, rgba(154, 106, 34, 0.96), rgba(92, 53, 18, 0.96))',
  color: '#fff8eb',
  textAlign: 'left',
  cursor: 'pointer'
}

const selectedAiTypeStyle = {
  margin: '8px 0 0',
  lineHeight: '1.5'
}

const rowBetweenStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '14px',
  flexWrap: 'wrap'
}

const textAreaStyle = {
  width: '100%',
  minHeight: '150px',
  marginTop: '14px',
  padding: '16px',
  borderRadius: '20px',
  resize: 'vertical',
  background: 'rgba(255, 255, 255, 0.78)',
  color: '#3b2817',
  outline: 'none',
  lineHeight: '1.6'
}

const hintBoxStyle = {
  marginTop: '18px',
  padding: '18px',
  borderRadius: '22px',
  background: 'rgba(244, 210, 138, 0.24)',
  border: '1px solid rgba(154, 106, 34, 0.22)'
}

const aiLibraryStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: '12px',
  maxHeight: '620px',
  overflowY: 'auto',
  paddingRight: '6px',
  marginTop: '16px'
}

const aiCardStyle = {
  minHeight: '190px',
  padding: '16px',
  borderRadius: '22px',
  cursor: 'pointer',
  textAlign: 'left',
  boxShadow: '0 14px 30px rgba(80, 52, 20, 0.1)'
}

const miniButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.18)',
  borderRadius: '999px',
  padding: '8px 12px',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.65)',
  color: '#5c3512',
  fontWeight: '800',
  fontSize: '0.82rem'
}

const scoreHeroStyle = {
  marginTop: '24px',
  padding: '26px',
  borderRadius: '30px',
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  flexWrap: 'wrap',
  background:
    'linear-gradient(135deg, rgba(92, 53, 18, 0.96), rgba(154, 106, 34, 0.92))',
  color: '#fff8eb',
  boxShadow: '0 24px 60px rgba(92, 53, 18, 0.2)'
}

const scoreCircleStyle = {
  width: '92px',
  height: '92px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 248, 235, 0.16)',
  border: '2px solid rgba(244, 210, 138, 0.45)',
  color: '#f4d28a',
  fontSize: '2rem',
  fontWeight: '950'
}

const scoreTitleStyle = {
  margin: '0 0 8px',
  color: '#fff8eb',
  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
  lineHeight: '1.05',
  letterSpacing: '-0.05em'
}

const scoreTextStyle = {
  margin: 0,
  color: 'rgba(255, 248, 235, 0.88)',
  lineHeight: '1.6'
}

const twoColumnGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '16px',
  marginTop: '18px'
}

const chipGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px'
}

const chipStyle = {
  display: 'inline-flex',
  padding: '10px 12px',
  borderRadius: '999px',
  background: 'rgba(154, 106, 34, 0.12)',
  color: '#5c3512',
  fontSize: '0.88rem',
  fontWeight: '850'
}

const subScoreGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '12px',
  marginTop: '16px'
}

const subScoreCardStyle = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255, 255, 255, 0.72)',
  border: '1px solid rgba(139, 92, 40, 0.14)'
}

const scoreLabelStyle = {
  color: '#9a6a22',
  fontWeight: '900'
}

const progressTrackStyle = {
  width: '100%',
  height: '9px',
  margin: '12px 0',
  borderRadius: '999px',
  background: 'rgba(139, 92, 40, 0.16)',
  overflow: 'hidden'
}

const progressFillStyle = {
  height: '100%',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)'
}

const listStyle = {
  margin: '0',
  paddingLeft: '20px',
  color: '#5c4632',
  lineHeight: '1.8'
}

const listGridStyle = {
  display: 'grid',
  gap: '12px',
  marginTop: '12px'
}

const subHeadingStyle = {
  margin: '34px 0 16px',
  color: '#5c3512',
  fontSize: '1.6rem'
}

const coinBadgeStyle = {
  height: 'fit-content',
  padding: '10px 14px',
  borderRadius: '999px',
  fontWeight: '900'
}

const dateTextStyle = {
  margin: '10px 0 0',
  color: '#6b5540',
  fontSize: '0.85rem'
}

const certificatePreviewStyle = {
  marginTop: '28px',
  padding: '42px',
  borderRadius: '30px',
  textAlign: 'center',
  background:
    'linear-gradient(135deg, rgba(92, 53, 18, 0.98), rgba(154, 106, 34, 0.94))',
  color: '#fff8eb',
  border: '1px solid rgba(244, 210, 138, 0.35)',
  boxShadow: '0 30px 80px rgba(92, 53, 18, 0.22)'
}

const certificateTitleStyle = {
  margin: '0 auto 12px',
  maxWidth: '760px',
  color: '#fff8eb',
  fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: '1',
  letterSpacing: '-0.06em'
}

const certificateTextStyle = {
  margin: '0 auto 18px',
  maxWidth: '780px',
  color: 'rgba(255, 248, 235, 0.88)',
  lineHeight: '1.7'
}

const certificateNameStyle = {
  margin: '28px auto',
  padding: '18px',
  maxWidth: '520px',
  borderTop: '1px solid rgba(244, 210, 138, 0.45)',
  borderBottom: '1px solid rgba(244, 210, 138, 0.45)',
  color: '#f4d28a',
  fontSize: '2rem',
  fontWeight: '900'
}

export default GameHome