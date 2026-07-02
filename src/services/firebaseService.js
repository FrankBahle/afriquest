import { auth, db, storage } from '../firebase'

export const COLLECTIONS = {
  users: 'users',
  problemCards: 'problemCards',
  aiCards: 'aiCards',
  selectedProblemStacks: 'selectedProblemStacks',
  gameSessions: 'gameSessions',
  attempts: 'attempts',
  deepSeekEvaluations: 'deepSeekEvaluations',
  hintRequests: 'hintRequests',
  glaCoinTransactions: 'glaCoinTransactions',
  certificates: 'certificates',
  scoringRubrics: 'scoringRubrics',
  scores: 'scores',
  subScores: 'subScores',
  feedback: 'feedback',
  userFeedback: 'userFeedback',
  aiScoringReviews: 'aiScoringReviews',
  cardReviewNotes: 'cardReviewNotes',
  analyticsEvents: 'analyticsEvents',
  languageVersions: 'languageVersions',
  cardTranslations: 'cardTranslations',
  achievements: 'achievements',
  playerAchievements: 'playerAchievements',
  adminUsers: 'adminUsers',
  adminActivityLogs: 'adminActivityLogs',
  appSettings: 'appSettings'
}

export { auth, db, storage }