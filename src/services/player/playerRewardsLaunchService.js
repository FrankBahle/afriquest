import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { COLLECTIONS, cleanFirestoreData, db, isSchemaDocument } from '../firebaseService'

const STARTER_REWARDS = [
  { rewardId: 'reward_certificate_showcase', title: 'Certificate Showcase', description: 'Feature your certificate on the GRIT Lab Africa learning showcase.', sponsorName: 'GRIT Lab Africa', rewardType: 'recognition', requiredCompletedProblems: 10, requiredAverageScore: 75, isActive: true, order: 1 },
  { rewardId: 'reward_innovation_badge', title: 'Innovation Badge', description: 'Unlock a public launch badge for strong AI and SDG problem-solving.', sponsorName: 'GRIT Lab Africa', rewardType: 'badge', requiredCompletedProblems: 5, requiredAverageScore: 70, isActive: true, order: 2 }
]

function cleanText(value) {
  return String(value || '').trim()
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

export async function seedStarterRewardsLaunchData() {
  await Promise.all(STARTER_REWARDS.map((reward) => setDoc(doc(db, COLLECTIONS.sponsorRewards, reward.rewardId), cleanFirestoreData({ ...reward, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), { merge: true })))

  await setDoc(doc(db, COLLECTIONS.launchSettings, 'publicLaunch'), cleanFirestoreData({
    launchId: 'publicLaunch',
    launchStatus: 'pilot',
    launchTitle: 'GRIT Lab Africa AI for SDGs Card Game Pilot',
    launchMessage: 'The game is ready for pilot testing with learners and youth innovators.',
    allowPublicRegistration: true,
    allowRewardClaims: true,
    sponsorMessage: 'Sponsor-supported rewards can be activated for launch programmes.',
    updatedAt: serverTimestamp()
  }), { merge: true })

  await setDoc(doc(db, COLLECTIONS.publicLaunchEvents, 'pilot_showcase'), cleanFirestoreData({
    eventId: 'pilot_showcase',
    title: 'Pilot Showcase',
    description: 'A public launch activity for learners to showcase AfriQuest progress.',
    eventStatus: 'planning',
    eventDate: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })

  return STARTER_REWARDS.length + 2
}

export async function getRewardsLaunchData(userId = '') {
  const [rewards, claims, launchRows, publicEvents] = await Promise.all([
    getCollectionRows(COLLECTIONS.sponsorRewards),
    getCollectionRows(COLLECTIONS.rewardClaims),
    getCollectionRows(COLLECTIONS.launchSettings),
    getCollectionRows(COLLECTIONS.publicLaunchEvents)
  ])

  const userClaims = claims.filter((claim) => !isSchemaDocument(claim) && String(claim.userId) === String(userId))
  const launchSettings = launchRows.find((row) => row.firestoreId === 'publicLaunch' || row.launchId === 'publicLaunch') || {
    launchStatus: 'pilot',
    launchTitle: 'GRIT Lab Africa AI for SDGs Card Game Pilot',
    launchMessage: 'The game is being prepared for public launch.',
    allowPublicRegistration: true,
    allowRewardClaims: true,
    sponsorMessage: 'Sponsor-supported features can be connected from Firebase.'
  }

  return {
    rewards: rewards.filter((reward) => !isSchemaDocument(reward)).filter((reward) => reward.isActive !== false).map((reward) => ({
      rewardId: reward.rewardId || reward.firestoreId,
      title: reward.title || 'Sponsor Reward',
      description: reward.description || 'Reward details coming soon.',
      sponsorName: reward.sponsorName || 'GRIT Lab Africa',
      rewardType: reward.rewardType || 'recognition',
      requiredCompletedProblems: toNumber(reward.requiredCompletedProblems),
      requiredAverageScore: toNumber(reward.requiredAverageScore),
      requiredLevel: toNumber(reward.requiredLevel),
      requiredAchievementId: cleanText(reward.requiredAchievementId),
      order: toNumber(reward.order, 99)
    })).sort((a, b) => a.order - b.order),
    claims: userClaims,
    launchSettings,
    publicLaunchEvents: publicEvents.filter((event) => !isSchemaDocument(event)).map((event) => ({
      eventId: event.eventId || event.firestoreId,
      title: cleanText(event.title) || 'Launch Event',
      description: cleanText(event.description),
      eventDate: cleanText(event.eventDate || event.date),
      eventStatus: cleanText(event.eventStatus || event.status) || 'planning'
    }))
  }
}

export async function claimSponsorReward({ userId, reward, completedProblems, averageScore }) {
  if (!userId) throw new Error('User ID is required to claim a reward.')
  if (!reward?.rewardId) throw new Error('Reward is missing.')

  const canClaim = Number(completedProblems || 0) >= Number(reward.requiredCompletedProblems || 0) && Number(averageScore || 0) >= Number(reward.requiredAverageScore || 0)
  if (!canClaim) throw new Error('You have not met this reward requirement yet.')

  const claimId = `${userId}_${reward.rewardId}`
  const payload = cleanFirestoreData({
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
  })

  await setDoc(doc(db, COLLECTIONS.rewardClaims, claimId), payload, { merge: true })
  return claimId
}
