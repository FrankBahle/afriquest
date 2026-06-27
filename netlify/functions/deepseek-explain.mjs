function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      error: 'Only POST requests are allowed.'
    })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'

  if (!apiKey) {
    return jsonResponse(500, {
      error: 'DeepSeek API key has not been configured.'
    })
  }

  let body

  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse(400, {
      error: 'Invalid request body.'
    })
  }

  const { problemCard, selectedSolution, correctSolution } = body

  if (!problemCard || !correctSolution) {
    return jsonResponse(400, {
      error: 'Problem card and correct solution are required.'
    })
  }

  const userChoiceText = selectedSolution
    ? `${selectedSolution.title}: ${selectedSolution.description}`
    : 'The player did not choose a solution.'

  const prompt = `
You are the AfriQuest AI mentor.

A learner is playing an educational game where they must match a real African problem with the best technology solution.

Explain the match in simple, encouraging language.

Problem title:
${problemCard.title}

Problem type:
${problemCard.problem_type}

Problem:
${problemCard.problem}

Examples:
${problemCard.examples?.join(', ') || 'No examples provided'}

Question to think about:
${problemCard.think_about_it}

Player selected:
${userChoiceText}

Correct solution:
${correctSolution.title}: ${correctSolution.description}

Your answer must:
1. Start by saying whether the player's choice was correct or not.
2. Explain why the correct solution fits the problem.
3. Give one simple real-life example.
4. Keep it under 140 words.
5. Use simple language for students.
`

  try {
    const deepseekResponse = await fetch(
      'https://api.deepseek.com/chat/completions',
      {
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
                'You explain social innovation and technology solutions to students in a simple and helpful way.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          thinking: {
            type: 'disabled'
          },
          stream: false,
          max_tokens: 350
        })
      }
    )

    const data = await deepseekResponse.json()

    if (!deepseekResponse.ok) {
      return jsonResponse(deepseekResponse.status, {
        error:
          data?.error?.message ||
          'DeepSeek could not generate an explanation right now.'
      })
    }

    const explanation =
      data?.choices?.[0]?.message?.content ||
      'No explanation was returned by DeepSeek.'

    return jsonResponse(200, {
      explanation
    })
  } catch {
    return jsonResponse(500, {
      error: 'Something went wrong while contacting DeepSeek.'
    })
  }
}