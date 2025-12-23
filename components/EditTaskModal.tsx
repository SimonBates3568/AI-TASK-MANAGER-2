"use client";
import React, { useState } from 'react';

export default function EditTaskModal({ task, onClose }: { task: any, onClose: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [saving, setSaving] = useState(false);

  async function save() {
    try {
      setSaving(true);
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority }),
      });
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-md p-4 rounded shadow-lg">
        <h3 className="font-bold">Edit Task</h3>
        <div className="mt-2">
          <label className="block text-sm">Title</label>
          <input className="mt-1 block w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Description</label>
          <textarea className="mt-1 block w-full border rounded p-2" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mt-2">
          <label className="block text-sm">Priority</label>
          {/* responsive select width */}
          <select className="mt-1 block w-full sm:w-48 border rounded p-2" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}
