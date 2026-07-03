import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { COLLECTIONS, cleanFirestoreData, db } from '../firebaseService'

export const DEFAULT_PLAYER_SETTINGS = {
  preferredLanguage: 'en',
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  cardFlipEnabled: true,
  soundEnabled: false,
  autoTranslate: true,
  showCardImages: true,
  compactMode: false
}

export async function getPlayerSettings(userId) {
  if (!userId) return DEFAULT_PLAYER_SETTINGS
  const snapshot = await getDoc(doc(db, COLLECTIONS.users, userId))
  if (!snapshot.exists()) return DEFAULT_PLAYER_SETTINGS
  const data = snapshot.data()
  return { ...DEFAULT_PLAYER_SETTINGS, ...(data.playerSettings || {}), preferredLanguage: data.preferredLanguage || data.playerSettings?.preferredLanguage || DEFAULT_PLAYER_SETTINGS.preferredLanguage }
}

export async function savePlayerSettings(userId, settings) {
  if (!userId) throw new Error('User ID is required to save settings.')
  const merged = { ...DEFAULT_PLAYER_SETTINGS, ...settings }
  await setDoc(doc(db, COLLECTIONS.users, userId), cleanFirestoreData({
    preferredLanguage: merged.preferredLanguage,
    playerSettings: merged,
    settingsUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })
  return merged
}

export function applyPlayerSettingsToDocument(settings) {
  const root = document.documentElement
  root.dataset.glaHighContrast = settings.highContrast ? 'true' : 'false'
  root.dataset.glaLargeText = settings.largeText ? 'true' : 'false'
  root.dataset.glaReduceMotion = settings.reduceMotion ? 'true' : 'false'
  root.dataset.glaCompactMode = settings.compactMode ? 'true' : 'false'
}
