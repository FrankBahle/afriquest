import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { styles } from './gameStyles'
import { Pill, SectionHeader } from './ui'
import {
  claimSponsorReward,
  getRewardsLaunchData,
  seedStarterRewardsLaunchData
} from '../../services/player/playerRewardsLaunchService'
import { usePlayerLanguage } from '../../hooks/usePlayerLanguage'

function RewardsLaunchScreen({ completedProblems = 0, averageScore = 0, certificateUnlocked = false }) {
  const { currentUser } = useAuth()
  const { t } = usePlayerLanguage()
  const [rewards, setRewards] = useState([])
  const [claims, setClaims] = useState([])
  const [launchSettings, setLaunchSettings] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [rewardFilter, setRewardFilter] = useState('all')
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadRewards() {
    setLoading(true)
    setError('')
    try {
      const data = await getRewardsLaunchData(currentUser?.uid)
      setRewards(data.rewards)
      setClaims(data.claims)
      setLaunchSettings(data.launchSettings)
    } catch (err) {
      setError(err.message || 'Could not load rewards and launch data from Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRewards()
  }, [currentUser?.uid])

  async function handleCreateStarterData() {
    setError('')
    setStatusMessage('')
    try {
      const count = await seedStarterRewardsLaunchData()
      setStatusMessage(`${count} starter rewards and launch settings saved.`)
      await loadRewards()
    } catch (err) {
      setError(err.message || 'Could not create starter reward data.')
    }
  }

  async function handleClaimReward(reward) {
    setError('')
    setStatusMessage('')
    try {
      await claimSponsorReward({
        userId: currentUser?.uid,
        reward,
        completedProblems,
        averageScore
      })
      setStatusMessage('Reward claim submitted successfully.')
      await loadRewards()
    } catch (err) {
      setError(err.message || 'Could not claim this reward.')
    }
  }

  const claimMap = useMemo(() => {
    const map = {}
    claims.forEach((claim) => {
      map[claim.rewardId] = claim
    })
    return map
  }, [claims])

  const filteredRewards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()
    return rewards.filter((reward) => {
      const canClaim = completedProblems >= reward.requiredCompletedProblems && averageScore >= reward.requiredAverageScore
      const claimed = Boolean(claimMap[reward.rewardId])
      const text = [reward.title, reward.description, reward.sponsorName, reward.rewardType].join(' ').toLowerCase()
      const matchesSearch = !cleanSearch || text.includes(cleanSearch)
      const matchesFilter = rewardFilter === 'all' || (rewardFilter === 'claimable' && canClaim && !claimed) || (rewardFilter === 'claimed' && claimed) || (rewardFilter === 'locked' && !canClaim)
      return matchesSearch && matchesFilter
    })
  }, [rewards, searchTerm, rewardFilter, completedProblems, averageScore, claimMap])

  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow={t('rewards')} title={t('rewardsTitle')}>
        {t('rewardsHelp')}
      </SectionHeader>

      {error && <MessageCard message={error} tone="error" />}
      {statusMessage && <MessageCard message={statusMessage} tone="success" />}

      <div style={styles.metricGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>{t('launchStatus')}</p>
          <h3 style={styles.smallCardTitle}>{launchSettings?.launchStatus || 'pilot'}</h3>
          <p style={styles.smallCardText}>launchSettings/publicLaunch</p>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Rewards</p>
          <h3 style={styles.smallCardTitle}>{rewards.length}</h3>
          <p style={styles.smallCardText}>sponsorRewards</p>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Your Claims</p>
          <h3 style={styles.smallCardTitle}>{claims.length}</h3>
          <p style={styles.smallCardText}>rewardClaims</p>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Certificate</p>
          <h3 style={styles.smallCardTitle}>{certificateUnlocked ? 'Unlocked' : 'Pending'}</h3>
          <p style={styles.smallCardText}>Used by some rewards.</p>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Public launch</p>
            <h3 style={styles.smallCardTitle}>{launchSettings?.launchTitle || 'GRIT Lab Africa AI for SDGs Card Game'}</h3>
          </div>
          <Pill>{launchSettings?.allowRewardClaims ? 'Claims open' : 'Claims closed'}</Pill>
        </div>
        <p style={{ ...styles.smallCardText, marginTop: 12 }}>{launchSettings?.launchMessage || 'Launch details will load from Firebase.'}</p>
        <p style={{ ...styles.smallCardText, marginTop: 8 }}>{launchSettings?.sponsorMessage || 'Sponsor-supported rewards can be activated later.'}</p>
        <div style={{ ...styles.centerButtonRow, marginTop: 14 }}>
          <button type="button" onClick={handleCreateStarterData} style={secondaryButtonStyle}>Create starter reward data</button>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Search and filter</p>
            <h3 style={styles.smallCardTitle}>Find rewards</h3>
          </div>
          <Pill>{filteredRewards.length} rewards</Pill>
        </div>
        <div style={filterGridStyle}>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search reward, sponsor or type..." style={inputStyle} />
          <select value={rewardFilter} onChange={(event) => setRewardFilter(event.target.value)} style={inputStyle}>
            <option value="all">All rewards</option>
            <option value="claimable">Claimable</option>
            <option value="claimed">Claimed</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Firebase sponsorRewards collection</p>
            <h3 style={styles.smallCardTitle}>Available launch rewards</h3>
          </div>
          <Pill>{loading ? 'Loading' : `${filteredRewards.length} rows`}</Pill>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>Loading rewards from Firebase...</p>
        ) : filteredRewards.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>No rewards match your filters.</p>
        ) : (
          <div style={rewardGridStyle}>
            {filteredRewards.map((reward) => {
              const claimed = Boolean(claimMap[reward.rewardId])
              const canClaim = completedProblems >= reward.requiredCompletedProblems && averageScore >= reward.requiredAverageScore
              return (
                <article key={reward.rewardId} style={rewardCardStyle}>
                  <div style={styles.rowBetween}>
                    <div>
                      <p style={styles.eyebrow}>{reward.sponsorName}</p>
                      <h3 style={styles.smallCardTitle}>{reward.title}</h3>
                    </div>
                    <Pill tone={claimed || canClaim ? 'success' : 'default'}>{claimed ? 'Claimed' : canClaim ? 'Ready' : 'Locked'}</Pill>
                  </div>
                  <p style={{ ...styles.smallCardText, marginTop: 10 }}>{reward.description}</p>
                  <p style={styles.smallCardText}>Needs {reward.requiredCompletedProblems} completed • {reward.requiredAverageScore}% average</p>
                  <button type="button" onClick={() => handleClaimReward(reward)} disabled={!canClaim || claimed} style={canClaim && !claimed ? primaryButtonStyle : disabledButtonStyle}>
                    {claimed ? 'Claim submitted' : t('claimReward')}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageCard({ message, tone }) {
  const isError = tone === 'error'
  return <div style={{ ...styles.smallCard, marginTop: 18, borderColor: isError ? 'rgba(153, 27, 27, 0.28)' : 'rgba(22, 101, 52, 0.28)' }}><p style={{ ...styles.smallCardText, color: isError ? '#991b1b' : '#166534' }}>{message}</p></div>
}

const filterGridStyle = { marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 220px', gap: 12 }
const inputStyle = { width: '100%', padding: '13px 15px', borderRadius: 16, border: '1px solid rgba(139, 92, 40, 0.24)', background: 'rgba(255, 255, 255, 0.76)', color: '#3b2817', outline: 'none' }
const rewardGridStyle = { marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }
const rewardCardStyle = { padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(139, 92, 40, 0.16)', boxShadow: '0 16px 36px rgba(80, 52, 20, 0.08)', display: 'grid', gap: 12 }
const primaryButtonStyle = { border: 0, borderRadius: 999, padding: '12px 16px', cursor: 'pointer', background: 'linear-gradient(135deg, #9a6a22, #5c3512)', color: '#fff8eb', fontWeight: 850 }
const secondaryButtonStyle = { border: '1px solid rgba(139, 92, 40, 0.22)', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', background: 'rgba(255,255,255,0.72)', color: '#5c3512', fontWeight: 850 }
const disabledButtonStyle = { ...secondaryButtonStyle, opacity: 0.55, cursor: 'not-allowed' }

export default RewardsLaunchScreen
