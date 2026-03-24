import { useState } from 'react'
import { customers, summaryMetrics, sequences } from '../data/mockData'
import './DunningDashboard.css'

const formatCurrency = (n) => '$' + n.toLocaleString()
const sequenceMap = Object.fromEntries(sequences.map(s => [s.id, s]))

function StatusBadge({ status }) {
  const colors = {
    active: { bg: '#ecfdf5', color: '#059669', label: 'Active' },
    paused: { bg: '#fffbeb', color: '#d97706', label: 'Paused' },
    escalated: { bg: '#fef2f2', color: '#dc2626', label: 'Escalated' },
  }
  const c = colors[status] || colors.active
  return (
    <span className="status-badge" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

function RiskBadge({ risk }) {
  const colors = {
    critical: { bg: '#fef2f2', color: '#dc2626' },
    high: { bg: '#fff7ed', color: '#ea580c' },
    medium: { bg: '#fffbeb', color: '#d97706' },
    low: { bg: '#ecfdf5', color: '#059669' },
  }
  const c = colors[risk] || colors.medium
  return (
    <span className="risk-badge" style={{ background: c.bg, color: c.color }}>
      {risk}
    </span>
  )
}

function SequenceBadge({ sequenceId, override }) {
  const seq = sequenceMap[sequenceId]
  if (!seq) return null
  return (
    <span className="sequence-badge" style={{ background: seq.color + '15', color: seq.color, borderColor: seq.color + '30' }}>
      {seq.name}
      {override && <span className="override-tag">Override</span>}
    </span>
  )
}

function ProgressBar({ current, max }) {
  const pct = Math.min((current / max) * 100, 100)
  const color = pct >= 80 ? '#dc2626' : pct >= 50 ? '#d97706' : '#2563eb'
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="progress-label">{current}/{max}</span>
    </div>
  )
}

function DeliveryBadge({ status }) {
  const map = {
    delivered: { color: '#059669', icon: '✓' },
    opened: { color: '#2563eb', icon: '👁' },
    bounced: { color: '#dc2626', icon: '✕' },
    pending: { color: '#d97706', icon: '◷' },
  }
  const s = map[status] || map.pending
  return (
    <span className="delivery-badge" style={{ color: s.color }}>
      {s.icon} {status}
    </span>
  )
}

function CustomerRow({ customer, onViewHistory }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className={`customer-row ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
        <td>
          <div className="expand-icon">{expanded ? '▾' : '›'}</div>
        </td>
        <td>
          <div className="customer-name">{customer.name}</div>
          <div className="customer-meta">{customer.invoiceCount} invoice{customer.invoiceCount > 1 ? 's' : ''}</div>
        </td>
        <td><StatusBadge status={customer.status} /></td>
        <td className="amount-cell">{formatCurrency(customer.totalAR)}</td>
        <td><SequenceBadge sequenceId={customer.sequence} /></td>
        <td><ProgressBar current={customer.worstStep} max={customer.maxSteps} /></td>
        <td><RiskBadge risk={customer.risk} /></td>
        <td className="date-cell">{customer.lastPayment}</td>
      </tr>
      {expanded && (
        <tr className="invoice-detail-row">
          <td colSpan={8}>
            <div className="invoice-detail-container">
              <table className="invoice-detail-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Amount Due</th>
                    <th>Days Overdue</th>
                    <th>Sequence</th>
                    <th>Step</th>
                    <th>Last Reminder</th>
                    <th>Delivery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <div className="invoice-id">{inv.id}</div>
                        {inv.partialPayment && <span className="partial-badge">Partial payment</span>}
                      </td>
                      <td className="amount-cell">
                        {formatCurrency(inv.amountDue)}
                        {inv.partialPayment && (
                          <span className="original-amount">of {formatCurrency(inv.amount)}</span>
                        )}
                      </td>
                      <td>
                        <span className={`days-overdue ${inv.daysOverdue > 30 ? 'critical' : inv.daysOverdue > 14 ? 'warning' : ''}`}>
                          {inv.daysOverdue}d
                        </span>
                      </td>
                      <td><SequenceBadge sequenceId={inv.sequence} override={inv.sequenceOverride} /></td>
                      <td>
                        <div className="step-info">
                          <ProgressBar current={inv.currentStep} max={inv.maxSteps} />
                          <span className="step-label-text">{inv.stepLabel}</span>
                        </div>
                      </td>
                      <td className="date-cell">{inv.lastReminder}</td>
                      <td><DeliveryBadge status={inv.deliveryStatus} /></td>
                      <td>
                        <div className="invoice-actions">
                          <button className="action-btn" title={inv.status === 'paused' ? 'Resume' : 'Pause'}>
                            {inv.status === 'paused' ? '▶' : '⏸'}
                          </button>
                          <button className="action-btn" title="View History" onClick={(e) => { e.stopPropagation(); onViewHistory(inv) }}>
                            📋
                          </button>
                          <button className="action-btn" title="Preview Next">
                            👁
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function DunningDashboard({ onViewHistory, onAddToDunning }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('totalAR')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = customers.filter(
    (c) => statusFilter === 'all' || c.status === statusFilter
  )

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1
    if (sortBy === 'totalAR') return (a.totalAR - b.totalAR) * dir
    if (sortBy === 'name') return a.name.localeCompare(b.name) * dir
    if (sortBy === 'risk') {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return (riskOrder[a.risk] - riskOrder[b.risk]) * dir
    }
    return 0
  })

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="sort-icon inactive">↕</span>
    return <span className="sort-icon">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="dashboard">
      {/* Summary Metrics */}
      <div className="metrics-bar">
        <div className="metric">
          <div className="metric-value">{formatCurrency(summaryMetrics.totalARInDunning)}</div>
          <div className="metric-label">Total AR in Dunning</div>
        </div>
        <div className="metric-divider" />
        <div className="metric">
          <div className="metric-value">{summaryMetrics.activeSequences}</div>
          <div className="metric-label">Active Sequences</div>
        </div>
        <div className="metric-divider" />
        <div className="metric">
          <div className="metric-value" style={{ color: 'var(--accent-red)' }}>{summaryMetrics.escalatedAccounts}</div>
          <div className="metric-label">Escalated</div>
        </div>
        <div className="metric-divider" />
        <div className="metric">
          <div className="metric-value">{summaryMetrics.avgDSO}d</div>
          <div className="metric-label">Avg DSO</div>
        </div>
        <div className="metric-divider" />
        <div className="metric">
          <div className="metric-value" style={{ color: 'var(--accent-green)' }}>{summaryMetrics.collectionRate}%</div>
          <div className="metric-label">Collection Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-pills">
          {['all', 'active', 'paused', 'escalated'].map((f) => (
            <button
              key={f}
              className={`filter-pill ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="filter-count">
                  {customers.filter((c) => c.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="add-dunning-btn" onClick={onAddToDunning}>
          + Add to Dunning
        </button>
      </div>

      {/* Customer Table */}
      <div className="table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th className="sortable" onClick={() => handleSort('name')}>Customer <SortIcon col="name" /></th>
              <th>Status</th>
              <th className="sortable amount-cell" onClick={() => handleSort('totalAR')}>AR in Dunning <SortIcon col="totalAR" /></th>
              <th>Sequence</th>
              <th>Dunning Progress</th>
              <th className="sortable" onClick={() => handleSort('risk')}>Risk <SortIcon col="risk" /></th>
              <th>Last Payment</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((customer) => (
              <CustomerRow key={customer.id} customer={customer} onViewHistory={onViewHistory} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
