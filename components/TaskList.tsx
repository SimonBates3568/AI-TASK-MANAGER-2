"use client";
import React, { useEffect, useState } from 'react';
import EditTaskModal from './EditTaskModal';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
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

export default function TaskList({ refreshFlag, filter }: { refreshFlag?: number, filter?: 'all'|'completed'|'incomplete' }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState<Task | null>(null);

  async function load() {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
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
        <div key={t.id} className="bg-white p-3 rounded shadow flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{t.title}</h3>
              <span className={`text-xs inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${priorityClass(t.priority)}`}>{t.priority}</span>
            </div>
            <p className="text-sm text-gray-600">{t.description}</p>
            <div className="mt-2 text-sm text-gray-500">{t.completed ? 'Completed' : 'Not completed'}</div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="text-blue-600" onClick={()=>setEditing(t)}>Edit</button>
            <button className="text-red-600" onClick={()=>remove(t.id)}>Delete</button>
            <button className="text-sm border rounded px-2 py-1" onClick={()=>toggleComplete(t)}>{t.completed? 'Undo' : 'Complete'}</button>
          </div>
        </div>
      ))}

      {editing && <EditTaskModal task={editing} onClose={()=>{ setEditing(null); load(); }} />}
    </div>
  );
}
