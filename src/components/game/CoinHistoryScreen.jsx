function CoinHistoryScreen({
  glaCoinBalance,
  totalGlaCoinEarned,
  glaCoinSpentOnHints,
  coinTransactions,
  onBackToDashboard
}) {
  return (
    <div style={panelStyle}>
      <p style={eyebrowStyle}>GLA coin transaction history</p>

      <h1 style={sectionTitleStyle}>Your GLA coin wallet.</h1>

      <p style={paragraphStyle}>
        This screen tracks the coin you earned from DeepSeek scoring and the coin
        you spent on hints.
      </p>

      <div style={metricGridStyle}>
        <MetricCard title="Current Balance" value={glaCoinBalance} />
        <MetricCard title="Total Earned" value={totalGlaCoinEarned} />
        <MetricCard title="Spent on Hints" value={glaCoinSpentOnHints} />
        <MetricCard title="Transactions" value={coinTransactions.length} />
      </div>

      <h2 style={subHeadingStyle}>Transaction list</h2>

      {coinTransactions.length === 0 ? (
        <div style={smallCardStyle}>
          <h3 style={smallCardTitleStyle}>No coin movement yet</h3>
          <p style={smallCardTextStyle}>
            Submit a scored solution to earn GLA coin, or request a hint to spend
            20 GLA coin.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {coinTransactions.map((transaction) => {
            const isEarned = transaction.type === 'earned'

            return (
              <div key={transaction.id} style={smallCardStyle}>
                <div style={rowBetweenStyle}>
                  <div>
                    <p style={eyebrowStyle}>
                      {isEarned ? 'Coin earned' : 'Coin spent'}
                    </p>
                    <h3 style={smallCardTitleStyle}>{transaction.reason}</h3>
                  </div>

                  <strong
                    style={{
                      ...coinBadgeStyle,
                      background: isEarned
                        ? 'rgba(21, 128, 61, 0.12)'
                        : 'rgba(185, 28, 28, 0.1)',
                      color: isEarned ? '#166534' : '#991b1b'
                    }}
                  >
                    {isEarned ? '+' : '-'}
                    {transaction.amount} GLA
                  </strong>
                </div>

                <p style={smallCardTextStyle}>
                  Problem: {transaction.problemTitle || 'General game activity'}
                </p>

                <p style={dateTextStyle}>
                  Balance after transaction: {transaction.balanceAfter} GLA coin
                </p>

                <p style={dateTextStyle}>Date: {transaction.createdAt}</p>
              </div>
            )
          })}
        </div>
      )}

      <div style={centerButtonRowStyle}>
        <button onClick={onBackToDashboard} style={primaryButtonStyle}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

function MetricCard({ title, value }) {
  return (
    <div style={metricCardStyle}>
      <strong style={{ display: 'block', color: '#5c3512', fontSize: '1.7rem' }}>
        {value}
      </strong>
      <span style={{ color: '#6b5540', fontSize: '0.9rem', fontWeight: '650' }}>
        {title}
      </span>
    </div>
  )
}

const panelStyle = {
  padding: '36px',
  borderRadius: '34px',
  background:
    'linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(232, 214, 170, 0.68))',
  border: '1px solid rgba(139, 92, 40, 0.22)',
  boxShadow: '0 30px 80px rgba(80, 52, 20, 0.18)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)'
}

const eyebrowStyle = {
  margin: '0 0 10px',
  color: '#9a6a22',
  fontSize: '0.74rem',
  fontWeight: '850',
  letterSpacing: '0.14em',
  textTransform: 'uppercase'
}

const sectionTitleStyle = {
  margin: '0 0 18px',
  color: '#4b2b10',
  fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
  lineHeight: '1',
  letterSpacing: '-0.06em',
  fontWeight: '900'
}

const paragraphStyle = {
  margin: '0',
  color: '#5c4632',
  fontSize: '1rem',
  lineHeight: '1.7'
}

const metricGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '12px',
  marginTop: '18px'
}

const metricCardStyle = {
  padding: '18px',
  borderRadius: '22px',
  background: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(139, 92, 40, 0.16)'
}

const subHeadingStyle = {
  margin: '34px 0 16px',
  color: '#5c3512',
  fontSize: '1.6rem'
}

const smallCardStyle = {
  padding: '20px',
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.66)',
  border: '1px solid rgba(139, 92, 40, 0.18)',
  boxShadow: '0 14px 34px rgba(80, 52, 20, 0.1)'
}

const smallCardTitleStyle = {
  margin: '0 0 10px',
  color: '#5c3512',
  fontSize: '1.2rem',
  lineHeight: '1.2',
  letterSpacing: '-0.035em'
}

const smallCardTextStyle = {
  margin: '0',
  color: '#5c4632',
  lineHeight: '1.6',
  fontSize: '0.94rem'
}

const rowBetweenStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap'
}

const coinBadgeStyle = {
  height: 'fit-content',
  padding: '10px 14px',
  borderRadius: '999px',
  fontWeight: '900'
}

const dateTextStyle = {
  margin: '10px 0 0',
  color: '#6b5540',
  fontSize: '0.85rem'
}

const centerButtonRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '26px'
}

const primaryButtonStyle = {
  border: '0',
  borderRadius: '999px',
  padding: '13px 24px',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #9a6a22, #5c3512)',
  color: '#fff8eb',
  fontWeight: '850',
  fontSize: '0.95rem',
  boxShadow: '0 14px 30px rgba(92, 53, 18, 0.22)'
}

export default CoinHistoryScreen