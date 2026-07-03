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
  startChallengeRoom
} from '../../services/player/playerMultiplayerService'

const modeDetails = {
  challenge: {
    label: 'Challenge',
    title: 'Live challenge rooms',
    description: 'Players compete on problem cards and compare scored solutions.',
    accent: '⚔️'
  },
  team: {
    label: 'Team',
    title: 'Team collaboration',
    description: 'Players can be grouped into teams for shared SDG problem solving.',
    accent: '🤝'
  },
  debate: {
    label: 'Debate',
    title: 'Debate arena',
    description: 'Players defend ideas, vote on strong arguments and build ethical AI reasoning.',
    accent: '🎙️'
  },
  tournament: {
    label: 'Tournament',
    title: 'Tournament bracket',
    description: 'Structured rounds for competitive AfriQuest events and showcases.',
    accent: '🏆'
  }
}

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
  const [activeMode, setActiveMode] = useState('challenge')
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
      const roomId = await createMultiplayerRoom({
        userId: currentUser?.uid,
        displayName: fullName,
        roomName,
        mode,
        maxPlayers
      })

      setRoomName('')
      setActiveMode(mode)
      setModeFilter(mode)
      setStatusMessage(`${modeDetails[mode]?.label || 'Room'} created and saved to Firebase.`)
      await loadHubData()
      await handleOpenRoom(roomId)
    } catch (err) {
      setError(err.message || 'Could not create multiplayer room.')
    }
  }

  async function handleJoinRoom(event) {
    event.preventDefault()
    setError('')
    setStatusMessage('')

    try {
      const roomId = await joinMultiplayerRoom({
        userId: currentUser?.uid,
        displayName: fullName,
        roomCode: joinCode
      })

      setJoinCode('')
      setStatusMessage('Room joined successfully and saved to Firebase.')
      await loadHubData()
      await handleOpenRoom(roomId)
    } catch (err) {
      setError(err.message || 'Could not join multiplayer room.')
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
      setActiveMode(details.room.mode || 'challenge')
      setModeFilter(details.room.mode || 'all')
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
      if (!selectedRoomId) throw new Error('Open a room first.')

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
      const text = [room.roomName, room.roomCode, room.mode, room.status, room.createdByName]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !cleanSearch || text.includes(cleanSearch)
      const matchesMode = modeFilter === 'all' || room.mode === modeFilter

      return matchesSearch && matchesMode
    })
  }, [rooms, searchTerm, modeFilter])

  const activeModeRooms = filteredRooms.filter((room) => activeMode === 'all' || room.mode === activeMode)
  const selectedModeMeta = modeDetails[activeMode] || modeDetails.challenge

  const modeCounts = useMemo(() => {
    return rooms.reduce(
      (total, room) => ({
        ...total,
        [room.mode]: Number(total[room.mode] || 0) + 1
      }),
      {}
    )
  }, [rooms])

  return (
    <div style={styles.panel}>
      <div style={heroStyle}>
        <div>
          <p style={styles.eyebrow}>Multiplayer arena</p>
          <h1 style={heroTitleStyle}>Compete, debate and solve SDG challenges together.</h1>
          <p style={heroTextStyle}>
            Create a room, share the code and let players join a professional AfriQuest game lobby connected to Firebase.
          </p>
        </div>

        <div style={heroStatStyle}>
          <span style={heroStatNumberStyle}>{rooms.length}</span>
          <span style={heroStatLabelStyle}>active rooms</span>
        </div>
      </div>


      <SectionHeader eyebrow={t('multiplayer')} title={t('multiplayerTitle')}>
        {t('multiplayerHelp')}
      </SectionHeader>

      {error && <MessageCard message={error} tone="error" />}
      {statusMessage && <MessageCard message={statusMessage} tone="success" />}

      <div style={arenaCardsStyle}>
        <div style={actionPanelStyle}>
          <p style={styles.eyebrow}>{t('createRoom')}</p>
          <h3 style={styles.smallCardTitle}>Host a new game room</h3>

          <form onSubmit={handleCreateRoom} style={formGridStyle}>
            <label style={fieldStyle}>
              {t('roomName')}
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Example: GLA SDG Final Room"
                style={inputStyle}
              />
            </label>

            <div style={modeChoiceGridStyle}>
              {Object.entries(modeDetails).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  style={mode === key ? selectedModeButtonStyle : modeButtonStyle}
                >
                  <span style={modeIconStyle}>{item.accent}</span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>

            <label style={fieldStyle}>
              Max players
              <select value={maxPlayers} onChange={(event) => setMaxPlayers(event.target.value)} style={inputStyle}>
                <option value="2">2 players</option>
                <option value="4">4 players</option>
                <option value="8">8 players</option>
                <option value="12">12 players</option>
              </select>
            </label>

            <button type="submit" style={primaryButtonStyle}>
              Create {modeDetails[mode]?.label || 'Room'} Room
            </button>
          </form>
        </div>

        <div style={actionPanelStyle}>
          <p style={styles.eyebrow}>{t('joinRoom')}</p>
          <h3 style={styles.smallCardTitle}>Join using a room code</h3>
          <p style={styles.smallCardText}>Ask the host for the 6-character code, then join the lobby immediately.</p>

          <form onSubmit={handleJoinRoom} style={formGridStyle}>
            <label style={fieldStyle}>
              {t('roomCode')}
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="Example: ABC123"
                style={{ ...inputStyle, fontSize: '1.2rem', letterSpacing: '0.12em', fontWeight: 900 }}
              />
            </label>

            <button type="submit" style={primaryButtonStyle}>
              Join Room
            </button>
          </form>

          <div style={databaseStripStyle}>
            <p style={styles.eyebrow}>Firebase linked</p>
            <div style={databaseGridStyle}>
              <MiniStat title="Players" value={hubData.roomPlayers.length} />
              <MiniStat title="Debates" value={hubData.debates.length} />
              <MiniStat title="Tournaments" value={hubData.tournaments.length} />
              <MiniStat title="Votes" value={hubData.debateVotes.length} />
            </div>
          </div>
        </div>
      </div>

      <div style={stickyArenaNavStyle}>
        {Object.entries(modeDetails).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActiveMode(key)
              setModeFilter(key)
            }}
            style={activeMode === key ? activeNavButtonStyle : navButtonStyle}
          >
            <span style={navIconStyle}>{item.accent}</span>
            <span>{item.label}</span>
            <small style={navCountStyle}>{modeCounts[key] || 0}</small>
          </button>
        ))}
      </div>

      <div style={sectionCardStyle}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>{selectedModeMeta.label} lobby</p>
            <h3 style={styles.smallCardTitle}>{selectedModeMeta.title}</h3>
            <p style={styles.smallCardText}>{selectedModeMeta.description}</p>
          </div>

          <Pill>{loading ? 'Loading' : `${activeModeRooms.length} rooms`}</Pill>
        </div>

        <div style={filterGridStyle}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search room name, code or host..."
            style={inputStyle}
          />

          <select value={modeFilter} onChange={(event) => setModeFilter(event.target.value)} style={inputStyle}>
            <option value="all">All modes</option>
            <option value="challenge">Challenge</option>
            <option value="team">Team</option>
            <option value="debate">Debate</option>
            <option value="tournament">Tournament</option>
          </select>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>Loading multiplayer rooms from Firebase...</p>
        ) : activeModeRooms.length === 0 ? (
          <div style={emptyArenaStyle}>
            <h3 style={styles.smallCardTitle}>No rooms here yet.</h3>
            <p style={styles.smallCardText}>Create a {selectedModeMeta.label.toLowerCase()} room above to start this game mode.</p>
          </div>
        ) : (
          <div style={roomGridStyle}>
            {activeModeRooms.map((room) => (
              <article key={room.roomId} style={roomCardStyle}>
                <div style={styles.rowBetween}>
                  <div>
                    <p style={styles.eyebrow}>{room.roomCode}</p>
                    <h3 style={styles.smallCardTitle}>{room.roomName}</h3>
                  </div>

                  <Pill tone={room.status === 'waiting' ? 'success' : 'default'}>{room.status}</Pill>
                </div>

                <p style={{ ...styles.smallCardText, marginTop: 10 }}>
                  {modeDetails[room.mode]?.accent || '🎮'} {room.mode} mode • hosted by {room.createdByName}
                </p>

                <div style={roomFooterStyle}>
                  <span>{room.playerCount} / {room.maxPlayers} players</span>
                  <button type="button" onClick={() => handleOpenRoom(room.roomId)} style={secondaryButtonStyle}>
                    Open Lobby
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedRoomDetails && (
        <div style={lobbyPanelStyle}>
          <div style={styles.rowBetween}>
            <div>
              <p style={styles.eyebrow}>Opened lobby</p>
              <h3 style={styles.smallCardTitle}>{selectedRoomDetails.room.roomName}</h3>
              <p style={styles.smallCardText}>
                Code <strong>{selectedRoomDetails.room.roomCode}</strong> • {selectedRoomDetails.room.mode} mode • {selectedRoomDetails.roomPlayers.length} / {selectedRoomDetails.room.maxPlayers} players
              </p>
            </div>

            <div style={buttonRowStyle}>
              <Pill>{roomLoading ? 'Loading' : selectedRoomDetails.room.status}</Pill>
              <button type="button" onClick={handleCloseRoom} style={secondaryButtonStyle}>Close</button>
            </div>
          </div>

          {selectedRoomDetails.room.mode === 'challenge' && (
            <div style={challengeControlStyle}>
              <label style={fieldStyle}>
                Problem card ID
                <input
                  value={challengeProblemId}
                  onChange={(event) => setChallengeProblemId(event.target.value)}
                  placeholder="Example: problem_1 or 1"
                  style={inputStyle}
                />
              </label>

              <button type="button" onClick={handleStartChallenge} style={primaryButtonStyle}>
                Start Challenge
              </button>
            </div>
          )}

          {selectedRoomDetails.room.mode === 'debate' && (
            <ModeDataPanel
              title="Debate setup"
              description="Debate rooms are saved in multiplayerRooms and linked to debates and debateVotes. Players can join the room now while the debate prompt is prepared."
              rows={hubData.debates.filter((debate) => debate.roomId === selectedRoomDetails.room.roomId)}
              empty="No debate prompt has been created for this room yet."
              render={(debate) => `${debate.prompt || 'Debate prompt'} • ${debate.status || 'open'}`}
            />
          )}

          {selectedRoomDetails.room.mode === 'tournament' && (
            <ModeDataPanel
              title="Tournament setup"
              description="Tournament rooms are saved in multiplayerRooms and linked to tournaments and tournamentPlayers."
              rows={hubData.tournaments.filter((tournament) => tournament.roomId === selectedRoomDetails.room.roomId)}
              empty="No tournament bracket has been created for this room yet."
              render={(tournament) => `${tournament.title || 'Tournament'} • ${tournament.status || 'planning'} • ${tournament.roundCount || 1} round(s)`}
            />
          )}

          <div style={styles.twoColumnGrid}>
            <div style={styles.smallCard}>
              <p style={styles.eyebrow}>Players in room</p>
              {selectedRoomDetails.roomPlayers.length === 0 ? (
                <p style={styles.smallCardText}>No players have joined yet.</p>
              ) : (
                <div style={playerListStyle}>
                  {selectedRoomDetails.roomPlayers.map((player) => (
                    <article key={player.roomPlayerId || player.firestoreId} style={playerCardStyle}>
                      <div>
                        <strong style={playerNameStyle}>{player.displayName}</strong>
                        <p style={styles.smallCardText}>{player.role || 'player'} • score {player.score || 0}</p>
                      </div>
                      <Pill>{player.status}</Pill>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.smallCard}>
              <p style={styles.eyebrow}>Challenge results</p>
              {challengeResults.length === 0 ? (
                <p style={styles.smallCardText}>Results will appear after players submit challenge answers.</p>
              ) : (
                <div style={playerListStyle}>
                  {challengeResults.map((result) => (
                    <article key={result.attemptId || result.firestoreId} style={playerCardStyle}>
                      <div>
                        <strong style={playerNameStyle}>#{result.rank} {result.displayName}</strong>
                        <p style={styles.smallCardText}>{result.problemTitle || 'Problem card'} • {result.totalScore || 0}/100</p>
                      </div>
                      <Pill>{result.totalScore || 0}</Pill>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ title, value }) {
  return (
    <div style={miniStatStyle}>
      <strong>{value}</strong>
      <span>{title}</span>
    </div>
  )
}

function MessageCard({ message, tone }) {
  const isError = tone === 'error'

  return (
    <div style={{ ...styles.smallCard, marginTop: 18, borderColor: isError ? 'rgba(153, 27, 27, 0.28)' : 'rgba(22, 101, 52, 0.28)' }}>
      <p style={{ ...styles.smallCardText, color: isError ? '#991b1b' : '#166534' }}>{message}</p>
    </div>
  )
}

function ModeDataPanel({ title, description, rows, empty, render }) {
  return (
    <div style={modeDataPanelStyle}>
      <p style={styles.eyebrow}>{title}</p>
      <p style={styles.smallCardText}>{description}</p>
      {rows.length === 0 ? (
        <p style={{ ...styles.smallCardText, marginTop: 10 }}>{empty}</p>
      ) : (
        <div style={playerListStyle}>
          {rows.map((row) => (
            <div key={row.firestoreId || row.debateId || row.tournamentId} style={playerCardStyle}>
              <p style={styles.smallCardText}>{render(row)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const heroStyle = {
  padding: 28,
  borderRadius: 32,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 22,
  alignItems: 'center',
  background: 'radial-gradient(circle at top left, rgba(244, 210, 138, 0.32), transparent 34%), linear-gradient(135deg, #3b2817, #6b3d16 58%, #9a6a22)',
  boxShadow: '0 28px 70px rgba(80, 52, 20, 0.28)',
  marginBottom: 18
}

const heroTitleStyle = {
  margin: '0 0 12px',
  color: '#fff8eb',
  fontSize: 'clamp(2rem, 4vw, 4rem)',
  lineHeight: 1,
  letterSpacing: '-0.065em'
}

const heroTextStyle = {
  margin: 0,
  color: 'rgba(255, 248, 235, 0.84)',
  lineHeight: 1.7,
  maxWidth: 720
}

const heroStatStyle = {
  minWidth: 150,
  padding: 20,
  borderRadius: 28,
  textAlign: 'center',
  background: 'rgba(255, 248, 235, 0.14)',
  border: '1px solid rgba(255, 248, 235, 0.22)'
}

const heroStatNumberStyle = {
  display: 'block',
  color: '#f4d28a',
  fontSize: '3.1rem',
  fontWeight: 950,
  lineHeight: 1
}

const heroStatLabelStyle = {
  display: 'block',
  marginTop: 8,
  color: '#fff8eb',
  fontWeight: 850
}

const stickyArenaNavStyle = {
  position: 'sticky',
  top: 14,
  zIndex: 20,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 10,
  padding: 12,
  marginTop: 22,
  marginBottom: 24,
  borderRadius: 26,
  background: 'rgba(255, 248, 235, 0.92)',
  border: '1px solid rgba(154, 106, 34, 0.26)',
  boxShadow: '0 18px 44px rgba(80, 52, 20, 0.16)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)'
}

const navButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.18)',
  borderRadius: 20,
  padding: '12px 14px',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.66)',
  color: '#5c3512',
  fontWeight: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8
}

const activeNavButtonStyle = {
  ...navButtonStyle,
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  border: '1px solid rgba(244, 210, 138, 0.42)',
  boxShadow: '0 12px 26px rgba(92, 53, 18, 0.22)'
}

const navIconStyle = { fontSize: '1.05rem' }
const navCountStyle = { opacity: 0.78 }

const arenaCardsStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, 0.75fr)',
  gap: 18,
  marginTop: 18
}

const actionPanelStyle = {
  ...styles.smallCard,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,248,235,0.62))'
}

const formGridStyle = { display: 'grid', gap: 14, marginTop: 14 }

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
  background: 'rgba(255, 255, 255, 0.78)',
  color: '#3b2817',
  outline: 'none'
}

const primaryButtonStyle = {
  border: 0,
  borderRadius: 999,
  padding: '14px 20px',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: 900,
  boxShadow: '0 14px 30px rgba(92, 53, 18, 0.22)'
}

const secondaryButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.22)',
  borderRadius: 999,
  padding: '11px 15px',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.76)',
  color: '#5c3512',
  fontWeight: 850
}

const modeChoiceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 10
}

const modeButtonStyle = {
  padding: 14,
  borderRadius: 20,
  textAlign: 'left',
  cursor: 'pointer',
  border: '1px solid rgba(139, 92, 40, 0.16)',
  background: 'rgba(255,255,255,0.66)',
  color: '#5c3512',
  display: 'grid',
  gap: 6
}

const selectedModeButtonStyle = {
  ...modeButtonStyle,
  border: '2px solid rgba(154, 106, 34, 0.68)',
  background: 'linear-gradient(135deg, rgba(255,248,235,0.98), rgba(244,210,138,0.48))',
  boxShadow: '0 14px 30px rgba(80, 52, 20, 0.14)'
}

const modeIconStyle = { fontSize: '1.35rem' }

const databaseStripStyle = {
  marginTop: 18,
  padding: 16,
  borderRadius: 22,
  background: 'rgba(154, 106, 34, 0.1)',
  border: '1px solid rgba(154, 106, 34, 0.18)'
}

const databaseGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10
}

const miniStatStyle = {
  padding: 12,
  borderRadius: 18,
  background: 'rgba(255,255,255,0.62)',
  display: 'grid',
  gap: 3,
  color: '#5c3512'
}

const sectionCardStyle = {
  ...styles.smallCard,
  marginTop: 18,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,248,235,0.56))'
}

const filterGridStyle = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: 'minmax(240px, 1fr) 220px',
  gap: 12
}

const emptyArenaStyle = {
  marginTop: 18,
  padding: 22,
  borderRadius: 24,
  textAlign: 'center',
  background: 'rgba(255,255,255,0.56)',
  border: '1px dashed rgba(139, 92, 40, 0.28)'
}

const roomGridStyle = {
  marginTop: 18,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16
}

const roomCardStyle = {
  padding: 18,
  borderRadius: 26,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,248,235,0.6))',
  border: '1px solid rgba(139, 92, 40, 0.16)',
  boxShadow: '0 16px 36px rgba(80, 52, 20, 0.1)'
}

const roomFooterStyle = {
  marginTop: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  color: '#5c3512',
  fontWeight: 850
}

const lobbyPanelStyle = {
  marginTop: 18,
  padding: 22,
  borderRadius: 30,
  background: 'linear-gradient(135deg, rgba(255, 248, 235, 0.96), rgba(244, 210, 138, 0.32))',
  border: '1px solid rgba(154, 106, 34, 0.28)',
  boxShadow: '0 22px 52px rgba(80, 52, 20, 0.16)'
}

const buttonRowStyle = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap'
}

const challengeControlStyle = {
  marginTop: 18,
  display: 'grid',
  gridTemplateColumns: 'minmax(240px, 1fr) auto',
  gap: 12,
  alignItems: 'end'
}

const modeDataPanelStyle = {
  ...styles.smallCard,
  marginTop: 18,
  background: 'rgba(255,255,255,0.62)'
}

const playerListStyle = {
  display: 'grid',
  gap: 10,
  marginTop: 12
}

const playerCardStyle = {
  padding: 14,
  borderRadius: 20,
  background: 'rgba(255,255,255,0.66)',
  border: '1px solid rgba(139, 92, 40, 0.14)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap'
}

const playerNameStyle = {
  color: '#5c3512',
  fontSize: '1rem'
}

export default MultiplayerHubScreen
