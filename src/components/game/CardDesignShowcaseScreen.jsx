import { useEffect, useMemo, useState } from 'react'
import { styles } from './gameStyles'
import { Pill, SectionHeader } from './ui'
import { getPlayerCardDesigns } from '../../services/player/playerCardDesignService'
import { usePlayerLanguage } from '../../hooks/usePlayerLanguage'

function CardDesignShowcaseScreen({ problemCardBack, aiCardBack }) {
  const { t } = usePlayerLanguage()
  const [problemCards, setProblemCards] = useState([])
  const [aiCards, setAiCards] = useState([])
  const [cardTypeFilter, setCardTypeFilter] = useState('all')
  const [imageFilter, setImageFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDesigns() {
    setLoading(true)
    setError('')

    try {
      const data = await getPlayerCardDesigns()
      setProblemCards(data.problemCards)
      setAiCards(data.aiCards)
    } catch (err) {
      setError(err.message || 'Could not load card design data from Firebase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDesigns()
  }, [])

  const allCards = useMemo(() => [...problemCards, ...aiCards], [problemCards, aiCards])

  const filteredCards = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase()

    return allCards.filter((card) => {
      const matchesType = cardTypeFilter === 'all' || card.cardType === cardTypeFilter
      const hasAnyImage = Boolean(card.frontImageUrl || card.backImageUrl)
      const matchesImage = imageFilter === 'all' || (imageFilter === 'with-images' && hasAnyImage) || (imageFilter === 'missing-images' && !hasAnyImage)
      const text = [card.title, card.subtitle, card.description, card.cardType, card.cardTheme].join(' ').toLowerCase()
      const matchesSearch = !cleanSearch || text.includes(cleanSearch)
      return matchesType && matchesImage && matchesSearch
    })
  }, [allCards, cardTypeFilter, imageFilter, searchTerm])

  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow={t('cardDesigns')} title={t('cardDesignTitle')}>
        {t('cardDesignHelp')}
      </SectionHeader>

      {error && (
        <div style={{ ...styles.smallCard, marginTop: 18, borderColor: 'rgba(153, 27, 27, 0.28)' }}>
          <p style={{ ...styles.smallCardText, color: '#991b1b' }}>{error}</p>
        </div>
      )}

      <div style={styles.metricGrid}>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>{t('problemCards')}</p>
          <h3 style={styles.smallCardTitle}>{problemCards.length}</h3>
          <p style={styles.smallCardText}>problemCards</p>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>{t('aiCards')}</p>
          <h3 style={styles.smallCardTitle}>{aiCards.length}</h3>
          <p style={styles.smallCardText}>aiCards</p>
        </div>
        <div style={styles.smallCard}>
          <p style={styles.eyebrow}>Cards with images</p>
          <h3 style={styles.smallCardTitle}>{allCards.filter((card) => card.frontImageUrl || card.backImageUrl).length}</h3>
          <p style={styles.smallCardText}>frontImageUrl / backImageUrl</p>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Search and filter</p>
            <h3 style={styles.smallCardTitle}>Find card designs</h3>
          </div>
          <Pill>{filteredCards.length} cards</Pill>
        </div>
        <div style={filterGridStyle}>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search cards, themes or descriptions..." style={inputStyle} />
          <select value={cardTypeFilter} onChange={(event) => setCardTypeFilter(event.target.value)} style={inputStyle}>
            <option value="all">All card types</option>
            <option value="problem">Problem cards</option>
            <option value="ai">AI cards</option>
          </select>
          <select value={imageFilter} onChange={(event) => setImageFilter(event.target.value)} style={inputStyle}>
            <option value="all">All image states</option>
            <option value="with-images">With images</option>
            <option value="missing-images">Missing images</option>
          </select>
        </div>
      </div>

      <div style={{ ...styles.smallCard, marginTop: 18 }}>
        <div style={styles.rowBetween}>
          <div>
            <p style={styles.eyebrow}>Firebase card image fields</p>
            <h3 style={styles.smallCardTitle}>Card image gallery</h3>
          </div>
          <Pill>{loading ? 'Loading' : `${filteredCards.length} visible`}</Pill>
        </div>

        {loading ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>Loading card designs from Firebase...</p>
        ) : filteredCards.length === 0 ? (
          <p style={{ ...styles.smallCardText, marginTop: 14 }}>No card designs match your filters.</p>
        ) : (
          <div style={galleryGridStyle}>
            {filteredCards.map((card) => {
              const fallbackBack = card.cardType === 'ai' ? aiCardBack : problemCardBack
              const frontImage = card.frontImageUrl || card.backImageUrl || fallbackBack
              const backImage = card.backImageUrl || fallbackBack

              return (
                <article key={`${card.cardType}_${card.firestoreId}`} style={cardBoxStyle}>
                  <div style={imagePairStyle}>
                    <ImagePreview src={frontImage} label="Front" />
                    <ImagePreview src={backImage} label="Back" />
                  </div>
                  <p style={styles.eyebrow}>{card.cardType === 'ai' ? t('aiCards') : t('problemCards')}</p>
                  <h3 style={styles.smallCardTitle}>{card.title}</h3>
                  <p style={styles.smallCardText}>{card.subtitle}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    <Pill>{card.cardTheme}</Pill>
                    <Pill tone={card.frontImageUrl || card.backImageUrl ? 'success' : 'default'}>{card.frontImageUrl || card.backImageUrl ? 'Firebase image' : 'Fallback image'}</Pill>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ImagePreview({ src, label }) {
  return (
    <div style={imagePreviewStyle}>
      {src ? <img src={src} alt={`${label} card`} style={imageStyle} /> : <span>No image</span>}
      <strong>{label}</strong>
    </div>
  )
}

const filterGridStyle = { marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 190px 190px', gap: 12 }
const inputStyle = { width: '100%', padding: '13px 15px', borderRadius: 16, border: '1px solid rgba(139, 92, 40, 0.24)', background: 'rgba(255, 255, 255, 0.76)', color: '#3b2817', outline: 'none' }
const galleryGridStyle = { marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }
const cardBoxStyle = { padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.66)', border: '1px solid rgba(139, 92, 40, 0.16)', boxShadow: '0 16px 36px rgba(80, 52, 20, 0.08)' }
const imagePairStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }
const imagePreviewStyle = { position: 'relative', minHeight: 160, borderRadius: 20, overflow: 'hidden', background: 'rgba(244,210,138,0.18)', border: '1px solid rgba(139,92,40,0.16)', display: 'grid', placeItems: 'center', color: '#5c3512', fontWeight: 850 }
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

export default CardDesignShowcaseScreen
