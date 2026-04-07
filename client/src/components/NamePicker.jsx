import React from 'react';

export default function NamePicker({ members, onPick }) {
  return (
    <div className="overlay">
      <div className="modal">
        <h2>Who are you?</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
          Select your name to get started.
        </p>
        {members.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            No team members yet. Add some on the Members page first.
          </p>
        ) : (
          <div className="name-picker-list">
            {members.map(m => (
              <button key={m.id} onClick={() => onPick(m)}>
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
