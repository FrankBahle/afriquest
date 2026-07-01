import { useMemo, useState } from 'react'
import { gradeExplanation } from '../services/deepseekService'
import problemCards from '../assets/json/grit_lab_africa_problem_cards.json'
import card1 from '../assets/images/card1.jpeg'
import card2 from '../assets/images/card2.jpeg'

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

function getAiResultScore(result) {
  if (!result) return 0

  if (typeof result.total_score === 'number') return result.total_score
  if (typeof result.totalScore === 'number') return result.totalScore
  if (typeof result.score === 'number') return result.score
  if (typeof result.GLA_coin_earned === 'number') return result.GLA_coin_earned
  if (typeof result.grade === 'number') return Math.round(result.grade * 10)

  return 0
}

function normaliseAiResult(result) {
  const totalScore = Math.max(0, Math.min(100, getAiResultScore(result)))

  return {
    totalScore,
    glaCoinEarned:
      result?.GLA_coin_earned ||
      result?.glaCoinEarned ||
      result?.gla_coin_earned ||
      totalScore,
    overallFeedback:
      result?.feedback?.overall ||
      result?.overallFeedback ||
      (typeof result?.feedback === 'string' ? result.feedback : '') ||
      'DeepSeek has reviewed the idea. Use the feedback to improve your solution.',
    improvement:
      result?.feedback?.improvement ||
      result?.improvement ||
      'Make the explanation more specific about how the solution will work in real life.',
    subScores: result?.sub_scores || result?.subScores || null
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
    setIsChanging(true)

    setTimeout(() => {
      setRound(createRound(activeProblemStack))
      resetRound()
      setIsChanging(false)
    }, 400)
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
    if (
      selectedAiCards.length === 0 ||
      !userExplanation.trim() ||
      explanationTooLong ||
      hasSubmittedExplanation
    ) {
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
  userExplanation: userExplanation.trim()
})

      const normalisedResult = normaliseAiResult(result)

      setAiResult(normalisedResult)
      setHasSubmittedExplanation(true)
      setGlaCoinBalance((previousBalance) =>
        previousBalance + normalisedResult.glaCoinEarned
      )

      setAttempts((previousAttempts) => [
        ...previousAttempts,
        {
          id: Date.now(),
          problemId: round.card.id,
          problemTitle: round.card.title,
          selectedAiCards,
          explanation: userExplanation.trim(),
          totalScore: normalisedResult.totalScore,
          glaCoinEarned: normalisedResult.glaCoinEarned,
          feedback: normalisedResult.overallFeedback,
          createdAt: new Date().toLocaleString()
        }
      ])
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

    setGlaCoinBalance((previousBalance) => previousBalance - 20)
    setHintMessage(generateBasicHint(round.card))
    setShowHintConfirm(false)
  }

  function renderTopNavigation() {
    return (
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}
      >
        {[
          ['intro', 'Game Guide'],
          ['select', 'Problem Selection'],
          ['play', 'Play Game'],
          ['dashboard', 'Dashboard'],
          ['certificate', 'Certificate']
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              if (value === 'play' && !round.card) {
                startGame()
                return
              }

              setScreen(value)
            }}
            style={{
              border: '0',
              borderRadius: '999px',
              padding: '11px 18px',
              cursor: 'pointer',
              background:
                screen === value
                  ? 'linear-gradient(135deg, #9a6a22, #5c3512)'
                  : 'rgba(255, 255, 255, 0.62)',
              color: screen === value ? '#fff8eb' : '#5c3512',
              fontWeight: '850',
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            margin: '28px auto 0',
            maxWidth: '880px',
            justifyContent: 'center'
          }}
        >
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
          <button
            onClick={() => setScreen('select')}
            style={{
              ...primaryButtonStyle,
              marginTop: 0
            }}
          >
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginTop: '24px'
          }}
        >
          {cards.map((card) => {
            const selected = selectedProblemIds.includes(card.id)

            return (
              <button
                key={card.id}
                onClick={() => toggleProblemCard(card.id)}
                style={{
                  padding: '18px',
                  minHeight: '180px',
                  borderRadius: '24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: selected
                    ? '2px solid rgba(154, 106, 34, 0.75)'
                    : '1px solid rgba(139, 92, 40, 0.18)',
                  background: selected
                    ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.96), rgba(244, 210, 138, 0.44))'
                    : 'rgba(255, 255, 255, 0.64)',
                  color: '#3b2817',
                  boxShadow: selected
                    ? '0 20px 42px rgba(80, 52, 20, 0.18)'
                    : '0 12px 28px rgba(80, 52, 20, 0.08)'
                }}
              >
                <p style={eyebrowStyle}>
                  {selected ? 'Selected' : 'Problem Card'}
                </p>

                <h3 style={smallCardTitleStyle}>{card.title}</h3>

                <p style={smallCardTextStyle}>{card.problem}</p>

                <p
                  style={{
                    margin: '12px 0 0',
                    color: '#9a6a22',
                    fontSize: '0.82rem',
                    fontWeight: '800'
                  }}
                >
                  {card.problem_type}
                </p>
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
              marginTop: 0,
              opacity: selectedProblemIds.length < 10 ? 0.45 : 1,
              cursor: selectedProblemIds.length < 10 ? 'default' : 'pointer'
            }}
          >
            Start Game with Selected Problems
          </button>
        </div>

        {selectedProblemIds.length < 10 && (
          <p
            style={{
              ...paragraphStyle,
              color: '#7f1d1d',
              marginTop: '12px',
              textAlign: 'center'
            }}
          >
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
            <button
              onClick={() => setScreen('select')}
              style={{
                ...primaryButtonStyle,
                marginTop: 0
              }}
            >
              Go to Problem Selection
            </button>
          </div>
        </div>
      )
    }

    return (
      <section
        className="gameSection"
        style={{
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div
          className="gameShell"
          style={{
            minHeight: '720px',
            padding: '34px',
            display: 'grid',
            gridTemplateColumns: '0.85fr 1.15fr',
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
          }}
        >
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

            <div
              style={{
                marginTop: '18px',
                padding: '22px',
                borderRadius: '26px',
                background:
                  'linear-gradient(135deg, rgba(92, 53, 18, 0.96), rgba(154, 106, 34, 0.9))',
                color: '#fff8eb',
                boxShadow: '0 18px 42px rgba(92, 53, 18, 0.22)'
              }}
            >
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#f4d28a',
                  fontSize: '0.74rem',
                  fontWeight: '850',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase'
                }}
              >
                Current Prompt
              </p>

              <h3
                style={{
                  margin: '0 0 12px',
                  fontSize: '1.25rem',
                  lineHeight: '1.35'
                }}
              >
                {round.card.title}
              </h3>

              <p
                style={{
                  margin: '0 0 12px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 248, 235, 0.9)'
                }}
              >
                {round.card.problem}
              </p>

              <p
                style={{
                  margin: '0',
                  lineHeight: '1.6',
                  color: '#f4d28a',
                  fontWeight: '750'
                }}
              >
                {round.card.think_about_it}
              </p>
            </div>

            <div className="gameStats" style={metricGridStyle}>
              <MetricCard title="GLA Coin" value={glaCoinBalance} />
              <MetricCard title="Completed" value={`${certificationProgress}/10`} />
              <MetricCard title="Average" value={`${averageScore}%`} />
            </div>

            <button
              onClick={() => setFlippedProblem(!flippedProblem)}
              style={{
                width: '100%',
                border: '0',
                padding: '0',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '20px'
              }}
            >
              <div
                className="problemCardVisual"
                style={{
                  position: 'relative',
                  minHeight: '510px',
                  borderRadius: '30px',
                  overflow: 'hidden',
                  boxShadow: '0 28px 60px rgba(0, 0, 0, 0.26)',
                  transform: 'rotate(-1.5deg)'
                }}
              >
                <img
                  src={flippedProblem ? card1 : card2}
                  alt="Problem card design"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: flippedProblem
                      ? 'linear-gradient(135deg, rgba(3, 8, 20, 0.82), rgba(8, 22, 46, 0.74))'
                      : 'linear-gradient(180deg, rgba(3, 8, 20, 0.08), rgba(3, 8, 20, 0.72))'
                  }}
                ></div>

                <div
                  style={{
                    position: 'absolute',
                    left: '24px',
                    right: '24px',
                    bottom: '28px',
                    color: '#fff8eb'
                  }}
                >
                  {flippedProblem ? (
                    <>
                      <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                        Problem Card Back
                      </p>

                      <h3 style={{ margin: '0 0 12px', fontSize: '2rem' }}>
                        GRIT Lab Africa
                      </h3>

                      <p style={{ margin: '0', lineHeight: '1.65' }}>
                        Click again to view the current problem card.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                        {round.card.problem_type}
                      </p>

                      <h3
                        style={{
                          margin: '0 0 12px',
                          fontSize: '1.75rem',
                          lineHeight: '1.1'
                        }}
                      >
                        {round.card.title}
                      </h3>

                      <p
                        style={{
                          margin: '0',
                          color: 'rgba(255, 248, 235, 0.88)',
                          lineHeight: '1.65'
                        }}
                      >
                        {round.card.problem}
                      </p>
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
                padding: '24px',
                borderRadius: '28px',
                background:
                  selectedAiCards.length > 0
                    ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.9), rgba(244, 210, 138, 0.42))'
                    : 'rgba(255, 255, 255, 0.7)',
                border: '2px dashed rgba(154, 106, 34, 0.38)',
                boxShadow: '0 18px 42px rgba(80, 52, 20, 0.12)'
              }}
            >
              <p style={eyebrowStyle}>Solution Board</p>

              <h3 style={smallCardTitleStyle}>
                Drop or tap up to 3 AI cards here.
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '12px',
                  marginTop: '16px'
                }}
              >
                {selectedAiCards.length === 0 && (
                  <div
                    style={{
                      padding: '18px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.58)',
                      color: '#6b5540',
                      lineHeight: '1.55'
                    }}
                  >
                    No AI cards selected yet.
                  </div>
                )}

                {selectedAiCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => removeSelectedAiCard(card.id)}
                    style={{
                      padding: '16px',
                      border: '1px solid rgba(154, 106, 34, 0.3)',
                      borderRadius: '20px',
                      background:
                        'linear-gradient(135deg, rgba(154, 106, 34, 0.96), rgba(92, 53, 18, 0.96))',
                      color: '#fff8eb',
                      textAlign: 'left',
                      cursor: hasSubmittedExplanation ? 'default' : 'pointer'
                    }}
                  >
                    <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                      Selected AI
                    </p>

                    <strong>{card.title}</strong>

                    <p style={{ margin: '8px 0 0', lineHeight: '1.5' }}>
                      {card.type}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div style={panelInnerStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <p style={eyebrowStyle}>AI Card Library</p>

                  <h3 style={smallCardTitleStyle}>
                    All 30 AI cards are available.
                  </h3>
                </div>

                <p
                  style={{
                    margin: '0',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    background: 'rgba(154, 106, 34, 0.12)',
                    color: '#5c3512',
                    fontWeight: '850'
                  }}
                >
                  {selectedAiCards.length}/3 selected
                </p>
              </div>

              <div
                style={{
                  maxHeight: '390px',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '12px',
                  paddingRight: '6px'
                }}
              >
                {aiCards.map((card) => {
                  const selected = selectedAiCards.some(
                    (selectedCard) => selectedCard.id === card.id
                  )
                  const flipped = flippedAiCards.includes(card.id)

                  return (
                    <div
                      key={card.id}
                      draggable={!hasSubmittedExplanation}
                      onDragStart={(event) => handleDragStart(event, card.id)}
                      style={{
                        minHeight: '190px',
                        borderRadius: '22px',
                        background: selected
                          ? 'linear-gradient(135deg, rgba(154, 106, 34, 0.96), rgba(92, 53, 18, 0.96))'
                          : flipped
                            ? 'linear-gradient(135deg, #b8860b, #5c3512)'
                            : 'rgba(255, 255, 255, 0.68)',
                        color: selected || flipped ? '#fff8eb' : '#3b2817',
                        border: selected
                          ? '1px solid rgba(244, 210, 138, 0.55)'
                          : '1px solid rgba(139, 92, 40, 0.18)',
                        boxShadow: selected
                          ? '0 18px 40px rgba(80, 52, 20, 0.24)'
                          : '0 12px 28px rgba(80, 52, 20, 0.08)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      {flipped ? (
                        <div>
                          <p style={{ ...eyebrowStyle, color: '#f4d28a' }}>
                            AI Card Back
                          </p>

                          <h4 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>
                            GRIT Lab Africa AI Card
                          </h4>

                          <p style={{ margin: '0', lineHeight: '1.55' }}>
                            Click “View Front” to see the AI capability.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p
                            style={{
                              ...eyebrowStyle,
                              color: selected ? '#f4d28a' : '#9a6a22'
                            }}
                          >
                            {selected ? 'Selected' : card.type}
                          </p>

                          <h4
                            style={{
                              margin: '0 0 10px',
                              fontSize: '1.08rem',
                              lineHeight: '1.15'
                            }}
                          >
                            {card.title}
                          </h4>

                          <p
                            style={{
                              margin: '0',
                              fontSize: '0.9rem',
                              lineHeight: '1.5',
                              opacity: 0.9
                            }}
                          >
                            {card.canDo}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                          marginTop: '14px'
                        }}
                      >
                        <button
                          onClick={() => toggleAiCard(card)}
                          disabled={
                            hasSubmittedExplanation ||
                            (!selected && selectedAiCards.length >= 3)
                          }
                          style={{
                            border: '0',
                            borderRadius: '999px',
                            padding: '9px 12px',
                            cursor:
                              hasSubmittedExplanation ||
                              (!selected && selectedAiCards.length >= 3)
                                ? 'default'
                                : 'pointer',
                            background: selected
                              ? 'rgba(255, 248, 235, 0.18)'
                              : '#5c3512',
                            color: '#fff8eb',
                            fontSize: '0.8rem',
                            fontWeight: '850',
                            opacity:
                              hasSubmittedExplanation ||
                              (!selected && selectedAiCards.length >= 3)
                                ? 0.55
                                : 1
                          }}
                        >
                          {selected ? 'Remove' : 'Select'}
                        </button>

                        <button
                          onClick={() => toggleAiFlip(card.id)}
                          style={{
                            border: '1px solid rgba(255, 248, 235, 0.35)',
                            borderRadius: '999px',
                            padding: '9px 12px',
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.14)',
                            color: selected || flipped ? '#fff8eb' : '#5c3512',
                            fontSize: '0.8rem',
                            fontWeight: '850'
                          }}
                        >
                          {flipped ? 'View Front' : 'Flip'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={panelInnerStyle}>
              <p style={eyebrowStyle}>100-word explanation</p>

              <p style={paragraphStyle}>
                Explain how your selected AI cards can solve or reduce the
                problem. Keep it practical, realistic and clear.
              </p>

              <textarea
                value={userExplanation}
                onChange={(event) => setUserExplanation(event.target.value)}
                placeholder="I think these AI cards can help because..."
                rows={5}
                disabled={hasSubmittedExplanation}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  border: explanationTooLong
                    ? '1px solid #b91c1c'
                    : '1px solid rgba(139, 92, 40, 0.25)',
                  background: 'rgba(255, 255, 255, 0.78)',
                  color: '#3b2817',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '10px'
                }}
              >
                <p
                  style={{
                    margin: '0',
                    color: explanationTooLong ? '#b91c1c' : '#6b5540',
                    fontSize: '0.9rem',
                    fontWeight: '750'
                  }}
                >
                  {wordCount}/100 words
                </p>

                <p
                  style={{
                    margin: '0',
                    color: '#6b5540',
                    fontSize: '0.9rem'
                  }}
                >
                  Selected AI cards: {selectedAiCards.length}/3
                </p>
              </div>

              {explanationTooLong && (
                <p style={{ margin: '10px 0 0', color: '#b91c1c' }}>
                  Your explanation is too long. Please reduce it to 100 words or
                  less.
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '16px'
                }}
              >
                <button
                  onClick={submitExplanation}
                  disabled={
                    selectedAiCards.length === 0 ||
                    !userExplanation.trim() ||
                    explanationTooLong ||
                    aiLoading ||
                    hasSubmittedExplanation
                  }
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 0,
                    opacity:
                      selectedAiCards.length === 0 ||
                      !userExplanation.trim() ||
                      explanationTooLong ||
                      aiLoading ||
                      hasSubmittedExplanation
                        ? 0.45
                        : 1
                  }}
                >
                  {aiLoading ? 'DeepSeek is scoring...' : 'Submit Solution'}
                </button>

                <button
                  onClick={() => setShowHintConfirm(true)}
                  disabled={hasSubmittedExplanation}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: hasSubmittedExplanation ? 0.5 : 1
                  }}
                >
                  Request Hint - 20 GLA coin
                </button>

                <button onClick={handleNextRound} style={secondaryButtonStyle}>
                  Next Problem
                </button>
              </div>

              {hintMessage && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'rgba(154, 106, 34, 0.12)',
                    color: '#5c3512',
                    lineHeight: '1.55'
                  }}
                >
                  <strong>Hint:</strong> {hintMessage}
                </div>
              )}

              {showHintConfirm && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '18px',
                    borderRadius: '20px',
                    background: 'rgba(92, 53, 18, 0.94)',
                    color: '#fff8eb'
                  }}
                >
                  <p style={{ margin: '0 0 12px', lineHeight: '1.55' }}>
                    This hint costs 20 GLA coin. Your current balance is{' '}
                    {glaCoinBalance} GLA coin.
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <button
                      onClick={confirmHintPurchase}
                      style={{
                        border: '0',
                        borderRadius: '999px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        background: '#f4d28a',
                        color: '#5c3512',
                        fontWeight: '850'
                      }}
                    >
                      Confirm Hint
                    </button>

                    <button
                      onClick={() => setShowHintConfirm(false)}
                      style={{
                        border: '1px solid rgba(255, 248, 235, 0.3)',
                        borderRadius: '999px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: '#fff8eb',
                        fontWeight: '850'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {aiError && (
                <p style={{ margin: '16px 0 0', color: '#b91c1c' }}>
                  {aiError}
                </p>
              )}

              {aiResult && (
                <div
                  style={{
                    marginTop: '18px',
                    padding: '22px',
                    borderRadius: '24px',
                    background:
                      'linear-gradient(135deg, rgba(255, 248, 235, 0.92), rgba(244, 210, 138, 0.38))',
                    border: '1px solid rgba(154, 106, 34, 0.22)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      flexWrap: 'wrap',
                      marginBottom: '16px'
                    }}
                  >
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, #9a6a22, #5c3512)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff8eb',
                        fontSize: '1.45rem',
                        fontWeight: '900'
                      }}
                    >
                      {aiResult.totalScore}
                    </div>

                    <div>
                      <p style={eyebrowStyle}>DeepSeek Score</p>

                      <h3 style={smallCardTitleStyle}>
                        {aiResult.glaCoinEarned} GLA coin earned
                      </h3>
                    </div>
                  </div>

                  <p style={paragraphStyle}>{aiResult.overallFeedback}</p>

                  <p
                    style={{
                      margin: '12px 0 0',
                      color: '#5c3512',
                      fontWeight: '850',
                      lineHeight: '1.55'
                    }}
                  >
                    Improvement: {aiResult.improvement}
                  </p>

                  {aiResult.subScores && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '10px',
                        marginTop: '18px'
                      }}
                    >
                      {Object.entries(aiResult.subScores).map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            padding: '12px',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            color: '#3b2817'
                          }}
                        >
                          <strong
                            style={{
                              display: 'block',
                              marginBottom: '6px',
                              color: '#5c3512'
                            }}
                          >
                            {key.replaceAll('_', ' ')}
                          </strong>

                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  function renderDashboardScreen() {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Player dashboard</p>

        <h1 style={sectionTitleStyle}>Your AfriQuest progress.</h1>

        <div style={metricGridStyle}>
          <MetricCard title="GLA Coin Balance" value={glaCoinBalance} />
          <MetricCard title="Completed Cards" value={completedProblems} />
          <MetricCard title="Average Score" value={`${averageScore}%`} />
          <MetricCard
            title="Certificate"
            value={certificateUnlocked ? 'Unlocked' : 'Locked'}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }}
        >
          <div style={smallCardStyle}>
            <h3 style={smallCardTitleStyle}>Selected problem cards</h3>

            <p style={smallCardTextStyle}>
              {selectedProblemIds.length} problem cards selected in your active
              stack.
            </p>
          </div>

          <div style={smallCardStyle}>
            <h3 style={smallCardTitleStyle}>Certification rule</h3>

            <p style={smallCardTextStyle}>
              Complete 10 problem cards with an average score of 75 or higher.
            </p>
          </div>

          <div style={smallCardStyle}>
            <h3 style={smallCardTitleStyle}>Hint system</h3>

            <p style={smallCardTextStyle}>
              Each hint costs 20 GLA coin and helps you think without giving away
              the full answer.
            </p>
          </div>
        </div>

        <h2
          style={{
            margin: '34px 0 16px',
            color: '#5c3512',
            fontSize: '1.6rem'
          }}
        >
          Attempt history
        </h2>

        {attempts.length === 0 ? (
          <p style={paragraphStyle}>No attempts submitted yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {[...attempts].reverse().map((attempt) => (
              <div key={attempt.id} style={smallCardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <h3 style={smallCardTitleStyle}>{attempt.problemTitle}</h3>

                  <strong style={{ color: '#9a6a22' }}>
                    {attempt.totalScore}/100
                  </strong>
                </div>

                <p style={smallCardTextStyle}>
                  AI cards:{' '}
                  {attempt.selectedAiCards.map((card) => card.title).join(', ')}
                </p>

                <p style={smallCardTextStyle}>{attempt.feedback}</p>

                <p
                  style={{
                    margin: '10px 0 0',
                    color: '#6b5540',
                    fontSize: '0.85rem'
                  }}
                >
                  Submitted: {attempt.createdAt}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderCertificateScreen() {
    return (
      <div style={panelStyle}>
        <p style={eyebrowStyle}>Certificate screen</p>

        <h1 style={sectionTitleStyle}>
          {certificateUnlocked
            ? 'Certificate unlocked.'
            : 'Certificate still locked.'}
        </h1>

        <p style={paragraphStyle}>
          Certification unlocks after 10 completed problem cards with an average
          score of at least 75 GLA coin.
        </p>

        <div
          style={{
            marginTop: '28px',
            padding: '34px',
            borderRadius: '30px',
            background: certificateUnlocked
              ? 'linear-gradient(135deg, rgba(255, 248, 235, 0.98), rgba(244, 210, 138, 0.5))'
              : 'rgba(255, 255, 255, 0.62)',
            border: certificateUnlocked
              ? '2px solid rgba(154, 106, 34, 0.45)'
              : '1px solid rgba(139, 92, 40, 0.18)',
            color: '#3b2817',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(80, 52, 20, 0.16)'
          }}
        >
          <p style={eyebrowStyle}>GRIT Lab Africa</p>

          <h2
            style={{
              margin: '0 auto 16px',
              maxWidth: '760px',
              color: '#5c3512',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              lineHeight: '1.05',
              letterSpacing: '-0.05em'
            }}
          >
            Artificial Intelligence and Practical Applications
          </h2>

          <p style={paragraphStyle}>
            Gaming SDG Problems and Ideating Solutions for Africa
          </p>

          <div
            style={{
              width: 'min(520px, 100%)',
              margin: '28px auto',
              padding: '22px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.72)'
            }}
          >
            <p style={{ margin: '0 0 10px', color: '#6b5540' }}>
              Awarded to
            </p>

            <h3
              style={{
                margin: '0',
                color: '#5c3512',
                fontSize: '2rem'
              }}
            >
              {fullName}
            </h3>
          </div>

          <div style={metricGridStyle}>
            <MetricCard title="Completed" value={`${completedProblems}/10`} />
            <MetricCard title="Average" value={`${averageScore}%`} />
            <MetricCard
              title="Status"
              value={certificateUnlocked ? 'Certified' : 'Not Yet'}
            />
          </div>

          <div style={centerButtonRowStyle}>
            <button
              onClick={() => window.print()}
              disabled={!certificateUnlocked}
              style={{
                ...primaryButtonStyle,
                marginTop: 0,
                opacity: certificateUnlocked ? 1 : 0.45,
                cursor: certificateUnlocked ? 'pointer' : 'default'
              }}
            >
              Download / Print Certificate
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      className="gameSection"
      style={{
        width: 'min(1450px, calc(100vw - 48px))',
        margin: '40px auto 80px'
      }}
    >
      {renderTopNavigation()}

      {screen === 'intro' && renderIntroScreen()}
      {screen === 'select' && renderProblemSelectionScreen()}
      {screen === 'play' && renderPlayScreen()}
      {screen === 'dashboard' && renderDashboardScreen()}
      {screen === 'certificate' && renderCertificateScreen()}
    </section>
  )
}

function MetricCard({ title, value }) {
  return (
    <div
      style={{
        padding: '18px',
        borderRadius: '22px',
        background: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(139, 92, 40, 0.16)'
      }}
    >
      <strong
        style={{
          display: 'block',
          color: '#5c3512',
          fontSize: '1.7rem'
        }}
      >
        {value}
      </strong>

      <span
        style={{
          color: '#6b5540',
          fontSize: '0.9rem',
          fontWeight: '650'
        }}
      >
        {title}
      </span>
    </div>
  )
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
  margin: '0 0 20px',
  color: '#4b2b10',
  fontSize: 'clamp(2.6rem, 5vw, 4.8rem)',
  lineHeight: '0.96',
  letterSpacing: '-0.07em',
  fontWeight: '900'
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

const metricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginTop: '18px'
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
  marginTop: '26px',
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

export default GameHome