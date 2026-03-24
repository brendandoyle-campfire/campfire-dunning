import { useState } from 'react'
import { unenrolledCustomers, sequences } from '../data/mockData'
import './EmberPanel.css'

const sequenceMap = Object.fromEntries(sequences.map(s => [s.id, s]))
const formatCurrency = (n) => '$' + n.toLocaleString()

const initialMessages = [
  {
    role: 'ember',
    content: "Hi! I'm Ember, your AR collections copilot. I can help you analyze overdue invoices, identify at-risk customers, set up dunning, and draft escalation emails. What would you like to do?",
  },
]

const riskCards = [
  { customer: 'XYZ Industries', ar: '$89,400', days: 68, risk: 'Critical', reason: 'No payment in 68 days. Collections notice sent. Email bounced on last attempt for INV-1056.' },
  { customer: 'Acme Corporation', ar: '$47,250', days: 32, risk: 'High', reason: 'INV-1042 at final notice stage. INV-1103 paused (overridden to Light Touch). Contact may be needed.' },
  { customer: 'Brainly Inc.', ar: '$56,200', days: 42, risk: 'High', reason: 'INV-1034 escalated to Aggressive sequence. No response to 6 reminders. Last payment was Jan 22.' },
]

const draftEmail = `Subject: Outstanding Balance — Action Required

Dear XYZ Industries Accounts Payable Team,

I'm reaching out personally regarding your outstanding balance of $89,400 across two invoices (INV-0987 and INV-1056).

We've sent several automated reminders over the past two months, and I wanted to connect directly to understand if there are any issues preventing payment. If there's a dispute or question about these invoices, I'd be happy to discuss.

Could we schedule a brief call this week to resolve this?

Best regards,
[Your Name]`

