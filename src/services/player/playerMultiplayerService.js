import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { COLLECTIONS, cleanFirestoreData, db, isSchemaDocument } from '../firebaseService'

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

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

function getRoomId(row) {
  return cleanText(row.roomId || row.firestoreId)
}

function normaliseRoom(room, players = []) {
  const roomId = getRoomId(room)
  const roomPlayers = players.filter((player) => String(player.roomId) === String(roomId))
  return {
    roomId,
    roomCode: room.roomCode || room.firestoreId,
    roomName: room.roomName || room.title || 'Multiplayer Room',
    mode: room.mode || room.roomType || 'challenge',
    status: room.status || room.roomStatus || 'waiting',
    maxPlayers: Number(room.maxPlayers || 4),
    playerCount: Number(room.playerCount || roomPlayers.length),
    createdBy: room.createdBy || '',
    createdByName: room.createdByName || 'Player',
    createdAtMillis: toMillis(room.createdAt),
    currentProblemId: room.currentProblemId || '',
    roomPlayers
  }
}

export async function getMultiplayerHubData() {
  const [rooms, players, teams, teamSessions, debates, debateVotes, tournaments, tournamentPlayers] = await Promise.all([
    getCollectionRows(COLLECTIONS.multiplayerRooms),
    getCollectionRows(COLLECTIONS.roomPlayers),
    getCollectionRows(COLLECTIONS.teams),
    getCollectionRows(COLLECTIONS.teamSessions),
    getCollectionRows(COLLECTIONS.debates),
    getCollectionRows(COLLECTIONS.debateVotes),
    getCollectionRows(COLLECTIONS.tournaments),
    getCollectionRows(COLLECTIONS.tournamentPlayers)
  ])

  const cleanPlayers = players.filter((row) => !isSchemaDocument(row))
  const cleanRooms = rooms.filter((row) => !isSchemaDocument(row)).map((room) => normaliseRoom(room, cleanPlayers)).sort((a, b) => b.createdAtMillis - a.createdAtMillis)

  return {
    rooms: cleanRooms,
    roomPlayers: cleanPlayers,
    teams: teams.filter((row) => !isSchemaDocument(row)),
    teamSessions: teamSessions.filter((row) => !isSchemaDocument(row)),
    debates: debates.filter((row) => !isSchemaDocument(row)),
    debateVotes: debateVotes.filter((row) => !isSchemaDocument(row)),
    tournaments: tournaments.filter((row) => !isSchemaDocument(row)),
    tournamentPlayers: tournamentPlayers.filter((row) => !isSchemaDocument(row))
  }
}

export async function getMultiplayerRooms() {
  const data = await getMultiplayerHubData()
  return data.rooms
}

export async function createMultiplayerRoom({ userId, displayName, roomName, mode, maxPlayers }) {
  if (!userId) throw new Error('User ID is required to create a room.')

  const roomCode = createRoomCode()
  const roomId = `room_${roomCode}`
  const safeRoomName = cleanText(roomName) || `${displayName || 'Player'} Room`
  const safeMode = cleanText(mode) || 'challenge'
  const safeMaxPlayers = Number(maxPlayers || 4)

  await setDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), cleanFirestoreData({
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
  }))

  await setDoc(doc(db, COLLECTIONS.roomPlayers, `${roomId}_${userId}`), cleanFirestoreData({
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
  }))

  if (safeMode === 'team') {
    await setDoc(doc(db, COLLECTIONS.teams, `${roomId}_team_1`), cleanFirestoreData({
      teamId: `${roomId}_team_1`,
      roomId,
      teamName: `${safeRoomName} Team`,
      teamScore: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true })
  }

  if (safeMode === 'debate') {
    await setDoc(doc(db, COLLECTIONS.debates, `${roomId}_debate`), cleanFirestoreData({
      debateId: `${roomId}_debate`,
      roomId,
      prompt: 'Debate prompt will be selected during play.',
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true })
  }

  if (safeMode === 'tournament') {
    await setDoc(doc(db, COLLECTIONS.tournaments, `${roomId}_tournament`), cleanFirestoreData({
      tournamentId: `${roomId}_tournament`,
      roomId,
      title: safeRoomName,
      status: 'planning',
      roundCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true })

    await setDoc(doc(db, COLLECTIONS.tournamentPlayers, `${roomId}_${userId}`), cleanFirestoreData({
      tournamentPlayerId: `${roomId}_${userId}`,
      tournamentId: `${roomId}_tournament`,
      userId,
      displayName: cleanText(displayName) || 'Player',
      totalScore: 0,
      averageScore: 0,
      completedRounds: 0,
      rank: 0,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true })
  }

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

  await setDoc(doc(db, COLLECTIONS.roomPlayers, `${roomId}_${userId}`), cleanFirestoreData({
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
  }), { merge: true })

  if (room.mode === 'tournament') {
    await setDoc(doc(db, COLLECTIONS.tournamentPlayers, `${roomId}_${userId}`), cleanFirestoreData({
      tournamentPlayerId: `${roomId}_${userId}`,
      tournamentId: `${roomId}_tournament`,
      userId,
      displayName: cleanText(displayName) || 'Player',
      totalScore: 0,
      averageScore: 0,
      completedRounds: 0,
      rank: 0,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }), { merge: true })
  }

  await updateDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), {
    playerCount: playerCount + 1,
    updatedAt: serverTimestamp()
  })

  return roomId
}

export async function getChallengeRoomDetails(roomId) {
  if (!roomId) throw new Error('Room ID is required.')

  const roomSnapshot = await getDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId))

  if (!roomSnapshot.exists()) {
    throw new Error('Room was not found.')
  }

  const room = {
    firestoreId: roomSnapshot.id,
    ...roomSnapshot.data()
  }

  const playersSnapshot = await getDocs(collection(db, COLLECTIONS.roomPlayers))
  const roomPlayers = playersSnapshot.docs
    .map((playerDoc) => ({
      firestoreId: playerDoc.id,
      ...playerDoc.data()
    }))
    .filter((player) => player.roomId === roomId && !isSchemaDocument(player))

  const attemptsSnapshot = await getDocs(collection(db, COLLECTIONS.attempts))
  const roomAttempts = attemptsSnapshot.docs
    .map((attemptDoc) => ({
      firestoreId: attemptDoc.id,
      ...attemptDoc.data()
    }))
    .filter((attempt) => attempt.roomId === roomId && !isSchemaDocument(attempt))

  const scoresSnapshot = await getDocs(collection(db, COLLECTIONS.scores))
  const roomScores = scoresSnapshot.docs
    .map((scoreDoc) => ({
      firestoreId: scoreDoc.id,
      ...scoreDoc.data()
    }))
    .filter((score) => score.roomId === roomId && !isSchemaDocument(score))

  return {
    room: normaliseRoom(room, roomPlayers),
    roomPlayers,
    roomAttempts,
    roomScores
  }
}

