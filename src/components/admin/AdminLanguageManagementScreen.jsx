import { useEffect, useMemo, useState } from 'react'
import { styles } from '../game/gameStyles'
import { Pill, SectionHeader } from '../game/ui'
import {
  addAdminLanguageVersion,
  deleteAdminLanguageVersion,
  getAdminLanguageVersions,
  seedStarterLanguageVersions,
  updateAdminLanguageStatus
} from '../../services/admin/adminTranslationService'

const emptyForm = {
  languageName: '',
  languageCode: '',
  deckStatus: 'Planning',
  reviewer: '',
  order: ''
}

function AdminLanguageManagementScreen() {
  const [languages, setLanguages] = useState([])
  const [formValues, setFormValues] = useState(emptyForm)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadLanguages() {
    setLoading(true)
    setError('')

    try {
      const rows = await getAdminLanguageVersions()
      setLanguages(rows)
    } catch (err) {
      setError(err.message || 'Could not load language versions from Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLanguages()
  }, [])

  const filteredLanguages = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    return languages.filter((language) => {
      const searchableText = [
        language.languageName,
        language.languageCode,
        language.deckStatus,
        language.reviewer
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !cleanSearch || searchableText.includes(cleanSearch)

      const matchesStatus =
        statusFilter === 'all' ||
        String(language.deckStatus || '').toLowerCase() ===
          statusFilter.toLowerCase()

      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && language.isActive) ||
        (activeFilter === 'inactive' && !language.isActive)

      return matchesSearch && matchesStatus && matchesActive
    })
  }, [languages, searchTerm, statusFilter, activeFilter])

  function updateFormField(field, value) {
    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: value
    }))
  }

  async function handleCreateStarterLanguages() {
    const confirmed = window.confirm(
      'Create or update starter language versions in Firebase?'
    )

    if (!confirmed) return

    setSeeding(true)
    setError('')
    setSuccessMessage('')

    try {
      const count = await seedStarterLanguageVersions()
      setSuccessMessage(`${count} starter language versions saved.`)
      await loadLanguages()
    } catch (err) {
      setError(err.message || 'Could not create starter language versions.')
    } finally {
      setSeeding(false)
    }
  }

  async function handleAddLanguage(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      await addAdminLanguageVersion(formValues)
      setFormValues(emptyForm)
      setSuccessMessage('Language version saved successfully.')
      await loadLanguages()
    } catch (err) {
      setError(err.message || 'Could not save language version.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(language) {
    setUpdatingId(language.id)
    setError('')
    setSuccessMessage('')

    try {
      await updateAdminLanguageStatus(language, {
        isActive: !language.isActive
      })

      setSuccessMessage('Language status updated successfully.')
      await loadLanguages()
    } catch (err) {
      setError(err.message || 'Could not update language status.')
    } finally {
      setUpdatingId('')
    }
  }

  async function handleDeleteLanguage(language) {
    const confirmed = window.confirm(
      `Delete "${language.languageName}" from Firebase languageVersions?`
    )

    if (!confirmed) return

    setUpdatingId(language.id)
    setError('')
    setSuccessMessage('')

    try {
      await deleteAdminLanguageVersion(language)
      setSuccessMessage('Language version deleted successfully.')
      await loadLanguages()
    } catch (err) {
      setError(err.message || 'Could not delete language version.')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div style={styles.panel}>
      <SectionHeader
        eyebrow="Admin language version management"
        title="Manage multilingual card decks."
      >
        Language versions are loaded from Firebase languageVersions and
        translation progress is calculated from cardTranslations.
      </SectionHeader>

      <div style={{ ...styles.centerButtonRow, marginTop: 16 }}>
        <button type="button" onClick={loadLanguages} style={secondaryButtonStyle}>
          Refresh Languages
        </button>

        <button
          type="button"
          onClick={handleCreateStarterLanguages}
          disabled={seeding}
          style={primaryButtonStyle}
        >
          {seeding ? 'Creating...' : 'Create Starter Languages'}
        </button>
      </div>

      {error && <MessageCard message={error} tone="error" />}
      {successMessage && <MessageCard message={successMessage} tone="success" />}

      <div style={styles.metricGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Languages</p>
          <h3 style={styles.smallCardTitle}>{languages.length}</h3>
          <p style={styles.smallCardText}>Loaded from Firebase.</p>
        </div>

        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Active Languages</p>
          <h3 style={styles.smallCardTitle}>
            {languages.filter((language) => language.isActive).length}
          </h3>
          <p style={styles.smallCardText}>Available for future display.</p>
        </div>

        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Filtered Results</p>
          <h3 style={styles.smallCardTitle}>{filteredLanguages.length}</h3>
          <p style={styles.smallCardText}>Based on search and filters.</p>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Add language</p>
            <h3 style={styles.smallCardTitle}>Create language version</h3>
          </div>
          <Pill>languageVersions</Pill>
        </div>

        <form onSubmit={handleAddLanguage} style={formGridStyle}>
          <label style={fieldStyle}>
            Language name
            <input
              value={formValues.languageName}
              onChange={(event) =>
                updateFormField('languageName', event.target.value)
              }
              placeholder="Example: French"
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            Language code
            <input
              value={formValues.languageCode}
              onChange={(event) =>
                updateFormField('languageCode', event.target.value)
              }
              placeholder="Example: fr"
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            Deck status
            <select
              value={formValues.deckStatus}
              onChange={(event) =>
                updateFormField('deckStatus', event.target.value)
              }
              style={inputStyle}
            >
              <option value="Planning">Planning</option>
              <option value="Draft">Draft</option>
              <option value="Review">Review</option>
              <option value="Published">Published</option>
            </select>
          </label>

          <label style={fieldStyle}>
            Reviewer
            <input
              value={formValues.reviewer}
              onChange={(event) => updateFormField('reviewer', event.target.value)}
              placeholder="Example: Pending"
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            Display order
            <input
              value={formValues.order}
              onChange={(event) => updateFormField('order', event.target.value)}
              placeholder="Example: 1"
              type="number"
              min="1"
              style={inputStyle}
            />
          </label>

          <div style={{ ...styles.centerButtonRow, gridColumn: '1 / -1' }}>
            <button type="submit" disabled={saving} style={primaryButtonStyle}>
              {saving ? 'Saving...' : 'Save Language'}
            </button>

            <button
              type="button"
              onClick={() => setFormValues(emptyForm)}
              disabled={saving}
              style={secondaryButtonStyle}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Search and filter</p>
            <h3 style={styles.smallCardTitle}>Find language versions</h3>
          </div>
          <Pill>{filteredLanguages.length} results</Pill>
        </div>

        <div style={filterGridStyle}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search language, code, reviewer or status..."
            style={inputStyle}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="all">All deck statuses</option>
            <option value="Planning">Planning</option>
            <option value="Draft">Draft</option>
            <option value="Review">Review</option>
            <option value="Published">Published</option>
          </select>

          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="all">All active states</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Firebase languageVersions collection</p>
            <h3 style={styles.smallCardTitle}>Current language versions</h3>
          </div>
          <Pill>{loading ? 'Loading...' : `${filteredLanguages.length} rows`}</Pill>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 16 }}>
            Loading language versions from Firebase...
          </p>
        ) : filteredLanguages.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 16 }}>
            No language versions match your search.
          </p>
        ) : (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Language</th>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Deck Status</th>
                  <th style={thStyle}>Cards Translated</th>
                  <th style={thStyle}>Progress</th>
                  <th style={thStyle}>Reviewer</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLanguages.map((language) => (
                  <tr key={language.id}>
                    <td style={tdStyle}>
                      <strong>{language.languageName}</strong>
                    </td>
                    <td style={tdStyle}>{language.languageCode}</td>
                    <td style={tdStyle}>{language.deckStatus}</td>
                    <td style={tdStyle}>
                      {language.cardsTranslated} / {language.totalCards}
                    </td>
                    <td style={tdStyle}>{language.progress}%</td>
                    <td style={tdStyle}>{language.reviewer}</td>
                    <td style={tdStyle}>
                      <Pill tone={language.isActive ? 'success' : 'default'}>
                        {language.isActive ? 'Active' : 'Inactive'}
                      </Pill>
                    </td>
                    <td style={tdStyle}>
                      <div style={actionRowStyle}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(language)}
                          disabled={updatingId === language.id}
                          style={secondarySmallButtonStyle}
                        >
                          {language.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLanguage(language)}
                          disabled={updatingId === language.id}
                          style={dangerButtonStyle}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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

function MessageCard({ message, tone }) {
  const isError = tone === 'error'

  return (
    <div
      style={{
        ...styles.smallCard,
        marginTop: 18,
        borderColor: isError
          ? 'rgba(153, 27, 27, 0.28)'
          : 'rgba(22, 101, 52, 0.28)'
      }}
    >
      <p
        style={{
          ...styles.smallCardText,
          color: isError ? '#991b1b' : '#166534'
        }}
      >
        {message}
      </p>
    </div>
  )
}

const formGridStyle = {
  marginTop: 18,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
}

const filterGridStyle = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 1fr) 220px 220px',
  gap: 12
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
  padding: '12px 18px',
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

const secondarySmallButtonStyle = {
  ...secondaryButtonStyle,
  padding: '8px 11px',
  fontSize: '0.82rem'
}

const dangerButtonStyle = {
  border: '1px solid rgba(153, 27, 27, 0.28)',
  borderRadius: 999,
  padding: '8px 11px',
  cursor: 'pointer',
  background: 'rgba(254, 226, 226, 0.86)',
  color: '#991b1b',
  fontWeight: 850,
  fontSize: '0.82rem'
}

const tableWrapStyle = {
  marginTop: 16,
  width: '100%',
  overflowX: 'auto'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 980
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

const actionRowStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap'
}

export default AdminLanguageManagementScreen