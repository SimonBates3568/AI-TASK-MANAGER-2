import React from 'react';
import PlanClient from '../../components/PlanClient';
import { prisma } from '../../lib/prisma';

async function getStats() {
  // Run DB query directly on the server to avoid making an HTTP request to our own API route
  const tasks = await prisma.task.findMany();
  const total = tasks.length;
  const completed = tasks.filter((t: any) => t.completed).length;
  return { total, completed };
}

export default async function PlanPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Plan — Overview</h1>
      <PlanClient total={stats.total} completed={stats.completed} />
    </div>
  );
}