export async function startChallengeRoom({ roomId, problemCardId }) {
  if (!roomId) throw new Error('Room ID is required to start the challenge.')
  if (!problemCardId) throw new Error('Problem card ID is required to start the challenge.')

  const roomRef = doc(db, COLLECTIONS.multiplayerRooms, roomId)
  const roomSnapshot = await getDoc(roomRef)

  if (!roomSnapshot.exists()) {
    throw new Error('Room was not found.')
  }

  await updateDoc(roomRef, {
    mode: 'challenge',
    status: 'active',
    currentProblemId: problemCardId,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return roomId
}

export async function submitChallengeAttempt({
  roomId,
  roomCode,
  userId,
  displayName,
  problemCardId,
  problemTitle,
  selectedAiCardIds,
  selectedAiCardTitles,
  explanation,
  totalScore = 0,
  feedback = '',
  status = 'submitted'
}) {
  if (!roomId) throw new Error('Room ID is required.')
  if (!userId) throw new Error('User ID is required.')
  if (!problemCardId) throw new Error('Problem card ID is required.')
  if (!explanation) throw new Error('Explanation is required.')

  const attemptId = `${roomId}_${userId}_${Date.now()}`

  await setDoc(doc(db, COLLECTIONS.attempts, attemptId), cleanFirestoreData({
    attemptId,
    roomId,
    roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    isMultiplayer: true,
    multiplayerMode: 'challenge',
    problemCardId,
    problemTitle: cleanText(problemTitle),
    selectedAiCardIds: selectedAiCardIds || [],
    selectedAiCardTitles: selectedAiCardTitles || [],
    explanation,
    totalScore: Number(totalScore || 0),
    feedback,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })

  await setDoc(doc(db, COLLECTIONS.roomPlayers, `${roomId}_${userId}`), cleanFirestoreData({
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: 'player',
    status: 'submitted',
    score: Number(totalScore || 0),
    updatedAt: serverTimestamp()
  }), { merge: true })

  return attemptId
}

export async function getChallengeResults(roomId) {
  if (!roomId) throw new Error('Room ID is required.')

  const attemptsSnapshot = await getDocs(collection(db, COLLECTIONS.attempts))

  const attempts = attemptsSnapshot.docs
    .map((attemptDoc) => ({
      firestoreId: attemptDoc.id,
      ...attemptDoc.data()
    }))
    .filter((attempt) => {
      return (
        attempt.roomId === roomId &&
        attempt.isMultiplayer === true &&
        attempt.multiplayerMode === 'challenge' &&
        !isSchemaDocument(attempt)
      )
    })
    .sort((a, b) => Number(b.totalScore || 0) - Number(a.totalScore || 0))

  return attempts.map((attempt, index) => ({
    ...attempt,
    rank: index + 1
  }))
}


export async function updateDebatePrompt({ roomId, prompt }) {
  if (!roomId) throw new Error('Room ID is required.')
  const safePrompt = cleanText(prompt)
  if (!safePrompt) throw new Error('Debate prompt is required.')

  const debateId = `${roomId}_debate`
  await setDoc(doc(db, COLLECTIONS.debates, debateId), cleanFirestoreData({
    debateId,
    roomId,
    prompt: safePrompt,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })

  await updateDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), {
    mode: 'debate',
    status: 'active',
    updatedAt: serverTimestamp()
  })

  return debateId
}

export async function submitDebateVote({ roomId, debateId, voterUserId, targetUserId, voteCategory }) {
  if (!roomId) throw new Error('Room ID is required.')
  if (!debateId) throw new Error('Debate ID is required.')
  if (!voterUserId) throw new Error('You must be logged in to vote.')
  if (!targetUserId) throw new Error('Choose the player you are voting for.')

  const safeVoteCategory = cleanText(voteCategory) || 'strong_argument'
  const voteId = `${debateId}_${voterUserId}_${targetUserId}`

  await setDoc(doc(db, COLLECTIONS.debateVotes, voteId), cleanFirestoreData({
    voteId,
    debateId,
    roomId,
    voterUserId,
    targetUserId,
    voteCategory: safeVoteCategory,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })

  return voteId
}

export async function startTournamentRoom({ roomId, title, roundCount = 3 }) {
  if (!roomId) throw new Error('Room ID is required.')

  const tournamentId = `${roomId}_tournament`
  await setDoc(doc(db, COLLECTIONS.tournaments, tournamentId), cleanFirestoreData({
    tournamentId,
    roomId,
    title: cleanText(title) || 'AfriQuest Tournament',
    status: 'active',
    roundCount: Number(roundCount || 3),
    startAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })

  await updateDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), {
    mode: 'tournament',
    status: 'active',
    updatedAt: serverTimestamp()
  })

  return tournamentId
}

export async function saveTournamentPlayerScore({ roomId, tournamentId, userId, displayName, totalScore }) {
  if (!roomId) throw new Error('Room ID is required.')
  if (!tournamentId) throw new Error('Tournament ID is required.')
  if (!userId) throw new Error('User ID is required.')

  const score = Number(totalScore || 0)
  await setDoc(doc(db, COLLECTIONS.tournamentPlayers, `${roomId}_${userId}`), cleanFirestoreData({
    tournamentPlayerId: `${roomId}_${userId}`,
    tournamentId,
    roomId,
    userId,
    displayName: cleanText(displayName) || 'Player',
    totalScore: score,
    averageScore: score,
    completedRounds: 1,
    rank: 0,
    updatedAt: serverTimestamp()
  }), { merge: true })

  return `${roomId}_${userId}`
}

export async function seedMultiplayerTableSamples(userId = 'sample_user') {
  const roomId = 'room_SAMPLE'

  await setDoc(doc(db, COLLECTIONS.multiplayerRooms, roomId), cleanFirestoreData({
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
  }), { merge: true })

  await setDoc(doc(db, COLLECTIONS.roomPlayers, `${roomId}_${userId}`), cleanFirestoreData({
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode: 'SAMPLE',
    userId,
    displayName: 'Sample Player',
    role: 'host',
    teamId: 'team_SAMPLE',
    status: 'joined',
    score: 0,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }), { merge: true })

  await setDoc(doc(db, COLLECTIONS.teams, 'team_SAMPLE'), cleanFirestoreData({ teamId: 'team_SAMPLE', roomId, teamName: 'Sample Team', teamScore: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), { merge: true })
  await setDoc(doc(db, COLLECTIONS.teamSessions, 'teamSession_SAMPLE'), cleanFirestoreData({ teamSessionId: 'teamSession_SAMPLE', roomId, teamId: 'team_SAMPLE', problemCardId: '', selectedAiCardIds: [], sharedExplanation: '', totalScore: 0, feedback: '', status: 'draft', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), { merge: true })
  await setDoc(doc(db, COLLECTIONS.debates, 'debate_SAMPLE'), cleanFirestoreData({ debateId: 'debate_SAMPLE', roomId, prompt: 'Should AI be used to support local SDG problem solving?', status: 'open', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), { merge: true })
  await setDoc(doc(db, COLLECTIONS.debateVotes, 'debateVote_SAMPLE'), cleanFirestoreData({ voteId: 'debateVote_SAMPLE', debateId: 'debate_SAMPLE', roomId, voterUserId: userId, targetUserId: userId, voteCategory: 'strong_argument', createdAt: serverTimestamp() }), { merge: true })
  await setDoc(doc(db, COLLECTIONS.tournaments, 'tournament_SAMPLE'), cleanFirestoreData({ tournamentId: 'tournament_SAMPLE', title: 'Sample Tournament', status: 'planning', roundCount: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), { merge: true })
  await setDoc(doc(db, COLLECTIONS.tournamentPlayers, 'tournamentPlayer_SAMPLE'), cleanFirestoreData({ tournamentPlayerId: 'tournamentPlayer_SAMPLE', tournamentId: 'tournament_SAMPLE', userId, displayName: 'Sample Player', totalScore: 0, averageScore: 0, completedRounds: 0, rank: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }), { merge: true })

  return 8
}
