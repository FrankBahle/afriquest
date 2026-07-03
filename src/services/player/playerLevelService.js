import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { COLLECTIONS, db } from '../firebaseService'

export const PLAYER_LEVELS = [
  {
    level: 1,
    levelId: 'ai_explorer',
    title: 'AI Explorer',
    badge: '🌱',
    description: 'You are starting your AI for SDGs learning journey.',
    requiredCoin: 0,
    requiredCompletedProblems: 0,
    requiredAverageScore: 0
  },
  {
    level: 2,
    levelId: 'problem_scout',
    title: 'Problem Scout',
    badge: '🔎',
    description: 'You have started exploring African problems through AI thinking.',
    requiredCoin: 100,
    requiredCompletedProblems: 1,
    requiredAverageScore: 0
  },
  {
    level: 3,
    levelId: 'ai_ideator',
    title: 'AI Ideator',
    badge: '💡',
    description: 'You are building stronger AI solution ideas.',
    requiredCoin: 250,
    requiredCompletedProblems: 3,
    requiredAverageScore: 50
  },
  {
    level: 4,
    levelId: 'sdg_builder',
    title: 'SDG Builder',
    badge: '🌍',
    description: 'You are connecting AI ideas to SDG-related challenges.',
    requiredCoin: 500,
    requiredCompletedProblems: 5,
    requiredAverageScore: 60
  },
  {
    level: 5,
    levelId: 'innovation_candidate',
    title: 'Innovation Candidate',
    badge: '🚀',
    description: 'You are close to the certificate pathway.',
    requiredCoin: 750,
    requiredCompletedProblems: 8,
    requiredAverageScore: 70
  },
  {
    level: 6,
    levelId: 'gla_certified_innovator',
    title: 'GLA Certified Innovator',
    badge: '🎓',
    description: 'You meet the certificate-style progress requirement.',
    requiredCoin: 1000,
    requiredCompletedProblems: 10,
    requiredAverageScore: 75
  },
  {
    level: 7,
    levelId: 'african_ai_champion',
    title: 'African AI Champion',
    badge: '🏆',
    description: 'You are showing strong continued play after certification.',
    requiredCoin: 1500,
    requiredCompletedProblems: 15,
    requiredAverageScore: 80
  },
  {
    level: 8,
    levelId: 'impact_leader',
    title: 'Impact Leader',
    badge: '👑',
    description: 'You are leading through high-quality AI and SDG problem-solving.',
    requiredCoin: 2000,
    requiredCompletedProblems: 20,
    requiredAverageScore: 85
  }
]

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function getRequirementProgress(currentValue, requiredValue) {
  if (!requiredValue || requiredValue <= 0) return 100

  return Math.min(100, Math.round((currentValue / requiredValue) * 100))
}

function levelIsUnlocked(level, stats) {
  return (
    stats.totalGlaCoinEarned >= level.requiredCoin &&
    stats.completedProblems >= level.requiredCompletedProblems &&
    stats.averageScore >= level.requiredAverageScore
  )
}

function getLevelProgress(level, stats) {
  const coinProgress = getRequirementProgress(
    stats.totalGlaCoinEarned,
    level.requiredCoin
  )

  const completedProgress = getRequirementProgress(
    stats.completedProblems,
    level.requiredCompletedProblems
  )

  const averageProgress = getRequirementProgress(
    stats.averageScore,
    level.requiredAverageScore
  )

  return Math.min(coinProgress, completedProgress, averageProgress)
}

export function calculatePlayerLevelProgress({
  totalGlaCoinEarned = 0,
  completedProblems = 0,
  averageScore = 0
}) {
  const stats = {
    totalGlaCoinEarned: toNumber(totalGlaCoinEarned),
    completedProblems: toNumber(completedProblems),
    averageScore: toNumber(averageScore)
  }

  const levels = PLAYER_LEVELS.map((level) => {
    const unlocked = levelIsUnlocked(level, stats)

    return {
      ...level,
      unlocked,
      progressPercent: unlocked ? 100 : getLevelProgress(level, stats),
      coinProgress: getRequirementProgress(stats.totalGlaCoinEarned, level.requiredCoin),
      completedProgress: getRequirementProgress(
        stats.completedProblems,
        level.requiredCompletedProblems
      ),
      averageProgress: getRequirementProgress(stats.averageScore, level.requiredAverageScore)
    }
  })

  const unlockedLevels = levels.filter((level) => level.unlocked)
  const currentLevel = unlockedLevels[unlockedLevels.length - 1] || levels[0]
  const nextLevel =
    levels.find((level) => level.level > currentLevel.level && !level.unlocked) ||
    null

  const nextProgress = nextLevel ? getLevelProgress(nextLevel, stats) : 100

  return {
    stats,
    levels,
    currentLevel,
    nextLevel,
    nextProgress,
    unlockedLevelCount: unlockedLevels.length,
    maxLevelCount: levels.length
  }
}

export async function syncPlayerLevelProgress({
  userId,
  totalGlaCoinEarned = 0,
  completedProblems = 0,
  averageScore = 0
}) {
  if (!userId) {
    throw new Error('User ID is required to sync player level.')
  }

  const progress = calculatePlayerLevelProgress({
    totalGlaCoinEarned,
    completedProblems,
    averageScore
  })

  await setDoc(
    doc(db, COLLECTIONS.users, userId),
    {
      currentLevel: progress.currentLevel.level,
      currentLevelId: progress.currentLevel.levelId,
      currentLevelTitle: progress.currentLevel.title,
      nextLevelId: progress.nextLevel?.levelId || '',
      nextLevelTitle: progress.nextLevel?.title || '',
      levelProgressPercent: progress.nextProgress,
      levelUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )

  return progress
}