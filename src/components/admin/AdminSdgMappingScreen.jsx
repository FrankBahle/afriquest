import { styles } from '../game/gameStyles'
import { ActionButton, DataTable, SectionHeader } from '../game/ui'
import { adminSdgOptions } from './adminMockData'

function AdminSdgMappingScreen() {
  const rows = adminSdgOptions.map((sdg, index) => ({ id: index + 1, sdg, linkedCards: Math.max(2, 12 - index), status: 'Mapped' }))
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Admin SDG mapping management" title="Manage problem-card SDG links.">
        Admins can review which SDG goals are attached to each problem card.
      </SectionHeader>
      <div style={styles.centerButtonRow}>
        <ActionButton>Add SDG Mapping</ActionButton>
        <ActionButton variant="secondary">Review Unmapped Cards</ActionButton>
      </div>
      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <DataTable rows={rows} columns={[{ key: 'sdg', label: 'SDG' }, { key: 'linkedCards', label: 'Linked Cards' }, { key: 'status', label: 'Status' }]} />
      </div>
    </div>
  )
}

export default AdminSdgMappingScreen
