import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { useAuth } from './AuthContext'
import { COLLECTIONS, cleanText, db } from '../services/firebaseService'

const STORAGE_KEY = 'gla_preferred_language'

const fallbackLanguages = [
  { languageCode: 'en', languageName: 'English', isActive: true },
  { languageCode: 'fr', languageName: 'French', isActive: true },
  { languageCode: 'zu', languageName: 'isiZulu', isActive: true }
]

const baseTranslations = {
  en: {
    appName: 'GRIT Lab Africa',
    gameName: 'AI for SDGs Card Game',
    journey: 'Journey', dashboard: 'Dashboard', coins: 'GLA Coin', certificate: 'Certificate', profile: 'Profile',
    achievements: 'Achievements', levels: 'Levels', leaderboard: 'Leaderboard', analytics: 'Analytics',
    language: 'Language', settings: 'Settings', cardDesigns: 'Card designs', multiplayer: 'Multiplayer', rewards: 'Rewards',
    progress: 'Progress', experience: 'Experience', completed: 'Completed', average: 'Average', coin: 'Coin', close: 'Close',
    playerSettings: 'Player settings', accessibilitySettings: 'App settings and accessibility', saveSettings: 'Save settings',
    chooseLanguage: 'Choose language', highContrast: 'High contrast', largeText: 'Large text', reduceMotion: 'Reduce motion',
    cardFlip: 'Card flip animation', soundEffects: 'Sound effects', autoTranslate: 'Auto translate interface',
    noData: 'No data found', loading: 'Loading...', active: 'Active', inactive: 'Inactive', search: 'Search', filter: 'Filter',
    adminDashboard: 'Admin Dashboard', problemCards: 'Problem Cards', aiCards: 'AI Cards', sdgMappings: 'SDG Mappings',
    scoringRubrics: 'Scoring Rubrics', reports: 'Reports', logout: 'Logout', adminWorkspace: 'Admin workspace'
  },
  fr: {
    appName: 'GRIT Lab Africa',
    gameName: 'Jeu de cartes IA pour les ODD',
    journey: 'Parcours', dashboard: 'Tableau de bord', coins: 'Pièces GLA', certificate: 'Certificat', profile: 'Profil',
    achievements: 'Réussites', levels: 'Niveaux', leaderboard: 'Classement', analytics: 'Analytique',
    language: 'Langue', settings: 'Paramètres', cardDesigns: 'Design des cartes', multiplayer: 'Multijoueur', rewards: 'Récompenses',
    progress: 'Progrès', experience: 'Expérience', completed: 'Terminé', average: 'Moyenne', coin: 'Pièce', close: 'Fermer',
    playerSettings: 'Paramètres du joueur', accessibilitySettings: 'Paramètres de l’application et accessibilité', saveSettings: 'Enregistrer les paramètres',
    chooseLanguage: 'Choisir la langue', highContrast: 'Contraste élevé', largeText: 'Texte agrandi', reduceMotion: 'Réduire les animations',
    cardFlip: 'Animation de retournement des cartes', soundEffects: 'Effets sonores', autoTranslate: 'Traduire automatiquement l’interface',
    noData: 'Aucune donnée trouvée', loading: 'Chargement...', active: 'Actif', inactive: 'Inactif', search: 'Rechercher', filter: 'Filtrer',
    adminDashboard: 'Tableau de bord admin', problemCards: 'Cartes problèmes', aiCards: 'Cartes IA', sdgMappings: 'Correspondances ODD',
    scoringRubrics: 'Grilles de notation', reports: 'Rapports', logout: 'Déconnexion', adminWorkspace: 'Espace administrateur'
  },
  zu: {
    appName: 'GRIT Lab Africa',
    gameName: 'Umdlalo Wamakhadi e-AI kuma-SDG',
    journey: 'Uhambo', dashboard: 'Ideshibhodi', coins: 'Izinhlamvu ze-GLA', certificate: 'Isitifiketi', profile: 'Iphrofayela',
    achievements: 'Impumelelo', levels: 'Amazinga', leaderboard: 'Ibhodi labaphambili', analytics: 'Ukuhlaziya',
    language: 'Ulimi', settings: 'Izilungiselelo', cardDesigns: 'Imiklamo yamakhadi', multiplayer: 'Abadlali abaningi', rewards: 'Imiklomelo',
    progress: 'Inqubekelaphambili', experience: 'Okuhlangenwe nakho', completed: 'Kuqediwe', average: 'Isilinganiso', coin: 'Uhlamvu', close: 'Vala',
    playerSettings: 'Izilungiselelo zomdlali', accessibilitySettings: 'Izilungiselelo zohlelo nokufinyeleleka', saveSettings: 'Gcina izilungiselelo',
    chooseLanguage: 'Khetha ulimi', highContrast: 'Ukuqhathanisa okuphezulu', largeText: 'Umbhalo omkhulu', reduceMotion: 'Nciphisa ukunyakaza',
    cardFlip: 'Ukuphenduka kwekhadi', soundEffects: 'Imisindo', autoTranslate: 'Humusha isixhumi ngokuzenzakalela',
    noData: 'Ayikho idatha etholakele', loading: 'Iyalayisha...', active: 'Kuyasebenza', inactive: 'Akusebenzi', search: 'Sesha', filter: 'Hlunga',
    adminDashboard: 'Ideshibhodi yomlawuli', problemCards: 'Amakhadi ezinkinga', aiCards: 'Amakhadi e-AI', sdgMappings: 'Ukuxhumanisa ama-SDG',
    scoringRubrics: 'Imithetho yokunikeza amamaki', reports: 'Imibiko', logout: 'Phuma', adminWorkspace: 'Indawo yomlawuli'
  }
}

