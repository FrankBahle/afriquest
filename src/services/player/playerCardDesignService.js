import { collection, getDocs } from 'firebase/firestore'
import { COLLECTIONS, db } from '../firebaseService'

function cleanText(value) {
  return String(value || '').trim()
}

function isSchemaDocument(row) {
  const id = cleanText(row.firestoreId || row.id).toLowerCase()
  return id === '__schema' || id.includes('__schema') || id.includes('sample')
}

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

function normaliseCard(row, cardType) {
  return {
    firestoreId: row.firestoreId,
    id: row.id || row.firestoreId,
    cardType,
    title: cleanText(row.title) || `${cardType === 'ai' ? 'AI' : 'Problem'} Card`,
    subtitle: cleanText(row.problem_type || row.ai_type || row.type || row.cardTheme),
    description: cleanText(row.problem || row.what_it_can_do || row.canDo || row.description),
    frontImageUrl: cleanText(row.frontImageUrl || row.imageUrl || row.illustrationUrl),
    backImageUrl: cleanText(row.backImageUrl),
    frontImageName: cleanText(row.frontImageName),
    backImageName: cleanText(row.backImageName),
    isActive: row.isActive !== false,
    cardTheme: cleanText(row.cardTheme) || (cardType === 'ai' ? 'gold' : 'dark-blue'),
    sdgGoals: row.sdg_goals || []
  }
}

export async function getPlayerCardDesigns() {
  const [problemCards, aiCards] = await Promise.all([
    getCollectionRows(COLLECTIONS.problemCards),
    getCollectionRows(COLLECTIONS.aiCards)
  ])

  return {
    problemCards: problemCards.filter((row) => !isSchemaDocument(row)).map((row) => normaliseCard(row, 'problem')),
    aiCards: aiCards.filter((row) => !isSchemaDocument(row)).map((row) => normaliseCard(row, 'ai'))
  }
}
