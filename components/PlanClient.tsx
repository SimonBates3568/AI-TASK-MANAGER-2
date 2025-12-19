"use client";
import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import TaskList from './TaskList';

export default function PlanClient({ total, completed }: { total: number, completed: number }) {
  const [filter, setFilter] = useState<'all'|'completed'|'incomplete'>('all');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [currentTotal, setCurrentTotal] = useState<number>(total);
  const [currentCompleted, setCurrentCompleted] = useState<number>(completed);
  const percent = currentTotal ? Math.round((currentCompleted / currentTotal) * 100) : 0;

  async function refreshStats() {
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const t = Array.isArray(data) ? data.length : 0;
      const c = Array.isArray(data) ? data.filter((x:any)=>x.completed).length : 0;
      setCurrentTotal(t);
      setCurrentCompleted(c);
    } catch (e) {
      console.error('Failed to refresh stats', e);
    }
  }

  return (
    <div>
      <div className="card mb-4">
        <h2 className="text-lg font-semibold">Progress</h2>
        <div className="mt-2"><ProgressBar percent={percent} /></div>
        <div className="mt-2 text-sm text-gray-600">{currentCompleted} of {currentTotal} tasks completed ({percent}%)</div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">Show:</span>
        <button className={`btn ${filter==='all'?'btn-active':''}`} onClick={()=>setFilter('all')}>All</button>
        <button className={`btn ${filter==='incomplete'?'btn-active':''}`} onClick={()=>setFilter('incomplete')}>Incomplete</button>
        <button className={`btn ${filter==='completed'?'btn-active':''}`} onClick={()=>setFilter('completed')}>Completed</button>
        <button className="btn-ghost ml-4" onClick={()=>setRefreshFlag(f=>f+1)}>Refresh</button>
      </div>

      <TaskList filter={filter} refreshFlag={refreshFlag} onChange={refreshStats} />
    </div>
  );
}
