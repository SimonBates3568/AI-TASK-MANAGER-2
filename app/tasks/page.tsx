"use client";
import React, { useState, useEffect } from 'react';
import TaskInput from '../../components/TaskInput';
import TaskList from '../../components/TaskList';
import Toast from '../../components/Toast';

export default function TasksPage() {
  // Make this page a client component so we can pass callbacks to child client components.
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [aiPending, setAiPending] = useState<Record<string, boolean>>({});
  const [aiSuggestion, setAiSuggestion] = useState<Record<string, string>>({});
  // Use server-stable defaults and hydrate from localStorage on mount to avoid hydration mismatch
  const [autoAccept, setAutoAccept] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0.7);

  // Hydrate settings from localStorage on client after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('autoAccept');
      if (raw !== null) setAutoAccept(JSON.parse(raw));
      const tRaw = localStorage.getItem('autoAcceptThreshold');
      if (tRaw !== null) setThreshold(parseFloat(tRaw));
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist changes
  useEffect(() => { try { localStorage.setItem('autoAccept', JSON.stringify(autoAccept)); } catch {} }, [autoAccept]);
  useEffect(() => { try { localStorage.setItem('autoAcceptThreshold', String(threshold)); } catch {} }, [threshold]);

  function handleCreated(id: string) {
    // mark task as pending AI recommendation and refresh list
    setAiPending((s) => ({ ...s, [id]: true }));
    setRefreshFlag((f) => f + 1);
  }

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleAiResult(id: string, priority?: string) {
    // remove pending flag and store suggestion (if any), then refresh
    setAiPending((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
    setAiSuggestion((s) => ({ ...s, ...(priority ? { [id]: priority } : {}) }));
    setRefreshFlag((f) => f + 1);
  }

  function handleAutoAccept(id: string, priority?: string) {
    setToastMessage(`Auto-accepted AI suggestion ${priority} for task ${id}`);
    setRefreshFlag((f) => f + 1);
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-extrabold mb-4">Tasks</h1>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={autoAccept} onChange={e => setAutoAccept(e.target.checked)} />
          <span className="text-sm">Auto-accept AI suggestions</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-sm">Threshold:</span>
          <input type="range" min={0} max={1} step={0.05} value={threshold} onChange={e=>setThreshold(parseFloat(e.target.value))} className="w-full sm:w-48" />
          <span className="text-sm">{Math.round(threshold*100)}%</span>
        </label>
      </div>

  <TaskInput onCreated={handleCreated} onAiResult={handleAiResult} autoAccept={autoAccept} threshold={threshold} onAutoAccept={handleAutoAccept} onToast={setToastMessage} />
      <TaskList refreshFlag={refreshFlag} aiPending={aiPending} aiSuggestion={aiSuggestion} />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
