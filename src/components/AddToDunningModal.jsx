import { useState } from 'react'
import { unenrolledCustomers, sequences } from '../data/mockData'
import './AddToDunningModal.css'

const formatCurrency = (n) => '$' + n.toLocaleString()
const sequenceMap = Object.fromEntries(sequences.map(s => [s.id, s]))

export default function AddToDunningModal({ onClose, onEnroll }) {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedSequence, setSelectedSequence] = useState(null)
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [step, setStep] = useState('search') // search | configure | confirm

  const filtered = unenrolledCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setSelectedSequence(customer.suggestedSequence)
    setSelectedInvoices(customer.invoices.filter(i => i.daysOverdue > 0).map(i => i.id))
    setStep('configure')
  }

  const toggleInvoice = (invId) => {
    setSelectedInvoices(prev =>
      prev.includes(invId) ? prev.filter(id => id !== invId) : [...prev, invId]
    )
  }

  const handleEnroll = () => {
    setStep('confirm')
    setTimeout(() => {
      onEnroll?.(selectedCustomer, selectedSequence, selectedInvoices)
    }, 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {step === 'search' && 'Add Customer to Dunning'}
            {step === 'configure' && 'Configure Dunning'}
            {step === 'confirm' && 'Enrollment Confirmed'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {step === 'search' && (
          <div className="modal-body">
            <div className="search-box">
              <span className="search-icon-input">🔍</span>
              <input
                type="text"
                placeholder="Search customers with overdue invoices..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="customer-search-results">
              {filtered.map(customer => (
                <button
                  key={customer.id}
                  className="customer-search-row"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="csr-main">
                    <div className="csr-name">{customer.name}</div>
                    <div className="csr-email">{customer.email}</div>
                  </div>
                  <div className="csr-stats">
                    <div className="csr-amount">{formatCurrency(customer.overdueAmount)}</div>
                    <div className="csr-label">overdue</div>
                  </div>
                  <div className="csr-stats">
                    <div className="csr-amount">{customer.invoices.filter(i => i.daysOverdue > 0).length}</div>
                    <div className="csr-label">invoice{customer.invoices.filter(i => i.daysOverdue > 0).length !== 1 ? 's' : ''}</div>
                  </div>
                  <span className="csr-arrow">→</span>
                </button>
              ))}

              {filtered.length === 0 && (
                <div className="empty-search">
                  No unenrolled customers found matching "{search}"
                </div>
              )}
            </div>

            <div className="modal-tip">
              <span className="tip-icon">✦</span>
              <span>Tip: You can also say <strong>"Add Pinnacle to dunning"</strong> in Ember to enroll customers with AI-powered recommendations.</span>
            </div>
          </div>
        )}

        {step === 'configure' && selectedCustomer && (
          <div className="modal-body">
            {/* Customer summary */}
            <div className="config-customer-header">
              <div>
                <div className="config-customer-name">{selectedCustomer.name}</div>
                <div className="config-customer-email">{selectedCustomer.email}</div>
              </div>
              <div className="config-customer-stats">
                <div className="stat-box">
                  <div className="stat-value">{formatCurrency(selectedCustomer.overdueAmount)}</div>
                  <div className="stat-label">Overdue</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{selectedCustomer.avgDaysToPay}d</div>
                  <div className="stat-label">Avg Days to Pay</div>
                </div>
              </div>
            </div>

            {/* Payment history insight */}
            <div className="payment-insight">
              <div className="insight-header">
                <span className="insight-icon">📊</span>
                <span className="insight-title">Payment History</span>
              </div>
              <p>{selectedCustomer.paymentHistory}</p>
            </div>

            {/* Sequence selection */}
            <div className="config-section">
              <label className="config-label">Dunning Sequence</label>
              <div className="sequence-options">
                {sequences.map(seq => {
                  const isRecommended = seq.id === selectedCustomer.suggestedSequence
                  const isSelected = seq.id === selectedSequence
                  return (
                    <button
                      key={seq.id}
                      className={`sequence-option ${isSelected ? 'selected' : ''}`}
                      style={isSelected ? { borderColor: seq.color, background: seq.color + '08' } : {}}
                      onClick={() => setSelectedSequence(seq.id)}
                    >
                      <div className="seq-opt-header">
                        <span className="seq-opt-dot" style={{ background: seq.color }} />
                        <span className="seq-opt-name">{seq.name}</span>
                        {isRecommended && <span className="recommended-badge">Recommended</span>}
                      </div>
                      <div className="seq-opt-detail">{seq.steps.length} steps · {seq.steps[seq.steps.length - 1].day}d max</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Invoice selection */}
            <div className="config-section">
              <label className="config-label">
                Invoices to Enroll
                <span className="config-sublabel">({selectedInvoices.length} selected)</span>
              </label>
              <div className="invoice-checklist">
                {selectedCustomer.invoices.map(inv => (
                  <label key={inv.id} className={`invoice-check-row ${inv.daysOverdue === 0 ? 'not-overdue' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(inv.id)}
                      onChange={() => toggleInvoice(inv.id)}
                    />
                    <span className="inv-check-id">{inv.id}</span>
                    <span className="inv-check-amount">{formatCurrency(inv.amount)}</span>
                    <span className="inv-check-due">Due {inv.dueDate}</span>
                    {inv.daysOverdue > 0 ? (
                      <span className={`inv-check-overdue ${inv.daysOverdue > 30 ? 'critical' : inv.daysOverdue > 14 ? 'warning' : ''}`}>
                        {inv.daysOverdue}d overdue
                      </span>
                    ) : (
                      <span className="inv-check-upcoming">Not yet due</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-back" onClick={() => { setStep('search'); setSelectedCustomer(null) }}>← Back</button>
              <button
                className="btn-enroll"
                disabled={selectedInvoices.length === 0}
                onClick={handleEnroll}
              >
                Enroll {selectedInvoices.length} Invoice{selectedInvoices.length !== 1 ? 's' : ''} in Dunning
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && selectedCustomer && (
          <div className="modal-body confirm-body">
            <div className="confirm-icon">✓</div>
            <h3>{selectedCustomer.name} enrolled in dunning</h3>
            <p>
              {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} enrolled
              in the <strong>{sequenceMap[selectedSequence]?.name}</strong> sequence.
              First reminders will be sent based on each invoice's due date.
            </p>
            <button className="btn-enroll" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
