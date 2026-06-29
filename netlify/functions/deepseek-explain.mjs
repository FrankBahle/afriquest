export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { problemCard, selectedSolution, correctSolution, userExplanation } =
      await req.json()

    if (!problemCard || !selectedSolution || !correctSolution || !userExplanation) {
      throw new Error(
        'Missing required fields: problemCard, selectedSolution, correctSolution, userExplanation'
      )
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is not set')
    }

    const prompt = `You are an evaluator for a game called AfriQuest. A player is shown a real-world problem in Africa and a technology/AI solution. The player must (1) pick a solution and (2) write an explanation of why that solution is the best fit for the problem.

Your job: Grade the player's explanation on a scale of 1 to 10 based on how realistic the solution is for that problem AND how well the player articulates why it's the best choice.

Consider:
- How realistically does the solution address the specific problem?
- Is the explanation thoughtful, specific, and well-reasoned?
- Does the player connect the solution's features to the problem's details?
- Feasibility in an African context (infrastructure, cost, accessibility)

=== PROBLEM CARD ===
Title: ${problemCard.title}
Problem Type: ${problemCard.problem_type}
Problem: ${problemCard.problem}
SDG Goals: ${(problemCard.sdg_goals || []).join(', ')}

=== CORRECT SOLUTION ===
Title: ${correctSolution.title}
Description: ${correctSolution.description}

=== SELECTED SOLUTION ===
Title: ${selectedSolution.title}
Description: ${selectedSolution.description}
Was it correct? ${selectedSolution.cardId === correctSolution.cardId ? 'YES' : 'NO (player chose the wrong solution)'}

=== PLAYER'S EXPLANATION ===
"${userExplanation}"

=== INSTRUCTIONS ===
Respond with ONLY a valid JSON object (no markdown, no code fences). The JSON must have exactly these fields:
{
  "grade": <number 1-10>,
  "feedback": "<2-3 sentences of encouraging, constructive feedback. Mention what was good and how they could improve.>"
}`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a fair, encouraging evaluator. You always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      const errBody = await response.text()
      throw new Error(`DeepSeek API error (${response.status}): ${errBody}`)
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content || ''

    let parsed
    try {
      const cleaned = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error(`Failed to parse DeepSeek response as JSON. Raw: ${content.slice(0, 200)}`)
    }

    if (typeof parsed.grade !== 'number' || !parsed.feedback) {
      throw new Error(`Invalid response structure from DeepSeek: ${JSON.stringify(parsed)}`)
    }

    return new Response(
      JSON.stringify({
        grade: Math.round(Math.max(1, Math.min(10, parsed.grade))),
        feedback: parsed.feedback
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
