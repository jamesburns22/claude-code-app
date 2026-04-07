import React, { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { api } from '../api.js';

export default function EventPopover({ event, members, currentUser, position, onClose, onRefresh, onEdit }) {
  const ref = useRef();
  const { chore, completion, date, assignedMemberId } = event.resource;

  const assignedMember = members.find(m => m.id === assignedMemberId);
  const completedBy = completion ? members.find(m => m.id === completion.completedBy) : null;

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  async function markDone() {
    await api.completions.add({
      choreId: chore.id,
      occurrenceDate: date,
      completedBy: currentUser?.id ?? null,
    });
    onRefresh();
    onClose();
  }

  async function undone() {
    await api.completions.remove(completion.id);
    onRefresh();
    onClose();
  }

  const style = {
    top: Math.min(position.y, window.innerHeight - 260),
    left: Math.min(position.x, window.innerWidth - 280),
  };

  return (
    <div className="popover" ref={ref} style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3>
          <span
            className="color-swatch"
            style={{ background: chore.color }}
          />
          {chore.title}
        </h3>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#9ca3af', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      <div className="meta">
        <div>{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</div>
        {assignedMember && <div>Assigned: {assignedMember.name}</div>}
        {chore.description && <div style={{ marginTop: '0.3rem' }}>{chore.description}</div>}
        {completion && (
          <div style={{ marginTop: '0.4rem', color: '#22c55e' }}>
            ✓ Done{completedBy ? ` by ${completedBy.name}` : ''}
            {' · '}{format(parseISO(completion.completedAt), 'h:mm a')}
          </div>
        )}
      </div>

      <div className="popover-actions">
        {completion ? (
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={undone}>Undo</button>
        ) : (
          <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={markDone}>Mark done</button>
        )}
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => { onClose(); onEdit(chore); }}>
          Edit chore
        </button>
      </div>
    </div>
  );
}
