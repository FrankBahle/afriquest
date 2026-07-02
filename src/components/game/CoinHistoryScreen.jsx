import { styles } from './gameStyles'
import { ActionButton, DataTable, EmptyState, MetricCard, SectionHeader } from './ui'

function CoinHistoryScreen({ glaCoinBalance, totalGlaCoinEarned, glaCoinSpentOnHints, coinTransactions, onBackToDashboard }) {
  return (
    <div style={styles.panel}>
      <SectionHeader eyebrow="GLA coin transaction history" title="Your GLA coin wallet.">
        This screen tracks coin earned from scoring and coin spent on hints.
      </SectionHeader>
      <div style={styles.metricGrid}>
        <MetricCard title="Current Balance" value={glaCoinBalance} />
        <MetricCard title="Total Earned" value={totalGlaCoinEarned} />
        <MetricCard title="Spent on Hints" value={glaCoinSpentOnHints} />
        <MetricCard title="Transactions" value={coinTransactions.length} />
      </div>
      <div style={{ ...styles.smallCard, marginTop: '22px' }}>
        <p style={styles.eyebrow}>Transaction list</p>
        {coinTransactions.length === 0 ? <EmptyState title="No coin movement yet">Submit a scored solution to earn GLA coin, or request a hint to spend 20 GLA coin.</EmptyState> : (
          <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'reason', label: 'Reason' },
              { key: 'problemTitle', label: 'Problem' },
              { key: 'amount', label: 'Amount', render: (row) => `${row.type === 'earned' ? '+' : '-'}${row.amount}` },
              { key: 'balanceAfter', label: 'Balance After' },
              { key: 'createdAt', label: 'Date' }
            ]}
            rows={coinTransactions}
          />
        )}
      </div>
      <div style={styles.centerButtonRow}><ActionButton onClick={onBackToDashboard}>Back to Dashboard</ActionButton></div>
    </div>
  )
}

export default CoinHistoryScreen
