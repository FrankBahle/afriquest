import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { COLLECTIONS, cleanFirestoreData, db } from '../firebaseService'

const C = {
  users: COLLECTIONS.users || 'users',
  multiplayerRooms: COLLECTIONS.multiplayerRooms || 'multiplayerRooms',
  roomPlayers: COLLECTIONS.roomPlayers || 'roomPlayers',
  teams: COLLECTIONS.teams || 'teams',
  teamSessions: COLLECTIONS.teamSessions || 'teamSessions',
  debates: COLLECTIONS.debates || 'debates',
  debateVotes: COLLECTIONS.debateVotes || 'debateVotes',
  tournaments: COLLECTIONS.tournaments || 'tournaments',
  tournamentPlayers: COLLECTIONS.tournamentPlayers || 'tournamentPlayers',
  attempts: COLLECTIONS.attempts || 'attempts',
  scores: COLLECTIONS.scores || 'scores',
  subScores: COLLECTIONS.subScores || 'subScores',
  feedback: COLLECTIONS.feedback || 'feedback',
  playerNotifications: COLLECTIONS.playerNotifications || 'playerNotifications',
  playerConnections: COLLECTIONS.playerConnections || 'playerConnections',
  playerConnectionRequests: COLLECTIONS.playerConnectionRequests || 'playerConnectionRequests',
  playerPresence: COLLECTIONS.playerPresence || 'playerPresence',
  multiplayerRoomEvents: COLLECTIONS.multiplayerRoomEvents || 'multiplayerRoomEvents',
  multiplayerRoomRequests: COLLECTIONS.multiplayerRoomRequests || 'multiplayerRoomRequests'
}

const terminalStatuses = ['completed', 'ended', 'cancelled', 'archived', 'expired']

function cleanText(value) {
  return String(value || '').trim()
}

