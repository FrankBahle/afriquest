import { useState } from 'react'
import AdminLoginScreen from './AdminLoginScreen'
import AdminLayout from './AdminLayout'
import AdminDashboardScreen from './AdminDashboardScreen'
import AdminProblemCardsScreen from './AdminProblemCardsScreen'
import AdminAiCardsScreen from './AdminAiCardsScreen'
import AdminSdgMappingScreen from './AdminSdgMappingScreen'
import AdminScoringRubricScreen from './AdminScoringRubricScreen'
import AdminAssetTemplateScreen from './AdminAssetTemplateScreen'
import AdminLanguageManagementScreen from './AdminLanguageManagementScreen'
import AdminPlayerAnalyticsScreen from './AdminPlayerAnalyticsScreen'
import AdminAnalyticsScreen from './AdminAnalyticsScreen'
import AdminReportsScreen from './AdminReportsScreen'

function AdminApp() {
  const [adminUser, setAdminUser] = useState(null)
  const [activeScreen, setActiveScreen] = useState('dashboard')

  if (!adminUser) {
    return <AdminLoginScreen onLogin={setAdminUser} />
  }

  return (
    <AdminLayout
      adminUser={adminUser}
      activeScreen={activeScreen}
      onScreenChange={setActiveScreen}
      onLogout={() => setAdminUser(null)}
    >
      {activeScreen === 'dashboard' && <AdminDashboardScreen />}

      {activeScreen === 'problem-cards' && <AdminProblemCardsScreen />}

      {activeScreen === 'ai-cards' && <AdminAiCardsScreen />}

      {activeScreen === 'sdg-mappings' && <AdminSdgMappingScreen />}

      {activeScreen === 'rubrics' && <AdminScoringRubricScreen />}

      {activeScreen === 'card-images' && (
        <AdminAssetTemplateScreen type="card-images" />
      )}

      {activeScreen === 'certificate-templates' && (
        <AdminAssetTemplateScreen type="certificate" />
      )}

      {activeScreen === 'languages' && <AdminLanguageManagementScreen />}

      {activeScreen === 'players' && <AdminPlayerAnalyticsScreen />}

      {activeScreen === 'analytics' && <AdminAnalyticsScreen />}

      {activeScreen === 'reports' && <AdminReportsScreen />}
    </AdminLayout>
  )
}

export default AdminApp