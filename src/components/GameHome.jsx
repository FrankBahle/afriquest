import { useMemo, useState } from 'react'
import { gradeExplanation } from '../services/deepseekService'
import problemCards from '../assets/json/grit_lab_africa_problem_cards.json'
import card1 from '../assets/images/card1.jpeg'
import card2 from '../assets/images/card2.jpeg'

const solutionBank = [
  {
    cardId: 1,
    title: 'AI skills and job-matching platform',
    description:
      'Matches young people to jobs, internships, training opportunities and entrepreneurship pathways.'
  },
  {
    cardId: 2,
    title: 'AI career guidance chatbot',
    description:
      'Guides learners through career options, subject choices, study pathways and future planning.'
  },
  {
    cardId: 3,
    title: 'Learner support and early-warning dashboard',
    description:
      'Helps schools identify learners at risk of dropping out and connect them to support earlier.'
  },
  {
    cardId: 4,
    title: 'AI tutoring assistant',
    description:
      'Provides homework help, revision support and step-by-step explanations outside the classroom.'
  },
  {
    cardId: 5,
    title: 'Offline-first digital learning hub',
    description:
      'Allows learners to access educational content even when internet access is limited or expensive.'
  },
  {
    cardId: 6,
    title: 'Device-sharing and tech access platform',
    description:
      'Connects learners to shared devices, refurbished laptops and community technology resources.'
  },
  {
    cardId: 7,
    title: 'Illegal dumping reporting app',
    description:
      'Lets residents report dumping hotspots with photos, locations and alerts for clean-up teams.'
  },
  {
    cardId: 8,
    title: 'Smart waste collection tracker',
    description:
      'Uses reports and data to help waste services identify missed collections and overflowing bins.'
  },
  {
    cardId: 9,
    title: 'Community safety alert system',
    description:
      'Helps residents report unsafe areas, receive alerts and share safety information quickly.'
  },
  {
    cardId: 10,
    title: 'Streetlight fault reporting map',
    description:
      'Allows communities to report broken lights and helps municipalities prioritise repairs.'
  },
  {
    cardId: 11,
    title: 'Road damage reporting platform',
    description:
      'Collects pothole and road damage reports using images, locations and repair tracking.'
  },
  {
    cardId: 12,
    title: 'AI traffic and route optimisation tool',
    description:
      'Uses transport data to suggest better routes and reduce delays during busy travel periods.'
  },
  {
    cardId: 13,
    title: 'Public transport information assistant',
    description:
      'Gives commuters better information about routes, taxi availability, stops and safer travel options.'
  },
  {
    cardId: 14,
    title: 'Local business discovery marketplace',
    description:
      'Helps small businesses improve visibility, reach nearby customers and advertise online.'
  },
  {
    cardId: 15,
    title: 'Youth entrepreneurship support platform',
    description:
      'Connects young business owners to mentors, tools, funding information and market access.'
  },
  {
    cardId: 16,
    title: 'Financial literacy learning chatbot',
    description:
      'Teaches budgeting, saving, debt management and basic money skills in a simple way.'
  },
  {
    cardId: 17,
    title: 'Community food access coordination app',
    description:
      'Connects households, food donors, gardens and local support services to improve food access.'
  },
  {
    cardId: 18,
    title: 'Mental health support chatbot',
    description:
      'Provides early emotional support, coping tips and guidance on where to find professional help.'
  },
  {
    cardId: 19,
    title: 'Substance abuse prevention support tool',
    description:
      'Shares prevention resources, support contacts and safe guidance for youth and families.'
  },
  {
    cardId: 20,
    title: 'Health information assistant',
    description:
      'Gives clear health information about symptoms, prevention and where to access services.'
  },
  {
    cardId: 21,
    title: 'Digital queue management system',
    description:
      'Helps clinics and public offices manage waiting times, appointments and service flow.'
  },
  {
    cardId: 22,
    title: 'Water leak reporting and monitoring tool',
    description:
      'Allows residents to report leaks and helps teams track water loss and repairs.'
  },
  {
    cardId: 23,
    title: 'Power interruption planning assistant',
    description:
      'Helps learners, families and businesses plan around electricity interruptions and backup options.'
  },
  {
    cardId: 24,
    title: 'Youth safe-space mapping platform',
    description:
      'Maps safe recreational, learning and creative spaces available to young people.'
  },
  {
    cardId: 25,
    title: 'Safe GBV support access tool',
    description:
      'Provides discreet access to awareness resources, reporting options and emergency support contacts.'
  },
  {
    cardId: 26,
    title: 'Opportunity notification platform',
    description:
      'Sends young people timely alerts about jobs, scholarships, events and learning opportunities.'
  },
  {
    cardId: 27,
    title: 'Civic issue reporting chatbot',
    description:
      'Makes it easier for residents to report local issues and track responses from service providers.'
  },
  {
    cardId: 28,
    title: 'Small business analytics dashboard',
    description:
      'Helps business owners track sales, customers and trends so they can make better decisions.'
  },
  {
    cardId: 29,
    title: 'Future skills recommendation engine',
    description:
      'Recommends relevant skills, courses and career pathways based on available opportunities.'
  },
  {
    cardId: 30,
    title: 'Community problem early-warning system',
    description:
      'Helps communities identify small issues early before they become bigger social problems.'
  }
]

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function createRound(cards) {
  const randomCard = cards[Math.floor(Math.random() * cards.length)]
  const correctSolution = solutionBank.find(
    (solution) => solution.cardId === randomCard.id
  )

  const wrongSolutions = shuffleArray(
    solutionBank.filter((solution) => solution.cardId !== randomCard.id)
  ).slice(0, 3)

  const options = shuffleArray([correctSolution, ...wrongSolutions])

  return {
    card: randomCard,
    correctSolution,
    options
  }
}