function normaliseId(value) {
  return cleanText(value)
    .replace(/[\\/#?]/g, '_')
    .replace(/\s+/g, '_')
}

function createRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function nowDate() {
  return new Date()
}

function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value.seconds) return value.seconds * 1000
  if (value instanceof Date) return value.getTime()
  return Date.parse(value) || 0
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function isSchemaDocument(row) {
  const id = cleanText(row?.firestoreId || row?.id || row?.roomId || row?.notificationId || row?.requestId).toLowerCase()
  return row?.isSchema === true || id === '__schema' || id.includes('__schema') || id.includes('sample')
}

function safeClean(data) {
  return cleanFirestoreData ? cleanFirestoreData(data) : data
}

function getRoomId(row) {
  return cleanText(row.roomId || row.firestoreId)
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean)
  return cleanText(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function autoScore(text = '', aiIds = []) {
  const words = cleanText(text).split(/\s+/).filter(Boolean).length
  const aiCount = Array.isArray(aiIds) ? aiIds.length : splitCsv(aiIds).length
  const score = 42 + Math.min(30, words * 1.5) + Math.min(24, aiCount * 8)
  return Math.max(0, Math.min(100, Math.round(score)))
}

function countWords(value) {
  return cleanText(value).split(/\s+/).filter(Boolean).length
}

function validateMultiplayerSubmission({ explanation, aiIds }) {
  if (!cleanText(explanation)) throw new Error('Explanation is required.')
  if (countWords(explanation) > 100) throw new Error('The explanation must be 100 words or less.')
  if (!Array.isArray(aiIds) || aiIds.length < 1) throw new Error('Choose at least one solution card.')
  if (aiIds.length > 3) throw new Error('Choose a maximum of three solution cards.')
}

function buildWorkflowStage(mode, status) {
  if (status === 'waiting') return 'lobby_waiting'
  if (status === 'active') return `${mode}_active`
  if (status === 'completed') return `${mode}_ended`
  if (status === 'cancelled') return `${mode}_cancelled`
  return status || 'draft'
}

function isRoomExpired(room) {
  const status = cleanText(room?.status).toLowerCase()
  if (terminalStatuses.includes(status)) return status === 'expired'
  if (status !== 'waiting') return false

  const createdMillis = toMillis(room?.createdAt || room?.lobbyOpenedAt)
  if (!createdMillis) return false

  const playerCount = toNumber(room?.playerCount, 1)
  const oneHour = 60 * 60 * 1000

  return playerCount <= 1 && Date.now() - createdMillis >= oneHour
}

function isRoomClosed(room) {
  return terminalStatuses.includes(cleanText(room?.status).toLowerCase()) ||
    terminalStatuses.includes(cleanText(room?.lifecycleStatus).toLowerCase()) ||
    isRoomExpired(room)
}

async function resolvePlayerIdentifier(identifier) {
  const value = cleanText(identifier)
  if (!value) throw new Error('Enter the player email or UID.')

  if (!value.includes('@')) return value

  const emailSnapshot = await getDocs(query(collection(db, C.users), where('email', '==', value.toLowerCase())))
  if (!emailSnapshot.empty) {
    const userDoc = emailSnapshot.docs[0]
    const row = userDoc.data()
    return row.userId || row.uid || userDoc.id
  }

  const exactSnapshot = await getDocs(query(collection(db, C.users), where('email', '==', value)))
  if (!exactSnapshot.empty) {
    const userDoc = exactSnapshot.docs[0]
    const row = userDoc.data()
    return row.userId || row.uid || userDoc.id
  }

  throw new Error('No player was found with that email address.')
}

function normaliseRoom(room, allPlayers = []) {
  const roomId = getRoomId(room)
  const roomPlayers = allPlayers.filter((player) => String(player.roomId) === String(roomId))
  const mode = cleanText(room.mode || room.roomType || 'challenge')
  const rawStatus = cleanText(room.status || room.roomStatus || 'waiting')
  const expired = isRoomExpired(room)
  const status = expired ? 'expired' : rawStatus
  const lifecycleStatus = expired ? 'expired' : room.lifecycleStatus || status
  const workflowStage = expired ? 'expired' : room.workflowStage || buildWorkflowStage(mode, status)

  return {
    firestoreId: room.firestoreId || roomId,
    ...room,
    roomId,
    roomCode: room.roomCode || roomId.replace(/^room_/, '').toUpperCase(),
    roomName: room.roomName || room.title || 'Multiplayer Room',
    mode,
    status,
    lifecycleStatus,
    workflowStage,
    maxPlayers: toNumber(room.maxPlayers, 4),
    playerCount: toNumber(room.playerCount || roomPlayers.length),
    createdBy: room.createdBy || '',
    createdByName: room.createdByName || 'Player',
    currentProblemId: room.currentProblemId || '',
    currentProblemTitle: room.currentProblemTitle || '',
    currentQuestTitle: room.currentQuestTitle || room.currentProblemTitle || '',
    currentRound: toNumber(room.currentRound, 1),
    createdAtMillis: toMillis(room.createdAt),
    startedAtMillis: toMillis(room.startedAt),
    endedAtMillis: toMillis(room.endedAt || room.completedAt || room.cancelledAt),
    expiresAtMillis: toMillis(room.expiresAt),
    lastActivityAtMillis: toMillis(room.lastActivityAt || room.updatedAt || room.createdAt),
    isExpired: expired,
    isClosed: isRoomClosed({ ...room, status, lifecycleStatus }),
    roomPlayers
  }
}

function buildHubData(cache) {
  const players = (cache.roomPlayers || []).filter((row) => !isSchemaDocument(row))
  const rooms = (cache.multiplayerRooms || [])
    .filter((row) => !isSchemaDocument(row))
    .map((room) => normaliseRoom(room, players))
    .sort((a, b) => b.lastActivityAtMillis - a.lastActivityAtMillis)

  return {
    rooms,
    roomPlayers: players,
    teams: (cache.teams || []).filter((row) => !isSchemaDocument(row)),
    teamSessions: (cache.teamSessions || []).filter((row) => !isSchemaDocument(row)),
    debates: (cache.debates || []).filter((row) => !isSchemaDocument(row)),
    debateVotes: (cache.debateVotes || []).filter((row) => !isSchemaDocument(row)),
    tournaments: (cache.tournaments || []).filter((row) => !isSchemaDocument(row)),
    tournamentPlayers: (cache.tournamentPlayers || []).filter((row) => !isSchemaDocument(row)),
    attempts: (cache.attempts || []).filter((row) => !isSchemaDocument(row)),
    scores: (cache.scores || []).filter((row) => !isSchemaDocument(row)),
    subScores: (cache.subScores || []).filter((row) => !isSchemaDocument(row)),
    feedback: (cache.feedback || []).filter((row) => !isSchemaDocument(row)),
    presence: (cache.playerPresence || []).filter((row) => !isSchemaDocument(row)),
    roomEvents: (cache.multiplayerRoomEvents || []).filter((row) => !isSchemaDocument(row)),
    roomRequests: (cache.multiplayerRoomRequests || []).filter((row) => !isSchemaDocument(row))
  }
}

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

async function getRoom(roomId) {
  const snapshot = await getDoc(doc(db, C.multiplayerRooms, roomId))
  if (!snapshot.exists()) throw new Error('Room was not found.')
  return { firestoreId: snapshot.id, ...snapshot.data() }
}

async function getRoomPlayers(roomId) {
  const rows = await getCollectionRows(C.roomPlayers)
  return rows.filter((player) => player.roomId === roomId && !isSchemaDocument(player))
}

async function touchRoom(roomId, extra = {}) {
  await updateDoc(doc(db, C.multiplayerRooms, roomId), {
    ...extra,
    lastActivityAt: nowDate(),
    updatedAt: nowDate()
  })
}

async function addRoomEvent({ roomId, roomCode = '', eventType, actorUserId = '', actorDisplayName = '', message, metadata = {} }) {
  if (!roomId) return ''
  const eventRef = doc(collection(db, C.multiplayerRoomEvents))

  await setDoc(eventRef, safeClean({
    eventId: eventRef.id,
    roomId,
    roomCode,
    eventType,
    actorUserId,
    actorDisplayName,
    message,
    metadata,
    createdAt: nowDate(),
    createdAtText: nowDate().toLocaleString(),
    isSchema: false
  }))

  return eventRef.id
}

async function createNotification({ recipientUserId, senderUserId = '', senderDisplayName = '', type, title, message, actionType = '', actionData = {} }) {
  if (!recipientUserId) return ''
  if (senderUserId && recipientUserId === senderUserId) return ''
  const notificationRef = doc(collection(db, C.playerNotifications))

  await setDoc(notificationRef, safeClean({
    notificationId: notificationRef.id,
    recipientUserId,
    senderUserId,
    senderDisplayName,
    type,
    title,
    message,
    status: 'unread',
    actionType,
    actionData,
    createdAt: nowDate(),
    readAt: '',
    isSchema: false
  }))

  return notificationRef.id
}

async function notifyRoomPlayers({ roomId, actorUserId = '', actorDisplayName = '', type, title, message, actionType = 'open_room' }) {
  const room = await getRoom(roomId)
  const players = await getRoomPlayers(roomId)
  await Promise.all(players
    .filter((player) => player.userId && player.userId !== actorUserId)
    .map((player) => createNotification({
      recipientUserId: player.userId,
      senderUserId: actorUserId,
      senderDisplayName: actorDisplayName,
      type,
      title,
      message,
      actionType,
      actionData: { roomId, roomCode: room.roomCode, mode: room.mode }
    })))
}

function subscribeRows(collectionName, callback) {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    callback(snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() })))
  })
}

export function subscribeMultiplayerHubData(callback) {
  const cache = {}
  const names = [
    'multiplayerRooms',
    'roomPlayers',
    'teams',
    'teamSessions',
    'debates',
    'debateVotes',
    'tournaments',
    'tournamentPlayers',
    'attempts',
    'scores',
    'subScores',
    'feedback',
    'playerPresence',
    'multiplayerRoomEvents',
    'multiplayerRoomRequests'
  ]

  const unsubscribers = names.map((name) => subscribeRows(C[name], (rows) => {
    cache[name] = rows
    callback(buildHubData(cache))
  }))

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
}

export function subscribeRoomDetails(roomId, callback) {
  if (!roomId) return () => {}
  const cache = {}
  const names = [
    'multiplayerRooms',
    'roomPlayers',
    'teams',
    'teamSessions',
    'debates',
    'debateVotes',
    'tournaments',
    'tournamentPlayers',
    'attempts',
    'scores',
    'subScores',
    'feedback',
    'playerPresence',
    'multiplayerRoomEvents',
    'multiplayerRoomRequests'
  ]

  function emit() {
    const hub = buildHubData(cache)
    const room = hub.rooms.find((item) => item.roomId === roomId)
    if (!room) {
      callback(null)
      return
    }

    callback({
      room,
      roomPlayers: hub.roomPlayers.filter((player) => player.roomId === roomId),
      teams: hub.teams.filter((team) => team.roomId === roomId),
      teamSessions: hub.teamSessions.filter((session) => session.roomId === roomId),
      debates: hub.debates.filter((debate) => debate.roomId === roomId),
      debateVotes: hub.debateVotes.filter((vote) => vote.roomId === roomId),
      tournaments: hub.tournaments.filter((tournament) => tournament.roomId === roomId),
      tournamentPlayers: hub.tournamentPlayers.filter((player) => player.roomId === roomId || player.tournamentId === `${roomId}_tournament`),
      roomAttempts: hub.attempts.filter((attempt) => attempt.roomId === roomId),
      roomScores: hub.scores.filter((score) => score.roomId === roomId),
      roomFeedback: hub.feedback.filter((item) => item.roomId === roomId),
      roomEvents: hub.roomEvents.filter((event) => event.roomId === roomId).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
      roomRequests: hub.roomRequests.filter((request) => request.roomId === roomId),
      presence: hub.presence
    })
  }

  const unsubscribers = names.map((name) => subscribeRows(C[name], (rows) => {
    cache[name] = rows
    emit()
  }))

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
}

