import { collection, getDocs } from 'firebase/firestore'
import { COLLECTIONS, db } from '../firebaseService'

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function timestampToMillis(value) {
  if (!value) return 0

  if (typeof value.toMillis === 'function') {
    return value.toMillis()
  }

  if (value.seconds) {
    return value.seconds * 1000
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatDate(value) {
  const millis = timestampToMillis(value)

  if (!millis) {
    return 'Not available'
  }

  return new Date(millis).toLocaleString()
}

function getFullName(user) {
  const firstName = String(user.firstName || '').trim()
  const lastName = String(user.lastName || '').trim()
  const fullName = `${firstName} ${lastName}`.trim()

  if (fullName) return fullName
  if (user.displayName) return user.displayName
  if (user.name) return user.name
  if (user.email) return String(user.email).split('@')[0]

  return 'Player'
}

function getUserId(user) {
  return user.userId || user.uid || user.firestoreId || user.id
}

function getAttemptUserId(attempt) {
  return attempt.userId || attempt.playerId || attempt.uid || attempt.createdBy
}

function getAttemptScore(attempt) {
  return toNumber(
    attempt.totalScore ||
      attempt.total_score ||
      attempt.score ||
      attempt.GLA_coin_earned ||
      attempt.glaCoinEarned
  )
}

function isPlayerUser(user) {
  return String(user.role || 'player').toLowerCase() !== 'admin'
}

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))

  return snapshot.docs.map((documentSnapshot) => ({
    firestoreId: documentSnapshot.id,
    ...documentSnapshot.data()
  }))
}

function calculatePlayerStats(user, attempts, certificates, hintRequests, transactions) {
  const userId = getUserId(user)

  const playerAttempts = attempts.filter(
    (attempt) => String(getAttemptUserId(attempt)) === String(userId)
  )

  const bestScoreByProblem = {}

  playerAttempts.forEach((attempt) => {
    const problemId = attempt.problemId || attempt.problemCardId || attempt.cardId
    if (!problemId) return

    const score = getAttemptScore(attempt)
    bestScoreByProblem[problemId] = Math.max(bestScoreByProblem[problemId] || 0, score)
  })

  const calculatedCompleted = Object.keys(bestScoreByProblem).length

  const calculatedAverage =
    calculatedCompleted > 0
      ? Math.round(
          Object.values(bestScoreByProblem).reduce((total, score) => total + score, 0) /
            calculatedCompleted
        )
      : 0

  const playerCertificate = certificates.find(
    (certificate) =>
      String(certificate.userId || certificate.playerId || certificate.ownerId) ===
      String(userId)
  )

  const playerHints = hintRequests.filter(
    (hint) => String(hint.userId || hint.playerId || hint.uid) === String(userId)
  )

  const playerTransactions = transactions.filter(
    (transaction) =>
      String(transaction.userId || transaction.playerId || transaction.uid) ===
      String(userId)
  )

  const earned = playerTransactions
    .filter((transaction) => String(transaction.type || '').toLowerCase() === 'earned')
    .reduce((total, transaction) => total + toNumber(transaction.amount), 0)

  const spent = playerTransactions
    .filter((transaction) => String(transaction.type || '').toLowerCase() === 'spent')
    .reduce((total, transaction) => total + toNumber(transaction.amount), 0)

  const completed = toNumber(user.completedProblemCount, calculatedCompleted)
  const average = toNumber(user.averageScore, calculatedAverage)

  return {
    completed,
    average,
    attempts: playerAttempts.length,
    hintsUsed: toNumber(user.totalHintsUsed, playerHints.length),
    coin: toNumber(user.glaCoinBalance, earned - spent),
    totalGlaCoinEarned: toNumber(user.totalGlaCoinEarned, earned),
    totalGlaCoinSpent: toNumber(user.totalGlaCoinSpent, spent),
    certificate:
      user.certificateUnlocked || user.certificateId || playerCertificate
        ? 'Issued'
        : 'Pending'
  }
}

export async function getAdminPlayerAnalyticsRows() {
  const [users, attempts, certificates, hintRequests, transactions] =
    await Promise.all([
      getCollectionRows(COLLECTIONS.users),
      getCollectionRows(COLLECTIONS.attempts),
      getCollectionRows(COLLECTIONS.certificates),
      getCollectionRows(COLLECTIONS.hintRequests),
      getCollectionRows(COLLECTIONS.glaCoinTransactions)
    ])

  return users
    .filter(isPlayerUser)
    .map((user) => {
      const stats = calculatePlayerStats(
        user,
        attempts,
        certificates,
        hintRequests,
        transactions
      )

      return {
        id: getUserId(user),
        firestoreId: user.firestoreId,
        name: getFullName(user),
        email: user.email || '',
        phone: user.phone || '',
        status: user.accountStatus || 'active',
        completed: stats.completed,
        average: stats.average,
        attempts: stats.attempts,
        hintsUsed: stats.hintsUsed,
        coin: stats.coin,
        totalGlaCoinEarned: stats.totalGlaCoinEarned,
        totalGlaCoinSpent: stats.totalGlaCoinSpent,
        certificate: stats.certificate,
        lastLoginAt: user.lastLoginAt || user.updatedAt || user.createdAt,
        lastSeen: formatDate(user.lastLoginAt || user.updatedAt || user.createdAt)
      }
    })
    .sort((a, b) => timestampToMillis(b.lastLoginAt) - timestampToMillis(a.lastLoginAt))
}