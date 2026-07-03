import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { COLLECTIONS, db } from '../firebaseService'

const STARTER_REWARDS = [
  {
    rewardId: 'reward_certificate_showcase',
    title: 'Certificate Showcase',
    description: 'Feature your certificate on the GRIT Lab Africa learning showcase.',
    sponsorName: 'GRIT Lab Africa',
    rewardType: 'recognition',
    requiredCompletedProblems: 10,
    requiredAverageScore: 75,
    isActive: true,
    order: 1
  },
  {
    rewardId: 'reward_innovation_badge',
    title: 'Innovation Badge',
    description: 'Unlock a public launch badge for strong AI and SDG problem-solving.',
    sponsorName: 'GRIT Lab Africa',
    rewardType: 'badge',
    requiredCompletedProblems: 5,
    requiredAverageScore: 70,
    isActive: true,
    order: 2
  }
]

function cleanText(value) {
  return String(value || '').trim()
}

function isSchemaDocument(row) {
  const id = cleanText(row.firestoreId || row.rewardId || row.claimId).toLowerCase()
  return id === '__schema' || id.includes('__schema') || id.includes('sample')
}

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

export async function seedStarterRewardsLaunchData() {
  await Promise.all(
    STARTER_REWARDS.map((reward) =>
      setDoc(doc(db, COLLECTIONS.sponsorRewards, reward.rewardId), {
        ...reward,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
    )
  )

  await setDoc(doc(db, COLLECTIONS.launchSettings, 'publicLaunch'), {
    launchId: 'publicLaunch',
    launchStatus: 'pilot',
    launchTitle: 'GRIT Lab Africa AI for SDGs Card Game Pilot',
    launchMessage: 'The game is ready for pilot testing with learners and youth innovators.',
    allowPublicRegistration: true,
    allowRewardClaims: true,
    sponsorMessage: 'Sponsor-supported rewards can be activated for launch programmes.',
    updatedAt: serverTimestamp()
  }, { merge: true })

  return STARTER_REWARDS.length
}

export async function getRewardsLaunchData(userId = '') {
  const [rewards, claims, launchRows] = await Promise.all([
    getCollectionRows(COLLECTIONS.sponsorRewards),
    getCollectionRows(COLLECTIONS.rewardClaims),
    getCollectionRows(COLLECTIONS.launchSettings)
  ])

  const userClaims = claims.filter((claim) => !isSchemaDocument(claim) && String(claim.userId) === String(userId))
  const launchSettings = launchRows.find((row) => row.firestoreId === 'publicLaunch') || {
    launchStatus: 'pilot',
    launchTitle: 'GRIT Lab Africa AI for SDGs Card Game Pilot',
    launchMessage: 'The game is being prepared for public launch.',
    allowPublicRegistration: true,
    allowRewardClaims: true,
    sponsorMessage: 'Sponsor-supported features can be connected from Firebase.'
  }

  return {
    rewards: rewards
      .filter((reward) => !isSchemaDocument(reward))
      .filter((reward) => reward.isActive !== false)
      .map((reward) => ({
        rewardId: reward.rewardId || reward.firestoreId,
        title: reward.title || 'Sponsor Reward',
        description: reward.description || 'Reward details coming soon.',
        sponsorName: reward.sponsorName || 'GRIT Lab Africa',
        rewardType: reward.rewardType || 'recognition',
        requiredCompletedProblems: Number(reward.requiredCompletedProblems || 0),
        requiredAverageScore: Number(reward.requiredAverageScore || 0),
        order: Number(reward.order || 99)
      }))
      .sort((a, b) => a.order - b.order),
    claims: userClaims,
    launchSettings
  }
}

export async function claimSponsorReward({ userId, reward, completedProblems, averageScore }) {
  if (!userId) throw new Error('User ID is required to claim a reward.')
  if (!reward?.rewardId) throw new Error('Reward is missing.')

  const canClaim =
    Number(completedProblems || 0) >= Number(reward.requiredCompletedProblems || 0) &&
    Number(averageScore || 0) >= Number(reward.requiredAverageScore || 0)

  if (!canClaim) throw new Error('You have not met this reward requirement yet.')

  const claimId = `${userId}_${reward.rewardId}`

  await setDoc(doc(db, COLLECTIONS.rewardClaims, claimId), {
    claimId,
    userId,
    rewardId: reward.rewardId,
    rewardTitle: reward.title,
    sponsorName: reward.sponsorName,
    claimStatus: 'submitted',
    completedProblems: Number(completedProblems || 0),
    averageScore: Number(averageScore || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  return claimId
}
