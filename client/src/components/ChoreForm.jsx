import React, { useState } from 'react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ChoreForm({ chore, members, onSave, onDelete, onClose }) {
  const isEdit = !!chore;

  const [title, setTitle] = useState(chore?.title ?? '');
  const [description, setDescription] = useState(chore?.description ?? '');
  const [color, setColor] = useState(chore?.color ?? '#6366f1');

  const [recType, setRecType] = useState(chore?.recurrence?.type ?? 'once');
  const [startDate, setStartDate] = useState(chore?.recurrence?.startDate ?? today());
  const [endDate, setEndDate] = useState(chore?.recurrence?.endDate ?? '');
  const [daysOfWeek, setDaysOfWeek] = useState(chore?.recurrence?.daysOfWeek ?? []);
  const [dayOfMonth, setDayOfMonth] = useState(chore?.recurrence?.dayOfMonth ?? 1);

  const [assignType, setAssignType] = useState(chore?.assignment?.type ?? 'fixed');
  const [fixedMember, setFixedMember] = useState(chore?.assignment?.memberId ?? '');
  const [rotateMembers, setRotateMembers] = useState(chore?.assignment?.memberIds ?? []);

  function toggleDay(d) {
    setDaysOfWeek(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b)
    );
  }

  function toggleRotateMember(id) {
    setRotateMembers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function buildPayload() {
    const recurrence = { type: recType, startDate, endDate: endDate || null };
    if (recType === 'weekly') recurrence.daysOfWeek = daysOfWeek;
    if (recType === 'monthly') recurrence.dayOfMonth = Number(dayOfMonth);

    const assignment =
      assignType === 'fixed'
        ? { type: 'fixed', memberId: fixedMember || null }
        : { type: 'rotate', memberIds: rotateMembers };

    return { title, description, color, recurrence, assignment };
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onSave(buildPayload());
    onClose();
  }

  async function handleDelete() {
    if (!confirm('Delete this chore and all its completions?')) return;
    await onDelete();
    onClose();
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{isEdit ? 'Edit Chore' : 'Add Chore'}</h2>
        <form onSubmit={handleSave}>

          <div className="form-row">
            <label>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Clean kitchen" />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details" />
          </div>

          <div className="form-row">
            <label>Color</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 24, height: 24, borderRadius: 4, background: c, border: c === color ? '3px solid #111' : '2px solid transparent', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Recurrence</label>
            <select value={recType} onChange={e => setRecType(e.target.value)}>
              <option value="once">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-row">
            <label>Start date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>

          {recType !== 'once' && (
            <div className="form-row">
              <label>End date (optional)</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          )}

          {recType === 'weekly' && (
            <div className="form-row">
              <label>Days of week</label>
              <div className="day-checkboxes">
                {DAY_LABELS.map((label, idx) => (
                  <label key={idx} className={daysOfWeek.includes(idx) ? 'selected' : ''}>
                    <input
                      type="checkbox"
                      checked={daysOfWeek.includes(idx)}
                      onChange={() => toggleDay(idx)}
                      style={{ display: 'none' }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {recType === 'monthly' && (
            <div className="form-row">
              <label>Day of month</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={e => setDayOfMonth(e.target.value)}
              />
            </div>
          )}

          <div className="form-row">
            <label>Assignment</label>
            <select value={assignType} onChange={e => setAssignType(e.target.value)}>
              <option value="fixed">Fixed member</option>
              <option value="rotate">Auto-rotate</option>
            </select>
          </div>

          {assignType === 'fixed' && (
            <div className="form-row">
              <label>Assigned to</label>
              <select value={fixedMember} onChange={e => setFixedMember(e.target.value)}>
                <option value="">— Unassigned —</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {assignType === 'rotate' && (
            <div className="form-row">
              <label>Rotate among</label>
              {members.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No team members added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {members.map(m => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rotateMembers.includes(m.id)}
                        onChange={() => toggleRotateMember(m.id)}
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            {isEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Save' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
