import { useEffect, useState } from 'react'
import { styles } from '../game/gameStyles'
import { Pill, SectionHeader } from '../game/ui'
import {
  getAdminProblemCards,
  updateProblemCardSdgMapping
} from '../../services/admin/adminCardService'

const sdgOptions = [
  'SDG 1',
  'SDG 2',
  'SDG 3',
  'SDG 4',
  'SDG 5',
  'SDG 6',
  'SDG 7',
  'SDG 8',
  'SDG 9',
  'SDG 10',
  'SDG 11',
  'SDG 12',
  'SDG 13',
  'SDG 14',
  'SDG 15',
  'SDG 16',
  'SDG 17'
]

function AdminSdgMappingScreen() {
  const [problemCards, setProblemCards] = useState([])
  const [sdgDrafts, setSdgDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadProblemCards() {
    setLoading(true)
    setError('')

    try {
      const cards = await getAdminProblemCards()
      setProblemCards(cards)

      const drafts = {}

      cards.forEach((card) => {
        drafts[card.firestoreId] = Array.isArray(card.sdg_goals)
          ? card.sdg_goals.join(', ')
          : card.sdg_goals || ''
      })

      setSdgDrafts(drafts)
    } catch (err) {
      setError(err.message || 'Could not load SDG mappings from Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProblemCards()
  }, [])

  function updateDraft(card, value) {
    setSdgDrafts((previousDrafts) => ({
      ...previousDrafts,
      [card.firestoreId]: value
    }))
  }

  function addSdgToDraft(card, sdg) {
    const currentValue = sdgDrafts[card.firestoreId] || ''
    const currentItems = currentValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (currentItems.includes(sdg)) {
      return
    }

    const nextValue = [...currentItems, sdg].join(', ')
    updateDraft(card, nextValue)
  }

  async function handleSaveMapping(card) {
    setSavingId(card.firestoreId)
    setError('')
    setSuccessMessage('')

    try {
      await updateProblemCardSdgMapping(card, sdgDrafts[card.firestoreId])
      setSuccessMessage(`SDG mapping updated for "${card.title}".`)
      await loadProblemCards()
    } catch (err) {
      setError(err.message || 'Could not update SDG mapping.')
    } finally {
      setSavingId('')
    }
  }

  function getMappedCount() {
    return problemCards.filter((card) => {
      if (Array.isArray(card.sdg_goals)) {
        return card.sdg_goals.length > 0
      }

      return Boolean(card.sdg_goals)
    }).length
  }

  return (
    <div style={styles.panel}>
      <SectionHeader
        eyebrow="Admin SDG mapping management"
        title="Manage problem-card SDG links."
      >
        SDG mappings are saved directly inside each Firebase problem card using
        the sdg_goals field.
      </SectionHeader>

      <div style={{ ...styles.centerButtonRow, marginTop: 16 }}>
        <button type="button" onClick={loadProblemCards} style={secondaryButtonStyle}>
          Refresh SDG Mappings
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

      {successMessage && (
        <div
          style={{
            ...styles.smallCard,
            marginTop: 18,
            borderColor: 'rgba(22, 101, 52, 0.28)'
          }}
        >
          <p style={{ ...styles.smallCardText, color: '#166534' }}>
            {successMessage}
          </p>
        </div>
      )}

      <div style={styles.metricGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Problem Cards</p>
          <h3 style={styles.smallCardTitle}>{problemCards.length}</h3>
          <p style={styles.smallCardText}>Loaded from Firebase problemCards.</p>
        </div>

        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Mapped Cards</p>
          <h3 style={styles.smallCardTitle}>{getMappedCount()}</h3>
          <p style={styles.smallCardText}>Cards with at least one SDG goal.</p>
        </div>

        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>SDG Options</p>
          <h3 style={styles.smallCardTitle}>17</h3>
          <p style={styles.smallCardText}>United Nations SDG goal numbers.</p>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Quick SDG options</p>
            <h3 style={styles.smallCardTitle}>Available SDG labels</h3>
          </div>

          <Pill>Use on problem cards</Pill>
        </div>

        <div style={sdgPillGridStyle}>
          {sdgOptions.map((sdg) => (
            <Pill key={sdg}>{sdg}</Pill>
          ))}
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Firebase problemCards collection</p>
            <h3 style={styles.smallCardTitle}>Edit SDG mappings</h3>
          </div>

          <Pill>{loading ? 'Loading...' : `${problemCards.length} cards`}</Pill>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 16 }}>
            Loading SDG mappings from Firebase...
          </p>
        ) : problemCards.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 16 }}>
            No problem cards found in Firebase yet.
          </p>
        ) : (
          <div style={mappingGridStyle}>
            {problemCards.map((card) => {
              const hasMapping = Array.isArray(card.sdg_goals)
                ? card.sdg_goals.length > 0
                : Boolean(card.sdg_goals)

              return (
                <div key={card.firestoreId || card.id} style={mappingCardStyle}>
                  <div style={styles.rowBetween}>
                    <div>
                      <p style={styles.eyebrow}>Problem #{card.id}</p>
                      <h3 style={styles.smallCardTitle}>{card.title}</h3>
                    </div>

                    <Pill tone={hasMapping ? 'success' : 'default'}>
                      {hasMapping ? 'Mapped' : 'Unmapped'}
                    </Pill>
                  </div>

                  <p style={{ ...styles.smallCardText, marginTop: 8 }}>
                    {card.problem_type}
                  </p>

                  <label style={fieldStyle}>
                    Linked SDGs
                    <input
                      value={sdgDrafts[card.firestoreId] || ''}
                      onChange={(event) => updateDraft(card, event.target.value)}
                      placeholder="Example: SDG 1, SDG 4, SDG 8"
                      style={inputStyle}
                    />
                  </label>

                  <div style={smallSdgGridStyle}>
                    {sdgOptions.map((sdg) => (
                      <button
                        key={sdg}
                        type="button"
                        onClick={() => addSdgToDraft(card, sdg)}
                        style={miniButtonStyle}
                      >
                        + {sdg}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveMapping(card)}
                    disabled={savingId === card.firestoreId}
                    style={primaryButtonStyle}
                  >
                    {savingId === card.firestoreId ? 'Saving...' : 'Save Mapping'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const sdgPillGridStyle = {
  marginTop: 14,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap'
}

const mappingGridStyle = {
  marginTop: 18,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: 16
}

const mappingCardStyle = {
  padding: 18,
  borderRadius: 22,
  background: 'rgba(255, 255, 255, 0.64)',
  border: '1px solid rgba(139, 92, 40, 0.16)'
}

const fieldStyle = {
  marginTop: 14,
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

const smallSdgGridStyle = {
  marginTop: 12,
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap'
}

const miniButtonStyle = {
  border: '1px solid rgba(139, 92, 40, 0.18)',
  borderRadius: 999,
  padding: '7px 10px',
  cursor: 'pointer',
  background: 'rgba(244, 210, 138, 0.2)',
  color: '#5c3512',
  fontSize: '0.78rem',
  fontWeight: 850
}

const primaryButtonStyle = {
  marginTop: 14,
  border: 0,
  borderRadius: 999,
  padding: '11px 16px',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: 850,
  boxShadow: '0 14px 30px rgba(92, 53, 18, 0.18)'
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

export default AdminSdgMappingScreen