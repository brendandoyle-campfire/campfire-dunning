import { useState } from 'react'
import { sequences, customers } from '../data/mockData'
import './DunningSequenceConfig.css'

// Sample drafted templates keyed by template name
const draftedTemplates = {
  'Friendly Reminder': {
    subject: 'Friendly reminder: Invoice {{invoice_number}} due {{due_date}}',
    body: `Hi {{customer_name}},

Just a quick heads-up that invoice {{invoice_number}} for {{amount_due}} is coming due on {{due_date}}.

You can pay securely online using the link below:
{{payment_link}}

If you've already sent payment, please disregard this message.

Thanks,
{{company_name}}`,
  },
  'Payment Due Today': {
    subject: 'Payment due today: Invoice {{invoice_number}}',
    body: `Hi {{customer_name}},

This is a reminder that invoice {{invoice_number}} for {{amount_due}} is due today ({{due_date}}).

To avoid any late fees, please submit payment at your earliest convenience:
{{payment_link}}

If you have any questions about this invoice, please don't hesitate to reach out.

Best regards,
{{company_name}}`,
  },
}

function StepDrawer({ step, stepIndex, sequenceName, sequenceColor, onClose }) {
  const [mode, setMode] = useState('view') // view | drafting | drafted
  const [draftedContent, setDraftedContent] = useState(null)

  const existingDraft = draftedTemplates[step.template]

  const handleAskEmber = () => {
    setMode('drafting')
    // Simulate Ember generating the template
    setTimeout(() => {
      setDraftedContent({
        subject: `${step.template}: Invoice {{invoice_number}} — {{amount_due}}`,
        body: `Hi {{customer_name}},

${step.day < 0
  ? `This is a courtesy reminder that invoice {{invoice_number}} for {{amount_due}} will be due on {{due_date}}.`
  : step.day === 0
    ? `Invoice {{invoice_number}} for {{amount_due}} is due today.`
    : step.day <= 14
      ? `Invoice {{invoice_number}} for {{amount_due}} was due on {{due_date}} and is now ${step.day} days overdue. We'd appreciate your prompt attention to this balance.`
      : `We've reached out several times regarding invoice {{invoice_number}} for {{amount_due}}, which is now significantly overdue. Please arrange payment as soon as possible to avoid further action.`
}

${step.includePayLink ? 'Pay securely online:\n{{payment_link}}\n' : ''}Please contact us if you have any questions or if there are circumstances we should be aware of.

Regards,
{{company_name}}`
      })
      setMode('drafted')
    }, 1200)
  }

  return (
    <div className="step-drawer-overlay" onClick={onClose}>
      <div className="step-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">Step {stepIndex + 1}: {step.template}</div>
            <div className="drawer-subtitle">{step.label} · {sequenceName} sequence</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Step config */}
          <div className="drawer-section">
            <div className="drawer-field">
              <label>Template Name</label>
              <input type="text" defaultValue={step.template} className="config-input" />
            </div>
            <div className="drawer-field-row">
              <div className="drawer-field">
                <label>Day Offset</label>
                <input type="number" defaultValue={step.day} className="config-input" style={{ width: 80 }} />
              </div>
              <div className="drawer-field">
                <label>Payment Link</label>
                <select defaultValue={step.includePayLink ? 'yes' : 'no'} className="config-input">
                  <option value="yes">Include</option>
                  <option value="no">Don't include</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Template */}
          <div className="drawer-section">
            <div className="drawer-section-header">
              <h4>Email Template</h4>
              {!existingDraft && mode === 'view' && (
                <span className="no-template-badge">No template yet</span>
              )}
            </div>

            {/* Existing template */}
            {existingDraft && mode === 'view' && (
              <div className="template-preview">
                <div className="template-subject">
                  <span className="template-label">Subject:</span>
                  {existingDraft.subject}
                </div>
                <div className="template-body">{existingDraft.body}</div>
                <div className="template-actions">
                  <button className="btn-secondary">Edit Manually</button>
                  <button className="btn-ember-draft" onClick={handleAskEmber}>
                    <span>✦</span> Ask Ember to Rewrite
                  </button>
                </div>
              </div>
            )}

            {/* No template yet — prompt to use Ember */}
            {!existingDraft && mode === 'view' && (
              <div className="ember-template-prompt">
                <div className="ember-prompt-icon">✦</div>
                <div className="ember-prompt-content">
                  <div className="ember-prompt-title">Let Ember draft this template</div>
                  <p>Ember can generate email copy tailored to this step's position in the dunning sequence — adjusting tone, urgency, and content based on how overdue the invoice is.</p>
                  <div className="ember-prompt-actions">
                    <button className="btn-ember-draft" onClick={handleAskEmber}>
                      <span>✦</span> Draft with Ember
                    </button>
                    <button className="btn-secondary">Write Manually</button>
                  </div>
                </div>
              </div>
            )}

            {/* Ember is drafting */}
            {mode === 'drafting' && (
              <div className="ember-drafting">
                <div className="drafting-spinner" />
                <div className="drafting-text">
                  Ember is drafting your email template...
                  <span className="drafting-detail">Analyzing sequence position, tone, and urgency level</span>
                </div>
              </div>
            )}

            {/* Ember has drafted */}
            {mode === 'drafted' && draftedContent && (
              <div className="ember-drafted">
                <div className="drafted-header">
                  <span className="drafted-icon">✦</span>
                  <span>Ember Draft</span>
                  <span className="drafted-badge">AI Generated</span>
                </div>
                <div className="template-preview">
                  <div className="template-subject">
                    <span className="template-label">Subject:</span>
                    {draftedContent.subject}
                  </div>
                  <div className="template-body">{draftedContent.body}</div>
                  <div className="template-actions">
                    <button className="btn-enroll-action">Use This Template</button>
                    <button className="btn-secondary" onClick={() => { setMode('view'); setDraftedContent(null) }}>Edit</button>
                    <button className="btn-ember-draft" onClick={handleAskEmber}>
                      <span>✦</span> Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Merge fields reference */}
          <div className="drawer-section">
            <div className="drawer-section-header">
              <h4>Available Merge Fields</h4>
            </div>
            <div className="merge-fields">
              {['{{customer_name}}', '{{invoice_number}}', '{{amount_due}}', '{{due_date}}', '{{days_overdue}}', '{{payment_link}}', '{{company_name}}', '{{contact_name}}'].map(f => (
                <span key={f} className="merge-field-tag">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const colorOptions = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Green', value: '#059669' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Teal', value: '#0d9488' },
]

const emberSequencePresets = {
  'Net 30 B2B': [
    { day: -5, label: '5 days before due', template: 'Upcoming Payment Reminder', includePayLink: true },
    { day: 0, label: 'Due date', template: 'Payment Due Today', includePayLink: true },
    { day: 7, label: '7 days overdue', template: 'First Follow-up', includePayLink: true },
    { day: 14, label: '14 days overdue', template: 'Second Follow-up', includePayLink: true },
    { day: 30, label: '30 days overdue', template: 'Formal Past Due Notice', includePayLink: true },
    { day: 45, label: '45 days overdue', template: 'Final Notice Before Escalation', includePayLink: false },
  ],
  'High-value accounts': [
    { day: -7, label: '7 days before due', template: 'Courtesy Reminder', includePayLink: true },
    { day: 0, label: 'Due date', template: 'Payment Due Today', includePayLink: true },
    { day: 5, label: '5 days overdue', template: 'Personal Check-in', includePayLink: true },
    { day: 14, label: '14 days overdue', template: 'Account Review Request', includePayLink: true },
    { day: 30, label: '30 days overdue', template: 'Escalation to Account Manager', includePayLink: false },
  ],
  'Quick collections': [
    { day: 0, label: 'Due date', template: 'Payment Due', includePayLink: true },
    { day: 3, label: '3 days overdue', template: 'Quick Reminder', includePayLink: true },
    { day: 7, label: '7 days overdue', template: 'Overdue Notice', includePayLink: true },
    { day: 14, label: '14 days overdue', template: 'Final Notice', includePayLink: false },
  ],
}

function NewSequenceDrawer({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#7c3aed')
  const [mode, setMode] = useState('choose') // choose | ember-picking | ember-generating | ember-done | manual
  const [generatedSteps, setGeneratedSteps] = useState(null)
  const [selectedPreset, setSelectedPreset] = useState(null)

  const handleEmberGenerate = (presetKey) => {
    setSelectedPreset(presetKey)
    setMode('ember-generating')
    setTimeout(() => {
      setGeneratedSteps(emberSequencePresets[presetKey])
      setMode('ember-done')
    }, 1500)
  }

  const handleCreate = () => {
    onCreate?.({ name, color, steps: generatedSteps || [] })
    onClose()
  }

  return (
    <div className="step-drawer-overlay" onClick={onClose}>
      <div className="step-drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">New Dunning Sequence</div>
            <div className="drawer-subtitle">Create a custom reminder sequence</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-body">
          {/* Name & Color */}
          <div className="drawer-section">
            <div className="drawer-field">
              <label>Sequence Name</label>
              <input
                type="text"
                placeholder="e.g., Enterprise, Small Business, Disputed..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="config-input"
                style={{ maxWidth: '100%' }}
                autoFocus
              />
            </div>
            <div className="drawer-field">
              <label>Color</label>
              <div className="color-picker">
                {colorOptions.map(c => (
                  <button
                    key={c.value}
                    className={`color-swatch ${color === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Choose how to build */}
          {mode === 'choose' && (
            <div className="drawer-section">
              <div className="drawer-section-header">
                <h4>Build Your Sequence</h4>
              </div>

              <div className="build-options">
                <button className="build-option ember-option" onClick={() => setMode('ember-picking')}>
                  <div className="build-option-icon">✦</div>
                  <div className="build-option-content">
                    <div className="build-option-title">Build with Ember</div>
                    <p>Ember will generate a complete sequence with steps and email templates based on your use case.</p>
                  </div>
                </button>

                <button className="build-option" onClick={() => setMode('manual')}>
                  <div className="build-option-icon manual-icon">+</div>
                  <div className="build-option-content">
                    <div className="build-option-title">Build Manually</div>
                    <p>Add steps one by one and configure each reminder yourself.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Ember: pick a use case */}
          {mode === 'ember-picking' && (
            <div className="drawer-section">
              <div className="drawer-section-header">
                <h4>What kind of sequence do you need?</h4>
              </div>
              <div className="ember-presets">
                {Object.entries(emberSequencePresets).map(([key, steps]) => (
                  <button key={key} className="preset-card" onClick={() => handleEmberGenerate(key)}>
                    <div className="preset-name">{key}</div>
                    <div className="preset-detail">{steps.length} steps · {steps[0].day}d to +{steps[steps.length-1].day}d</div>
                  </button>
                ))}
                <button className="preset-card custom-preset" onClick={() => handleEmberGenerate('Net 30 B2B')}>
                  <div className="preset-name">Custom</div>
                  <div className="preset-detail">Describe your needs and Ember will design a sequence</div>
                </button>
              </div>
            </div>
          )}

          {/* Ember: generating */}
          {mode === 'ember-generating' && (
            <div className="drawer-section">
              <div className="ember-drafting">
                <div className="drafting-spinner" />
                <div className="drafting-text">
                  Ember is building your "{selectedPreset}" sequence...
                  <span className="drafting-detail">Generating steps, timing, and email templates</span>
                </div>
              </div>
            </div>
          )}

          {/* Ember: done — show generated steps */}
          {mode === 'ember-done' && generatedSteps && (
            <div className="drawer-section">
              <div className="drafted-header" style={{ borderRadius: '8px 8px 0 0' }}>
                <span className="drafted-icon">✦</span>
                <span>Ember Generated Sequence</span>
                <span className="drafted-badge">AI Generated</span>
              </div>
              <div className="generated-steps-list">
                {generatedSteps.map((step, i) => (
                  <div key={i} className="generated-step-row">
                    <div className="gen-step-dot" style={{ background: color }} />
                    <div className="gen-step-main">
                      <div className="gen-step-name">Step {i + 1}: {step.template}</div>
                      <div className="gen-step-detail">
                        {step.label} · Payment link {step.includePayLink ? 'included' : 'not included'}
                      </div>
                    </div>
                    <span className="template-status-badge needs-template">
                      <span className="ember-mini-icon">✦</span> Draft email
                    </span>
                  </div>
                ))}
              </div>
              <div className="generated-steps-footer">
                <button
                  className="btn-enroll-action"
                  disabled={!name.trim()}
                  onClick={handleCreate}
                >
                  {name.trim() ? `Create "${name}" Sequence` : 'Enter a name to create'}
                </button>
                <button className="btn-ember-draft" onClick={() => setMode('ember-picking')}>
                  <span>✦</span> Try Different
                </button>
              </div>
            </div>
          )}

          {/* Manual mode */}
          {mode === 'manual' && (
            <div className="drawer-section">
              <div className="drawer-section-header">
                <h4>Steps</h4>
              </div>
              <div className="manual-empty">
                <p>No steps added yet. Add your first reminder step to get started.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary">+ Add Step</button>
                  <button className="btn-ember-draft" onClick={() => setMode('ember-picking')}>
                    <span>✦</span> Or let Ember build it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DunningSequenceConfig() {
  const [activeSeq, setActiveSeq] = useState('standard')
  const [openStep, setOpenStep] = useState(null) // { step, index }
  const [showNewSeq, setShowNewSeq] = useState(false)
  const seq = sequences.find((s) => s.id === activeSeq)
  const assignedCustomers = customers.filter(c => c.sequence === activeSeq)

  return (
    <div className="sequence-config">
      {/* Stripe Warning */}
      <div className="stripe-warning">
        <span className="warning-icon">⚠️</span>
        <div>
          <strong>Stripe Invoice Reminders Detected</strong>
          <p>Your Stripe connection has invoice reminders enabled. Disable them in Stripe to avoid sending duplicate reminder emails to customers.</p>
        </div>
        <button className="warning-dismiss">Dismiss</button>
      </div>

      {/* Sequence Tabs */}
      <div className="sequence-tabs">
        {sequences.map((s) => {
          const count = customers.filter(c => c.sequence === s.id).length
          return (
            <button
              key={s.id}
              className={`sequence-tab ${activeSeq === s.id ? 'active' : ''}`}
              onClick={() => setActiveSeq(s.id)}
              style={activeSeq === s.id ? { borderBottomColor: s.color } : undefined}
            >
              <span className="seq-dot" style={{ background: s.color }} />
              {s.name}
              <span className="seq-count">{count}</span>
            </button>
          )
        })}
        <button className="sequence-tab add-tab" onClick={() => setShowNewSeq(true)}>+ New Sequence</button>
      </div>

      <div className="sequence-body">
        {/* Timeline */}
        <div className="sequence-section">
          <div className="section-header">
            <h3>Reminder Steps</h3>
            <button className="btn-secondary">+ Add Step</button>
          </div>

          <div className="timeline">
            {seq.steps.map((step, i) => {
              const hasDraft = !!draftedTemplates[step.template]
              return (
                <div key={i} className="timeline-step">
                  <div className="timeline-line">
                    <div className="timeline-dot" style={{ background: seq.color }} />
                    {i < seq.steps.length - 1 && <div className="timeline-connector" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="step-number">Step {i + 1}</span>
                      <span className="step-timing">{step.label}</span>
                    </div>
                    <div
                      className="step-card clickable"
                      onClick={() => setOpenStep({ step, index: i })}
                    >
                      <div className="step-card-row">
                        <span className="step-field-label">Template</span>
                        <span className="step-field-value">{step.template}</span>
                        {hasDraft
                          ? <span className="template-status-badge has-template">Template ready</span>
                          : <span className="template-status-badge needs-template">
                              <span className="ember-mini-icon">✦</span> Draft with Ember
                            </span>
                        }
                      </div>
                      <div className="step-card-row">
                        <span className="step-field-label">Payment Link</span>
                        <span className={`step-field-value ${step.includePayLink ? 'enabled' : 'disabled'}`}>
                          {step.includePayLink ? '✓ Included' : '✕ Not included'}
                        </span>
                      </div>
                      <div className="step-card-row">
                        <span className="step-field-label">Day offset</span>
                        <span className="step-field-value">{step.day > 0 ? `+${step.day}` : step.day} days from due</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assigned Customers */}
        <div className="sequence-section">
          <div className="section-header">
            <h3>Assigned Customers ({assignedCustomers.length})</h3>
            <button className="btn-secondary">+ Assign Customer</button>
          </div>
          <div className="assigned-list">
            {assignedCustomers.map(c => (
              <div key={c.id} className="assigned-customer">
                <div className="assigned-name">{c.name}</div>
                <div className="assigned-meta">
                  {c.invoiceCount} invoice{c.invoiceCount > 1 ? 's' : ''} · ${c.totalAR.toLocaleString()} AR
                </div>
                <button className="btn-ghost">Reassign</button>
              </div>
            ))}
            {assignedCustomers.length === 0 && (
              <div className="empty-state">No customers assigned to this sequence.</div>
            )}
          </div>
        </div>

        {/* Email Config */}
        <div className="sequence-section">
          <div className="section-header">
            <h3>Email Configuration</h3>
          </div>
          <div className="email-config">
            <div className="config-row">
              <label>From Address</label>
              <input type="text" value="billing@yourdomain.com" readOnly className="config-input" />
            </div>
            <div className="config-row">
              <label>CC Recipients</label>
              <input type="text" placeholder="e.g., ar-team@yourdomain.com" className="config-input" />
            </div>
            <div className="config-row">
              <label>Reply-To</label>
              <input type="text" value="billing@yourdomain.com" readOnly className="config-input" />
            </div>
            <div className="config-row">
              <label>Send Time</label>
              <select className="config-input">
                <option>9:00 AM (Entity timezone)</option>
                <option>10:00 AM (Entity timezone)</option>
                <option>8:00 AM (Entity timezone)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Step Drawer */}
      {openStep && (
        <StepDrawer
          step={openStep.step}
          stepIndex={openStep.index}
          sequenceName={seq.name}
          sequenceColor={seq.color}
          onClose={() => setOpenStep(null)}
        />
      )}

      {/* New Sequence Drawer */}
      {showNewSeq && (
        <NewSequenceDrawer
          onClose={() => setShowNewSeq(false)}
          onCreate={(seq) => console.log('Created sequence:', seq)}
        />
      )}
    </div>
  )
}
