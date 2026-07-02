# GRIT Lab Africa AI for SDGs Card Game

A web-based educational card game where players solve African development challenges using AI solution cards. Players select problem cards, choose one to three AI cards, explain their solution, receive AI-generated scoring feedback, earn GLA Coins, and work toward unlocking a certificate.

This project is currently focused on the **front-end user interface only**. Backend services, real admin authentication, database storage, multiplayer sockets, and file upload APIs are not included yet.

---

## Project Overview

The game teaches players how artificial intelligence can be applied to real-world African challenges aligned with the Sustainable Development Goals.

The player journey includes:

1. Reading the game guide.
2. Selecting at least 10 problem cards.
3. Starting a game round.
4. Viewing a random problem card.
5. Choosing up to 3 AI solution cards.
6. Writing a short explanation of the selected AI solution.
7. Submitting the solution for AI scoring.
8. Earning GLA Coins based on the score.
9. Viewing feedback, retrying, and progressing toward a certificate.

The admin journey includes a separate static admin login and admin dashboard interface for managing game content and reviewing analytics.

---

## Main Features

### Player Features

- Public landing page
- Player login and registration UI
- Game guide screen
- Problem card selection screen
- Play game screen
- AI card selection
- Selected AI solution board
- Explanation box with 100-word limit
- DeepSeek scoring integration through the existing service file
- Score and feedback screen
- Detailed sub-score breakdown
- Retry attempt screen
- First score, latest score, and best score views
- GLA Coin balance
- GLA Coin earned display
- GLA Coin spent on hints display
- GLA Coin transaction history
- Hint request confirmation
- Hint history screen
- Advanced hint levels screen
- Player dashboard
- Player profile screen
- Best-scoring problem cards section
- Completed problem cards list
- Selected problem stack full view
- Achievements and badges screen
- Levels and progression screen
- Leaderboard screen
- Certificate screen
- Certificate download button UI
- Certificate verification ID display
- Certificate issue date display
- Accessibility settings UI
- Multilingual language selector UI
- Translated card deck screens
- Mobile-friendly layout

### Admin Features

Admin functionality is separated from the player sidebar. Players do not see admin menu items while playing the game.

Admin screens include:

- Admin login screen
- Admin dashboard
- Problem card management screen
- AI card management screen
- SDG mapping management screen
- Scoring rubric management screen
- Card image upload screen
- Certificate template management screen
- Language version management screen
- Player analytics screen
- Reports export screen
- Analytics dashboard
- Registered players analytics
- Active players analytics
- Most selected problem cards analytics
- Most used AI cards analytics
- Common AI card combinations analytics
- Average score per problem card analytics
- Average score per scoring category analytics
- Hints requested analytics
- Certificates issued analytics
- Completion rate analytics
- Replay rate analytics

### Extra Game Mode UI Screens

The project also includes user interface screens for future game modes:

- Multiplayer lobby
- Create multiplayer room
- Join multiplayer room
- Multiplayer challenge
- Multiplayer results comparison
- Team mode lobby
- Team creation
- Team shared solution
- Team results
- Debate mode
- Peer voting
- Most realistic solution vote
- Most innovative solution vote
- Most ethical solution vote
- Most scalable African solution vote
- Tournament mode
- Tournament leaderboard
- Advanced leaderboards
- Avatar and card skin unlocks
- Sponsor reward information
- Public launch / programme landing page

---

## Demo Admin Login

The admin login is static and only meant for UI testing.

Open the app and use the **Admin Login** button/card from the public landing page, or navigate directly to:

```txt
/admin
```

Demo credentials:

```txt
Email: admin@gritlabafrica.org
Password: GLA-admin-2026
Access Code: GLA-ADMIN
```

The credentials are stored in:

```txt
src/components/admin/adminCredentials.js
```

Example:

```js
export const ADMIN_CREDENTIALS = {
  email: 'admin@gritlabafrica.org',
  password: 'GLA-admin-2026',
  accessCode: 'GLA-ADMIN'
}
```

Do not use this static login for production. A real backend authentication system must be added before deployment to real users.

---

## Tech Stack

- React
- Vite
- JavaScript
- CSS / inline component styles
- Firebase integration for existing app login flow
- DeepSeek service integration for AI scoring
- Netlify-ready front-end routing

---

## Project Structure

A simplified structure of the project:

```txt
src/
├── App.jsx
├── main.jsx
├── firebase.js
├── data/
│   └── aiCards.js
├── assets/
│   ├── images/
│   │   ├── card1.jpeg
│   │   └── card2.jpeg
│   └── json/
│       └── grit_lab_africa_problem_cards.json
├── services/
│   └── deepseekService.js
├── components/
│   ├── GameHome.jsx
│   ├── AuthModal.jsx
│   ├── game/
│   │   ├── GameSidebar.jsx
│   │   ├── ScoringFeedbackScreen.jsx
│   │   ├── RetryAttemptScreen.jsx
│   │   ├── PlayerDashboardScreen.jsx
│   │   ├── CoinHistoryScreen.jsx
│   │   └── other player UI screens
│   └── admin/
│       ├── AdminApp.jsx
│       ├── AdminLoginScreen.jsx
│       ├── AdminLayout.jsx
│       ├── AdminDashboardScreen.jsx
│       ├── AdminContentManagementScreen.jsx
│       ├── AdminSdgMappingScreen.jsx
│       ├── AdminScoringRubricScreen.jsx
│       ├── AdminAssetTemplateScreen.jsx
│       ├── AdminLanguageManagementScreen.jsx
│       ├── AdminPlayerAnalyticsScreen.jsx
│       ├── AdminAnalyticsScreen.jsx
│       ├── AdminReportsScreen.jsx
│       ├── adminCredentials.js
│       └── adminMockData.js
└── styles/
```

