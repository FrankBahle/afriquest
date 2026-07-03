import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { styles } from './gameStyles'
import { Pill, SectionHeader } from './ui'
import { usePlayerLanguage } from '../../hooks/usePlayerLanguage'
import {
  createMultiplayerRoom,
  getChallengeResults,
  getChallengeRoomDetails,
  getMultiplayerHubData,
  joinMultiplayerRoom,
  seedMultiplayerTableSamples,
  startChallengeRoom
} from '../../services/player/playerMultiplayerService'

function MultiplayerHubScreen({ fullName = 'Player' }) {
  const { currentUser } = useAuth()
  const { t } = usePlayerLanguage()

  const [hubData, setHubData] = useState({
    rooms: [],
    roomPlayers: [],
    teams: [],
    teamSessions: [],
    debates: [],
    debateVotes: [],
    tournaments: [],
    tournamentPlayers: []
  })

  const [roomName, setRoomName] = useState('')
  const [mode, setMode] = useState('challenge')
  const [maxPlayers, setMaxPlayers] = useState('4')
  const [joinCode, setJoinCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [modeFilter, setModeFilter] = useState('all')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null)
  const [challengeProblemId, setChallengeProblemId] = useState('')
  const [challengeResults, setChallengeResults] = useState([])
  const [roomLoading, setRoomLoading] = useState(false)

  async function loadHubData() {
    setLoading(true)
    setError('')

    try {
      const data = await getMultiplayerHubData()
      setHubData(data)
    } catch (err) {
      setError(err.message || 'Could not load multiplayer data from Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHubData()
  }, [])

  async function handleCreateRoom(event) {
    event.preventDefault()
    setError('')
    setStatusMessage('')

    try {
      await createMultiplayerRoom({
        userId: currentUser?.uid,
        displayName: fullName,
        roomName,
        mode,
        maxPlayers
      })

      setRoomName('')
      setStatusMessage('Room created successfully and saved to Firebase.')
      await loadHubData()
    } catch (err) {
      setError(err.message || 'Could not create multiplayer room.')
    }
  }

  async function handleJoinRoom(event) {
    event.preventDefault()
    setError('')
    setStatusMessage('')

    try {
      await joinMultiplayerRoom({
        userId: currentUser?.uid,
        displayName: fullName,
        roomCode: joinCode
      })

      setJoinCode('')
      setStatusMessage('Room joined successfully and saved to Firebase.')
      await loadHubData()
    } catch (err) {
      setError(err.message || 'Could not join multiplayer room.')
    }
  }

  async function handleCreateSamples() {
    setError('')
    setStatusMessage('')

    try {
      const count = await seedMultiplayerTableSamples(currentUser?.uid || 'sample_user')
      setStatusMessage(`${count} multiplayer collection examples created.`)
      await loadHubData()
    } catch (err) {
      setError(err.message || 'Could not create multiplayer table examples.')
    }
  }

  async function handleOpenRoom(roomId) {
    setError('')
    setStatusMessage('')
    setSelectedRoomId(roomId)
    setRoomLoading(true)

    try {
      const details = await getChallengeRoomDetails(roomId)
      const results = await getChallengeResults(roomId)

      setSelectedRoomDetails(details)
      setChallengeResults(results)
      setChallengeProblemId(details.room.currentProblemId || '')
    } catch (err) {
      setError(err.message || 'Could not open multiplayer room.')
    } finally {
      setRoomLoading(false)
    }
  }

  async function handleStartChallenge() {
    setError('')
    setStatusMessage('')

    try {
      if (!selectedRoomId) {
        throw new Error('Open a room first.')
      }

      await startChallengeRoom({
        roomId: selectedRoomId,
        problemCardId: challengeProblemId
      })

      const details = await getChallengeRoomDetails(selectedRoomId)
      const results = await getChallengeResults(selectedRoomId)

      setSelectedRoomDetails(details)
      setChallengeResults(results)
      setStatusMessage('Challenge started successfully.')
      await loadHubData()
    } catch (err) {
      setError(err.message || 'Could not start challenge.')
    }
  }

  async function handleRefreshRoom() {
    if (!selectedRoomId) return

    setRoomLoading(true)
    setError('')

    try {
      const details = await getChallengeRoomDetails(selectedRoomId)
      const results = await getChallengeResults(selectedRoomId)

      setSelectedRoomDetails(details)
      setChallengeResults(results)
    } catch (err) {
      setError(err.message || 'Could not refresh room.')
    } finally {
      setRoomLoading(false)
    }
  }

  function handleCloseRoom() {
    setSelectedRoomId('')
    setSelectedRoomDetails(null)
    setChallengeResults([])
    setChallengeProblemId('')
  }

  const rooms = hubData.rooms || []

  const filteredRooms = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    return rooms.filter((room) => {
      const text = [
        room.roomName,
        room.roomCode,
        room.mode,
        room.status,
        room.createdByName
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !cleanSearch || text.includes(cleanSearch)
      const matchesMode = modeFilter === 'all' || room.mode === modeFilter

      return matchesSearch && matchesMode
    })
  }, [rooms, searchTerm, modeFilter])

  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow={t('multiplayer')} title={t('multiplayerTitle')}>
        {t('multiplayerHelp')}
      </SectionHeader>

      {error && <MessageCard message={error} tone="error" />}
      {statusMessage && <MessageCard message={statusMessage} tone="success" />}

      <div style={styles.metricGrid}>
        <Metric title="Rooms" value={rooms.length} note="multiplayerRooms" />
        <Metric title="Room Players" value={hubData.roomPlayers.length} note="roomPlayers" />
        <Metric title="Teams" value={hubData.teams.length} note="teams" />
        <Metric title="Team Sessions" value={hubData.teamSessions.length} note="teamSessions" />
        <Metric title="Debates" value={hubData.debates.length} note="debates" />
        <Metric title="Debate Votes" value={hubData.debateVotes.length} note="debateVotes" />
        <Metric title="Tournaments" value={hubData.tournaments.length} note="tournaments" />
        <Metric title="Tournament Players" value={hubData.tournamentPlayers.length} note="tournamentPlayers" />
      </div>

      <div style={styles.twoColumnGrid}>
        <div style={{ ...styles.smallCard, marginTop: 18 }}>
          <p style={styles.eyebrow}>{t('createRoom')}</p>

          <form onSubmit={handleCreateRoom} style={formGridStyle}>
            <label style={fieldStyle}>
              {t('roomName')}
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Example: Workshop Room 1"
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              {t('mode')}
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                style={inputStyle}
              >
                <option value="challenge">Challenge Mode</option>
                <option value="team">Team Mode</option>
                <option value="debate">Debate Mode</option>
                <option value="tournament">Tournament Mode</option>
              </select>
            </label>

            <label style={fieldStyle}>
              Max players
              <select
                value={maxPlayers}
                onChange={(event) => setMaxPlayers(event.target.value)}
                style={inputStyle}
              >
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="12">12</option>
              </select>
            </label>

            <button type="submit" style={primaryButtonStyle}>
              {t('createRoom')}
            </button>
          </form>
        </div>

        <div style={{ ...styles.smallCard, marginTop: 18 }}>
          <p style={styles.eyebrow}>{t('joinRoom')}</p>

          <form onSubmit={handleJoinRoom} style={formGridStyle}>
            <label style={fieldStyle}>
              {t('roomCode')}
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="Example: ABC123"
                style={inputStyle}
              />
            </label>

            <button type="submit" style={primaryButtonStyle}>
              {t('joinRoom')}
            </button>

            <button type="button" onClick={handleCreateSamples} style={secondaryButtonStyle}>
              Create table examples
            </button>
          </form>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Search and filter</p>
            <h3 style={styles.smallCardTitle}>Find multiplayer rooms</h3>
          </div>

          <Pill>{filteredRooms.length} rooms</Pill>
        </div>

        <div style={filterGridStyle}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search room name, code or host..."
            style={inputStyle}
          />

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="all">All modes</option>
            <option value="challenge">Challenge</option>
            <option value="team">Team</option>
            <option value="debate">Debate</option>
            <option value="tournament">Tournament</option>
          </select>
        </div>
      </div>

      {selectedRoomDetails && (
        <div style={{ ...styles.smallCard, marginTop: 18 }}>
          <div style={styles.rowBetween}>
            <div>
              <p style={styles.eyebrow}>Challenge room lobby</p>
              <h3 style={styles.smallCardTitle}>
                {selectedRoomDetails.room.roomName}
              </h3>
            </div>

            <Pill>{selectedRoomDetails.room.status}</Pill>
          </div>

          <p style={{ ...styles.smallCardText, marginTop: 10 }}>
            Room code: <strong>{selectedRoomDetails.room.roomCode}</strong>
          </p>

          <p style={styles.smallCardText}>
            Mode: {selectedRoomDetails.room.mode} • Players:{' '}
            {selectedRoomDetails.roomPlayers.length} / {selectedRoomDetails.room.maxPlayers}
          </p>

          <div style={filterGridStyle}>
            <label style={fieldStyle}>
              Challenge problem card ID
              <input
                value={challengeProblemId}
                onChange={(event) => setChallengeProblemId(event.target.value)}
                placeholder="Example: problem_1 or 1"
                style={inputStyle}
              />
            </label>

            <div style={buttonRowStyle}>
              <button type="button" onClick={handleStartChallenge} style={primaryButtonStyle}>
                Start Challenge
              </button>

              <button type="button" onClick={handleRefreshRoom} style={secondaryButtonStyle}>
                Refresh Room
              </button>

              <button type="button" onClick={handleCloseRoom} style={secondaryButtonStyle}>
                Close Room
              </button>
            </div>
          </div>

          {roomLoading && (
            <p style={{ ...styles.smallCardText, marginTop: 14 }}>
              Loading room details...
            </p>
          )}

          <div style={styles.twoColumnGrid}>
            <div style={{ ...styles.smallCard, marginTop: 18 }}>
              <p style={styles.eyebrow}>Players in room</p>

              {selectedRoomDetails.roomPlayers.length === 0 ? (
                <p style={styles.smallCardText}>No players have joined yet.</p>
              ) : (
                <div style={roomGridStyle}>
                  {selectedRoomDetails.roomPlayers.map((player) => (
                    <article key={player.roomPlayerId || player.firestoreId} style={roomCardStyle}>
                      <div style={styles.rowBetween}>
                        <div>
                          <p style={styles.eyebrow}>{player.role || 'player'}</p>
                          <h3 style={styles.smallCardTitle}>{player.displayName}</h3>
                        </div>

                        <Pill>{player.status}</Pill>
                      </div>

                      <p style={styles.smallCardText}>Score: {player.score || 0}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...styles.smallCard, marginTop: 18 }}>
              <p style={styles.eyebrow}>Challenge results</p>

              {challengeResults.length === 0 ? (
                <p style={styles.smallCardText}>
                  Results will appear after players submit challenge answers.
                </p>
              ) : (
                <div style={roomGridStyle}>
                  {challengeResults.map((result) => (
                    <article key={result.attemptId || result.firestoreId} style={roomCardStyle}>
                      <div style={styles.rowBetween}>
                        <div>
                          <p style={styles.eyebrow}>Rank #{result.rank}</p>
                          <h3 style={styles.smallCardTitle}>{result.displayName}</h3>
                        </div>

                        <Pill>{result.totalScore || 0}/100</Pill>
                      </div>

                      <p style={styles.smallCardText}>{result.problemTitle}</p>
                      <p style={styles.smallCardText}>{result.feedback || 'No feedback yet.'}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Firebase multiplayer collections</p>
            <h3 style={styles.smallCardTitle}>Available rooms</h3>
          </div>

          <Pill>{loading ? 'Loading' : `${filteredRooms.length} rows`}</Pill>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>
            Loading multiplayer rooms from Firebase...
          </p>
        ) : filteredRooms.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>
            No multiplayer rooms match your search.
          </p>
        ) : (
          <div style={roomGridStyle}>
            {filteredRooms.map((room) => (
              <article key={room.roomId} style={roomCardStyle}>
                <div style={styles.rowBetween}>
                  <div>
                    <p style={styles.eyebrow}>{room.roomCode}</p>
                    <h3 style={styles.smallCardTitle}>{room.roomName}</h3>
                  </div>

                  <Pill tone={room.status === 'waiting' ? 'success' : 'default'}>
                    {room.status}
                  </Pill>
                </div>

                <p style={{ ...styles.smallCardText, marginTop: 10 }}>
                  {room.mode} mode • hosted by {room.createdByName}
                </p>

                <p style={styles.smallCardText}>
                  {room.playerCount} / {room.maxPlayers} players
                </p>

                <button
                  type="button"
                  onClick={() => handleOpenRoom(room.roomId)}
                  style={{ ...secondaryButtonStyle, marginTop: 12 }}
                >
                  Open Lobby
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ title, value, note }) {
  return (
    <div style={styles.smallCard}>
      <p style={styles.eyebrow}>{title}</p>
      <h3 style={styles.smallCardTitle}>{value}</h3>
      <p style={styles.smallCardText}>{note}</p>
    </div>
  )
}

function MessageCard({ message, tone }) {
  const isError = tone === 'error'

  return (
    <div
      style={{
        ...styles.smallCard,
        marginTop: 18,
        borderColor: isError ? 'rgba(153, 27, 27, 0.28)' : 'rgba(22, 101, 52, 0.28)'
      }}
    >
      <p style={{ ...styles.smallCardText, color: isError ? '#991b1b' : '#166534' }}>
        {message}
      </p>
    </div>
  )
}

const formGridStyle = {
  display: 'grid',
  gap: 12,
  marginTop: 12
}

const fieldStyle = {
  display: 'grid',
  gap: 8,
  color: '#5c3512',
  fontWeight: 850
}

const inputStyle = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: 16,
  border: '1px solid rgba(139, 92, 40, 0.24)',
  background: 'rgba(255, 255, 255, 0.76)',
  color: '#3b2817',
  outline: 'none'
}

const primaryButtonStyle = {
  border: 0,
  borderRadius: 999,
  padding: '13px 18px',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: 850
}

const secondaryButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.22)',
  borderRadius: 999,
  padding: '12px 16px',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.72)',
  color: '#5c3512',
  fontWeight: 850
}

const filterGridStyle = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 1fr) 220px',
  gap: 12
}

const buttonRowStyle = {
  display: 'flex',
  gap: 10,
  alignItems: 'end',
  flexWrap: 'wrap'
}

const roomGridStyle = {
  marginTop: 18,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16
}

const roomCardStyle = {
  padding: 18,
  borderRadius: 24,
  background: 'rgba(255,255,255,0.66)',
  border: '1px solid rgba(139, 92, 40, 0.16)',
  boxShadow: '0 16px 36px rgba(80, 52, 20, 0.08)'
}

export default MultiplayerHubScreen