const phraseTranslations = {
  fr: {
    'GRIT Lab Africa': 'GRIT Lab Africa',
    'AI for SDGs Card Game': 'Jeu de cartes IA pour les ODD',
    'Player achievements and badges': 'Réussites et badges du joueur',
    'Player levels and progression': 'Niveaux et progression du joueur',
    'GLA coin wallet': 'Portefeuille de pièces GLA',
    'Player leaderboard': 'Classement des joueurs',
    'Search and filter': 'Rechercher et filtrer',
    'Current Balance': 'Solde actuel',
    'Total Earned': 'Total gagné',
    'Total Spent': 'Total dépensé',
    'Current Level': 'Niveau actuel',
    'Next Level': 'Niveau suivant',
    'Problem Cards': 'Cartes problèmes',
    'AI Cards': 'Cartes IA',
    'Admin Portal': 'Portail administrateur',
    'Admin workspace': 'Espace administrateur',
    'Back to Player App': 'Retour à l’application joueur'
  },
  zu: {
    'GRIT Lab Africa': 'GRIT Lab Africa',
    'AI for SDGs Card Game': 'Umdlalo Wamakhadi e-AI kuma-SDG',
    'Player achievements and badges': 'Impumelelo namabheji omdlali',
    'Player levels and progression': 'Amazinga nokuthuthuka komdlali',
    'GLA coin wallet': 'Isikhwama sezinhlamvu ze-GLA',
    'Player leaderboard': 'Ibhodi labaphambili labadlali',
    'Search and filter': 'Sesha futhi uhlunge',
    'Current Balance': 'Ibhalansi yamanje',
    'Total Earned': 'Ingqikithi etholakele',
    'Total Spent': 'Ingqikithi esetshenzisiwe',
    'Current Level': 'Izinga lamanje',
    'Next Level': 'Izinga elilandelayo',
    'Problem Cards': 'Amakhadi ezinkinga',
    'AI Cards': 'Amakhadi e-AI',
    'Admin Portal': 'Iphothali yomlawuli',
    'Admin workspace': 'Indawo yomlawuli',
    'Back to Player App': 'Buyela kuhlelo lomdlali'
  }
}

const LanguageContext = createContext(null)

async function getCollectionRows(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((documentSnapshot) => ({ firestoreId: documentSnapshot.id, ...documentSnapshot.data() }))
}

function buildTranslationMap(languageCode, rows) {
  const map = { ...(baseTranslations[languageCode] || {}) }
  const phraseMap = { ...(phraseTranslations[languageCode] || {}) }

  rows
    .filter((row) => String(row.languageCode || row.language || '').toLowerCase() === languageCode)
    .forEach((row) => {
      const key = cleanText(row.key || row.translationKey || row.firestoreId)
      const value = cleanText(row.translatedText || row.text || row.value)
      const sourceText = cleanText(row.sourceText || row.englishText)
      if (key && value) map[key] = value
      if (sourceText && value) phraseMap[sourceText] = value
    })

  return { map, phraseMap }
}

const domOriginalTextMap = new WeakMap()
const translatedAttrPrefix = 'data-gla-original'

