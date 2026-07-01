export async function gradeExplanation({
  problemCard,
  selectedSolution,
  selectedAiCards = [],
  userExplanation
}) {
  const response = await fetch('/api/deepseek/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      problemCard,
      selectedSolution,
      selectedAiCards,
      userExplanation
    })
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Could not score explanation.')
  }

  return data
}