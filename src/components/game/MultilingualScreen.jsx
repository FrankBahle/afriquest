import { useState } from 'react'
import { styles } from './gameStyles'
import { languageCards } from '../../data/mockUiData'
import { ActionButton, SectionHeader } from './ui'

function MultilingualScreen() {
  const languages = Object.keys(languageCards)
  const [language, setLanguage] = useState(languages[0])
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Multilingual expansion" title="Translated card deck screen." />
      <div style={styles.centerButtonRow}>{languages.map((item) => <ActionButton key={item} variant={item === language ? 'primary' : 'secondary'} onClick={() => setLanguage(item)}>{item}</ActionButton>)}</div>
      <div style={styles.cardGrid}>{languageCards[language].map((text, index) => <div key={text} style={styles.smallCard}><p style={styles.eyebrow}>{language} card version {index + 1}</p><h3 style={styles.smallCardTitle}>{text}</h3><p style={styles.smallCardText}>This is a UI placeholder for the translated card deck. Admin can manage these language versions later.</p></div>)}</div>
    </div>
  )
}

export default MultilingualScreen
