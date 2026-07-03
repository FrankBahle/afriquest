import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { COLLECTIONS, db } from '../firebaseService'

function cleanText(value) {
  return String(value || '').trim()
}

function createRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value.seconds) return value.seconds * 1000
  return Date.parse(value) || 0
}

function isSchemaDocument(row) {
  const id = cleanText(row.firestoreId || row.roomId).toLowerCase()
  return id === '__schema' || id.includes('__schema') || id.includes('sample')
}

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

export async function getMultiplayerRooms() {
  const [rooms, players] = await Promise.all([
    getCollectionRows(COLLECTIONS.multiplayerRooms),
    getCollectionRows(COLLECTIONS.roomPlayers)
  ])

  return rooms
    .filter((room) => !isSchemaDocument(room))
    .map((room) => {
      const roomPlayers = players.filter((player) => String(player.roomId) === String(room.roomId || room.firestoreId))
      return {
        roomId: room.roomId || room.firestoreId,
        roomCode: room.roomCode || room.firestoreId,
        roomName: room.roomName || 'Multiplayer Room',
        mode: room.mode || 'challenge',
        status: room.status || 'waiting',
        maxPlayers: Number(room.maxPlayers || 4),
        playerCount: Number(room.playerCount || roomPlayers.length),
        createdBy: room.createdBy || '',
        createdByName: room.createdByName || 'Player',
        createdAtMillis: toMillis(room.createdAt),
        currentProblemId: room.currentProblemId || '',
        roomPlayers
      }
    })
    .sort((a, b) => b.createdAtMillis - a.createdAtMillis)
}

export async function createMultiplayerRoom({ userId, displayName, roomName, mode, maxPlayers }) {
  if (!userId) throw new Error('User ID is required to create a room.')

  const roomCode = createRoomCode()
  const roomId = `room_${roomCode}`
  const safeRoomName = cleanText(roomName) || `${displayName || 'Player'} Room`
  const safeMode = cleanText(mode) || 'challenge'
  const safeMaxPlayers = Number(maxPlayers || 4)

  await setDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), {
    roomId,
    roomCode,
    roomName: safeRoomName,
    mode: safeMode,
    status: 'waiting',
    maxPlayers: safeMaxPlayers,
    playerCount: 1,
    createdBy: userId,
    createdByName: cleanText(displayName) || 'Player',
    currentProblemId: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  await setDoc(doc(db, COLLECTIONS.roomPlayers, `${roomId}_${userId}`), {
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: 'host',
    teamId: '',
    status: 'joined',
    score: 0,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return roomId
}

export async function joinMultiplayerRoom({ userId, displayName, roomCode }) {
  if (!userId) throw new Error('User ID is required to join a room.')
  const safeRoomCode = cleanText(roomCode).toUpperCase()
  if (!safeRoomCode) throw new Error('Room code is required.')

  const roomId = safeRoomCode.startsWith('ROOM_') ? safeRoomCode.toLowerCase() : `room_${safeRoomCode}`
  const roomSnapshot = await getDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId))

  if (!roomSnapshot.exists()) throw new Error('Room was not found.')

  const room = roomSnapshot.data()
  const playerCount = Number(room.playerCount || 0)
  const maxPlayers = Number(room.maxPlayers || 4)
  if (playerCount >= maxPlayers) throw new Error('This room is already full.')

  await setDoc(doc(db, COLLECTIONS.roomPlayers, `${roomId}_${userId}`), {
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode: room.roomCode || safeRoomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: 'player',
    teamId: '',
    status: 'joined',
    score: 0,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  await updateDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), {
    playerCount: playerCount + 1,
    updatedAt: serverTimestamp()
  })

  return roomId
}

export async function seedMultiplayerTableSamples(userId = 'sample_user') {
  const roomId = 'room_SAMPLE'

  await setDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), {
    roomId,
    roomCode: 'SAMPLE',
    roomName: 'Sample Challenge Room',
    mode: 'challenge',
    status: 'waiting',
    maxPlayers: 4,
    playerCount: 1,
    createdBy: userId,
    createdByName: 'Sample Player',
    currentProblemId: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  await setDoc(doc(db, COLLECTIONS.teams, 'team_SAMPLE'), {
    teamId: 'team_SAMPLE',
    roomId,
    teamName: 'Sample Team',
    teamScore: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  await setDoc(doc(db, COLLECTIONS.debates, 'debate_SAMPLE'), {
    debateId: 'debate_SAMPLE',
    roomId,
    prompt: 'Which AI solution is most realistic for the African context?',
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  await setDoc(doc(db, COLLECTIONS.tournaments, 'tournament_SAMPLE'), {
    tournamentId: 'tournament_SAMPLE',
    title: 'Sample GLA AI Tournament',
    status: 'draft',
    roundCount: 3,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })

  return 4
}
