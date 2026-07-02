import { styles } from './gameStyles'
import { SectionHeader, Toggle } from './ui'

function AccessibilityScreen({ settings, onChange }) {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="Accessibility settings" title="Make the game easier to use.">
        These are UI-only settings for inclusive design, mobile optimisation, screen-reader labels, low-bandwidth use and keyboard-friendly alternatives.
      </SectionHeader>
      <div style={styles.cardGrid}>
        <Toggle label="High Contrast Mode" checked={settings.highContrast} onChange={(value) => onChange('highContrast', value)} description="Makes panels and text stronger for readability." />
        <Toggle label="Low-Bandwidth Mode" checked={settings.lowBandwidth} onChange={(value) => onChange('lowBandwidth', value)} description="Reduces visual heaviness and encourages lighter images." />
        <Toggle label="Keyboard-Friendly Card Selection" checked={settings.keyboardMode} onChange={(value) => onChange('keyboardMode', value)} description="Cards can be selected by buttons and keyboard focus, not only drag-and-drop." />
        <Toggle label="Screen Reader Friendly Labels" checked={settings.screenReaderLabels} onChange={(value) => onChange('screenReaderLabels', value)} description="Adds clear labels to buttons and card actions." />
        <Toggle label="Mobile-Optimised Layout" checked={settings.mobileOptimized} onChange={(value) => onChange('mobileOptimized', value)} description="Uses stacked panels and responsive spacing on smaller screens." />
      </div>
    </div>
  )
}

export default AccessibilityScreen
