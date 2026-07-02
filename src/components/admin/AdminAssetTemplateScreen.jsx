import { styles } from '../game/gameStyles'
import { ActionButton, SectionHeader, Pill } from '../game/ui'

function AdminAssetTemplateScreen({ type }) {
  const isCertificate = type === 'certificate'
  return (
    <div style={styles.panel}>
      <SectionHeader
        eyebrow={isCertificate ? 'Admin certificate template management' : 'Admin card image upload'}
        title={isCertificate ? 'Manage certificate templates.' : 'Upload and manage card images.'}
      >
        {isCertificate
          ? 'Create branded certificate designs, issue-date areas and verification ID placement.'
          : 'Upload problem-card illustrations, AI-card illustrations and card back designs.'}
      </SectionHeader>

      <div style={styles.twoColumnGrid}>
        <UploadBox title={isCertificate ? 'Certificate template upload' : 'Problem card image upload'} />
        <UploadBox title={isCertificate ? 'Verification badge assets' : 'AI card golden image upload'} />
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <p style={styles.eyebrow}>Current assets</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Pill>{isCertificate ? 'Default GLA certificate' : 'Problem dark blue back'}</Pill>
          <Pill>{isCertificate ? 'Certificate verification ID' : 'AI golden back'}</Pill>
          <Pill>{isCertificate ? 'Issue date layout' : 'SDG badge overlay'}</Pill>
        </div>
      </div>
    </div>
  )
}

function UploadBox({ title }) {
  return (
    <div style={{ ...styles.smallCard, minHeight: 220 }}>
      <p style={styles.eyebrow}>{title}</p>
      <div style={uploadBoxStyle}>Drop files here or click to upload. UI placeholder only.</div>
      <div style={styles.centerButtonRow}>
        <ActionButton>Upload</ActionButton>
        <ActionButton variant="secondary">Preview</ActionButton>
      </div>
    </div>
  )
}

const uploadBoxStyle = {
  padding: 34,
  borderRadius: 22,
  border: '2px dashed rgba(154,106,34,0.38)',
  background: 'rgba(255,255,255,0.62)',
  color: '#5c4632',
  textAlign: 'center'
}

export default AdminAssetTemplateScreen
