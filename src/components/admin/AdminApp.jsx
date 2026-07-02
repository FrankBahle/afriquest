import { useMemo, useState } from 'react'
import AdminLoginScreen from './AdminLoginScreen'
import AdminLayout from './AdminLayout'
import AdminDashboardScreen from './AdminDashboardScreen'
import AdminContentManagementScreen from './AdminContentManagementScreen'
import AdminSdgMappingScreen from './AdminSdgMappingScreen'
import AdminScoringRubricScreen from './AdminScoringRubricScreen'
import AdminAssetTemplateScreen from './AdminAssetTemplateScreen'
import AdminLanguageManagementScreen from './AdminLanguageManagementScreen'
import AdminPlayerAnalyticsScreen from './AdminPlayerAnalyticsScreen'
import AdminAnalyticsScreen from './AdminAnalyticsScreen'
import AdminReportsScreen from './AdminReportsScreen'
import { adminAiCards, adminProblemCards } from './adminMockData'

function AdminApp() {
  const [adminUser, setAdminUser] = useState(null)
  const [activeScreen, setActiveScreen] = useState('dashboard')

  const problemColumns = useMemo(() => [
    { key: 'title', label: 'Problem Card Title' },
    { key: 'problem_type', label: 'Problem Type' },
    { key: 'think_about_it', label: 'Reflection Question' }
  ], [])

  const aiColumns = useMemo(() => [
    { key: 'title', label: 'AI Card Title' },
    { key: 'type', label: 'Type of AI' },
    { key: 'canDo', label: 'What It Can Do' }
  ], [])

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
      {activeScreen === 'problem-cards' && (
        <AdminContentManagementScreen
          eyebrow="Admin problem card management"
          title="Manage problem cards."
          helper="Add, edit or remove African problem cards, examples, reflection questions and SDG links."
          rows={adminProblemCards}
          columns={problemColumns}
          itemName="problem cards"
        />
      )}
      {activeScreen === 'ai-cards' && (
        <AdminContentManagementScreen
          eyebrow="Admin AI card management"
          title="Manage AI cards."
          helper="Add, edit or remove AI capability cards and examples."
          rows={adminAiCards}
          columns={aiColumns}
          itemName="AI cards"
        />
      )}
      {activeScreen === 'sdg-mappings' && <AdminSdgMappingScreen />}
      {activeScreen === 'rubrics' && <AdminScoringRubricScreen />}
      {activeScreen === 'card-images' && <AdminAssetTemplateScreen type="card-images" />}
      {activeScreen === 'certificate-templates' && <AdminAssetTemplateScreen type="certificate" />}
      {activeScreen === 'languages' && <AdminLanguageManagementScreen />}
      {activeScreen === 'players' && <AdminPlayerAnalyticsScreen />}
      {activeScreen === 'analytics' && <AdminAnalyticsScreen />}
      {activeScreen === 'reports' && <AdminReportsScreen />}
    </AdminLayout>
  )
}

export default AdminApp
