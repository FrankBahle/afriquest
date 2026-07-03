import {
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import {
  PLAYER_COLLECTIONS,
  getUserRef,
  now,
  playerCollection,
  playerDoc
} from './playerFirebaseService'
import { logProfileUpdated } from './playerAnalyticsService'

const defaultPlayerFields = {
  role: 'player',
  accountStatus: 'active',
  glaCoinBalance: 0,
  totalGlaCoinEarned: 0,
  totalGlaCoinSpent: 0,
  totalHintsUsed: 0,
  completedProblemCount: 0,
  averageScore: 0,
  bestScore: 0,
  certificateUnlocked: false,
  certificateId: '',
  currentProblemStackId: '',
  activeSessionId: ''
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object') {
    return false
  }

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

function cleanData(value) {
  if (Array.isArray(value)) {
    return value.map(cleanData)
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, itemValue]) => itemValue !== undefined)
        .map(([key, itemValue]) => [key, cleanData(itemValue)])
    )
  }

  return value
}

export async function getPlayerProfile(userId) {
  if (!userId) {
    return null
  }

  const userRef = getUserRef(userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    return null
  }

  return {
    id: userSnap.id,
    ...userSnap.data()
  }
}

export async function getPlayerSelectedProblemStack(profile) {
  const stackId = profile?.currentProblemStackId

  if (!stackId) {
    return null
  }

  const stackSnap = await getDoc(
    playerDoc(PLAYER_COLLECTIONS.selectedProblemStacks, stackId)
  )

  if (!stackSnap.exists()) {
    return null
  }

  return {
    id: stackSnap.id,
    ...stackSnap.data()
  }
}

export async function createOrUpdatePlayerProfile({
  userId,
  firstName = '',
  lastName = '',
  phone = '',
  email = ''
}) {
  if (!userId) {
    throw new Error('User ID is required to create or update a player profile.')
  }

  const userRef = getUserRef(userId)

  await setDoc(
    userRef,
    cleanData({
      userId,
      firstName,
      lastName,
      phone,
      email,
      ...defaultPlayerFields,
      updatedAt: now()
    }),
    { merge: true }
  )

  return getPlayerProfile(userId)
}

export async function ensurePlayerProfile({
  userId,
  firstName = '',
  lastName = '',
  phone = '',
  email = ''
}) {
  if (!userId) {
    throw new Error('User ID is required to ensure player profile.')
  }

  const existingProfile = await getPlayerProfile(userId)

  if (existingProfile) {
    const missingFields = {}

    Object.entries(defaultPlayerFields).forEach(([key, value]) => {
      if (existingProfile[key] === undefined) {
        missingFields[key] = value
      }
    })

    if (existingProfile.userId === undefined) {
      missingFields.userId = userId
    }

    if (Object.keys(missingFields).length > 0) {
      await setDoc(
        getUserRef(userId),
        {
          ...missingFields,
          updatedAt: now()
        },
        { merge: true }
      )
    }

    return getPlayerProfile(userId)
  }

  return createOrUpdatePlayerProfile({
    userId,
    firstName,
    lastName,
    phone,
    email
  })
}

export async function updatePlayerProfile(userId, profileData) {
  if (!userId) {
    throw new Error('User ID is required to update player profile.')
  }

  const allowedFields = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    phone: profileData.phone,
    displayName: profileData.displayName
  }

  const cleanedFields = cleanData(allowedFields)
  const userRef = getUserRef(userId)

  await updateDoc(userRef, {
    ...cleanedFields,
    updatedAt: now()
  })

  await logProfileUpdated(userId, Object.keys(cleanedFields))

  return getPlayerProfile(userId)
}

export async function updatePlayerProgressSummary(userId, summaryData) {
  if (!userId) {
    throw new Error('User ID is required to update player progress.')
  }

  const allowedFields = {
    glaCoinBalance: summaryData.glaCoinBalance,
    totalGlaCoinEarned: summaryData.totalGlaCoinEarned,
    totalGlaCoinSpent: summaryData.totalGlaCoinSpent,
    totalHintsUsed: summaryData.totalHintsUsed,
    completedProblemCount: summaryData.completedProblemCount,
    averageScore: summaryData.averageScore,
    bestScore: summaryData.bestScore,
    certificateUnlocked: summaryData.certificateUnlocked,
    certificateId: summaryData.certificateId,
    currentProblemStackId: summaryData.currentProblemStackId,
    activeSessionId: summaryData.activeSessionId
  }

  const userRef = getUserRef(userId)

  await updateDoc(userRef, {
    ...cleanData(allowedFields),
    updatedAt: now()
  })

  return getPlayerProfile(userId)
}

export async function updatePlayerActiveSession(userId, activeSessionId) {
  if (!userId) {
    throw new Error('User ID is required to update active session.')
  }

  const userRef = getUserRef(userId)

  await updateDoc(userRef, {
    activeSessionId,
    updatedAt: now()
  })

  return activeSessionId
}

export async function updatePlayerCurrentProblemStack(userId, currentProblemStackId) {
  if (!userId) {
    throw new Error('User ID is required to update current problem stack.')
  }

  const userRef = getUserRef(userId)

  await updateDoc(userRef, {
    currentProblemStackId,
    updatedAt: now()
  })

  return currentProblemStackId
}

export async function getPlayerRecentAttempts(userId, resultLimit = 10) {
  if (!userId) {
    return []
  }

  const attemptsQuery = query(
    playerCollection(PLAYER_COLLECTIONS.attempts),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(resultLimit)
  )

  const attemptsSnap = await getDocs(attemptsQuery)

  return attemptsSnap.docs.map((attemptDoc) => ({
    id: attemptDoc.id,
    ...attemptDoc.data()
  }))
}

export async function getPlayerCertificates(userId) {
  if (!userId) {
    return []
  }

  const certificatesQuery = query(
    playerCollection(PLAYER_COLLECTIONS.certificates),
    where('userId', '==', userId),
    orderBy('issuedAt', 'desc')
  )

  const certificatesSnap = await getDocs(certificatesQuery)

  return certificatesSnap.docs.map((certificateDoc) => ({
    id: certificateDoc.id,
    ...certificateDoc.data()
  }))
}

export async function getPlayerCoinTransactions(userId, resultLimit = 20) {
  if (!userId) {
    return []
  }

  const transactionsQuery = query(
    playerCollection(PLAYER_COLLECTIONS.glaCoinTransactions),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(resultLimit)
  )

  const transactionsSnap = await getDocs(transactionsQuery)

  return transactionsSnap.docs.map((transactionDoc) => ({
    id: transactionDoc.id,
    ...transactionDoc.data()
  }))
}

export async function getPlayerFullProfile(userId) {
  const profile = await getPlayerProfile(userId)
  const selectedProblemStack = await getPlayerSelectedProblemStack(profile)
  const recentAttempts = await getPlayerRecentAttempts(userId)
  const certificates = await getPlayerCertificates(userId)
  const coinTransactions = await getPlayerCoinTransactions(userId)

  return {
    profile,
    selectedProblemStack,
    recentAttempts,
    certificates,
    coinTransactions
  }
}