function GameSidebar({
  screen,
  onNavigate,
  onClose,
  selectedProblemCount,
  completedProblems,
  certificationProgress,
  averageScore,
  glaCoinBalance,
  certificateUnlocked,
  latestAttempt
}) {
  const journeyScreens = ['intro', 'select', 'play', 'score', 'retry']

  const navItems = [
    { value: 'journey', label: 'Play Journey', icon: '🎮', description: 'Guide, cards, play and score' },
    { value: 'dashboard', label: 'Dashboard', icon: '🏆', description: `${completedProblems} completed` },
    { value: 'profile', label: 'Player Profile', icon: '👤', description: 'Profile and progress' },
    { value: 'certificate', label: 'Certificate', icon: '🎓', description: certificateUnlocked ? 'Unlocked' : 'Locked' },
    { value: 'achievements', label: 'Achievements', icon: '🏅', description: 'Badges and awards' },
    { value: 'levels', label: 'Levels', icon: '⬆️', description: 'Progression path' },
    { value: 'leaderboard', label: 'Leaderboard', icon: '🥇', description: 'Top players' },
    { value: 'coins', label: 'GLA Coin', icon: '🪙', description: `${glaCoinBalance} balance` },
    { value: 'hints', label: 'Hints', icon: '💬', description: 'Hint history and levels' },
    { value: 'analytics', label: 'Analytics', icon: '📈', description: 'Learning analytics' },
    { value: 'multilingual', label: 'Languages', icon: '🌍', description: 'Translated card decks' },
    { value: 'accessibility', label: 'Accessibility', icon: '♿', description: 'Inclusive settings' },
    { value: 'designs', label: 'Card Designs', icon: '🃏', description: 'Images and card backs' },
    { value: 'multiplayer', label: 'Multiplayer', icon: '👥', description: 'Rooms, teams and tournaments' },
    { value: 'rewards', label: 'Rewards & Launch', icon: '🚀', description: 'Unlocks and public page' }
  ]

  return (
    <aside className="glaSidebar">
      <style>
        {`
          .glaSidebar {
            width: 100%;
            height: 100dvh;
            max-height: 100dvh;
            padding: 14px;
            background:
              linear-gradient(145deg, rgba(92, 53, 18, 0.96), rgba(18, 18, 18, 0.94)),
              radial-gradient(circle at top left, rgba(244, 210, 138, 0.26), transparent 22rem);
            border-right: 1px solid rgba(244, 210, 138, 0.22);
            box-shadow: 0 26px 70px rgba(45, 27, 10, 0.28);
            color: #fff8eb;
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: rgba(244, 210, 138, 0.55) rgba(255, 255, 255, 0.08);
          }
          .glaSidebar::-webkit-scrollbar { width: 7px; }
          .glaSidebar::-webkit-scrollbar-track { background: rgba(255,255,255,0.08); border-radius: 999px; }
          .glaSidebar::-webkit-scrollbar-thumb { background: rgba(244,210,138,0.55); border-radius: 999px; }
          .glaSidebarTop { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px; border-radius:22px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); margin-bottom:14px; }
          .glaSidebarBrand { display:flex; align-items:center; gap:12px; min-width:0; }
          .glaSidebarLogo { width:46px; height:46px; flex:0 0 46px; border-radius:17px; display:grid; place-items:center; background:linear-gradient(135deg,#f4d28a,#9a6a22); color:#3b2817; font-size:1rem; font-weight:950; box-shadow:0 14px 28px rgba(0,0,0,0.22); }
          .glaSidebarTitle { margin:0; color:#fff8eb; font-size:1rem; line-height:1.15; letter-spacing:-0.04em; font-weight:900; }
          .glaSidebarSubtitle { margin:4px 0 0; color:rgba(255,248,235,0.64); font-size:0.76rem; line-height:1.35; }
          .glaSidebarClose { width:38px; height:38px; border:1px solid rgba(255,255,255,0.12); border-radius:14px; cursor:pointer; background:rgba(255,255,255,0.08); color:#fff8eb; font-size:1.2rem; font-weight:900; }
          .glaSidebarProgressCard { padding:14px; border-radius:22px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1); margin-bottom:14px; }
          .glaSidebarProgressTop { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px; }
          .glaSidebarProgressTop span { color:rgba(255,248,235,0.72); font-size:0.76rem; font-weight:800; }
          .glaSidebarProgressTop strong { color:#f4d28a; font-size:0.9rem; font-weight:950; }
          .glaSidebarProgressTrack { width:100%; height:8px; border-radius:999px; overflow:hidden; background:rgba(255,255,255,0.12); }
          .glaSidebarProgressFill { height:100%; border-radius:999px; background:linear-gradient(135deg,#f4d28a,#9a6a22); }
          .glaSidebarMiniStats { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
          .glaSidebarMiniStat { padding:10px; border-radius:16px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.08); }
          .glaSidebarMiniStat strong { display:block; color:#f4d28a; font-size:0.95rem; line-height:1.1; }
          .glaSidebarMiniStat span { display:block; margin-top:3px; color:rgba(255,248,235,0.58); font-size:0.68rem; font-weight:800; }
          .glaSidebarMenuLabel { margin:0 0 8px 10px; color:rgba(255,248,235,0.48); font-size:0.68rem; letter-spacing:0.14em; text-transform:uppercase; font-weight:900; }
          .glaSidebarNav { display:grid; gap:7px; }
          .glaSidebarButton { position:relative; width:100%; border:1px solid transparent; border-radius:18px; padding:10px 11px; display:grid; grid-template-columns:36px 1fr; gap:10px; align-items:center; text-align:left; cursor:pointer; background:transparent; color:rgba(255,248,235,0.78); transition:transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
          .glaSidebarButton::before { content:''; position:absolute; left:0; top:12px; bottom:12px; width:4px; border-radius:999px; background:transparent; transition:background 0.2s ease; }
          .glaSidebarButton:hover { transform:translateX(3px); background:rgba(255,255,255,0.08); border-color:rgba(244,210,138,0.18); }
          .glaSidebarButton.active { background:rgba(244,210,138,0.14); color:#fff8eb; border-color:rgba(244,210,138,0.28); box-shadow:inset 0 0 0 1px rgba(244,210,138,0.08); }
          .glaSidebarButton.active::before { background:#f4d28a; }
          .glaSidebarIcon { width:36px; height:36px; border-radius:14px; display:grid; place-items:center; background:rgba(255,255,255,0.08); font-size:1rem; }
          .glaSidebarButton.active .glaSidebarIcon { background:linear-gradient(135deg,#f4d28a,#9a6a22); color:#3b2817; }
          .glaSidebarLabel { display:block; font-size:0.9rem; font-weight:900; line-height:1.15; }
          .glaSidebarDescription { display:block; margin-top:3px; font-size:0.7rem; font-weight:750; color:rgba(255,248,235,0.5); }
          .glaSidebarButton.active .glaSidebarDescription { color:rgba(255,248,235,0.68); }
        `}
      </style>

      <div className="glaSidebarTop">
        <div className="glaSidebarBrand">
          <div className="glaSidebarLogo">GLA</div>
          <div>
            <h2 className="glaSidebarTitle">GRIT Lab Africa</h2>
            <p className="glaSidebarSubtitle">AI for SDGs card game</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="glaSidebarClose" aria-label="Close menu">×</button>
      </div>

      <div className="glaSidebarProgressCard">
        <div className="glaSidebarProgressTop"><span>Certificate Progress</span><strong>{certificationProgress}/10</strong></div>
        <div className="glaSidebarProgressTrack"><div className="glaSidebarProgressFill" style={{ width: `${Math.min(100, (certificationProgress / 10) * 100)}%` }}></div></div>
        <div className="glaSidebarMiniStats">
          <div className="glaSidebarMiniStat"><strong>{averageScore}%</strong><span>Average</span></div>
          <div className="glaSidebarMiniStat"><strong>{glaCoinBalance}</strong><span>GLA Coin</span></div>
        </div>
      </div>

      <p className="glaSidebarMenuLabel">Menu</p>
      <nav className="glaSidebarNav">
        {navItems.map((item) => {
          const active = item.value === 'journey' ? journeyScreens.includes(screen) : screen === item.value
          return (
            <button key={item.value} type="button" onClick={() => onNavigate(item.value)} className={`glaSidebarButton ${active ? 'active' : ''}`}>
              <span className="glaSidebarIcon">{item.icon}</span>
              <span><span className="glaSidebarLabel">{item.label}</span><span className="glaSidebarDescription">{item.description}</span></span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default GameSidebar
