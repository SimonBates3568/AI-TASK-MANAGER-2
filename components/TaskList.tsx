"use client";
import React, { useEffect, useState } from 'react';
import EditTaskModal from './EditTaskModal';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
  aiAssigned?: boolean;
  aiSuggestion?: string | null;
  aiConfidence?: number | null;
  aiResponse?: string | null;
  aiEvaluatedAt?: string | null;
};

function priorityClass(p: string) {
  switch (p) {
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function TaskList({ refreshFlag, filter, aiPending, aiSuggestion, onChange }: { refreshFlag?: number, filter?: 'all'|'completed'|'incomplete', aiPending?: Record<string, boolean>, aiSuggestion?: Record<string, string>, onChange?: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState<Task | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' });
      if (!res.ok) {
        const err = await res.text();
        console.error('Failed to load tasks', res.status, err);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.debug('Unexpected tasks response', data);
        return;
      }
  console.debug('Loaded tasks', data.length);
  setTasks(data);
  try { onChange?.(); } catch (e) { console.debug('onChange handler threw', e); }
    } catch (e) {
      console.error('Error loading tasks', e);
    }
  }

  useEffect(()=>{ load(); }, [refreshFlag]);

  async function toggleComplete(t: Task) {
    await fetch(`/api/tasks/${t.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ completed: !t.completed }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    load();
  }

  const displayed = tasks.filter(t => {
    if (!filter || filter === 'all') return true;
    if (filter === 'completed') return t.completed;
    if (filter === 'incomplete') return !t.completed;
    return true;
  });

  return (
    <div className="space-y-2">
      {displayed.map(t=> (
        <div key={t.id} className="card flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{t.title}</h3>
              <span className={`text-xs inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${priorityClass(t.priority)}`}>{t.priority}</span>
              {aiPending && aiPending[t.id] && (
                <span className="ml-2 text-xs inline-flex items-center gap-1 text-gray-600"> 
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>AI pending</span>
                </span>
              )}
              {aiSuggestion && aiSuggestion[t.id] && (
                <span title={t.aiResponse ? `AI: ${t.aiResponse}\nEvaluated at: ${t.aiEvaluatedAt || ''}` : undefined} className="ml-2 text-xs inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">AI: {aiSuggestion[t.id]}
                  {/** show persisted confidence if available on task record or suggestion map */}
                  {t.aiConfidence != null && (
                    <span className={`ml-2 text-xs ${t.aiConfidence! >= 0.75 ? 'text-green-700' : t.aiConfidence! >= 0.5 ? 'text-yellow-700' : 'text-red-700'}`}>({Math.round((t.aiConfidence || 0) * 100)}%)</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{t.description}</p>
            <div className="mt-2 text-sm text-gray-500">{t.completed ? 'Completed' : 'Not completed'}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              onClick={() => setEditing(t)}
            >
              Edit
            </button>

            <button
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
              onClick={() => remove(t.id)}
            >
              Delete
            </button>

            <button className="inline-flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300" onClick={() => toggleComplete(t)}>
              {t.completed ? 'Undo' : 'Complete'}
            </button>
          </div>
        </div>
      ))}

      {editing && <EditTaskModal task={editing} onClose={()=>{ setEditing(null); load(); }} />}
    </div>
  );
}
