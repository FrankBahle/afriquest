import { useEffect, useMemo, useState } from 'react'
import { styles } from '../game/gameStyles'
import { MetricCard, SectionHeader, Pill } from '../game/ui'
import { getAdminPlayerAnalyticsRows } from '../../services/admin/adminUserService'

function AdminPlayerAnalyticsScreen() {
  const [players, setPlayers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [certificateFilter, setCertificateFilter] = useState('all')
  const [completionFilter, setCompletionFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadPlayers() {
    setLoading(true)
    setError('')

    try {
      const rows = await getAdminPlayerAnalyticsRows()
      setPlayers(rows)
    } catch (err) {
      setError(err.message || 'Could not load player analytics from Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  const filteredPlayers = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    return players.filter((player) => {
      const searchableText = [
        player.name,
        player.email,
        player.phone,
        player.status,
        player.certificate
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !cleanSearch || searchableText.includes(cleanSearch)

      const matchesStatus =
        statusFilter === 'all' ||
        String(player.status || '').toLowerCase() === statusFilter

      const matchesCertificate =
        certificateFilter === 'all' ||
        String(player.certificate || '').toLowerCase() === certificateFilter

      const matchesCompletion =
        completionFilter === 'all' ||
        (completionFilter === 'cert-ready' &&
          player.completed >= 10 &&
          player.average >= 75) ||
        (completionFilter === 'in-progress' && player.completed < 10) ||
        (completionFilter === 'needs-improvement' &&
          player.completed >= 10 &&
          player.average < 75)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCertificate &&
        matchesCompletion
      )
    })
  }, [players, searchTerm, statusFilter, certificateFilter, completionFilter])

  const active = players.filter(
    (player) => String(player.status || '').toLowerCase() === 'active'
  ).length

  const certified = players.filter(
    (player) => player.certificate === 'Issued'
  ).length

  const averageCompletion =
    players.length > 0
      ? Math.round(
          players.reduce((total, player) => total + Number(player.completed || 0), 0) /
            players.length
        )
      : 0

  const averageScore =
    players.length > 0
      ? Math.round(
          players.reduce((total, player) => total + Number(player.average || 0), 0) /
            players.length
        )
      : 0

  return (
    <div style={styles.panel}>
      <SectionHeader
        eyebrow="Admin player analytics"
        title="View player progress and certification activity."
      >
        Player analytics are loaded from Firebase users, attempts, hintRequests,
        certificates and GLA coin transactions.
      </SectionHeader>

      <div style={{ ...styles.centerButtonRow, marginTop: 16 }}>
        <button type="button" onClick={loadPlayers} style={secondaryButtonStyle}>
          Refresh Players
        </button>
      </div>

      {error && (
        <div
          style={{
            ...styles.smallCard,
            marginTop: 18,
            borderColor: 'rgba(153, 27, 27, 0.28)'
          }}
        >
          <p style={{ ...styles.smallCardText, color: '#991b1b' }}>{error}</p>
        </div>
      )}

      <div style={styles.metricGrid}>
        <MetricCard title="Registered Players" value={players.length} />
        <MetricCard title="Active Players" value={active} />
        <MetricCard title="Certificates Issued" value={certified} />
        <MetricCard title="Average Completion" value={averageCompletion} />
        <MetricCard title="Average Score" value={`${averageScore}%`} />
        <MetricCard title="Filtered Results" value={filteredPlayers.length} />
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Search and filter</p>
            <h3 style={styles.smallCardTitle}>Find players</h3>
          </div>
          <Pill>{filteredPlayers.length} results</Pill>
        </div>

        <div style={filterGridStyle}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search name, email, phone or status..."
            style={inputStyle}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
            <option value="suspended">Suspended only</option>
          </select>

          <select
            value={certificateFilter}
            onChange={(event) => setCertificateFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="all">All certificates</option>
            <option value="issued">Issued</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={completionFilter}
            onChange={(event) => setCompletionFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="all">All progress</option>
            <option value="cert-ready">Certificate ready</option>
            <option value="in-progress">In progress</option>
            <option value="needs-improvement">Needs improvement</option>
          </select>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Firebase users collection</p>
            <h3 style={styles.smallCardTitle}>Player progress table</h3>
          </div>
          <Pill>{loading ? 'Loading...' : `${filteredPlayers.length} players`}</Pill>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 16 }}>
            Loading player analytics from Firebase...
          </p>
        ) : filteredPlayers.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 16 }}>
            No players match your search and filters.
          </p>
        ) : (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Player</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Completed</th>
                  <th style={thStyle}>Average</th>
                  <th style={thStyle}>Attempts</th>
                  <th style={thStyle}>Hints</th>
                  <th style={thStyle}>GLA Coin</th>
                  <th style={thStyle}>Certificate</th>
                  <th style={thStyle}>Last Seen</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id || player.email}>
                    <td style={tdStyle}>
                      <strong>{player.name}</strong>
                    </td>
                    <td style={tdStyle}>{player.email || 'No email'}</td>
                    <td style={tdStyle}>
                      <Pill
                        tone={
                          String(player.status || '').toLowerCase() === 'active'
                            ? 'success'
                            : 'default'
                        }
                      >
                        {player.status}
                      </Pill>
                    </td>
                    <td style={tdStyle}>{player.completed}</td>
                    <td style={tdStyle}>{player.average}%</td>
                    <td style={tdStyle}>{player.attempts}</td>
                    <td style={tdStyle}>{player.hintsUsed}</td>
                    <td style={tdStyle}>{player.coin}</td>
                    <td style={tdStyle}>
                      <Pill tone={player.certificate === 'Issued' ? 'success' : 'default'}>
                        {player.certificate}
                      </Pill>
                    </td>
                    <td style={tdStyle}>{player.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const filterGridStyle = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 1fr) repeat(3, 190px)',
  gap: 12
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

const secondaryButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.22)',
  borderRadius: 999,
  padding: '11px 16px',
  cursor: 'pointer',
  background: 'rgba(255, 255, 255, 0.72)',
  color: '#5c3512',
  fontWeight: 850
}

const tableWrapStyle = {
  marginTop: 16,
  width: '100%',
  overflowX: 'auto'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 1100
}

const thStyle = {
  padding: '12px 14px',
  textAlign: 'left',
  color: '#5c3512',
  fontSize: '0.78rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(139, 92, 40, 0.2)',
  background: 'rgba(244, 210, 138, 0.22)'
}

const tdStyle = {
  padding: '14px',
  color: '#3b2817',
  borderBottom: '1px solid rgba(139, 92, 40, 0.14)',
  verticalAlign: 'top'
}

export default AdminPlayerAnalyticsScreen