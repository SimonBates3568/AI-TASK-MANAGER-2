"use client";
import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import TaskList from './TaskList';

export default function PlanClient({ total, completed }: { total: number, completed: number }) {
  const [filter, setFilter] = useState<'all'|'completed'|'incomplete'>('all');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold">Progress</h2>
        <div className="mt-2"><ProgressBar percent={percent} /></div>
        <div className="mt-2 text-sm text-gray-600">{completed} of {total} tasks completed ({percent}%)</div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">Show:</span>
        <button className={`px-2 py-1 rounded ${filter==='all'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setFilter('all')}>All</button>
        <button className={`px-2 py-1 rounded ${filter==='incomplete'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setFilter('incomplete')}>Incomplete</button>
        <button className={`px-2 py-1 rounded ${filter==='completed'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setFilter('completed')}>Completed</button>
        <button className="ml-4 px-2 py-1 rounded bg-gray-100" onClick={()=>setRefreshFlag(f=>f+1)}>Refresh</button>
      </div>

      <TaskList filter={filter} refreshFlag={refreshFlag} />
    </div>
  );
}
