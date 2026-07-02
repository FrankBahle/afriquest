import { styles } from '../game/gameStyles'
import { ActionButton, DataTable, SectionHeader, Pill } from '../game/ui'
import { adminReports } from './adminMockData'

function AdminReportsScreen() {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Admin reports export" title="Export reports for GRIT Lab Africa partners.">
        UI-only report export center for PDF and CSV outputs.
      </SectionHeader>
      <div style={styles.centerButtonRow}>
        <ActionButton>Export Selected</ActionButton>
        <ActionButton variant="secondary">Generate New Report</ActionButton>
      </div>
      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <DataTable rows={adminReports} columns={[{ key: 'report', label: 'Report' }, { key: 'type', label: 'Type' }, { key: 'status', label: 'Status', render: (row) => <Pill tone={row.status === 'Ready' ? 'success' : 'default'}>{row.status}</Pill> }, { key: 'owner', label: 'Owner' }]} />
      </div>
    </div>
  )
}

export default AdminReportsScreen
