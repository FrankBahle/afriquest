export async function explainSolution({
  problemCard,
  selectedSolution,
  correctSolution
}) {
  const response = await fetch('/api/deepseek/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      problemCard,
      selectedSolution,
      correctSolution
    })
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Could not generate AI explanation.')
  }

  return data.explanation
}