export default function EmberPanel({ onClose }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [enrollmentState, setEnrollmentState] = useState(null) // null | { customer, step: 'recommend' | 'confirm' | 'done', selectedSeq }

  const handleSend = (text) => {
    const msg = text || input
    if (!msg.trim()) return
    setInput('')

    setMessages((prev) => [...prev, { role: 'user', content: msg }])

    const lower = msg.toLowerCase()

    // Enrollment flow: "add X to dunning" or "set up dunning for X" or "enroll X"
    const addMatch = lower.match(/(?:add|enroll|set up dunning for|start dunning for)\s+(.+?)(?:\s+(?:to|in|for)\s+dunning)?$/i)
    if (addMatch || lower.includes('add') && lower.includes('dunning')) {
      const searchTerm = addMatch ? addMatch[1].replace(/\s*(to|in|for)\s*dunning/i, '').trim() : ''

      // Find matching unenrolled customer
      const match = unenrolledCustomers.find(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (match) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ember',
              content: `I found **${match.name}** in your customer database. Let me analyze their payment history and recommend a dunning approach.`,
              type: 'enrollment-analysis',
              customer: match,
            },
          ])
          setEnrollmentState({ customer: match, step: 'recommend', selectedSeq: match.suggestedSequence })
        }, 800)
      } else if (lower.includes('pinnacle')) {
        const pinnacle = unenrolledCustomers.find(c => c.name.includes('Pinnacle'))
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ember',
              content: `I found **Pinnacle Consulting** in your customer database. Let me analyze their payment history and recommend a dunning approach.`,
              type: 'enrollment-analysis',
              customer: pinnacle,
            },
          ])
          setEnrollmentState({ customer: pinnacle, step: 'recommend', selectedSeq: pinnacle.suggestedSequence })
        }, 800)
      } else if (lower.includes('westwood')) {
        const ww = unenrolledCustomers.find(c => c.name.includes('Westwood'))
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ember',
              content: `I found **Westwood Media Group** in your customer database. Let me analyze their payment history and recommend a dunning approach.`,
              type: 'enrollment-analysis',
              customer: ww,
            },
          ])
          setEnrollmentState({ customer: ww, step: 'recommend', selectedSeq: ww.suggestedSequence })
        }, 800)
      } else {
        // Show all unenrolled
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ember',
              content: `I found ${unenrolledCustomers.length} customers with overdue invoices not yet in dunning. Which one would you like to enroll?`,
              type: 'enrollment-list',
            },
          ])
        }, 800)
      }
      return
    }

    // "set up dunning for all" / "enroll all overdue"
    if (lower.includes('all') && (lower.includes('overdue') || lower.includes('dunning') || lower.includes('enroll'))) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ember',
            content: `I found ${unenrolledCustomers.length} customers with overdue invoices not yet in dunning. Here's my recommended plan:`,
            type: 'enrollment-bulk',
          },
        ])
      }, 800)
      return
    }

    // Risk flow
    if (lower.includes('risk') || lower.includes('at risk')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'ember', content: 'Here are your customers at highest collection risk right now:', type: 'risk' },
        ])
      }, 800)
      return
    }

    // Draft email flow
    if (lower.includes('email') || lower.includes('draft') || lower.includes('escalat')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'ember', content: "Here's a draft escalation email for XYZ Industries based on their payment history and dunning status:", type: 'draft' },
        ])
      }, 800)
      return
    }

    // Not enrolled / who's not in dunning
    if (lower.includes('not enrolled') || lower.includes('not in dunning') || lower.includes('who should') || lower.includes('missing')) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ember',
            content: `I found ${unenrolledCustomers.length} customers with overdue invoices not yet in dunning. Which one would you like to enroll?`,
            type: 'enrollment-list',
          },
        ])
      }, 800)
      return
    }

    // Fallback
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ember',
          content: "I can help with that! Try asking me things like:\n• \"Which customers are at risk?\"\n• \"Add Pinnacle Consulting to dunning\"\n• \"Who's not enrolled in dunning yet?\"\n• \"Set up dunning for all overdue customers\"\n• \"Draft an escalation email for XYZ\"",
        },
      ])
    }, 600)
  }

  const handleEnrollConfirm = () => {
    if (!enrollmentState) return
    const { customer, selectedSeq } = enrollmentState
    const seq = sequenceMap[selectedSeq]
    const overdueCount = customer.invoices.filter(i => i.daysOverdue > 0).length

    setEnrollmentState({ ...enrollmentState, step: 'done' })
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `Yes, enroll in ${seq.name}` },
      {
        role: 'ember',
        content: `Done! **${customer.name}** has been enrolled in the **${seq.name}** dunning sequence. ${overdueCount} overdue invoice${overdueCount !== 1 ? 's' : ''} will begin receiving reminders based on their due dates. First reminders go out tomorrow at 9:00 AM.`,
        type: 'enrollment-done',
      },
    ])
  }

  const handleChangeSeq = (seqId) => {
    if (!enrollmentState) return
    setEnrollmentState({ ...enrollmentState, selectedSeq: seqId })
  }

  const handlePickCustomer = (customer) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `Add ${customer.name} to dunning` },
    ])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ember',
          content: `Great choice. Let me analyze **${customer.name}**'s payment history and recommend a dunning approach.`,
          type: 'enrollment-analysis',
          customer: customer,
        },
      ])
      setEnrollmentState({ customer, step: 'recommend', selectedSeq: customer.suggestedSequence })
    }, 600)
  }

  const handleBulkEnroll = () => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: 'Enroll all with recommended sequences' },
      {
        role: 'ember',
        content: `Done! All ${unenrolledCustomers.length} customers have been enrolled in their recommended dunning sequences:\n\n• Westwood Media → Standard\n• Pinnacle Consulting → Aggressive\n• Silverline Logistics → Light Touch\n• Redstone Manufacturing → Aggressive\n\nReminders will start going out tomorrow morning. I'll flag any bounced emails or non-responses after the first cycle.`,
        type: 'enrollment-done',
      },
    ])
  }

  return (
    <div className="ember-panel">
      <div className="ember-panel-header">
        <div className="ember-panel-title">
          <span className="ember-panel-icon">✦</span>
          Ember AI
        </div>
        <button className="ember-close" onClick={onClose}>✕</button>
      </div>

      <div className="ember-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ember-msg ${msg.role}`}>
            {msg.role === 'ember' && <div className="ember-avatar">✦</div>}
            <div className="ember-msg-content">
              <div className="ember-msg-text" style={{ whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
              />

              {/* Risk cards */}
              {msg.type === 'risk' && (
                <div className="ember-risk-cards">
                  {riskCards.map((c, j) => (
                    <div key={j} className={`risk-card risk-${c.risk.toLowerCase()}`}>
                      <div className="risk-card-header">
                        <span className="risk-card-name">{c.customer}</span>
                        <span className={`risk-card-badge ${c.risk.toLowerCase()}`}>{c.risk}</span>
                      </div>
                      <div className="risk-card-stats">
                        <span>{c.ar} AR</span>
                        <span>{c.days}d overdue</span>
                      </div>
                      <div className="risk-card-reason">{c.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Draft email */}
              {msg.type === 'draft' && (
                <div className="ember-draft">
                  <div className="draft-content">{draftEmail}</div>
                  <div className="draft-actions">
                    <button className="draft-btn primary">Send via Campfire</button>
                    <button className="draft-btn">Edit Draft</button>
                    <button className="draft-btn">Copy</button>
                  </div>
                </div>
              )}

              {/* Enrollment: customer list */}
              {msg.type === 'enrollment-list' && (
                <div className="ember-enrollment-list">
                  {unenrolledCustomers.map((c) => (
                    <button key={c.id} className="enroll-list-card" onClick={() => handlePickCustomer(c)}>
                      <div className="enroll-list-main">
                        <div className="enroll-list-name">{c.name}</div>
                        <div className="enroll-list-detail">
                          {c.invoices.filter(inv => inv.daysOverdue > 0).length} overdue · {formatCurrency(c.overdueAmount)}
                        </div>
                      </div>
                      <div className="enroll-list-seq">
                        <span className="seq-mini-badge" style={{ color: sequenceMap[c.suggestedSequence]?.color }}>
                          {sequenceMap[c.suggestedSequence]?.name}
                        </span>
                      </div>
                      <span className="enroll-list-arrow">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Enrollment: bulk plan */}
              {msg.type === 'enrollment-bulk' && (
                <div className="ember-bulk-plan">
                  {unenrolledCustomers.map((c) => {
                    const seq = sequenceMap[c.suggestedSequence]
                    return (
                      <div key={c.id} className="bulk-plan-row">
                        <div className="bulk-plan-main">
                          <div className="bulk-plan-name">{c.name}</div>
                          <div className="bulk-plan-detail">
                            {formatCurrency(c.overdueAmount)} overdue · Avg {c.avgDaysToPay}d to pay
                          </div>
                        </div>
                        <span className="bulk-plan-seq" style={{ color: seq?.color, background: seq?.color + '15' }}>
                          {seq?.name}
                        </span>
                      </div>
                    )
                  })}
                  <div className="bulk-plan-actions">
                    <button className="draft-btn primary" onClick={handleBulkEnroll}>Enroll All ({unenrolledCustomers.length})</button>
                    <button className="draft-btn">Adjust Recommendations</button>
                  </div>
                </div>
              )}

              {/* Enrollment: analysis + recommendation */}
              {msg.type === 'enrollment-analysis' && msg.customer && (
                <div className="ember-enrollment-card">
                  <div className="enroll-card-header">
                    <span className="enroll-card-icon">📊</span>
                    <span>Payment Analysis</span>
                  </div>

                  <div className="enroll-analysis-grid">
                    <div className="analysis-stat">
                      <div className="analysis-stat-val">{formatCurrency(msg.customer.overdueAmount)}</div>
                      <div className="analysis-stat-label">Overdue</div>
                    </div>
                    <div className="analysis-stat">
                      <div className="analysis-stat-val">{msg.customer.invoices.filter(inv => inv.daysOverdue > 0).length}</div>
                      <div className="analysis-stat-label">Overdue Invoices</div>
                    </div>
                    <div className="analysis-stat">
                      <div className="analysis-stat-val">{msg.customer.avgDaysToPay}d</div>
                      <div className="analysis-stat-label">Avg Days to Pay</div>
                    </div>
                    <div className="analysis-stat">
                      <div className="analysis-stat-val">{msg.customer.lastPayment}</div>
                      <div className="analysis-stat-label">Last Payment</div>
                    </div>
                  </div>

                  <div className="enroll-history-note">{msg.customer.paymentHistory}</div>

                  <div className="enroll-recommendation">
                    <div className="enroll-rec-label">Recommended Sequence</div>
                    <div className="enroll-seq-options">
                      {sequences.map(seq => {
                        const isRec = seq.id === msg.customer.suggestedSequence
                        const isSel = enrollmentState?.selectedSeq === seq.id
                        return (
                          <button
                            key={seq.id}
                            className={`enroll-seq-btn ${isSel ? 'selected' : ''}`}
                            style={isSel ? { borderColor: seq.color, background: seq.color + '10' } : {}}
                            onClick={() => handleChangeSeq(seq.id)}
                          >
                            <span className="enroll-seq-dot" style={{ background: seq.color }} />
                            <span>{seq.name}</span>
                            {isRec && <span className="enroll-rec-badge">AI Pick</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="enroll-invoices">
                    <div className="enroll-inv-label">Invoices to enroll ({msg.customer.invoices.filter(i => i.daysOverdue > 0).length} overdue):</div>
                    {msg.customer.invoices.map(inv => (
                      <div key={inv.id} className={`enroll-inv-row ${inv.daysOverdue === 0 ? 'not-due' : ''}`}>
                        <span className="enroll-inv-id">{inv.id}</span>
                        <span className="enroll-inv-amount">{formatCurrency(inv.amount)}</span>
                        {inv.daysOverdue > 0
                          ? <span className={`enroll-inv-overdue ${inv.daysOverdue > 30 ? 'critical' : ''}`}>{inv.daysOverdue}d overdue</span>
                          : <span className="enroll-inv-upcoming">Not yet due</span>
                        }
                      </div>
                    ))}
                  </div>

                  {enrollmentState?.step === 'recommend' && (
                    <div className="enroll-card-actions">
                      <button className="draft-btn primary" onClick={handleEnrollConfirm}>
                        Enroll in {sequenceMap[enrollmentState.selectedSeq]?.name}
                      </button>
                      <button className="draft-btn">Skip</button>
                    </div>
                  )}
                </div>
              )}

              {/* Enrollment done */}
              {msg.type === 'enrollment-done' && (
                <div className="enroll-done-badge">
                  <span className="enroll-done-check">✓</span> Enrollment complete
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ember-suggestions">
        <button className="suggestion-chip" onClick={() => handleSend('Which customers are at risk?')}>
          Customers at risk?
        </button>
        <button className="suggestion-chip" onClick={() => handleSend('Add Pinnacle Consulting to dunning')}>
          Add customer to dunning
        </button>
        <button className="suggestion-chip" onClick={() => handleSend("Who's not enrolled in dunning yet?")}>
          Who's not enrolled?
        </button>
        <button className="suggestion-chip" onClick={() => handleSend('Set up dunning for all overdue customers')}>
          Enroll all overdue
        </button>
      </div>

      <div className="ember-input-bar">
        <input
          type="text"
          className="ember-input"
          placeholder="Ask Ember about your collections..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="ember-send" onClick={() => handleSend()}>→</button>
      </div>
    </div>
  )
}
