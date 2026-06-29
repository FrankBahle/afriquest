export async function gradeExplanation({
  problemCard,
  selectedSolution,
  correctSolution,
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
      correctSolution,
      userExplanation
    })
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Could not grade explanation.')
  }

  return {
    grade: data.grade,
    feedback: data.feedback
  }
}
