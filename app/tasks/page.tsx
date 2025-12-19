"use client";
import React, { useState } from 'react';
import TaskInput from '../../components/TaskInput';
import TaskList from '../../components/TaskList';

export default function TasksPage() {
  // Make this page a client component so we can pass callbacks to child client components.
  const [refreshFlag, setRefreshFlag] = useState(0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      <TaskInput onCreated={() => setRefreshFlag((f) => f + 1)} />
      <TaskList refreshFlag={refreshFlag} />
    </div>
  );
}
