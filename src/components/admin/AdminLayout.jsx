function AdminLayout({ adminUser, activeScreen, onScreenChange, onLogout, children }) {
  const navItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: '📊', description: 'Overview' },
    { id: 'problem-cards', label: 'Problem Cards', icon: '🧩', description: 'Add, edit, remove' },
    { id: 'ai-cards', label: 'AI Cards', icon: '🤖', description: 'Manage AI deck' },
    { id: 'sdg-mappings', label: 'SDG Mappings', icon: '🌍', description: 'Goal links' },
    { id: 'rubrics', label: 'Scoring Rubrics', icon: '🧮', description: 'Evaluation rules' },
    { id: 'card-images', label: 'Card Images', icon: '🖼️', description: 'Upload artwork' },
    { id: 'certificate-templates', label: 'Certificate Templates', icon: '🎓', description: 'Certificate design' },
    { id: 'languages', label: 'Language Versions', icon: '🗣️', description: 'Translated decks' },
    { id: 'players', label: 'Player Analytics', icon: '👥', description: 'Player progress' },
    { id: 'analytics', label: 'Analytics Dashboard', icon: '📈', description: 'Impact metrics' },
    { id: 'reports', label: 'Reports Export', icon: '📤', description: 'PDF/CSV exports' }
  ]

  return (
    <main className="adminShell">
      <style>{layoutCss}</style>

      <aside className="adminSidebar">
        <div className="adminSidebarTop">
          <div className="adminLogo">GLA</div>
          <div>
            <h1>Admin Portal</h1>
            <p>{adminUser?.role || 'Administrator'}</p>
          </div>
        </div>

        <nav className="adminNav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onScreenChange(item.id)}
              className={`adminNavButton ${activeScreen === item.id ? 'active' : ''}`}
            >
              <span className="adminNavIcon">{item.icon}</span>
              <span>
                <span className="adminNavLabel">{item.label}</span>
                <span className="adminNavDescription">{item.description}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="adminSidebarFooter">
          <p>Signed in as</p>
          <strong>{adminUser?.email}</strong>
          <button type="button" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <section className="adminContent">
        <header className="adminHeader">
          <div>
            <p>GRIT Lab Africa</p>
            <h2>Admin workspace</h2>
          </div>
          <a href="/" className="adminBackLink">Back to Player App</a>
        </header>

        {children}
      </section>
    </main>
  )
}

const layoutCss = `
  .adminShell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 310px minmax(0, 1fr);
    background:
      radial-gradient(circle at top left, rgba(244, 210, 138, 0.22), transparent 26rem),
      linear-gradient(135deg, rgba(255, 248, 235, 0.94), rgba(232, 214, 170, 0.72));
  }

  .adminSidebar {
    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;
    padding: 16px;
    color: #fff8eb;
    background:
      linear-gradient(145deg, rgba(92, 53, 18, 0.97), rgba(18, 18, 18, 0.94)),
      radial-gradient(circle at top left, rgba(244, 210, 138, 0.26), transparent 22rem);
    border-right: 1px solid rgba(244, 210, 138, 0.22);
    box-shadow: 0 26px 70px rgba(45, 27, 10, 0.28);
    scrollbar-width: thin;
    scrollbar-color: rgba(244, 210, 138, 0.55) rgba(255, 255, 255, 0.08);
  }

  .adminSidebar::-webkit-scrollbar { width: 7px; }
  .adminSidebar::-webkit-scrollbar-track { background: rgba(255,255,255,0.08); border-radius: 999px; }
  .adminSidebar::-webkit-scrollbar-thumb { background: rgba(244,210,138,0.55); border-radius: 999px; }

  .adminSidebarTop {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    margin-bottom: 14px;
  }

  .adminLogo {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    border-radius: 17px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #f4d28a, #9a6a22);
    color: #3b2817;
    font-weight: 950;
  }

  .adminSidebarTop h1 {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.15;
    letter-spacing: -0.04em;
  }

  .adminSidebarTop p {
    margin: 4px 0 0;
    color: rgba(255, 248, 235, 0.64);
    font-size: 0.76rem;
  }

  .adminNav {
    display: grid;
    gap: 7px;
  }

  .adminNavButton {
    position: relative;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 18px;
    padding: 10px 11px;
    display: grid;
    grid-template-columns: 36px 1fr;
    gap: 10px;
    align-items: center;
    text-align: left;
    cursor: pointer;
    background: transparent;
    color: rgba(255, 248, 235, 0.78);
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  }

  .adminNavButton::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 4px;
    border-radius: 999px;
    background: transparent;
  }

  .adminNavButton:hover {
    transform: translateX(3px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(244, 210, 138, 0.18);
  }

  .adminNavButton.active {
    background: rgba(244, 210, 138, 0.14);
    color: #fff8eb;
    border-color: rgba(244, 210, 138, 0.28);
  }

  .adminNavButton.active::before { background: #f4d28a; }

  .adminNavIcon {
    width: 36px;
    height: 36px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.08);
  }

  .adminNavButton.active .adminNavIcon {
    background: linear-gradient(135deg, #f4d28a, #9a6a22);
    color: #3b2817;
  }

  .adminNavLabel {
    display: block;
    font-size: 0.9rem;
    font-weight: 900;
    line-height: 1.15;
  }

  .adminNavDescription {
    display: block;
    margin-top: 3px;
    font-size: 0.7rem;
    font-weight: 750;
    color: rgba(255, 248, 235, 0.5);
  }

  .adminSidebarFooter {
    margin-top: 16px;
    padding: 14px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .adminSidebarFooter p {
    margin: 0 0 4px;
    color: rgba(255, 248, 235, 0.58);
    font-size: 0.72rem;
  }

  .adminSidebarFooter strong {
    display: block;
    color: #f4d28a;
    overflow-wrap: anywhere;
    font-size: 0.84rem;
  }

  .adminSidebarFooter button {
    margin-top: 12px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 10px 14px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
    color: #fff8eb;
    font-weight: 850;
  }

  .adminContent {
    min-width: 0;
    padding: 28px;
  }

  .adminHeader {
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }

  .adminHeader p {
    margin: 0 0 6px;
    color: #9a6a22;
    font-size: 0.74rem;
    font-weight: 850;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .adminHeader h2 {
    margin: 0;
    color: #4b2b10;
    font-size: 2.1rem;
    line-height: 0.95;
    letter-spacing: -0.06em;
  }

  .adminBackLink {
    border-radius: 999px;
    padding: 11px 16px;
    background: rgba(255, 255, 255, 0.68);
    border: 1px solid rgba(139, 92, 40, 0.22);
    color: #5c3512;
    text-decoration: none;
    font-weight: 850;
  }

  @media (max-width: 980px) {
    .adminShell { grid-template-columns: 1fr; }
    .adminSidebar { position: relative; height: auto; max-height: 72vh; }
    .adminContent { padding: 18px; }
  }
`

export default AdminLayout
