import { useState } from 'react'
import './Sidebar.css'

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'reporting', label: 'Reporting', icon: '📊', hasSubmenu: true },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: '💳',
    hasSubmenu: true,
    children: [
      { id: 'rev-dashboard', label: 'Dashboard' },
      { id: 'contracts', label: 'Contracts' },
      { id: 'customers', label: 'Customers' },
      { id: 'transactions', label: 'Transactions' },
      { id: 'dunning', label: 'Dunning' },
    ],
  },
  { id: 'accounting', label: 'Accounting', icon: '📒', hasSubmenu: true },
  { id: 'cash-management', label: 'Cash Management', icon: '🏦', hasSubmenu: true },
  { id: 'close-management', label: 'Close Management', icon: '📋', hasSubmenu: true },
  { id: 'approvals', label: 'Approvals', icon: '✅' },
  { id: 'ember', label: 'Ember AI', icon: '✦', hasSubmenu: true },
]

export default function Sidebar({ currentPage, onNavigate }) {
  const [expandedSections, setExpandedSections] = useState(['revenue'])

  const toggleSection = (id) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const isActive = (id) => {
    if (id === 'dunning') return currentPage === 'dunning'
    return currentPage === id
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 8c2-4 6-6 8-4s0 6-2 10c4-2 8-2 10 0s-2 6-6 8" stroke="#e87a2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
        <span className="logo-text">campfire</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div key={item.id}>
            <button
              className={`nav-item ${isActive(item.id) ? 'active' : ''} ${expandedSections.includes(item.id) ? 'expanded' : ''}`}
              onClick={() => {
                if (item.children) {
                  toggleSection(item.id)
                } else {
                  onNavigate(item.id)
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.hasSubmenu && (
                <span className="nav-chevron">{expandedSections.includes(item.id) ? '▾' : '›'}</span>
              )}
            </button>

            {item.children && expandedSections.includes(item.id) && (
              <div className="nav-children">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    className={`nav-child ${isActive(child.id) ? 'active' : ''}`}
                    onClick={() => onNavigate(child.id)}
                  >
                    {child.label}
                    {child.id === 'dunning' && <span className="nav-badge-new">New</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
