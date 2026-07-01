const RUBRIC_LIMITS = {
  ai_card_relevance: 20,
  combination_strength: 15,
  practical_feasibility: 15,
  african_context_and_feasibility: 15,
  sdg_alignment: 15,
  creativity_and_innovation: 10,
  ethical_and_responsible_use: 10
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

function cleanJsonResponse(content) {
  return String(content || '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
}

function toNumber(value, fallback = 0) {
  const number = Number(value)

  if (Number.isFinite(number)) {
    return number
  }

  return fallback
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function pickNumber(source, possibleKeys, fallback = 0) {
  if (!source || typeof source !== 'object') {
    return fallback
  }

  for (const key of possibleKeys) {
    if (source[key] !== undefined && source[key] !== null) {
      return toNumber(source[key], fallback)
    }
  }

  return fallback
}

function normaliseSubScores(subScores = {}) {
  const normalised = {
    ai_card_relevance: clamp(
      Math.round(
        pickNumber(subScores, [
          'ai_card_relevance',
          'aiCardRelevance',
          'AI Card Relevance',
          'AI card relevance'
        ])
      ),
      0,
      RUBRIC_LIMITS.ai_card_relevance
    ),

    combination_strength: clamp(
      Math.round(
        pickNumber(subScores, [
          'combination_strength',
          'combinationStrength',
          'Combination Strength',
          'combination strength'
        ])
      ),
      0,
      RUBRIC_LIMITS.combination_strength
    ),

    practical_feasibility: clamp(
      Math.round(
        pickNumber(subScores, [
          'practical_feasibility',
          'practicalFeasibility',
          'Practical Feasibility',
          'practical feasibility'
        ])
      ),
      0,
      RUBRIC_LIMITS.practical_feasibility
    ),

    african_context_and_feasibility: clamp(
      Math.round(
        pickNumber(subScores, [
          'african_context_and_feasibility',
          'africanContextAndFeasibility',
          'African Context and Feasibility',
          'african context and feasibility'
        ])
      ),
      0,
      RUBRIC_LIMITS.african_context_and_feasibility
    ),

    sdg_alignment: clamp(
      Math.round(
        pickNumber(subScores, [
          'sdg_alignment',
          'sdgAlignment',
          'SDG Alignment',
          'sdg alignment'
        ])
      ),
      0,
      RUBRIC_LIMITS.sdg_alignment
    ),

    creativity_and_innovation: clamp(
      Math.round(
        pickNumber(subScores, [
          'creativity_and_innovation',
          'creativityAndInnovation',
          'Creativity and Innovation',
          'creativity and innovation'
        ])
      ),
      0,
      RUBRIC_LIMITS.creativity_and_innovation
    ),

    ethical_and_responsible_use: clamp(
      Math.round(
        pickNumber(subScores, [
          'ethical_and_responsible_use',
          'ethicalAndResponsibleUse',
          'Ethical and Responsible Use',
          'ethical and responsible use'
        ])
      ),
      0,
      RUBRIC_LIMITS.ethical_and_responsible_use
    )
  }

  return normalised
}

function sumSubScores(subScores) {
  return Object.values(subScores).reduce((total, score) => total + score, 0)
}

function normaliseEvaluation(parsed) {
  const subScores = normaliseSubScores(parsed?.sub_scores || parsed?.subScores)

  let totalScore = Math.round(
    toNumber(
      parsed?.total_score ??
        parsed?.totalScore ??
        parsed?.score ??
        parsed?.GLA_coin_earned,
      sumSubScores(subScores)
    )
  )

  if (totalScore <= 0) {
    totalScore = sumSubScores(subScores)
  }

  totalScore = clamp(totalScore, 1, 100)

  return {
    total_score: totalScore,
    GLA_coin_earned: totalScore,
    sub_scores: subScores,
    feedback: {
      overall:
        parsed?.feedback?.overall ||
        parsed?.overall_feedback ||
        parsed?.overallFeedback ||
        'Your idea has been reviewed. The score shows how realistic, practical, ethical and useful the solution is.',
      improvement:
        parsed?.feedback?.improvement ||
        parsed?.improvement ||
        parsed?.improvement_suggestion ||
        'Improve your answer by explaining who will use the solution, how it will work, what resources are needed, and why it fits the African context.'
    }
  }
}

async function callDeepSeek({ apiKey, model, prompt }) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are the AfriQuest DeepSeek evaluator. You must return valid JSON only. You rate African AI solution ideas from 1 to 100 based on realism, practicality, SDG value, ethics and usefulness. Never return markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_object'
      },
      thinking: {
        type: 'disabled'
      },
      temperature: 0.2,
      max_tokens: 900
    })
  })

  const data = await response.json().catch(() => ({}))

  return {
    response,
    data
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Only POST requests are allowed.'
    })
  }

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY

    const requestedModel = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'

    const model = ['deepseek-v4-flash', 'deepseek-v4-pro'].includes(
      requestedModel
    )
      ? requestedModel
      : 'deepseek-v4-flash'

    if (!apiKey) {
      return jsonResponse(500, {
        error: 'DeepSeek API key has not been configured.'
      })
    }

    const body = JSON.parse(event.body || '{}')

    const problemCard = body.problemCard
    const selectedSolution = body.selectedSolution
    const selectedAiCards = body.selectedAiCards || []
    const userExplanation = String(body.userExplanation || '').trim()

    if (!problemCard) {
      return jsonResponse(400, {
        error: 'Problem card is missing.'
      })
    }

    if (!selectedSolution && selectedAiCards.length === 0) {
      return jsonResponse(400, {
        error: 'Please select at least one AI card before submitting.'
      })
    }

    if (!userExplanation) {
      return jsonResponse(400, {
        error: 'Please write a short explanation before submitting.'
      })
    }

    const selectedAiCardsText =
      selectedAiCards.length > 0
        ? selectedAiCards
            .map((card, index) => {
              return `${index + 1}. ${card.title}
Type: ${card.type}
What it can do: ${card.canDo}`
            })
            .join('\n\n')
        : `Title: ${selectedSolution.title}
Description: ${selectedSolution.description}`

    const prompt = `
Return valid JSON only.

You are evaluating a player's AfriQuest solution.

The player is not choosing a single correct answer.
The player is using AI cards to design a realistic solution for an African problem.

IMPORTANT RULES:
- Rate the idea from 1 to 100.
- Do not return 0 for normal weak answers.
- If the player says "I don't know", "not sure", or gives a very weak explanation, still score it between 1 and 15 and give helpful feedback.
- Do not say "I cannot evaluate this".
- Do not judge the answer as simply correct or wrong.
- Judge how realistic, practical, useful, ethical and African-context-aware the idea is.
- If the idea is unsafe, harmful, discriminatory, or gives dangerous advice, give a very low score and explain the safety problem.
- For health, mental health, GBV, crime, substance abuse or emergency topics, encourage safe support, privacy, human oversight and appropriate services.

PROBLEM CARD:
Title: ${problemCard.title}
Problem Type: ${problemCard.problem_type}
Problem: ${problemCard.problem}
Examples: ${(problemCard.examples || []).join(', ')}
Think About It: ${problemCard.think_about_it}
SDG Goals: ${(problemCard.sdg_goals || []).join(', ')}

SELECTED AI CARD(S):
${selectedAiCardsText}

PLAYER EXPLANATION:
"${userExplanation}"

SCORING RUBRIC:
1. AI card relevance: 20 marks
2. Combination strength: 15 marks
3. Practical feasibility: 15 marks
4. African context and feasibility: 15 marks
5. SDG alignment: 15 marks
6. Creativity and innovation: 10 marks
7. Ethical and responsible use: 10 marks

The total score must be the sum of the sub-scores.
The total score must be between 1 and 100.

Return exactly this JSON shape:

{
  "total_score": 72,
  "GLA_coin_earned": 72,
  "sub_scores": {
    "ai_card_relevance": 15,
    "combination_strength": 10,
    "practical_feasibility": 11,
    "african_context_and_feasibility": 12,
    "sdg_alignment": 12,
    "creativity_and_innovation": 6,
    "ethical_and_responsible_use": 6
  },
  "feedback": {
    "overall": "Short feedback explaining why this score was given.",
    "improvement": "One clear way the player can improve the solution."
  }
}
`

    let deepseekData = null
    let content = ''

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const { response, data } = await callDeepSeek({
        apiKey,
        model,
        prompt
      })

      deepseekData = data

      if (!response.ok) {
        return jsonResponse(response.status, {
          error:
            data?.error?.message ||
            'DeepSeek could not score the explanation right now.'
        })
      }

      content = cleanJsonResponse(data?.choices?.[0]?.message?.content)

      if (content) {
        break
      }
    }

    if (!content) {
      return jsonResponse(502, {
        error:
          'DeepSeek returned an empty response. Please try again in a few seconds.'
      })
    }

    let parsed

    try {
      parsed = JSON.parse(content)
    } catch {
      return jsonResponse(502, {
        error:
          'DeepSeek returned an invalid JSON response. Please try again.'
      })
    }

    const normalised = normaliseEvaluation(parsed)

    return jsonResponse(200, normalised)
  } catch (err) {
    return jsonResponse(500, {
      error: err.message || 'Internal server error.'
    })
  }
}