export function subscribeUserNotifications(userId, callback) {
  if (!userId) return () => {}

  return subscribeRows(C.playerNotifications, (rows) => {
    callback(rows
      .filter((notification) => notification.recipientUserId === userId && !isSchemaDocument(notification))
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)))
  })
}

export function subscribePlayerConnections(userId, callback) {
  if (!userId) return () => {}

  return subscribeRows(C.playerConnections, (rows) => {
    callback(rows
      .filter((connection) => connection.ownerUserId === userId && !isSchemaDocument(connection))
      .sort((a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt)))
  })
}

export async function updatePlayerPresence({ userId, displayName, status = 'online', currentRoomId = '', currentRoomCode = '', currentScreen = 'Multiplayer' }) {
  if (!userId) return

  await setDoc(doc(db, C.playerPresence, userId), safeClean({
    userId,
    displayName: cleanText(displayName) || 'Player',
    status,
    currentRoomId,
    currentRoomCode,
    currentScreen,
    lastSeenAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })
}

export async function createMultiplayerRoom({ userId, displayName, roomName, mode, maxPlayers, requiresApproval = false, questTitle = '' }) {
  if (!userId) throw new Error('You must be logged in to create a room.')

  const roomCode = createRoomCode()
  const roomId = `room_${roomCode}`
  const safeMode = cleanText(mode) || 'challenge'
  const safeRoomName = cleanText(roomName) || `${displayName || 'Player'} Room`
  const now = nowDate()
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000)

  await setDoc(doc(db, C.multiplayerRooms, roomId), safeClean({
    roomId,
    roomCode,
    roomName: safeRoomName,
    mode: safeMode,
    status: 'waiting',
    lifecycleStatus: 'waiting',
    workflowStage: 'lobby_waiting',
    maxPlayers: toNumber(maxPlayers, 4),
    playerCount: 1,
    createdBy: userId,
    createdByName: cleanText(displayName) || 'Player',
    requiresApproval: Boolean(requiresApproval),
    isOpen: true,
    currentProblemId: '',
    currentProblemTitle: '',
    currentQuestTitle: cleanText(questTitle),
    currentRound: 1,
    createdAt: now,
    lobbyOpenedAt: now,
    expiresAt,
    expiryNotice: 'This event will expire in one hour if no other player joins.',
    startedAt: '',
    endedAt: '',
    completedAt: '',
    cancelledAt: '',
    lastActivityAt: now,
    updatedAt: now,
    endedBy: '',
    endedByName: '',
    endReason: '',
    isSchema: false
  }))

  await setDoc(doc(db, C.roomPlayers, `${roomId}_${userId}`), safeClean({
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: 'host',
    teamId: '',
    status: 'joined',
    liveStatus: 'online',
    score: 0,
    joinedAt: now,
    lastSeenAt: now,
    updatedAt: now,
    isSchema: false
  }), { merge: true })

  if (safeMode === 'team') {
    await createTeam({ roomId, teamName: `${safeRoomName} Team 1`, userId, displayName })
  }

  if (safeMode === 'debate') {
    await setDoc(doc(db, C.debates, `${roomId}_debate`), safeClean({
      debateId: `${roomId}_debate`,
      roomId,
      prompt: '',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      isSchema: false
    }), { merge: true })
  }

  if (safeMode === 'tournament') {
    await setDoc(doc(db, C.tournaments, `${roomId}_tournament`), safeClean({
      tournamentId: `${roomId}_tournament`,
      roomId,
      title: safeRoomName,
      status: 'planning',
      roundCount: 3,
      currentRound: 1,
      createdAt: now,
      startedAt: '',
      endedAt: '',
      updatedAt: now,
      isSchema: false
    }), { merge: true })

    await setDoc(doc(db, C.tournamentPlayers, `${roomId}_${userId}`), safeClean({
      tournamentPlayerId: `${roomId}_${userId}`,
      tournamentId: `${roomId}_tournament`,
      roomId,
      userId,
      displayName: cleanText(displayName) || 'Player',
      totalScore: 0,
      averageScore: 0,
      completedRounds: 0,
      rank: 0,
      joinedAt: now,
      updatedAt: now,
      isSchema: false
    }), { merge: true })
  }

  await addRoomEvent({
    roomId,
    roomCode,
    eventType: 'room_created',
    actorUserId: userId,
    actorDisplayName: displayName,
    message: `${displayName || 'Player'} created ${safeRoomName}.`,
    metadata: { mode: safeMode }
  })

  return roomId
}

