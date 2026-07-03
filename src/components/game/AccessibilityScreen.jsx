import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getPlayerSettings, savePlayerSettings, DEFAULT_PLAYER_SETTINGS, applyPlayerSettingsToDocument } from '../../services/player/playerSettingsService'
import { styles } from './gameStyles'
import { Pill, SectionHeader } from './ui'

function AccessibilityScreen({ onSettingsChange }) {
  const { currentUser } = useAuth()
  const { languageCode, languageOptions, setLanguage, autoTranslate, setAutoTranslate, t } = useLanguage()
  const [settings, setSettings] = useState({ ...DEFAULT_PLAYER_SETTINGS, preferredLanguage: languageCode, autoTranslate })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const row = await getPlayerSettings(currentUser?.uid)
        const next = { ...row, preferredLanguage: row.preferredLanguage || languageCode, autoTranslate }
        setSettings(next)
        applyPlayerSettingsToDocument(next)
        onSettingsChange?.(next)
      } catch (err) {
        setError(err.message || 'Could not load settings.')
      }
    }
    load()
  }, [currentUser?.uid])

  async function updateSetting(key, value) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    if (key === 'preferredLanguage') await setLanguage(value)
    if (key === 'autoTranslate') setAutoTranslate(value)
    applyPlayerSettingsToDocument(next)
    onSettingsChange?.(next)
  }

  async function save() {
    setError(''); setMessage('')
    try {
      const saved = await savePlayerSettings(currentUser?.uid, settings)
      await setLanguage(saved.preferredLanguage)
      setAutoTranslate(saved.autoTranslate)
      applyPlayerSettingsToDocument(saved)
      setMessage('Settings saved.')
    } catch (err) {
      setError(err.message || 'Could not save settings.')
    }
  }

  return <div style={styles.panel}>
    <SectionHeader eyebrow={t('settings', 'Settings')} title={t('accessibilitySettings', 'App settings and accessibility')}>
      Choose your language, interface behaviour, card animation and accessibility preferences.
    </SectionHeader>
    {error && <div style={{...styles.smallCard,marginTop:18,borderColor:'rgba(153,27,27,.28)'}}><p style={{...styles.smallCardText,color:'#991b1b'}}>{error}</p></div>}
    {message && <div style={{...styles.smallCard,marginTop:18,borderColor:'rgba(22,101,52,.28)'}}><p style={{...styles.smallCardText,color:'#166534'}}>{message}</p></div>}
    <div style={styles.metricGrid}>
      <SettingCard title={t('chooseLanguage','Choose language')}><select style={inputStyle} value={settings.preferredLanguage} onChange={(e)=>updateSetting('preferredLanguage',e.target.value)}>{languageOptions.map(lang=><option key={lang.languageCode} value={lang.languageCode}>{lang.languageName}</option>)}</select></SettingCard>
      <Toggle title={t('autoTranslate','Auto translate interface')} checked={settings.autoTranslate} onChange={(v)=>updateSetting('autoTranslate',v)} />
      <Toggle title={t('cardFlip','Card flip animation')} checked={settings.cardFlipEnabled} onChange={(v)=>updateSetting('cardFlipEnabled',v)} />
      <Toggle title={t('soundEffects','Sound effects')} checked={settings.soundEnabled} onChange={(v)=>updateSetting('soundEnabled',v)} />
      <Toggle title={t('highContrast','High contrast')} checked={settings.highContrast} onChange={(v)=>updateSetting('highContrast',v)} />
      <Toggle title={t('largeText','Large text')} checked={settings.largeText} onChange={(v)=>updateSetting('largeText',v)} />
      <Toggle title={t('reduceMotion','Reduce motion')} checked={settings.reduceMotion} onChange={(v)=>updateSetting('reduceMotion',v)} />
      <Toggle title="Show card images" checked={settings.showCardImages} onChange={(v)=>updateSetting('showCardImages',v)} />
      <Toggle title="Compact mode" checked={settings.compactMode} onChange={(v)=>updateSetting('compactMode',v)} />
    </div>
    <div style={{...styles.centerButtonRow, marginTop:18}}><button style={buttonStyle} onClick={save}>{t('saveSettings','Save settings')}</button><Pill>{languageCode.toUpperCase()}</Pill></div>
  </div>
}
function SettingCard({title, children}){return <div style={styles.smallCard}><p style={styles.eyebrow}>{title}</p>{children}</div>}
function Toggle({title, checked, onChange}){return <SettingCard title={title}><label style={toggleStyle}><input type="checkbox" checked={!!checked} onChange={(e)=>onChange(e.target.checked)} /><span>{checked?'On':'Off'}</span></label></SettingCard>}
const inputStyle={width:'100%',padding:'13px 15px',borderRadius:16,border:'1px solid rgba(139,92,40,.24)',background:'rgba(255,255,255,.76)',color:'#3b2817'}
const buttonStyle={border:0,borderRadius:999,padding:'12px 18px',cursor:'pointer',background:'linear-gradient(135deg,#9a6a22,#5c3512)',color:'#fff8eb',fontWeight:850}
const toggleStyle={display:'flex',gap:10,alignItems:'center',fontWeight:850,color:'#5c3512'}
export default AccessibilityScreen
