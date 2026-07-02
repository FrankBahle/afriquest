import { styles, colors } from './gameStyles'
import { ActionButton, MetricCard, SectionHeader } from './ui'

function CertificateScreen({ fullName, completedProblems, averageScore, certificateUnlocked, certificateId, issueDate, onBackToDashboard }) {
  function downloadCertificate() {
    const content = `GRIT Lab Africa Certificate\n\nCertificate: Artificial Intelligence and Practical Applications\nRecipient: ${fullName}\nCertificate ID: ${certificateId}\nIssue Date: ${issueDate}\nCompleted Problems: ${completedProblems}\nAverage Score: ${averageScore}%\n`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${certificateId}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Certificate" title={certificateUnlocked ? 'Your certificate is unlocked.' : 'Your certificate is not unlocked yet.'}>
        Certificate unlocks after 10 completed problem cards with an average score of 75 or higher.
      </SectionHeader>
      <div style={styles.metricGrid}>
        <MetricCard title="Certificate ID" value={certificateUnlocked ? certificateId : 'Pending'} />
        <MetricCard title="Issue Date" value={certificateUnlocked ? issueDate : 'Pending'} />
        <MetricCard title="Completed" value={completedProblems} />
        <MetricCard title="Average" value={`${averageScore}%`} />
      </div>
      <div style={certificatePreviewStyle}>
        <p style={{ ...styles.eyebrow, color: colors.lightGold }}>GRIT Lab Africa</p>
        <h2 style={certificateTitleStyle}>Artificial Intelligence and Practical Applications</h2>
        <p style={certificateTextStyle}>Gaming SDG Problems and Ideating Solutions for Africa</p>
        <div style={certificateNameStyle}>{fullName}</div>
        <p style={certificateTextStyle}>Certificate ID: {certificateUnlocked ? certificateId : 'Locked until requirements are met'}</p>
        <p style={certificateTextStyle}>Issue Date: {certificateUnlocked ? issueDate : 'Pending'}</p>
        <p style={certificateTextStyle}>Completed Problems: {completedProblems} • Average Score: {averageScore}%</p>
        <p style={certificateTextStyle}>Status: {certificateUnlocked ? 'Certified' : 'Not Certified Yet'}</p>
      </div>
      <div style={styles.centerButtonRow}>
        <ActionButton disabled={!certificateUnlocked} onClick={downloadCertificate}>Download Certificate</ActionButton>
        <ActionButton variant="secondary" onClick={onBackToDashboard}>Back to Dashboard</ActionButton>
      </div>
    </div>
  )
}

const certificatePreviewStyle = { marginTop: '28px', padding: '42px', borderRadius: '30px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(92,53,18,0.98), rgba(154,106,34,0.94))', color: colors.cream, border: '1px solid rgba(244,210,138,0.35)', boxShadow: '0 30px 80px rgba(92,53,18,0.22)' }
const certificateTitleStyle = { margin: '0 auto 12px', maxWidth: '760px', color: colors.cream, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: '1', letterSpacing: '-0.06em' }
const certificateTextStyle = { margin: '0 auto 18px', maxWidth: '780px', color: 'rgba(255,248,235,0.88)', lineHeight: '1.7' }
const certificateNameStyle = { margin: '28px auto', padding: '18px', maxWidth: '520px', borderTop: '1px solid rgba(244,210,138,0.45)', borderBottom: '1px solid rgba(244,210,138,0.45)', color: colors.lightGold, fontSize: '2rem', fontWeight: '900' }

export default CertificateScreen
