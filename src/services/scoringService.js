async function postScore(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        'The scoring engine could not score the explanation right now.'
    )
  }

  if (!data || typeof data !== 'object') {
    throw new Error('The scoring engine returned an empty result.')
  }

  return data
}

export async function gradeExplanation({
  problemCard,
  selectedSolution,
  selectedAiCards = [],
  userExplanation
}) {
  const payload = {
    problemCard,
    selectedSolution,
    selectedAiCards,
    userExplanation
  }

  const endpoints = ['/api/deepseek/explain', '/api/scoring/explain']
  const errors = []

  for (const endpoint of endpoints) {
    try {
      return await postScore(endpoint, payload)
    } catch (error) {
      errors.push(error.message)
    }
  }

  throw new Error(errors.find(Boolean) || 'The scoring engine could not score the explanation right now.')
}
