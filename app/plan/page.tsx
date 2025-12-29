import React from 'react';
import PlanClient from '../../components/PlanClient';
import { prisma } from '../../lib/prisma';

async function getStats() {
  // Run lightweight DB queries to avoid selecting columns that may not exist in older DBs.
  // Use count() so Prisma will only issue simple COUNT queries and not reference model columns like `dueDate`.
  const total = await prisma.task.count();
  const completed = await prisma.task.count({ where: { completed: true } });
  return { total, completed };
}

export default async function PlanPage() {
  const stats = await getStats();

  return (
    <div className="container">
      <h1 className="text-3xl font-extrabold mb-4">Plan — Overview</h1>
      <PlanClient total={stats.total} completed={stats.completed} />
    </div>
  );
}
