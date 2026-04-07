import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { api } from './api.js';
import CalendarView from './components/CalendarView.jsx';
import ChoreForm from './components/ChoreForm.jsx';
import MembersPanel from './components/MembersPanel.jsx';
import NamePicker from './components/NamePicker.jsx';
import EventPopover from './components/EventPopover.jsx';

function getRangeForMonth(date) {
  const start = startOfMonth(date);
  const end = endOfMonth(addMonths(date, 0));
  // Expand slightly so week view at month boundaries works
  const s = new Date(start);
  s.setDate(s.getDate() - 7);
  const e = new Date(end);
  e.setDate(e.getDate() + 7);
  return [format(s, 'yyyy-MM-dd'), format(e, 'yyyy-MM-dd')];
}

export default function App() {
  const [page, setPage] = useState('calendar'); // 'calendar' | 'members'
  const [members, setMembers] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
  });
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [choreForm, setChoreForm] = useState(null); // null | { chore?: object }
  const [popover, setPopover] = useState(null); // { event, position }
  const [range, setRange] = useState(() => getRangeForMonth(new Date()));

  const loadMembers = useCallback(async () => {
    const data = await api.members.list();
    setMembers(data);
  }, []);

  const loadOccurrences = useCallback(async () => {
    const [start, end] = range;
    const data = await api.occurrences.list(start, end);
    setOccurrences(data);
  }, [range]);

  useEffect(() => { loadMembers(); }, [loadMembers]);
  useEffect(() => { loadOccurrences(); }, [loadOccurrences]);

  // Show name picker on first visit if no user set
  useEffect(() => {
    if (!currentUser && members.length > 0) setShowNamePicker(true);
  }, [currentUser, members]);

  function handlePickName(member) {
    setCurrentUser(member);
    localStorage.setItem('currentUser', JSON.stringify(member));
    setShowNamePicker(false);
  }

  function handleRangeChange(start, end) {
    setRange([start, end]);
  }

  function handleSelectEvent(event, e) {
    const rect = (e?.target ?? e?.currentTarget)?.getBoundingClientRect?.() ?? { bottom: 100, left: 100 };
    setPopover({
      event,
      position: { x: rect.left, y: rect.bottom + 8 },
    });
  }

  async function handleSaveChore(payload) {
    if (choreForm?.chore) {
      await api.chores.update(choreForm.chore.id, payload);
    } else {
      await api.chores.create(payload);
    }
    loadOccurrences();
  }

  async function handleDeleteChore() {
    if (choreForm?.chore) {
      await api.chores.remove(choreForm.chore.id);
      loadOccurrences();
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>🧹 Office Chores</h1>
        <button
          className={`topbar-btn${page === 'calendar' ? ' active' : ''}`}
          onClick={() => setPage('calendar')}
        >
          Calendar
        </button>
        <button
          className={`topbar-btn${page === 'members' ? ' active' : ''}`}
          onClick={() => setPage('members')}
        >
          Team
        </button>
        <button className="topbar-btn" onClick={() => setChoreForm({})}>
          + Add Chore
        </button>
        <div
          className="user-chip"
          onClick={() => setShowNamePicker(true)}
          title="Change user"
        >
          {currentUser ? `👤 ${currentUser.name}` : '👤 Select user'}
        </div>
      </header>

      <main className="main">
        {page === 'calendar' && (
          <CalendarView
            occurrences={occurrences}
            members={members}
            onSelectEvent={handleSelectEvent}
            onRangeChange={handleRangeChange}
          />
        )}
        {page === 'members' && (
          <MembersPanel
            members={members}
            onRefresh={loadMembers}
          />
        )}
      </main>

      {showNamePicker && (
        <NamePicker
          members={members}
          onPick={handlePickName}
        />
      )}

      {choreForm && (
        <ChoreForm
          chore={choreForm.chore}
          members={members}
          onSave={handleSaveChore}
          onDelete={handleDeleteChore}
          onClose={() => setChoreForm(null)}
        />
      )}

      {popover && (
        <EventPopover
          event={popover.event}
          members={members}
          currentUser={currentUser}
          position={popover.position}
          onClose={() => setPopover(null)}
          onRefresh={loadOccurrences}
          onEdit={(chore) => setChoreForm({ chore })}
        />
      )}
    </div>
  );
}
