import { styles } from '../game/gameStyles'
import { ActionButton, DataTable, SectionHeader } from '../game/ui'
import { adminRubricRows } from './adminMockData'

function AdminScoringRubricScreen() {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Admin scoring rubric management" title="Manage DeepSeek evaluation rubric.">
        These rubric areas define how player explanations are scored out of 100.
      </SectionHeader>
      <div style={styles.centerButtonRow}>
        <ActionButton>Add Rubric Area</ActionButton>
        <ActionButton variant="secondary">Preview Prompt Rules</ActionButton>
      </div>
      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <DataTable rows={adminRubricRows} columns={[{ key: 'label', label: 'Area' }, { key: 'max', label: 'Max Score' }, { key: 'meaning', label: 'Meaning' }]} />
      </div>
    </div>
  )
}

export default AdminScoringRubricScreen
