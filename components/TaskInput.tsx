"use client";
import React, { useState } from 'react';

type Priority = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';

export default function TaskInput({ onCreated, onAiResult, autoAccept, threshold, onAutoAccept }: { onCreated?: (id: string) => void, onAiResult?: (id: string, priority?: Priority) => void, autoAccept?: boolean, threshold?: number, onAutoAccept?: (id: string, priority?: Priority) => void }) {
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

    // notify parent that a task was created so it can show AI-pending state
    onCreated?.(created.id);

    // After creation, call AI to get recommendation and update if user didn't override
    if (!override) {
      try {
        const pRes = await fetch('/api/priority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const body = await pRes.json();
        const priority = body.priority;
        const confidence = typeof body.confidence === 'number' ? body.confidence : 0;
        const raw = body.raw ?? '';
        const evaluatedAt = new Date().toISOString();
        // notify parent of AI result (even if same as created)
        onAiResult?.(created.id, priority);

        // Persist AI metadata
        // If autoAccept is enabled and confidence >= threshold, apply the priority change
        const shouldApply = !!autoAccept && (confidence >= (threshold ?? 0.7));

        if (shouldApply && priority && priority !== created.priority) {
          await fetch(`/api/tasks/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority, aiAssigned: true, aiSuggestion: priority, aiConfidence: confidence, aiResponse: raw, aiEvaluatedAt: evaluatedAt }),
          });
          // notify page to show toast
          onAutoAccept?.(created.id, priority);
        } else {
          // Only persist the AI metadata (suggestion/confidence/response) without changing the primary priority
          await fetch(`/api/tasks/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiAssigned: true, aiSuggestion: priority, aiConfidence: confidence, aiResponse: raw, aiEvaluatedAt: evaluatedAt }),
          });
        }
      } catch (err) {
        // notify parent that AI finished without suggestion
        onAiResult?.(created.id, undefined);
      }
    } else {
      // user overrode; no AI call
      onAiResult?.(created.id, undefined);
    }

    setTitle('');
    setDescription('');
    setOverride('');
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4">
      <div className="mb-2">
        <label className="block text-sm font-medium">Title</label>
        <input className="input mt-1 block w-full" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea className="input mt-1 block w-full" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Manual Priority (optional)</label>
        <select className="mt-1 block w-48 input" value={override} onChange={e=>setOverride(e.target.value)}>
          <option value="">-- AI recommendation --</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button className="btn" disabled={loading}>{loading? 'Saving...' : 'Add Task'}</button>
      </div>
    </form>
  );
}
