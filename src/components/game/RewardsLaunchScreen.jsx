import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { styles } from './gameStyles'
import { LoadingPage, Pill, SectionHeader } from './ui'
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
  const [publicLaunchEvents, setPublicLaunchEvents] = useState([])
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
      setRewards(data.rewards || [])
      setClaims(data.claims || [])
      setLaunchSettings(data.launchSettings || null)
      setPublicLaunchEvents(data.publicLaunchEvents || [])
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
      setStatusMessage(`${count} starter reward and launch records saved to Firebase.`)
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
      setStatusMessage('Reward claim submitted. Admin can now review it from Firebase rewardClaims.')
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

  const rewardStats = useMemo(() => {
    const claimable = rewards.filter((reward) => {
      const claimed = Boolean(claimMap[reward.rewardId])
      return !claimed && completedProblems >= reward.requiredCompletedProblems && averageScore >= reward.requiredAverageScore
    }).length

    const locked = rewards.filter((reward) => {
      return completedProblems < reward.requiredCompletedProblems || averageScore < reward.requiredAverageScore
    }).length

    return {
      total: rewards.length,
      claimable,
      claimed: claims.length,
      locked
    }
  }, [rewards, claims.length, claimMap, completedProblems, averageScore])

  const filteredRewards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    return rewards.filter((reward) => {
      const canClaim = completedProblems >= reward.requiredCompletedProblems && averageScore >= reward.requiredAverageScore
      const claimed = Boolean(claimMap[reward.rewardId])
      const text = [reward.title, reward.description, reward.sponsorName, reward.rewardType].join(' ').toLowerCase()
      const matchesSearch = !cleanSearch || text.includes(cleanSearch)
      const matchesFilter =
        rewardFilter === 'all' ||
        (rewardFilter === 'claimable' && canClaim && !claimed) ||
        (rewardFilter === 'claimed' && claimed) ||
        (rewardFilter === 'locked' && !canClaim)

      return matchesSearch && matchesFilter
    })
  }, [rewards, searchTerm, rewardFilter, completedProblems, averageScore, claimMap])

  if (loading) {
    return (
      <LoadingPage
        title="Loading rewards"
        message="Checking available rewards and player claim status from Firebase."
      />
    )
  }

  return (
    <div style={styles.panel}>
      <div style={heroStyle}>
        <div>
          <p style={{ ...styles.eyebrow, color: '#f4d28a' }}>GRIT Lab Africa rewards</p>
          <h1 style={heroTitleStyle}>Launch rewards and sponsor opportunities.</h1>
          <p style={heroTextStyle}>
            Rewards are connected to Firebase collections: sponsorRewards, rewardClaims,
            launchSettings and publicLaunchEvents. Claimable rewards depend on your real
            completed cards and average score.
          </p>
        </div>

        <div style={heroBadgeStyle}>
          <span>{certificateUnlocked ? '🎓' : '🎁'}</span>
          <strong>{certificateUnlocked ? 'Certificate ready' : 'Keep playing'}</strong>
          <small>{completedProblems} completed • {averageScore}% average</small>
        </div>
      </div>

      {error && <MessageCard message={error} tone="error" />}
      {statusMessage && <MessageCard message={statusMessage} tone="success" />}

      <div style={styles.metricGrid}>
        <ProfessionalMetric title="Launch Status" value={launchSettings?.launchStatus || 'pilot'} detail="launchSettings" />
        <ProfessionalMetric title="Available Rewards" value={rewardStats.total} detail="sponsorRewards" />
        <ProfessionalMetric title="Ready to Claim" value={rewardStats.claimable} detail="Based on your progress" highlight />
        <ProfessionalMetric title="Submitted Claims" value={rewardStats.claimed} detail="rewardClaims" />
        <ProfessionalMetric title="Locked Rewards" value={rewardStats.locked} detail="Still in progress" />
        <ProfessionalMetric title="Launch Events" value={publicLaunchEvents.length} detail="publicLaunchEvents" />
      </div>

      <div style={launchPanelStyle}>
        <div>
          <p style={{ ...styles.eyebrow, color: '#f4d28a' }}>Public launch</p>
          <h2 style={launchTitleStyle}>{launchSettings?.launchTitle || 'AfriQuest Pilot Launch'}</h2>
          <p style={launchTextStyle}>{launchSettings?.launchMessage || 'Launch information will load from Firebase.'}</p>
          <p style={launchSponsorStyle}>{launchSettings?.sponsorMessage || 'Sponsor-supported rewards remain subject to GRIT Lab Africa approval and availability.'}</p>
        </div>

        <div style={launchActionsStyle}>
          <Pill tone={launchSettings?.allowRewardClaims ? 'success' : 'default'}>
            {launchSettings?.allowRewardClaims ? 'Claims open' : 'Claims closed'}
          </Pill>
          <button type="button" onClick={handleCreateStarterData} style={secondaryButtonStyle}>
            Create starter data
          </button>
        </div>
      </div>

      <div style={filterPanelStyle}>
        <div>
          <p style={styles.eyebrow}>Reward catalogue</p>
          <h3 style={styles.smallCardTitle}>Search, filter and claim rewards</h3>
        </div>

        <div style={filterGridStyle}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search reward, sponsor or type..."
            style={inputStyle}
          />

          <select value={rewardFilter} onChange={(event) => setRewardFilter(event.target.value)} style={inputStyle}>
            <option value="all">All rewards</option>
            <option value="claimable">Claimable</option>
            <option value="claimed">Claimed</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={emptyStateStyle}>Loading rewards from Firebase...</div>
      ) : filteredRewards.length === 0 ? (
        <div style={emptyStateStyle}>No rewards match your filters yet.</div>
      ) : (
        <div style={rewardGridStyle}>
          {filteredRewards.map((reward) => {
            const claimed = Boolean(claimMap[reward.rewardId])
            const canClaim = completedProblems >= reward.requiredCompletedProblems && averageScore >= reward.requiredAverageScore
            const completedProgress = getProgress(completedProblems, reward.requiredCompletedProblems)
            const averageProgress = getProgress(averageScore, reward.requiredAverageScore)

            return (
              <article key={reward.rewardId} style={canClaim ? rewardCardReadyStyle : rewardCardStyle}>
                <div style={styles.rowBetween}>
                  <div>
                    <p style={styles.eyebrow}>{reward.sponsorName}</p>
                    <h3 style={rewardTitleStyle}>{reward.title}</h3>
                  </div>
                  <Pill tone={claimed || canClaim ? 'success' : 'default'}>
                    {claimed ? 'Claimed' : canClaim ? 'Ready' : 'Locked'}
                  </Pill>
                </div>

                <p style={styles.smallCardText}>{reward.description}</p>

                <div style={requirementBoxStyle}>
                  <RequirementProgress label="Completed cards" value={completedProblems} target={reward.requiredCompletedProblems} progress={completedProgress} />
                  <RequirementProgress label="Average score" value={`${averageScore}%`} target={`${reward.requiredAverageScore}%`} progress={averageProgress} />
                </div>

                <button
                  type="button"
                  onClick={() => handleClaimReward(reward)}
                  disabled={!canClaim || claimed}
                  style={canClaim && !claimed ? primaryButtonStyle : disabledButtonStyle}
                >
                  {claimed ? 'Claim submitted' : canClaim ? 'Claim reward' : 'Keep playing to unlock'}
                </button>
              </article>
            )
          })}
        </div>
      )}

      <div style={{ ...styles.smallCard, marginTop: 20 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Public launch events</p>
            <h3 style={styles.smallCardTitle}>Upcoming AfriQuest activities</h3>
          </div>
          <Pill>{publicLaunchEvents.length} events</Pill>
        </div>

        {publicLaunchEvents.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 12 }}>No public launch events found yet.</p>
        ) : (
          <div style={eventGridStyle}>
            {publicLaunchEvents.map((event) => (
              <article key={event.eventId} style={eventCardStyle}>
                <div style={styles.rowBetween}>
                  <h3 style={styles.smallCardTitle}>{event.title}</h3>
                  <Pill>{event.eventStatus}</Pill>
                </div>
                <p style={styles.smallCardText}>{event.description || 'Launch event details will be updated by admin.'}</p>
                <p style={styles.smallCardText}>{event.eventDate || 'Date pending'}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProfessionalMetric({ title, value, detail, highlight = false }) {
  return (
    <div style={highlight ? metricHighlightStyle : metricStyle}>
      <p style={styles.eyebrow}>{title}</p>
      <h3 style={metricValueStyle}>{value}</h3>
      <p style={styles.smallCardText}>{detail}</p>
    </div>
  )
}

function RequirementProgress({ label, value, target, progress }) {
  return (
    <div>
      <div style={requirementHeaderStyle}>
        <span>{label}</span>
        <strong>{value} / {target}</strong>
      </div>
      <div style={progressTrackStyle}>
        <div style={{ ...progressFillStyle, width: `${progress}%` }} />
      </div>
    </div>
  )
}

function MessageCard({ message, tone }) {
  const isError = tone === 'error'
  return (
    <div style={{ ...styles.smallCard, marginTop: 18, borderColor: isError ? 'rgba(153, 27, 27, 0.28)' : 'rgba(22, 101, 52, 0.28)' }}>
      <p style={{ ...styles.smallCardText, color: isError ? '#991b1b' : '#166534', fontWeight: 850 }}>{message}</p>
    </div>
  )
}

function getProgress(value, target) {
  const required = Number(target || 0)
  if (required <= 0) return 100
  return Math.min(100, Math.round((Number(value || 0) / required) * 100))
}

const heroStyle = { padding: 30, borderRadius: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', background: 'radial-gradient(circle at top right, rgba(244,210,138,.34), transparent 22rem), linear-gradient(135deg, #5c3512, #9a6a22)', boxShadow: '0 28px 70px rgba(80,52,20,.24)', marginBottom: 20 }
const heroTitleStyle = { margin: 0, color: '#fff8eb', fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, letterSpacing: '-.06em' }
const heroTextStyle = { margin: '13px 0 0', color: 'rgba(255,248,235,.86)', lineHeight: 1.65, maxWidth: 780, fontWeight: 650 }
const heroBadgeStyle = { minWidth: 190, padding: 20, borderRadius: 28, textAlign: 'center', color: '#fff8eb', background: 'rgba(255,248,235,.13)', border: '1px solid rgba(255,248,235,.22)' }
const launchPanelStyle = { marginTop: 20, padding: 24, borderRadius: 30, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 18, background: 'linear-gradient(135deg, rgba(92,53,18,.96), rgba(59,40,23,.96))', border: '1px solid rgba(244,210,138,.28)', boxShadow: '0 22px 52px rgba(80,52,20,.18)' }
const launchTitleStyle = { margin: 0, color: '#fff8eb', fontSize: '1.8rem', letterSpacing: '-.04em' }
const launchTextStyle = { color: 'rgba(255,248,235,.84)', lineHeight: 1.6, margin: '10px 0 0' }
const launchSponsorStyle = { color: '#f4d28a', lineHeight: 1.6, margin: '10px 0 0', fontWeight: 800 }
const launchActionsStyle = { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column', gap: 12 }
const filterPanelStyle = { ...styles.smallCard, marginTop: 20 }
const filterGridStyle = { marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 220px', gap: 12 }
const inputStyle = { width: '100%', padding: '13px 15px', borderRadius: 16, border: '1px solid rgba(139, 92, 40, 0.24)', background: 'rgba(255, 255, 255, 0.82)', color: '#3b2817', outline: 'none', fontWeight: 750 }
const rewardGridStyle = { marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', gap: 18 }
const rewardCardStyle = { padding: 20, borderRadius: 28, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(139, 92, 40, 0.16)', boxShadow: '0 16px 36px rgba(80, 52, 20, 0.08)', display: 'grid', gap: 14 }
const rewardCardReadyStyle = { ...rewardCardStyle, background: 'linear-gradient(135deg, rgba(255,248,235,.98), rgba(244,210,138,.52))', border: '1px solid rgba(154,106,34,.42)', boxShadow: '0 22px 50px rgba(154,106,34,.18)' }
const rewardTitleStyle = { margin: '3px 0 0', color: '#3b2817', fontSize: '1.25rem', letterSpacing: '-.03em' }
const requirementBoxStyle = { display: 'grid', gap: 11, padding: 14, borderRadius: 20, background: 'rgba(92,53,18,.06)', border: '1px solid rgba(139,92,40,.12)' }
const requirementHeaderStyle = { display: 'flex', justifyContent: 'space-between', gap: 10, color: '#5c3512', fontSize: '.82rem', fontWeight: 850 }
const progressTrackStyle = { marginTop: 7, height: 9, borderRadius: 999, overflow: 'hidden', background: 'rgba(139,92,40,.14)' }
const progressFillStyle = { height: '100%', borderRadius: 999, background: 'linear-gradient(135deg, #d4af37, #5c3512)' }
const eventGridStyle = { marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }
const eventCardStyle = { padding: 16, borderRadius: 22, background: 'rgba(244,210,138,0.18)', border: '1px solid rgba(139, 92, 40, 0.16)', display: 'grid', gap: 8 }
const emptyStateStyle = { marginTop: 20, padding: 24, borderRadius: 26, textAlign: 'center', background: 'rgba(255,255,255,.68)', border: '1px dashed rgba(139,92,40,.24)', color: '#5c3512', fontWeight: 850 }
const metricStyle = { ...styles.smallCard }
const metricHighlightStyle = { ...styles.smallCard, background: 'linear-gradient(135deg, rgba(244,210,138,.86), rgba(255,248,235,.9))', border: '1px solid rgba(154,106,34,.36)' }
const metricValueStyle = { margin: '5px 0', color: '#3b2817', fontSize: '1.8rem', letterSpacing: '-.05em' }
const primaryButtonStyle = { border: 0, borderRadius: 999, padding: '13px 16px', cursor: 'pointer', background: 'linear-gradient(135deg, #9a6a22, #5c3512)', color: '#fff8eb', fontWeight: 900, boxShadow: '0 14px 30px rgba(92,53,18,.22)' }
const secondaryButtonStyle = { border: '1px solid rgba(244,210,138,.28)', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', background: 'rgba(255,248,235,.14)', color: '#fff8eb', fontWeight: 850 }
const disabledButtonStyle = { ...primaryButtonStyle, opacity: 0.52, cursor: 'not-allowed', background: 'rgba(139,92,40,.24)', color: '#5c3512', boxShadow: 'none' }

export default RewardsLaunchScreen
