import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DunningDashboard from './pages/DunningDashboard'
import DunningSequenceConfig from './pages/DunningSequenceConfig'
import ReminderHistory from './pages/ReminderHistory'
import EmberPanel from './components/EmberPanel'
import AddToDunningModal from './components/AddToDunningModal'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dunning')
  const [dunningTab, setDunningTab] = useState('dashboard')
  const [showEmber, setShowEmber] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const handleViewHistory = (invoice) => {
    setSelectedInvoice(invoice)
    setDunningTab('history')
  }

  const handleEnroll = (customer, sequence, invoices) => {
    // In a real app this would hit the API
    console.log('Enrolled:', customer.name, sequence, invoices)
  }

  const renderPage = () => {
    if (currentPage === 'home') {
      return (
        <div className="dunning-page">
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-icon">🏠</span>
              <span className="breadcrumb-sep">{'>'}</span>
              <span className="breadcrumb-current">Home</span>
            </div>
            <div className="page-header-right">
              <button className="search-btn">🔍 Search</button>
            </div>
          </div>
          <div style={{ padding: '40px 32px' }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Welcome,</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32 }}>Your current summary for Brendan - Demo</p>
            <div style={{ display: 'grid', gap: 16, maxWidth: 700 }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>29</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Uncategorized Transactions</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>16</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Overdue Receivables</div>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>1</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Overdue Payable</div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (currentPage !== 'dunning') {
      return (
        <div className="dunning-page">
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-icon">🏠</span>
              <span className="breadcrumb-sep">{'>'}</span>
              <span className="breadcrumb-current">{currentPage.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </div>
            <div className="page-header-right">
              <button className="search-btn">🔍 Search</button>
            </div>
          </div>
          <div className="placeholder-page">
            <p className="placeholder-text">Select <strong>Dunning</strong> from the Revenue menu to view the prototype.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="dunning-page">
        <div className="page-header">
          <div className="breadcrumb">
            <span className="breadcrumb-icon">🏠</span>
            <span className="breadcrumb-sep">{'>'}</span>
            <span>Revenue</span>
            <span className="breadcrumb-sep">{'>'}</span>
            <span className="breadcrumb-current">Dunning</span>
          </div>
          <div className="page-header-right">
            <button className="search-btn">🔍 Search</button>
          </div>
        </div>

        <div className="dunning-content">
          <div className="dunning-tabs">
            <button
              className={`dunning-tab ${dunningTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setDunningTab('dashboard')}
            >
              Collections Dashboard
            </button>
            <button
              className={`dunning-tab ${dunningTab === 'sequences' ? 'active' : ''}`}
              onClick={() => setDunningTab('sequences')}
            >
              Dunning Sequences
            </button>
            <button
              className={`dunning-tab ${dunningTab === 'history' ? 'active' : ''}`}
              onClick={() => setDunningTab('history')}
            >
              Reminder History
            </button>
            <div className="dunning-tabs-right">
              <button className="ember-btn" onClick={() => setShowEmber(!showEmber)}>
                <span className="ember-icon">✦</span> Ask Ember
              </button>
            </div>
          </div>

          <div className="dunning-tab-content">
            {dunningTab === 'dashboard' && (
              <DunningDashboard
                onViewHistory={handleViewHistory}
                onAddToDunning={() => setShowAddModal(true)}
              />
            )}
            {dunningTab === 'sequences' && <DunningSequenceConfig />}
            {dunningTab === 'history' && <ReminderHistory invoice={selectedInvoice} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
      {showEmber && <EmberPanel onClose={() => setShowEmber(false)} />}
      {showAddModal && (
        <AddToDunningModal
          onClose={() => setShowAddModal(false)}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  )
}

export default App
