import React, { useState } from 'react';
import { api } from '../api.js';

export default function MembersPanel({ members, onRefresh }) {
  const [name, setName] = useState('');

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.members.add(name.trim());
    setName('');
    onRefresh();
  }

  async function remove(id) {
    if (!confirm('Remove this member?')) return;
    await api.members.remove(id);
    onRefresh();
  }

  return (
    <div className="members-panel">
      <h2>Team Members</h2>
      <ul className="member-list">
        {members.map(m => (
          <li key={m.id} className="member-item">
            <span>{m.name}</span>
            <button className="btn btn-danger" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }} onClick={() => remove(m.id)}>
              Remove
            </button>
          </li>
        ))}
        {members.length === 0 && (
          <li style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '0.4rem 0' }}>No members yet.</li>
        )}
      </ul>
      <form className="add-member-row" onSubmit={add}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New member name"
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
    </div>
  );
}
