"use client";
import React, { useState } from 'react';

type Priority = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';

export default function TaskInput({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [override, setOverride] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    // Create with manual override if provided, else default MEDIUM
    const initialPriority = override || 'MEDIUM';

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority: initialPriority }),
    });

    const created = await res.json();

    // After creation, call AI to get recommendation and update if user didn't override
    if (!override) {
      try {
        const pRes = await fetch('/api/priority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const { priority } = await pRes.json();
        if (priority && priority !== created.priority) {
          await fetch(`/api/tasks/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority }),
          });
        }
      } catch (err) {
        // ignore
      }
    }

    setTitle('');
    setDescription('');
    setOverride('');
    setLoading(false);
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-4">
      <div className="mb-2">
        <label className="block text-sm font-medium">Title</label>
        <input className="mt-1 block w-full border rounded p-2" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea className="mt-1 block w-full border rounded p-2" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Manual Priority (optional)</label>
        <select className="mt-1 block w-48 border rounded p-2" value={override} onChange={e=>setOverride(e.target.value)}>
          <option value="">-- AI recommendation --</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading? 'Saving...' : 'Add Task'}</button>
      </div>
    </form>
  );
}
