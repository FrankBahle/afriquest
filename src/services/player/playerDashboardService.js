import { getDocs, query, where } from 'firebase/firestore'
import {
  PLAYER_COLLECTIONS,
  playerCollection
} from './playerFirebaseService'
import { getPlayerProfile } from './playerProfileService'
import { logDashboardViewed } from './playerAnalyticsService'

function toSafeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function getTimeValue(value) {
  if (!value) return 0

  if (typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  const parsedDate = new Date(value).getTime()

  return Number.isFinite(parsedDate) ? parsedDate : 0
}

function sortNewestFirst(items) {
  return [...items].sort(
    (a, b) =>
      getTimeValue(b.createdAt || b.issuedAt) -
      getTimeValue(a.createdAt || a.issuedAt)
  )
}

async function getPlayerCollectionRows(collectionName, userId) {
  if (!userId) {
    return []
  }

  const collectionQuery = query(
    playerCollection(collectionName),
    where('userId', '==', userId)
  )

  const collectionSnap = await getDocs(collectionQuery)

  return collectionSnap.docs.map((itemDoc) => ({
    id: itemDoc.id,
    ...itemDoc.data()
  }))
}

export async function getPlayerDashboardAttempts(userId) {
  const attempts = await getPlayerCollectionRows(
    PLAYER_COLLECTIONS.attempts,
    userId
  )

  return sortNewestFirst(attempts)
}

export async function getPlayerDashboardScores(userId) {
  const scores = await getPlayerCollectionRows(
    PLAYER_COLLECTIONS.scores,
    userId
  )

  return sortNewestFirst(scores)
}

export async function getPlayerDashboardCoinTransactions(userId) {
  const transactions = await getPlayerCollectionRows(
    PLAYER_COLLECTIONS.glaCoinTransactions,
    userId
  )

  return sortNewestFirst(transactions)
}

export async function getPlayerDashboardCertificates(userId) {
  const certificates = await getPlayerCollectionRows(
    PLAYER_COLLECTIONS.certificates,
    userId
  )

  return sortNewestFirst(certificates)
}

export async function getPlayerDashboardAchievements(userId) {
  const playerAchievements = await getPlayerCollectionRows(
    PLAYER_COLLECTIONS.playerAchievements,
    userId
  )

  return sortNewestFirst(playerAchievements)
}

export async function getAvailableAchievements() {
  const achievementsQuery = query(
    playerCollection(PLAYER_COLLECTIONS.achievements),
    where('isActive', '==', true)
  )

  const achievementsSnap = await getDocs(achievementsQuery)

  return achievementsSnap.docs.map((achievementDoc) => ({
    id: achievementDoc.id,
    ...achievementDoc.data()
  }))
}

function buildScoreLookup(scores) {
  const scoreLookup = {}

  scores.forEach((score) => {
    if (!score.attemptId) return

    scoreLookup[score.attemptId] = score
  })

  return scoreLookup
}

function buildAttemptRows(attempts, scores) {
  const scoreLookup = buildScoreLookup(scores)

  return attempts.map((attempt) => {
    const matchingScore = scoreLookup[attempt.attemptId || attempt.id] || {}

    return {
      ...attempt,
      totalScore: toSafeNumber(
        matchingScore.totalScore ?? attempt.totalScore
      ),
      glaCoinEarned: toSafeNumber(
        matchingScore.glaCoinEarned ?? attempt.glaCoinEarned
      ),
      scoreId: matchingScore.scoreId || matchingScore.id || ''
    }
  })
}

function buildProblemStats(attemptRows) {
  const stats = {}

  attemptRows.forEach((attempt) => {
    const problemId = String(attempt.problemCardId || attempt.problemId || '')

    if (!problemId) return

    const problemTitle =
      attempt.problemCardTitle ||
      attempt.problemTitle ||
      `Problem ${problemId}`

    if (!stats[problemId]) {
      stats[problemId] = {
        problemId,
        problemTitle,
        first: attempt,
        latest: attempt,
        best: attempt,
        count: 1
      }

      return
    }

    const current = stats[problemId]

    current.count += 1

    if (
      getTimeValue(attempt.createdAt) >
      getTimeValue(current.latest.createdAt)
    ) {
      current.latest = attempt
    }

    if (
      getTimeValue(attempt.createdAt) <
      getTimeValue(current.first.createdAt)
    ) {
      current.first = attempt
    }

    if (
      toSafeNumber(attempt.totalScore) >
      toSafeNumber(current.best.totalScore)
    ) {
      current.best = attempt
    }
  })

  return stats
}

function buildCompletedProblemRows(problemStats) {
  return Object.values(problemStats).map((stats) => ({
    id: stats.problemId,
    problemId: stats.problemId,
    problemTitle: stats.problemTitle,
    firstScore: toSafeNumber(stats.first.totalScore),
    latestScore: toSafeNumber(stats.latest.totalScore),
    bestScore: toSafeNumber(stats.best.totalScore),
    attempts: stats.count,
    latestAttempt: stats.latest,
    bestAttempt: stats.best
  }))
}

function buildBestScoringProblems(completedProblemRows) {
  return [...completedProblemRows]
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 5)
}