export async function joinMultiplayerRoom({ userId, displayName, roomCode, skipApproval = false }) {
  if (!userId) throw new Error('You must be logged in to join a room.')
  const safeRoomCode = cleanText(roomCode).toUpperCase()
  if (!safeRoomCode) throw new Error('Room code is required.')

  const roomId = safeRoomCode.startsWith('ROOM_') ? safeRoomCode.toLowerCase() : `room_${safeRoomCode}`
  const room = await getRoom(roomId)

  if (isRoomExpired(room)) throw new Error('This room has expired.')
  if (isRoomClosed(room)) throw new Error('This room has already ended.')
  if (room.requiresApproval && !skipApproval) throw new Error('This room requires host approval. Ask the host for access.')

  const players = await getRoomPlayers(roomId)
  const alreadyJoined = players.some((player) => player.userId === userId)
  const maxPlayers = toNumber(room.maxPlayers, 4)

  if (!alreadyJoined && players.length >= maxPlayers) {
    throw new Error('This room is already full.')
  }

  await setDoc(doc(db, C.roomPlayers, `${roomId}_${userId}`), safeClean({
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode: room.roomCode || safeRoomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: alreadyJoined ? players.find((player) => player.userId === userId)?.role || 'player' : 'player',
    teamId: players.find((player) => player.userId === userId)?.teamId || '',
    status: 'joined',
    liveStatus: 'online',
    score: toNumber(players.find((player) => player.userId === userId)?.score),
    joinedAt: players.find((player) => player.userId === userId)?.joinedAt || nowDate(),
    lastSeenAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  if (room.mode === 'tournament') {
    await setDoc(doc(db, C.tournamentPlayers, `${roomId}_${userId}`), safeClean({
      tournamentPlayerId: `${roomId}_${userId}`,
      tournamentId: `${roomId}_tournament`,
      roomId,
      userId,
      displayName: cleanText(displayName) || 'Player',
      totalScore: 0,
      averageScore: 0,
      completedRounds: 0,
      rank: 0,
      joinedAt: nowDate(),
      updatedAt: nowDate(),
      isSchema: false
    }), { merge: true })
  }

  const nextPlayers = alreadyJoined ? players.length : players.length + 1
  await touchRoom(roomId, { playerCount: nextPlayers })

  await addRoomEvent({
    roomId,
    roomCode: room.roomCode,
    eventType: 'player_joined',
    actorUserId: userId,
    actorDisplayName: displayName,
    message: `${displayName || 'Player'} joined the room.`
  })

  await notifyRoomPlayers({
    roomId,
    actorUserId: userId,
    actorDisplayName: displayName,
    type: 'room_update',
    title: 'Player joined',
    message: `${displayName || 'A player'} joined ${room.roomName}.`
  })

  return roomId
}

export async function requestToJoinRoom({ roomId, userId, displayName, message = '' }) {
  if (!roomId) throw new Error('Room ID is required.')
  if (!userId) throw new Error('User ID is required.')
  const room = await getRoom(roomId)
  if (room.createdBy === userId) throw new Error('You are the host of this room. Open the lobby instead.')
  if (isRoomExpired(room)) throw new Error('This room has expired.')
  if (isRoomClosed(room)) throw new Error('This room has already ended.')

  const players = await getRoomPlayers(roomId)
  if (players.some((player) => player.userId === userId)) {
    throw new Error('You are already in this room. Open the lobby instead.')
  }

  const requestId = `${roomId}_${userId}`
  await setDoc(doc(db, C.multiplayerRoomRequests, requestId), safeClean({
    requestId,
    roomId,
    roomCode: room.roomCode,
    roomName: room.roomName,
    mode: room.mode,
    fromUserId: userId,
    fromDisplayName: cleanText(displayName) || 'Player',
    hostUserId: room.createdBy,
    hostDisplayName: room.createdByName,
    status: 'pending',
    message: cleanText(message),
    createdAt: nowDate(),
    respondedAt: '',
    isSchema: false
  }), { merge: true })

  await createNotification({
    recipientUserId: room.createdBy,
    senderUserId: userId,
    senderDisplayName: displayName,
    type: 'room_join_request',
    title: 'Room join request',
    message: `${displayName || 'A player'} requested to join ${room.roomName}.`,
    actionType: 'open_room_request',
    actionData: { roomId, requestId, roomCode: room.roomCode }
  })

  await addRoomEvent({
    roomId,
    roomCode: room.roomCode,
    eventType: 'join_requested',
    actorUserId: userId,
    actorDisplayName: displayName,
    message: `${displayName || 'A player'} requested access.`
  })

  return requestId
}

export async function acceptRoomJoinRequest({ requestId, hostUserId }) {
  if (!requestId) throw new Error('Request ID is required.')
  const requestSnapshot = await getDoc(doc(db, C.multiplayerRoomRequests, requestId))
  if (!requestSnapshot.exists()) throw new Error('Request was not found.')

  const request = requestSnapshot.data()
  const room = await getRoom(request.roomId)
  if (room.createdBy !== hostUserId) throw new Error('Only the host can accept this request.')

  await updateDoc(doc(db, C.multiplayerRoomRequests, requestId), {
    status: 'accepted',
    respondedAt: nowDate(),
    updatedAt: nowDate()
  })

  await joinMultiplayerRoom({
    userId: request.fromUserId,
    displayName: request.fromDisplayName,
    roomCode: request.roomCode,
    skipApproval: true
  })

  await createNotification({
    recipientUserId: request.fromUserId,
    senderUserId: hostUserId,
    senderDisplayName: room.createdByName,
    type: 'room_request_accepted',
    title: 'Room request accepted',
    message: `Your request to join ${room.roomName} was accepted.`,
    actionType: 'open_room',
    actionData: { roomId: request.roomId, roomCode: request.roomCode }
  })

  return request.roomId
}

export async function declineRoomJoinRequest({ requestId, hostUserId }) {
  if (!requestId) throw new Error('Request ID is required.')
  const requestSnapshot = await getDoc(doc(db, C.multiplayerRoomRequests, requestId))
  if (!requestSnapshot.exists()) throw new Error('Request was not found.')

  const request = requestSnapshot.data()
  const room = await getRoom(request.roomId)
  if (room.createdBy !== hostUserId) throw new Error('Only the host can decline this request.')

  await updateDoc(doc(db, C.multiplayerRoomRequests, requestId), {
    status: 'declined',
    respondedAt: nowDate(),
    updatedAt: nowDate()
  })

  await createNotification({
    recipientUserId: request.fromUserId,
    senderUserId: hostUserId,
    senderDisplayName: room.createdByName,
    type: 'room_request_declined',
    title: 'Room request declined',
    message: `Your request to join ${room.roomName} was declined.`,
    actionType: '',
    actionData: { roomId: request.roomId }
  })

  return request.roomId
}

export async function createRoomInvite({ roomId, recipientUserId, senderUserId, senderDisplayName }) {
  if (!roomId) throw new Error('Open a room before sending an invite.')
  const resolvedRecipientUserId = await resolvePlayerIdentifier(recipientUserId)
  const room = await getRoom(roomId)
  if (isRoomExpired(room)) throw new Error('This room has expired.')
  if (isRoomClosed(room)) throw new Error('This room has already ended.')

  return createNotification({
    recipientUserId: resolvedRecipientUserId,
    senderUserId,
    senderDisplayName,
    type: 'room_invite',
    title: `Invite to ${room.roomName}`,
    message: `${senderDisplayName || 'A player'} invited you to join ${room.roomName}.`,
    actionType: 'accept_room_invite',
    actionData: { roomId, roomCode: room.roomCode, mode: room.mode }
  })
}

export async function acceptRoomInvite({ notificationId, userId, displayName }) {
  const notificationSnapshot = await getDoc(doc(db, C.playerNotifications, notificationId))
  if (!notificationSnapshot.exists()) throw new Error('Invite was not found.')
  const notification = notificationSnapshot.data()
  const roomId = notification.actionData?.roomId
  const room = await getRoom(roomId)

  await joinMultiplayerRoom({ userId, displayName, roomCode: room.roomCode, skipApproval: true })
  await markNotificationRead(notificationId)
  return roomId
}

export async function declineRoomInvite(notificationId) {
  await updateDoc(doc(db, C.playerNotifications, notificationId), {
    status: 'declined',
    readAt: nowDate(),
    updatedAt: nowDate()
  })
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) return
  await updateDoc(doc(db, C.playerNotifications, notificationId), {
    status: 'read',
    readAt: nowDate(),
    updatedAt: nowDate()
  })
}

export async function sendPlayerConnectionRequest({ fromUserId, fromDisplayName, toUserId }) {
  if (!fromUserId) throw new Error('You must be logged in.')
  const resolvedToUserId = await resolvePlayerIdentifier(toUserId)
  if (fromUserId === resolvedToUserId) throw new Error('You cannot connect with yourself.')

  const requestId = `${fromUserId}_${resolvedToUserId}`
  await setDoc(doc(db, C.playerConnectionRequests, requestId), safeClean({
    requestId,
    fromUserId,
    fromDisplayName: cleanText(fromDisplayName) || 'Player',
    toUserId: resolvedToUserId,
    toDisplayName: '',
    status: 'pending',
    createdAt: nowDate(),
    respondedAt: '',
    isSchema: false
  }), { merge: true })

  await createNotification({
    recipientUserId: resolvedToUserId,
    senderUserId: fromUserId,
    senderDisplayName: fromDisplayName,
    type: 'connection_request',
    title: 'Connection request',
    message: `${fromDisplayName || 'A player'} wants to connect with you.`,
    actionType: 'accept_connection_request',
    actionData: { requestId }
  })

  return requestId
}

export async function acceptConnectionRequest({ requestId, currentUserId, currentDisplayName }) {
  const requestSnapshot = await getDoc(doc(db, C.playerConnectionRequests, requestId))
  if (!requestSnapshot.exists()) throw new Error('Connection request was not found.')
  const request = requestSnapshot.data()

  await updateDoc(doc(db, C.playerConnectionRequests, requestId), {
    status: 'accepted',
    respondedAt: nowDate(),
    updatedAt: nowDate()
  })

  const firstId = `${request.fromUserId}_${request.toUserId}`
  const secondId = `${request.toUserId}_${request.fromUserId}`

  await setDoc(doc(db, C.playerConnections, firstId), safeClean({
    connectionId: firstId,
    ownerUserId: request.fromUserId,
    connectedUserId: request.toUserId,
    connectedDisplayName: cleanText(currentDisplayName) || 'Player',
    status: 'connected',
    source: 'request',
    createdAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await setDoc(doc(db, C.playerConnections, secondId), safeClean({
    connectionId: secondId,
    ownerUserId: request.toUserId,
    connectedUserId: request.fromUserId,
    connectedDisplayName: request.fromDisplayName || 'Player',
    status: 'connected',
    source: 'request',
    createdAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await createNotification({
    recipientUserId: request.fromUserId,
    senderUserId: currentUserId,
    senderDisplayName: currentDisplayName,
    type: 'connection_accepted',
    title: 'Connection accepted',
    message: `${currentDisplayName || 'A player'} accepted your connection request.`,
    actionType: '',
    actionData: {}
  })
}

export async function declineConnectionRequest({ requestId }) {
  if (!requestId) return
  await updateDoc(doc(db, C.playerConnectionRequests, requestId), {
    status: 'declined',
    respondedAt: nowDate(),
    updatedAt: nowDate()
  })
}

async function startRoom({ roomId, mode, problemCardId, problemTitle, actorUserId, actorDisplayName, workflowStage }) {
  if (!roomId) throw new Error('Open a room first.')
  if (!problemCardId) throw new Error('Problem card ID is required.')
  const room = await getRoom(roomId)
  if (isRoomClosed(room)) throw new Error('This room has ended.')

  const alreadyStarted = Boolean(room.startedAt)
  await touchRoom(roomId, {
    mode,
    status: 'active',
    lifecycleStatus: 'active',
    workflowStage: workflowStage || `${mode}_active`,
    currentProblemId: cleanText(problemCardId),
    currentProblemTitle: cleanText(problemTitle),
    currentQuestTitle: cleanText(problemTitle) || cleanText(problemCardId),
    startedAt: alreadyStarted ? room.startedAt : nowDate()
  })

  await addRoomEvent({
    roomId,
    roomCode: room.roomCode,
    eventType: `${mode}_started`,
    actorUserId,
    actorDisplayName,
    message: `${actorDisplayName || 'Host'} started ${mode} mode.`,
    metadata: { problemCardId, problemTitle }
  })

  await notifyRoomPlayers({
    roomId,
    actorUserId,
    actorDisplayName,
    type: `${mode}_started`,
    title: `${mode} started`,
    message: `${room.roomName} has started.`
  })

  return roomId
}

export function startChallengeRoom(args) {
  return startRoom({ ...args, mode: 'challenge', workflowStage: 'challenge_in_progress' })
}

export function startTeamRoom(args) {
  return startRoom({ ...args, mode: 'team', workflowStage: 'team_collaboration' })
}

export async function submitChallengeAttempt({ roomId, userId, displayName, problemCardId, problemTitle, selectedAiCardIds, selectedAiCardTitles, explanation }) {
  const room = await getRoom(roomId)
  if (isRoomClosed(room)) throw new Error('This room has ended.')
  if (!userId) throw new Error('User ID is required.')

  const aiIds = splitCsv(selectedAiCardIds)
  const aiTitles = splitCsv(selectedAiCardTitles)
  validateMultiplayerSubmission({ explanation, aiIds })

  const totalScore = autoScore(explanation, aiIds)
  const attemptId = `${roomId}_challenge_${userId}`
  const attemptRef = doc(db, C.attempts, attemptId)
  const attemptSnap = await getDoc(attemptRef)
  const previousAttempt = attemptSnap.exists() ? attemptSnap.data() : {}
  const bestScore = Math.max(toNumber(previousAttempt.bestScore || previousAttempt.totalScore), totalScore)
  const attemptNumber = toNumber(previousAttempt.attemptNumber) + 1

  await setDoc(attemptRef, safeClean({
    attemptId,
    roomId,
    roomCode: room.roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    isMultiplayer: true,
    multiplayerMode: 'challenge',
    problemCardId: cleanText(problemCardId || room.currentProblemId),
    problemTitle: cleanText(problemTitle || room.currentProblemTitle),
    selectedAiCardIds: aiIds,
    selectedAiCardTitles: aiTitles,
    explanation: cleanText(explanation),
    totalScore,
    bestScore,
    attemptNumber,
    feedback: 'Challenge answer saved. Ranking uses the latest submitted score and keeps the best score for reference.',
    status: 'submitted',
    createdAt: previousAttempt.createdAt || nowDate(),
    submittedAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await setDoc(doc(db, C.roomPlayers, `${roomId}_${userId}`), safeClean({
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode: room.roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: userId === room.createdBy ? 'host' : 'player',
    status: 'submitted',
    score: totalScore,
    bestScore,
    submittedAt: nowDate(),
    lastSeenAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await addRoomEvent({
    roomId,
    roomCode: room.roomCode,
    eventType: 'challenge_submitted',
    actorUserId: userId,
    actorDisplayName: displayName,
    message: `${displayName || 'A player'} submitted a challenge answer.`,
    metadata: { totalScore, bestScore }
  })

  await touchRoom(roomId, { workflowStage: 'challenge_scoring' })

  return { attemptId, totalScore, bestScore }
}

export async function createTeam({ roomId, teamName, userId, displayName }) {
  if (!roomId) throw new Error('Open a room first.')
  if (!userId) throw new Error('User ID is required.')
  const room = await getRoom(roomId)
  const teamId = `${roomId}_team_${Date.now()}`

  await setDoc(doc(db, C.teams, teamId), safeClean({
    teamId,
    roomId,
    roomCode: room.roomCode,
    teamName: cleanText(teamName) || `${displayName || 'Player'} Team`,
    createdBy: userId,
    createdByName: displayName,
    teamScore: 0,
    status: 'active',
    createdAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await joinTeam({ roomId, teamId, userId, displayName })
  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'team_created', actorUserId: userId, actorDisplayName: displayName, message: `${displayName || 'A player'} created a team.` })
  return teamId
}

export async function joinTeam({ roomId, teamId, userId, displayName }) {
  if (!roomId) throw new Error('Room ID is required.')
  if (!teamId) throw new Error('Choose a team first.')
  if (!userId) throw new Error('User ID is required.')
  const room = await getRoom(roomId)

  await setDoc(doc(db, C.roomPlayers, `${roomId}_${userId}`), safeClean({
    roomPlayerId: `${roomId}_${userId}`,
    roomId,
    roomCode: room.roomCode,
    userId,
    displayName: cleanText(displayName) || 'Player',
    role: userId === room.createdBy ? 'host' : 'player',
    teamId,
    status: 'joined_team',
    lastSeenAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'team_joined', actorUserId: userId, actorDisplayName: displayName, message: `${displayName || 'A player'} joined a team.` })
  return teamId
}

export async function submitTeamSolution({ roomId, teamId, userId, displayName, problemCardId, problemTitle, selectedAiCardIds, selectedAiCardTitles, explanation }) {
  if (!teamId) throw new Error('Join or create a team first.')
  const room = await getRoom(roomId)
  if (isRoomClosed(room)) throw new Error('This room has ended.')

  const aiIds = splitCsv(selectedAiCardIds)
  const aiTitles = splitCsv(selectedAiCardTitles)
  validateMultiplayerSubmission({ explanation, aiIds })

  const totalScore = autoScore(explanation, aiIds)
  const teamSessionId = `${roomId}_${teamId}`
  const sessionRef = doc(db, C.teamSessions, teamSessionId)
  const sessionSnap = await getDoc(sessionRef)
  const previousSession = sessionSnap.exists() ? sessionSnap.data() : {}
  const bestScore = Math.max(toNumber(previousSession.bestScore || previousSession.totalScore), totalScore)

  await setDoc(sessionRef, safeClean({
    teamSessionId,
    roomId,
    roomCode: room.roomCode,
    teamId,
    submittedBy: userId,
    submittedByName: displayName,
    displayName: displayName,
    problemCardId: cleanText(problemCardId || room.currentProblemId),
    problemTitle: cleanText(problemTitle || room.currentProblemTitle),
    selectedAiCardIds: aiIds,
    selectedAiCardTitles: aiTitles,
    sharedExplanation: cleanText(explanation),
    totalScore,
    bestScore,
    feedback: 'Team solution saved and scored. The latest team answer remains visible to everyone in the room.',
    status: 'submitted',
    createdAt: previousSession.createdAt || nowDate(),
    submittedAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await updateDoc(doc(db, C.teams, teamId), {
    teamScore: totalScore,
    bestScore,
    status: 'submitted',
    updatedAt: nowDate()
  })

  await touchRoom(roomId, { workflowStage: 'team_submissions' })
  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'team_solution_submitted', actorUserId: userId, actorDisplayName: displayName, message: `${displayName || 'A player'} submitted a team solution.`, metadata: { totalScore, bestScore } })
  return { teamSessionId, totalScore, bestScore }
}

export async function updateDebatePrompt({ roomId, prompt, actorUserId, actorDisplayName }) {
  if (!roomId) throw new Error('Open a debate room first.')
  if (!cleanText(prompt)) throw new Error('Debate prompt is required.')
  const room = await getRoom(roomId)
  const debateId = `${roomId}_debate`

  await setDoc(doc(db, C.debates, debateId), safeClean({
    debateId,
    roomId,
    roomCode: room.roomCode,
    prompt: cleanText(prompt),
    status: 'open',
    createdAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await touchRoom(roomId, {
    mode: 'debate',
    status: 'active',
    lifecycleStatus: 'active',
    workflowStage: 'debate_prompt_ready',
    currentQuestTitle: cleanText(prompt),
    startedAt: room.startedAt || nowDate()
  })

  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'debate_prompt_set', actorUserId, actorDisplayName, message: `${actorDisplayName || 'Host'} set the debate prompt.` })
  return debateId
}

export async function submitDebateArgument({ roomId, debateId, userId, displayName, argumentText, selectedAiCardIds, selectedAiCardTitles }) {
  const room = await getRoom(roomId)
  if (isRoomClosed(room)) throw new Error('This room has ended.')

  const aiIds = splitCsv(selectedAiCardIds)
  const aiTitles = splitCsv(selectedAiCardTitles)
  validateMultiplayerSubmission({ explanation: argumentText, aiIds })

  const totalScore = autoScore(argumentText, aiIds)
  const safeDebateId = debateId || `${roomId}_debate`
  const attemptId = `${safeDebateId}_${userId}`
  const attemptRef = doc(db, C.attempts, attemptId)
  const attemptSnap = await getDoc(attemptRef)
  const previousAttempt = attemptSnap.exists() ? attemptSnap.data() : {}
  const bestScore = Math.max(toNumber(previousAttempt.bestScore || previousAttempt.totalScore), totalScore)

  await setDoc(attemptRef, safeClean({
    attemptId,
    roomId,
    roomCode: room.roomCode,
    debateId: safeDebateId,
    userId,
    displayName: cleanText(displayName) || 'Player',
    isMultiplayer: true,
    multiplayerMode: 'debate',
    problemCardId: safeDebateId,
    problemTitle: room.currentQuestTitle || 'Debate prompt',
    selectedAiCardIds: aiIds,
    selectedAiCardTitles: aiTitles,
    explanation: cleanText(argumentText),
    argumentText: cleanText(argumentText),
    totalScore,
    bestScore,
    feedback: 'Debate argument saved. Players can vote for the strongest categories.',
    status: 'submitted',
    createdAt: previousAttempt.createdAt || nowDate(),
    submittedAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await touchRoom(roomId, { workflowStage: 'debate_voting' })
  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'debate_argument_submitted', actorUserId: userId, actorDisplayName: displayName, message: `${displayName || 'A player'} submitted a debate argument.`, metadata: { totalScore, bestScore } })
  return { attemptId, totalScore, bestScore }
}

export async function submitDebateVote({ roomId, debateId, voterUserId, voterDisplayName, targetUserId, targetDisplayName, voteCategory }) {
  if (!targetUserId) throw new Error('Choose a player to vote for.')
  if (targetUserId === voterUserId) throw new Error('Choose another player to vote for.')
  const room = await getRoom(roomId)
  if (isRoomClosed(room)) throw new Error('This room has ended.')
  const safeCategory = cleanText(voteCategory) || 'most_realistic'
  const voteId = `${debateId || `${roomId}_debate`}_${voterUserId}_${targetUserId}_${safeCategory}`

  await setDoc(doc(db, C.debateVotes, voteId), safeClean({
    voteId,
    debateId: debateId || `${roomId}_debate`,
    roomId,
    roomCode: room.roomCode,
    voterUserId,
    voterDisplayName,
    targetUserId,
    targetDisplayName: cleanText(targetDisplayName) || targetUserId,
    voteCategory: safeCategory,
    createdAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'debate_vote_submitted', actorUserId: voterUserId, actorDisplayName: voterDisplayName, message: `${voterDisplayName || 'A player'} submitted a debate vote.` })
  return voteId
}

async function ensureTournamentPlayersFromRoom({ roomId, tournamentId }) {
  const players = await getRoomPlayers(roomId)
  await Promise.all(players.map((player) => setDoc(doc(db, C.tournamentPlayers, `${roomId}_${player.userId}`), safeClean({
    tournamentPlayerId: `${roomId}_${player.userId}`,
    tournamentId,
    roomId,
    userId: player.userId,
    displayName: cleanText(player.displayName) || 'Player',
    totalScore: 0,
    averageScore: 0,
    completedRounds: 0,
    rank: 0,
    joinedAt: player.joinedAt || nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })))
}

export async function startTournamentRoom({ roomId, title, roundCount = 3, createdBy, createdByName }) {
  const room = await getRoom(roomId)
  const tournamentId = `${roomId}_tournament`

  await setDoc(doc(db, C.tournaments, tournamentId), safeClean({
    tournamentId,
    roomId,
    roomCode: room.roomCode,
    title: cleanText(title) || room.roomName,
    status: 'active',
    roundCount: toNumber(roundCount, 3),
    currentRound: 1,
    createdBy,
    createdByName,
    createdAt: room.createdAt || nowDate(),
    startedAt: nowDate(),
    endedAt: '',
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await ensureTournamentPlayersFromRoom({ roomId, tournamentId })

  await touchRoom(roomId, {
    mode: 'tournament',
    status: 'active',
    lifecycleStatus: 'active',
    workflowStage: 'tournament_active',
    startedAt: room.startedAt || nowDate(),
    currentRound: 1
  })

  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'tournament_started', actorUserId: createdBy, actorDisplayName: createdByName, message: `${createdByName || 'Host'} started the tournament.` })
  return tournamentId
}

export async function setTournamentRound({ roomId, tournamentId, roundNumber, problemCardId, problemTitle, actorUserId, actorDisplayName }) {
  const room = await getRoom(roomId)
  const safeRound = toNumber(roundNumber, 1)

  await setDoc(doc(db, C.tournaments, tournamentId || `${roomId}_tournament`), safeClean({
    tournamentId: tournamentId || `${roomId}_tournament`,
    roomId,
    currentRound: safeRound,
    currentProblemId: cleanText(problemCardId),
    currentProblemTitle: cleanText(problemTitle),
    status: 'active',
    updatedAt: nowDate()
  }), { merge: true })

  await touchRoom(roomId, {
    currentRound: safeRound,
    currentProblemId: cleanText(problemCardId),
    currentProblemTitle: cleanText(problemTitle),
    currentQuestTitle: cleanText(problemTitle) || cleanText(problemCardId),
    workflowStage: `tournament_round_${safeRound}`
  })

  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'tournament_round_set', actorUserId, actorDisplayName, message: `Round ${safeRound} is ready.`, metadata: { problemCardId, problemTitle } })
}

export async function submitTournamentRound({ roomId, tournamentId, userId, displayName, roundNumber, problemCardId, problemTitle, selectedAiCardIds, selectedAiCardTitles, explanation }) {
  const room = await getRoom(roomId)
  if (isRoomClosed(room)) throw new Error('This room has ended.')
  const safeTournamentId = tournamentId || `${roomId}_tournament`
  const safeRound = toNumber(roundNumber || room.currentRound, 1)
  const aiIds = splitCsv(selectedAiCardIds)
  const aiTitles = splitCsv(selectedAiCardTitles)
  validateMultiplayerSubmission({ explanation, aiIds })

  const totalScore = autoScore(explanation, aiIds)
  const attemptId = `${roomId}_tournament_${userId}_round_${safeRound}`
  const attemptRef = doc(db, C.attempts, attemptId)
  const previousAttemptSnap = await getDoc(attemptRef)
  const previousAttempt = previousAttemptSnap.exists() ? previousAttemptSnap.data() : null
  const oldRoundScore = previousAttempt ? toNumber(previousAttempt.totalScore) : 0
  const isNewRoundForPlayer = !previousAttempt
  const playerRef = doc(db, C.tournamentPlayers, `${roomId}_${userId}`)
  const playerSnap = await getDoc(playerRef)
  const existing = playerSnap.exists() ? playerSnap.data() : {}
  const completedRounds = toNumber(existing.completedRounds) + (isNewRoundForPlayer ? 1 : 0)
  const accumulatedScore = Math.max(0, toNumber(existing.totalScore) - oldRoundScore + totalScore)

  await setDoc(attemptRef, safeClean({
    attemptId,
    roomId,
    roomCode: room.roomCode,
    tournamentId: safeTournamentId,
    userId,
    displayName: cleanText(displayName) || 'Player',
    isMultiplayer: true,
    multiplayerMode: 'tournament',
    roundNumber: safeRound,
    problemCardId: cleanText(problemCardId || room.currentProblemId),
    problemTitle: cleanText(problemTitle || room.currentProblemTitle),
    selectedAiCardIds: aiIds,
    selectedAiCardTitles: aiTitles,
    explanation: cleanText(explanation),
    totalScore,
    feedback: 'Tournament round saved. Resubmitting the same round updates your round score instead of duplicating it.',
    status: 'submitted',
    createdAt: previousAttempt?.createdAt || nowDate(),
    submittedAt: nowDate(),
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await setDoc(playerRef, safeClean({
    tournamentPlayerId: `${roomId}_${userId}`,
    tournamentId: safeTournamentId,
    roomId,
    userId,
    displayName: cleanText(displayName) || 'Player',
    totalScore: accumulatedScore,
    averageScore: Math.round(accumulatedScore / Math.max(1, completedRounds)),
    completedRounds,
    rank: toNumber(existing.rank),
    lastRoundScore: totalScore,
    updatedAt: nowDate(),
    isSchema: false
  }), { merge: true })

  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'tournament_round_submitted', actorUserId: userId, actorDisplayName: displayName, message: `${displayName || 'A player'} submitted round ${safeRound}.`, metadata: { totalScore } })
  await recalculateTournamentRanks({ roomId, tournamentId: safeTournamentId })
  return { attemptId, totalScore }
}

async function recalculateTournamentRanks({ roomId, tournamentId }) {
  const rows = await getCollectionRows(C.tournamentPlayers)
  const players = rows
    .filter((player) => player.roomId === roomId || player.tournamentId === tournamentId)
    .sort((a, b) => toNumber(b.totalScore) - toNumber(a.totalScore))

  await Promise.all(players.map((player, index) => updateDoc(doc(db, C.tournamentPlayers, player.firestoreId), {
    rank: index + 1,
    updatedAt: nowDate()
  })))
}

export async function finishTournamentRoom({ roomId, tournamentId, actorUserId, actorDisplayName }) {
  const room = await getRoom(roomId)
  const safeTournamentId = tournamentId || `${roomId}_tournament`
  await recalculateTournamentRanks({ roomId, tournamentId: safeTournamentId })

  await setDoc(doc(db, C.tournaments, safeTournamentId), safeClean({
    tournamentId: safeTournamentId,
    roomId,
    status: 'completed',
    endedAt: nowDate(),
    updatedAt: nowDate()
  }), { merge: true })

  await endMultiplayerRoom({ roomId, actorUserId, actorDisplayName, endReason: 'Tournament finished.' })
  await addRoomEvent({ roomId, roomCode: room.roomCode, eventType: 'tournament_finished', actorUserId, actorDisplayName, message: 'Tournament completed and leaderboard finalised.' })
}

export async function endMultiplayerRoom({ roomId, actorUserId, actorDisplayName, endReason = 'Room ended by host.' }) {
  if (!roomId) throw new Error('Room ID is required.')
  const room = await getRoom(roomId)
  const startedMillis = toMillis(room.startedAt || room.lobbyOpenedAt || room.createdAt)
  const endedAt = nowDate()
  const durationSeconds = startedMillis > 0 ? Math.max(0, Math.round((endedAt.getTime() - startedMillis) / 1000)) : 0

  await updateDoc(doc(db, C.multiplayerRooms, roomId), {
    status: 'completed',
    lifecycleStatus: 'completed',
    workflowStage: `${room.mode || 'room'}_ended`,
    endedAt,
    completedAt: endedAt,
    durationSeconds,
    endedBy: actorUserId || '',
    endedByName: actorDisplayName || '',
    endReason: cleanText(endReason),
    isOpen: false,
    lastActivityAt: endedAt,
    updatedAt: endedAt
  })

  await addRoomEvent({
    roomId,
    roomCode: room.roomCode,
    eventType: 'room_ended',
    actorUserId,
    actorDisplayName,
    message: cleanText(endReason) || 'Room ended.'
  })

  await notifyRoomPlayers({
    roomId,
    actorUserId,
    actorDisplayName,
    type: 'room_ended',
    title: 'Room ended',
    message: `${room.roomName} has ended.`
  })

  return roomId
}

export async function seedMultiplayerRealtimeCollections({ userId = 'schema_user', displayName = 'Schema Player' } = {}) {
  const now = nowDate()
  const writes = [
    setDoc(doc(db, C.playerNotifications, '__schema'), safeClean({ notificationId: '__schema', recipientUserId: userId, senderUserId: userId, senderDisplayName: displayName, type: 'schema', title: 'Notification schema', message: 'Schema only', status: 'read', actionType: '', actionData: {}, createdAt: now, readAt: now, isSchema: true }), { merge: true }),
    setDoc(doc(db, C.playerConnections, '__schema'), safeClean({ connectionId: '__schema', ownerUserId: userId, connectedUserId: userId, connectedDisplayName: displayName, status: 'schema', source: 'schema', createdAt: now, updatedAt: now, isSchema: true }), { merge: true }),
    setDoc(doc(db, C.playerConnectionRequests, '__schema'), safeClean({ requestId: '__schema', fromUserId: userId, fromDisplayName: displayName, toUserId: userId, toDisplayName: displayName, status: 'schema', createdAt: now, respondedAt: now, isSchema: true }), { merge: true }),
    setDoc(doc(db, C.playerPresence, '__schema'), safeClean({ userId: '__schema', displayName: 'Presence schema', status: 'offline', currentRoomId: '', currentRoomCode: '', currentScreen: '', lastSeenAt: now, updatedAt: now, isSchema: true }), { merge: true }),
    setDoc(doc(db, C.multiplayerRoomEvents, '__schema'), safeClean({ eventId: '__schema', roomId: '__schema', roomCode: '', eventType: 'schema', actorUserId: userId, actorDisplayName: displayName, message: 'Schema only', metadata: {}, createdAt: now, createdAtText: now.toLocaleString(), isSchema: true }), { merge: true }),
    setDoc(doc(db, C.multiplayerRoomRequests, '__schema'), safeClean({ requestId: '__schema', roomId: '__schema', roomCode: '', roomName: '', mode: '', fromUserId: userId, fromDisplayName: displayName, hostUserId: userId, hostDisplayName: displayName, status: 'schema', message: '', createdAt: now, respondedAt: now, isSchema: true }), { merge: true })
  ]

  await Promise.all(writes)
  return writes.length
}
