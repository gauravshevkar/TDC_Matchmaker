// components/NotesSection/NotesSection.jsx
import React, { useState } from 'react';
import { customerService } from '../../services/customerService';
import toast from 'react-hot-toast';
import './NotesSection.css';

export default function NotesSection({ customerId, notes = [], onNotesUpdate }) {
  const [text, setText]       = useState('');
  const [saving, setSaving]   = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return toast.error('Note cannot be empty');
    setSaving(true);
    try {
      const data = await customerService.addNote(customerId, text.trim());
      onNotesUpdate(data.notes);
      setText('');
      toast.success('Note added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return '—'; }
  };

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h4>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          Notes
          {notes.length > 0 && <span className="notes-count">{notes.length}</span>}
        </h4>
      </div>

      {/* Add note */}
      <div className="notes-add">
        <textarea
          className="form-textarea"
          placeholder="Add a note about this client — call summary, preferences, concerns..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd();
          }}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={saving || !text.trim()}>
          {saving ? <span className="spinner" /> : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          )}
          Add Note
        </button>
        <span className="notes-hint text-xs text-muted">Ctrl+Enter to save</span>
      </div>

      {/* Notes list */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="notes-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-muted text-sm">No notes yet. Add your first note above.</p>
          </div>
        ) : (
          [...notes].reverse().map((note, idx) => (
            <div key={idx} className="note-item fade-in">
              <div className="note-header">
                <span className="note-date">{formatDate(note.addedAt)}</span>
              </div>
              <p className="note-content">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}