function calculateAverageScore(completedProblemRows) {
  if (completedProblemRows.length === 0) {
    return 0
  }

  const total = completedProblemRows.reduce(
    (sum, problem) => sum + toSafeNumber(problem.bestScore),
    0
  )

  return Math.round(total / completedProblemRows.length)
}

function calculateCoinSummary(transactions) {
  const totalGlaCoinEarned = transactions
    .filter((transaction) => transaction.type === 'earned')
    .reduce((sum, transaction) => sum + toSafeNumber(transaction.amount), 0)

  const totalGlaCoinSpent = transactions
    .filter((transaction) => transaction.type === 'spent')
    .reduce((sum, transaction) => sum + toSafeNumber(transaction.amount), 0)

  return {
    totalGlaCoinEarned,
    totalGlaCoinSpent,
    glaCoinSpentOnHints: totalGlaCoinSpent
  }
}

function getLatestCertificate(certificates) {
  if (certificates.length === 0) {
    return null
  }

  return sortNewestFirst(certificates)[0]
}

function buildAchievementSummary(playerAchievements, availableAchievements) {
  const unlockedAchievements = playerAchievements.filter(
    (achievement) => achievement.isUnlocked === true
  )

  return {
    availableAchievementCount: availableAchievements.length,
    playerAchievementCount: playerAchievements.length,
    unlockedAchievementCount: unlockedAchievements.length,
    unlockedAchievements,
    playerAchievements,
    availableAchievements
  }
}

export function buildPlayerDashboardSummary({
  profile,
  attempts,
  scores,
  coinTransactions,
  certificates,
  playerAchievements,
  availableAchievements
}) {
  const attemptRows = buildAttemptRows(attempts, scores)
  const problemStats = buildProblemStats(attemptRows)
  const completedProblemRows = buildCompletedProblemRows(problemStats)
  const bestScoringProblems = buildBestScoringProblems(completedProblemRows)
  const averageScore = calculateAverageScore(completedProblemRows)
  const completedProblemCount = completedProblemRows.length
  const latestAttempt = sortNewestFirst(attemptRows)[0] || null
  const latestCertificate = getLatestCertificate(certificates)
  const coinSummary = calculateCoinSummary(coinTransactions)
  const achievementSummary = buildAchievementSummary(
    playerAchievements,
    availableAchievements
  )

  const certificateUnlocked =
    profile?.certificateUnlocked === true ||
    latestCertificate?.isUnlocked === true ||
    (completedProblemCount >= 10 && averageScore >= 75)

  return {
    profile,
    attempts: attemptRows,
    scores,
    coinTransactions,
    certificates,
    latestCertificate,
    playerAchievements,
    availableAchievements,
    achievementSummary,
    attemptStatsByProblem: problemStats,
    completedProblemRows,
    completedProblems: completedProblemCount,
    completedProblemCount,
    averageScore,
    bestScore:
      bestScoringProblems.length > 0 ? bestScoringProblems[0].bestScore : 0,
    bestScoringProblems,
    latestAttempt,
    glaCoinBalance: toSafeNumber(profile?.glaCoinBalance),
    totalGlaCoinEarned: toSafeNumber(
      profile?.totalGlaCoinEarned,
      coinSummary.totalGlaCoinEarned
    ),
    totalGlaCoinSpent: toSafeNumber(
      profile?.totalGlaCoinSpent,
      coinSummary.totalGlaCoinSpent
    ),
    glaCoinSpentOnHints: coinSummary.glaCoinSpentOnHints,
    totalHintsUsed: toSafeNumber(profile?.totalHintsUsed),
    certificateUnlocked,
    certificationProgress: Math.min(10, completedProblemCount)
  }
}

export async function getPlayerDashboardData(userId) {
  if (!userId) {
    return null
  }

  const [
    profile,
    attempts,
    scores,
    coinTransactions,
    certificates,
    playerAchievements,
    availableAchievements
  ] = await Promise.all([
    getPlayerProfile(userId),
    getPlayerDashboardAttempts(userId),
    getPlayerDashboardScores(userId),
    getPlayerDashboardCoinTransactions(userId),
    getPlayerDashboardCertificates(userId),
    getPlayerDashboardAchievements(userId),
    getAvailableAchievements()
  ])

  await logDashboardViewed(userId)

  return buildPlayerDashboardSummary({
    profile,
    attempts,
    scores,
    coinTransactions,
    certificates,
    playerAchievements,
    availableAchievements
  })
}