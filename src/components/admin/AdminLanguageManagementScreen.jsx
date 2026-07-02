import { styles } from '../game/gameStyles'
import { ActionButton, DataTable, SectionHeader } from '../game/ui'
import { adminLanguages } from './adminMockData'

function AdminLanguageManagementScreen() {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Admin language version management" title="Manage multilingual card decks.">
        UI placeholders for French, Portuguese, Arabic, Kiswahili and isiZulu translations.
      </SectionHeader>
      <div style={styles.centerButtonRow}>
        <ActionButton>Add Language</ActionButton>
        <ActionButton variant="secondary">Export Translation Sheet</ActionButton>
      </div>
      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <DataTable rows={adminLanguages} columns={[{ key: 'language', label: 'Language' }, { key: 'deckStatus', label: 'Deck Status' }, { key: 'cardsTranslated', label: 'Cards Translated' }, { key: 'reviewer', label: 'Reviewer' }]} />
      </div>
    </div>
  )
}

export default AdminLanguageManagementScreen