function GameHome({ currentUser }) {
  const cards = problemCards.cards || []

  const [round, setRound] = useState(() => createRound(cards))
  const [selectedSolution, setSelectedSolution] = useState(null)
  const [score, setScore] = useState(0)
  const [roundCount, setRoundCount] = useState(1)
  const [isChanging, setIsChanging] = useState(false)

  const [userExplanation, setUserExplanation] = useState('')
  const [hasSubmittedExplanation, setHasSubmittedExplanation] = useState(false)
  const [aiGrade, setAiGrade] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

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
  const hasAnswered = Boolean(selectedSolution)
  const isCorrect = selectedSolution?.cardId === round.correctSolution.cardId

  async function submitExplanation() {
    if (!userExplanation.trim() || hasSubmittedExplanation) return

    setAiError('')
    setAiLoading(true)

    try {
      const result = await gradeExplanation({
        problemCard: round.card,
        selectedSolution,
        correctSolution: round.correctSolution,
        userExplanation: userExplanation.trim()
      })

      setAiGrade(result)
      setHasSubmittedExplanation(true)
    } catch (err) {
      setAiError(err.message || 'Grading failed.')
    } finally {
      setAiLoading(false)
    }
  }

  function handleSelectSolution(solution) {
	if (hasAnswered) return

	setSelectedSolution(solution)

	if (solution.cardId === round.correctSolution.cardId) {
		setScore((previousScore) => previousScore + 1)
	}
  }

  function handleNextRound() {
    setIsChanging(true)

    setTimeout(() => {
      setRound(createRound(cards))
	  setSelectedSolution(null)
	  setUserExplanation('')
	  setHasSubmittedExplanation(false)
	  setAiGrade(null)
	  setAiError('')
	  setAiLoading(false)
	  setRoundCount((previousCount) => previousCount + 1)
	  setIsChanging(false)
    }, 450)
  }

  return (
    <section
      className="gameSection"
      style={{
        width: 'min(1450px, calc(100vw - 48px))',
        margin: '40px auto 80px'
      }}
    >
      <div
        className="gameShell"
        style={{
          minHeight: '720px',
          padding: '44px',
          display: 'grid',
          gridTemplateColumns: '0.85fr 1.15fr',
          gap: '34px',
          alignItems: 'center',
          borderRadius: '38px',
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(232, 214, 170, 0.7))',
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
          <p
            style={{
              margin: '0 0 14px',
              color: '#9a6a22',
              fontSize: '0.78rem',
              fontWeight: '850',
              letterSpacing: '0.16em',
              textTransform: 'uppercase'
            }}
          >
            Welcome back, {fullName}
          </p>

          <h1
            style={{
              margin: '0 0 20px',
              color: '#4b2b10',
              fontSize: 'clamp(2.8rem, 5.4vw, 5.1rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.07em',
              fontWeight: '900'
            }}
          >
            Pick the best solution.
          </h1>

          <p
            style={{
              margin: '0 0 26px',
              maxWidth: '620px',
              color: '#5c4632',
              fontSize: '1.05rem',
              lineHeight: '1.75'
            }}
          >
            Hi {firstName}, you have received a random problem card. Read the
            challenge and choose the technology solution that fits it best.
          </p>

          <div
            className="gameStats"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '28px'
            }}
          >
            <div
              style={{
                padding: '18px',
                borderRadius: '22px',
                background: 'rgba(255, 255, 255, 0.58)',
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
                {score}
              </strong>
              <span
                style={{
                  color: '#6b5540',
                  fontSize: '0.9rem',
                  fontWeight: '650'
                }}
              >
                Score
              </span>
            </div>

            <div
              style={{
                padding: '18px',
                borderRadius: '22px',
                background: 'rgba(255, 255, 255, 0.58)',
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
                {roundCount}
              </strong>
              <span
                style={{
                  color: '#6b5540',
                  fontSize: '0.9rem',
                  fontWeight: '650'
                }}
              >
                Round
              </span>
            </div>

            <div
              style={{
                padding: '18px',
                borderRadius: '22px',
                background: 'rgba(255, 255, 255, 0.58)',
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
                {problemCards.card_count}
              </strong>
              <span
                style={{
                  color: '#6b5540',
                  fontSize: '0.9rem',
                  fontWeight: '650'
                }}
              >
                Cards
              </span>
            </div>
          </div>

          <div
            className="problemCardVisual"
            style={{
              position: 'relative',
              minHeight: '510px',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 28px 60px rgba(0, 0, 0, 0.26)',
              transform: 'rotate(-2deg)'
            }}
          >
            <img
              src={card2}
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
                background:
                  'linear-gradient(180deg, rgba(3, 8, 20, 0.08), rgba(3, 8, 20, 0.68))'
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
              <p
                style={{
                  margin: '0 0 8px',
                  color: '#f4d28a',
                  fontSize: '0.76rem',
                  fontWeight: '850',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
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
                  color: 'rgba(255, 248, 235, 0.86)',
                  lineHeight: '1.65'
                }}
              >
                {round.card.problem}
              </p>
            </div>
          </div>
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
            style={{
              padding: '26px',
              borderRadius: '28px',
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(139, 92, 40, 0.18)',
              boxShadow: '0 18px 42px rgba(80, 52, 20, 0.12)'
            }}
          >
            <p
              style={{
                margin: '0 0 10px',
                color: '#9a6a22',
                fontSize: '0.74rem',
                fontWeight: '850',
                letterSpacing: '0.14em',
                textTransform: 'uppercase'
              }}
            >
              Think about it
            </p>

            <h3
              style={{
                margin: '0',
                color: '#3b2817',
                fontSize: '1.55rem',
                lineHeight: '1.15',
                letterSpacing: '-0.04em'
              }}
            >
              {round.card.think_about_it}
            </h3>
          </div>

          <div
            className="solutionGrid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px'
            }}
          >
            {round.options.map((solution) => {
              const selected = selectedSolution?.cardId === solution.cardId
              const correct = solution.cardId === round.correctSolution.cardId

              let background = 'rgba(255, 255, 255, 0.66)'
              let color = '#3b2817'
              let border = '1px solid rgba(139, 92, 40, 0.18)'

              if (hasAnswered && correct) {
                background =
                  'linear-gradient(135deg, rgba(154, 106, 34, 0.96), rgba(92, 53, 18, 0.96))'
                color = '#fff8eb'
                border = '1px solid rgba(244, 210, 138, 0.5)'
              }

              if (hasAnswered && selected && !correct) {
                background = 'rgba(88, 31, 20, 0.88)'
                color = '#fff8eb'
                border = '1px solid rgba(255, 255, 255, 0.16)'
              }

              return (
                <button
                  key={solution.cardId}
                  onClick={() => handleSelectSolution(solution)}
                  style={{
                    minHeight: '150px',
                    padding: '20px',
                    textAlign: 'left',
                    cursor: hasAnswered ? 'default' : 'pointer',
                    borderRadius: '24px',
                    background,
                    color,
                    border,
                    boxShadow: selected
                      ? '0 20px 44px rgba(80, 52, 20, 0.22)'
                      : '0 14px 34px rgba(80, 52, 20, 0.1)',
                    transform: selected ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 8px',
                      color: hasAnswered && correct ? '#f4d28a' : '#9a6a22',
                      fontSize: '0.72rem',
                      fontWeight: '850',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {hasAnswered && correct
                      ? 'Correct Match'
                      : hasAnswered && selected
                        ? 'Your Choice'
                        : 'Solution Option'}
                  </p>

                  <h4
                    style={{
                      margin: '0 0 10px',
                      fontSize: '1.18rem',
                      lineHeight: '1.15',
                      letterSpacing: '-0.035em'
                    }}
                  >
                    {solution.title}
                  </h4>

                  <p
                    style={{
                      margin: '0',
                      fontSize: '0.92rem',
                      lineHeight: '1.55',
                      opacity: 0.84
                    }}
                  >
                    {solution.description}
                  </p>
                </button>
              )
            })}
          </div>

          {hasAnswered && (
            <div
              style={{
                padding: '24px',
                borderRadius: '28px',
                background:
                  'linear-gradient(135deg, rgba(255, 248, 235, 0.88), rgba(244, 210, 138, 0.42))',
                border: '1px solid rgba(154, 106, 34, 0.22)',
                color: '#3b2817',
                boxShadow: '0 18px 42px rgba(80, 52, 20, 0.14)',
                animation: 'fadeIn 0.35s ease'
              }}
            >
              <p
                style={{
                  margin: '0 0 10px',
                  color: '#9a6a22',
                  fontSize: '0.74rem',
                  fontWeight: '850',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase'
                }}
              >
                Explain Your Choice
              </p>

              {!hasSubmittedExplanation && (
                <>
                  <p
                    style={{
                      margin: '0 0 12px',
                      color: '#5c4632',
                      fontSize: '0.94rem',
                      lineHeight: '1.55'
                    }}
                  >
                    In a few sentences, explain why this solution is the best fit
                    for the problem. DeepSeek will grade your explanation on how
                    realistic and well-reasoned it is.
                  </p>

                  <textarea
                    value={userExplanation}
                    onChange={(e) => setUserExplanation(e.target.value)}
                    placeholder="I think this solution is the best because..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '16px',
                      border: '1px solid rgba(139, 92, 40, 0.25)',
                      background: 'rgba(255, 255, 255, 0.78)',
                      color: '#3b2817',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />

                  <button
                    onClick={submitExplanation}
                    disabled={!userExplanation.trim() || aiLoading}
                    style={{
                      marginTop: '12px',
                      border: '0',
                      cursor: userExplanation.trim() && !aiLoading
                        ? 'pointer'
                        : 'default',
                      borderRadius: '999px',
                      padding: '12px 28px',
                      background:
                        userExplanation.trim() && !aiLoading
                          ? 'linear-gradient(135deg, #9a6a22, #5c3512)'
                          : 'rgba(139, 92, 40, 0.3)',
                      color: '#fff8eb',
                      fontWeight: '850',
                      fontSize: '0.9rem',
                      boxShadow:
                        userExplanation.trim() && !aiLoading
                          ? '0 10px 24px rgba(92, 53, 18, 0.22)'
                          : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Submit for Grading
                  </button>
                </>
              )}

              {aiLoading && (
                <p
                  style={{
                    margin: '0',
                    lineHeight: '1.65',
                    color: '#5c4632'
                  }}
                >
                  DeepSeek is evaluating your explanation...
                </p>
              )}

              {aiError && (
                <p
                  style={{
                    margin: '0',
                    lineHeight: '1.65',
                    color: '#7f1d1d'
                  }}
                >
                  {aiError}
                </p>
              )}

              {aiGrade && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: '14px'
                    }}
                  >
                    <div
                      style={{
                        width: '58px',
                        height: '58px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, #9a6a22, #5c3512)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff8eb',
                        fontSize: '1.5rem',
                        fontWeight: '900'
                      }}
                    >
                      {aiGrade.grade}/10
                    </div>
                    <p
                      style={{
                        margin: '0',
                        color: '#9a6a22',
                        fontSize: '0.78rem',
                        fontWeight: '850',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase'
                      }}
                    >
                      Realism Grade
                    </p>
                  </div>

                  <p
                    style={{
                      margin: '0',
                      lineHeight: '1.65',
                      color: '#5c4632',
                      fontSize: '0.94rem'
                    }}
                  >
                    {aiGrade.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          <div
            className="gameBottomGrid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 0.8fr',
              gap: '16px',
              alignItems: 'stretch'
            }}
          >
            <div
              style={{
                padding: '22px',
                borderRadius: '26px',
                background: 'rgba(92, 53, 18, 0.92)',
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
                Examples
              </p>

              <ul
                style={{
                  margin: '0',
                  paddingLeft: '18px',
                  lineHeight: '1.7',
                  color: 'rgba(255, 248, 235, 0.86)'
                }}
              >
                {round.card.examples?.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>

            <div
              style={{
                position: 'relative',
                minHeight: '180px',
                borderRadius: '26px',
                overflow: 'hidden',
                boxShadow: '0 18px 42px rgba(80, 52, 20, 0.14)'
              }}
            >
              <img
                src={card1}
                alt="AI card design"
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
                  background: 'rgba(92, 53, 18, 0.45)'
                }}
              ></div>

              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '22px',
                  color: '#fff8eb'
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    color: '#f4d28a',
                    fontSize: '0.74rem',
                    fontWeight: '850',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase'
                  }}
                >
                  AI Card
                </p>

                <h3
                  style={{
                    margin: '0',
                    fontSize: '1.35rem',
                    lineHeight: '1.1'
                  }}
                >
                  Match the card to the right solution.
                </h3>
              </div>
            </div>
          </div>

          <button
            className="nextProblemButton"
            onClick={handleNextRound}
            style={{
              width: 'fit-content',
              border: '0',
              cursor: 'pointer',
              borderRadius: '999px',
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
              color: '#fff8eb',
              fontWeight: '850',
              boxShadow: '0 14px 30px rgba(92, 53, 18, 0.24)'
            }}
          >
            {hasAnswered ? 'Next Random Problem' : 'Shuffle Problem'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default GameHome