import { useState } from 'react'
import { styles } from './gameStyles'
import { ActionButton, DataTable, MetricCard, Pill, SectionHeader } from './ui'

function MultiplayerHubScreen() {
  const [tab, setTab] = useState('lobby')
  const tabs = ['lobby', 'create room', 'join room', 'challenge', 'results', 'team mode', 'debate', 'tournament']
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Version 2 multiplayer" title="Rooms, teams, debates and tournaments." />
      <div style={styles.centerButtonRow}>{tabs.map((item) => <ActionButton key={item} variant={tab === item ? 'primary' : 'secondary'} onClick={() => setTab(item)}>{item}</ActionButton>)}</div>
      {tab === 'lobby' && <Lobby />}
      {tab === 'create room' && <Room title="Create Multiplayer Room Screen" />}
      {tab === 'join room' && <Room title="Join Multiplayer Room Screen" />}
      {tab === 'challenge' && <Challenge />}
      {tab === 'results' && <Results />}
      {tab === 'team mode' && <TeamMode />}
      {tab === 'debate' && <Debate />}
      {tab === 'tournament' && <Tournament />}
    </div>
  )
}
function Lobby() { return <div style={styles.metricGrid}><MetricCard title="Multiplayer Lobby Screen" value="4 rooms" /><MetricCard title="Players Online" value="23" /><MetricCard title="Team Mode Lobby" value="Open" /></div> }
function Room({ title }) { return <div style={{ ...styles.smallCard, marginTop: 18 }}><p style={styles.eyebrow}>{title}</p><h3 style={styles.smallCardTitle}>Room code: GLA-204</h3><p style={styles.smallCardText}>UI-only room creation/join form. Backend sockets are not included.</p><div style={{ marginTop: 12 }}><Pill>Waiting for players</Pill></div></div> }
function Challenge() { return <div style={styles.cardGrid}>{['Multiplayer Challenge Screen', 'Each player selects up to 3 AI cards', 'Same problem card for everyone'].map((text) => <div key={text} style={styles.smallCard}><h3 style={styles.smallCardTitle}>{text}</h3><p style={styles.smallCardText}>UI placeholder for online challenge mode.</p></div>)}</div> }
function Results() { return <div style={{ ...styles.smallCard, marginTop: 18 }}><p style={styles.eyebrow}>Multiplayer Results Comparison Screen</p><DataTable columns={[{ key: 'player', label: 'Player' }, { key: 'score', label: 'Score' }, { key: 'creativity', label: 'Creativity' }, { key: 'feasibility', label: 'Feasibility' }]} rows={[{ id: 1, player: 'Player A', score: 84, creativity: 8, feasibility: 13 }, { id: 2, player: 'Player B', score: 79, creativity: 9, feasibility: 11 }]} /></div> }
function TeamMode() { return <div style={styles.cardGrid}>{['Team Creation Screen', 'Team Shared Solution Screen', 'Team Results Screen'].map((text) => <div key={text} style={styles.smallCard}><h3 style={styles.smallCardTitle}>{text}</h3><p style={styles.smallCardText}>Teams collaborate and submit one shared explanation.</p></div>)}</div> }
function Debate() { return <div style={styles.cardGrid}>{['Debate Mode Screen', 'Peer Voting Screen', 'Most Realistic Solution Vote', 'Most Innovative Solution Vote', 'Most Ethical Solution Vote', 'Most Scalable African Solution Vote'].map((text) => <div key={text} style={styles.smallCard}><h3 style={styles.smallCardTitle}>{text}</h3><p style={styles.smallCardText}>Peer learning and voting UI placeholder.</p></div>)}</div> }
function Tournament() { return <div style={styles.cardGrid}>{['Tournament Mode Screen', 'Tournament Leaderboard Screen', 'Advanced Leaderboards'].map((text) => <div key={text} style={styles.smallCard}><h3 style={styles.smallCardTitle}>{text}</h3><p style={styles.smallCardText}>Multi-round competition and ranking view.</p></div>)}</div> }
export default MultiplayerHubScreen
