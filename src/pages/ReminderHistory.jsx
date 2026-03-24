import { reminderHistory } from '../data/mockData'
import './ReminderHistory.css'

export default function ReminderHistory({ invoice }) {
  const history = invoice
    ? reminderHistory.filter((r) => r.invoice === invoice.id)
    : reminderHistory

  return (
    <div className="history-page">
      {invoice && (
        <div className="history-context">
          <span className="history-badge">{invoice.id}</span>
          <span>Showing history for this invoice</span>
        </div>
      )}

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Step</th>
              <th>Recipient</th>
              <th>Delivery</th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={i}>
                <td className="date-cell">{r.date}<br/><span className="time-sub">{r.time}</span></td>
                <td><span className="invoice-link">{r.invoice}</span></td>
                <td>{r.customer}</td>
                <td><span className="step-text">{r.step}</span></td>
                <td className="email-cell">{r.recipient}</td>
                <td>
                  <span className={`delivery-dot ${r.deliveryStatus}`}>
                    {r.deliveryStatus === 'delivered' && '✓'}
                    {r.deliveryStatus === 'opened' && '👁'}
                    {r.deliveryStatus === 'bounced' && '✕'}
                    {' '}{r.deliveryStatus}
                  </span>
                </td>
                <td className="date-cell">{r.openedAt || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <div className="history-empty">No reminder history found.</div>
      )}
    </div>
  )
}