The exact folder structure may differ slightly depending on the latest update, but the project follows the same idea: player game UI files are separated from admin UI files.

---

## Installation

Clone the project or open the project folder, then install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```txt
http://localhost:5173
```

---

## Available Routes

Main app route:

```txt
/
```

Admin route:

```txt
/admin
```

For Netlify deployment, the project should redirect routes back to the React app so `/admin` works after refresh.

A typical `netlify.toml` setup:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Environment Variables

The project uses a DeepSeek service file for AI scoring. Depending on how the service is configured, you may need an environment variable such as:

```txt
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

Create a `.env` file in the root of the project if needed:

```txt
.env
```

Example:

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
```

Do not commit real API keys to GitHub.

Make sure `.gitignore` includes:

```txt
.env
```

---

## Important Game Rules

- Player must select at least 10 problem cards before starting.
- Each round shows one random problem from the selected problem stack.
- Player can select 1 to 3 AI cards.
- Player explanation must be 100 words or fewer.
- AI scoring gives a score out of 100.
- Score is converted into GLA Coin.
- Hints cost 20 GLA Coin.
- Certificate unlocks after completing 10 problem cards with an average score of 75% or higher.

---

## Sidebar Behaviour

The game sidebar works like a drawer:

- It opens when the player clicks the menu button.
- It appears above the page instead of pushing the layout.
- The background blurs when the menu is open.
- The sidebar is fixed and has its own scroll.
- The main page does not scroll while the sidebar is open.

This keeps the Play Game screen spacious and cleaner.

---

## Admin Separation

Admin screens are not shown inside the player sidebar.

The admin has a separate interface and can be accessed through:

- The Admin Login card/button on the public homepage
- The `/admin` route

This avoids showing administration features to normal players.

---

## UI-Only Limitations

The following features are currently user interface mockups only:

- Real admin authentication
- Real database storage
- Real card creation and editing
- Real image upload
- Real certificate download generation
- Real certificate verification
- Real reports export
- Real player analytics
- Real multiplayer rooms
- Real team mode communication
- Real voting persistence
- Real leaderboard persistence
- Real multilingual translation storage
- Real accessibility persistence

These can be connected to a backend later.

---

## Recommended Future Backend Work

To make this production-ready, add:

- Secure user authentication
- Role-based access control for Admin and Player
- Database tables for players, cards, attempts, scores, hints, certificates and analytics
- Admin CRUD APIs for problem cards and AI cards
- File upload API for card images and certificate templates
- Certificate PDF generation
- Certificate verification endpoint
- Analytics aggregation endpoints
- Multiplayer room and socket service
- Translation management service
- Audit logs for admin actions

---

## Common Issues

### Admin login does not work

Check that you are using the admin route or the Admin Login card:

```txt
/admin
```

Use the exact demo details:

```txt
Email: admin@gritlabafrica.org
Password: GLA-admin-2026
Access Code: GLA-ADMIN
```

Also check:

```txt
src/components/admin/adminCredentials.js
```

### Blank page after refresh on `/admin`

Add or confirm this in `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### DeepSeek scoring does not work

Check:

```txt
src/services/deepseekService.js
```

Also confirm that your `.env` file contains the needed API key and that the key starts with `VITE_` if it is accessed in the Vite front end.

### Sidebar moves while scrolling

Make sure you are using the latest `GameSidebar.jsx` and `GameHome.jsx` where the sidebar is rendered as a fixed overlay drawer.

---

## Development Notes

This project follows separation of concerns:

- `GameHome.jsx` controls the main game flow.
- Player screens are stored in `src/components/game/`.
- Admin screens are stored in `src/components/admin/`.
- Static admin credentials are stored separately in `adminCredentials.js`.
- Mock admin data is stored separately in `adminMockData.js`.
- AI card data is stored in `src/data/aiCards.js`.
- Problem cards are loaded from JSON in `src/assets/json/`.

---

## Project Status

Current status:

```txt
Front-end UI: In progress / mostly implemented
Backend: Not implemented
Admin backend: Not implemented
Multiplayer backend: Not implemented
Analytics backend: Not implemented
Production security: Not implemented
```

---

## Credits

Project: GRIT Lab Africa AI for SDGs Card Game  
Purpose: Educational AI and SDG problem-solving game for African contexts  
Developer/UI implementation: Wonderful Ngwenya and collaborators

---

## License

This project is currently for educational and demonstration purposes.
Add a proper license before public production release.