function useDomTranslator(languageCode, phraseMap, enabled) {
  useEffect(() => {
    function shouldSkipElement(node) {
      const tag = node?.tagName?.toLowerCase()
      return ['script', 'style', 'textarea', 'input', 'select', 'option'].includes(tag)
    }

    function restoreTextNodes(root) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const nodes = []
      while (walker.nextNode()) nodes.push(walker.currentNode)
      nodes.forEach((node) => {
        const original = domOriginalTextMap.get(node)
        if (original !== undefined) node.nodeValue = original
      })
    }

    function translateTextNodes(root) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
          let parent = node.parentElement
          while (parent) {
            if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT
            parent = parent.parentElement
          }
          return NodeFilter.FILTER_ACCEPT
        }
      })

      const nodes = []
      while (walker.nextNode()) nodes.push(walker.currentNode)

      nodes.forEach((node) => {
        const original = domOriginalTextMap.get(node) || node.nodeValue
        domOriginalTextMap.set(node, original)
        const cleanOriginal = original.trim()
        const translated = phraseMap[cleanOriginal]
        if (translated) node.nodeValue = original.replace(cleanOriginal, translated)
      })
    }

    function translateAttributes(root) {
      const elements = root.querySelectorAll?.('[placeholder], [title], [aria-label]') || []
      elements.forEach((element) => {
        if (shouldSkipElement(element)) return
        ;['placeholder', 'title', 'aria-label'].forEach((attribute) => {
          const value = element.getAttribute(attribute)
          if (!value) return
          const originalKey = `${translatedAttrPrefix}-${attribute}`
          const original = element.getAttribute(originalKey) || value
          element.setAttribute(originalKey, original)
          element.setAttribute(attribute, phraseMap[original] || original)
        })
      })
    }

    function restoreAttributes(root) {
      const elements = root.querySelectorAll?.('[data-gla-original-placeholder], [data-gla-original-title], [data-gla-original-aria-label]') || []
      elements.forEach((element) => {
        ;['placeholder', 'title', 'aria-label'].forEach((attribute) => {
          const original = element.getAttribute(`${translatedAttrPrefix}-${attribute}`)
          if (original) element.setAttribute(attribute, original)
        })
      })
    }

    let isTranslating = false
    let translateTimer = null

    const translatePage = () => {
      if (!document.body || isTranslating) return

      isTranslating = true
      try {
        restoreTextNodes(document.body)
        restoreAttributes(document.body)
        if (enabled && languageCode !== 'en') {
          translateTextNodes(document.body)
          translateAttributes(document.body)
        }
      } finally {
        isTranslating = false
      }
    }

    const scheduleTranslate = () => {
      if (translateTimer) window.clearTimeout(translateTimer)
      translateTimer = window.setTimeout(translatePage, 80)
    }

    translatePage()
    const observer = new MutationObserver(scheduleTranslate)
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true })
    }
    return () => {
      observer.disconnect()
      if (translateTimer) window.clearTimeout(translateTimer)
      if (document.body) {
        restoreTextNodes(document.body)
        restoreAttributes(document.body)
      }
    }
  }, [languageCode, phraseMap, enabled])
}

export function LanguageProvider({ children }) {
  const { currentUser } = useAuth()
  const [languageCode, setLanguageCode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en')
  const [languageOptions, setLanguageOptions] = useState(fallbackLanguages)
  const [translations, setTranslations] = useState(baseTranslations.en)
  const [phraseMap, setPhraseMap] = useState({})
  const [autoTranslate, setAutoTranslate] = useState(true)

  async function loadLanguagesAndTranslations(code = languageCode) {
    try {
      const [languages, uiRows] = await Promise.all([
        getCollectionRows(COLLECTIONS.languageVersions),
        getCollectionRows(COLLECTIONS.uiTranslations)
      ])

      const activeLanguages = languages
        .filter((language) => language.isActive !== false)
        .map((language) => ({
          languageCode: cleanText(language.languageCode || language.code || language.firestoreId).toLowerCase(),
          languageName: cleanText(language.languageName || language.language || language.name || language.firestoreId),
          isActive: true
        }))
        .filter((language) => language.languageCode && language.languageName)

      setLanguageOptions(activeLanguages.length ? activeLanguages : fallbackLanguages)

      const result = buildTranslationMap(code, uiRows)
      setTranslations({ ...baseTranslations.en, ...result.map })
      setPhraseMap(result.phraseMap)
    } catch {
      setLanguageOptions(fallbackLanguages)
      setTranslations({ ...baseTranslations.en, ...(baseTranslations[code] || {}) })
      setPhraseMap(phraseTranslations[code] || {})
    }
  }

  async function changeLanguage(nextLanguageCode) {
    const code = cleanText(nextLanguageCode).toLowerCase() || 'en'
    setLanguageCode(code)
    localStorage.setItem(STORAGE_KEY, code)
    await loadLanguagesAndTranslations(code)

    if (currentUser?.uid) {
      await setDoc(doc(db, COLLECTIONS.users, currentUser.uid), {
        preferredLanguage: code,
        languageUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
    }
  }

  useEffect(() => {
    loadLanguagesAndTranslations(languageCode)
  }, [])

  useDomTranslator(languageCode, phraseMap, autoTranslate)

  const value = useMemo(() => ({
    languageCode,
    languageOptions,
    translations,
    phraseMap,
    autoTranslate,
    setAutoTranslate,
    setLanguage: changeLanguage,
    loadLanguagesAndTranslations,
    t: (key, fallback = '') => translations[key] || fallback || key
  }), [languageCode, languageOptions, translations, phraseMap, autoTranslate])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      languageCode: 'en',
      languageOptions: fallbackLanguages,
      translations: baseTranslations.en,
      phraseMap: {},
      autoTranslate: true,
      setAutoTranslate: () => {},
      setLanguage: async () => {},
      loadLanguagesAndTranslations: async () => {},
      t: (key, fallback = '') => fallback || key
    }
  }
  return context
}
