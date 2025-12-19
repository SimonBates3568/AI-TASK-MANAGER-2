"use client";
import Link from 'next/link';
import React from 'react';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="text-xl font-bold">AI Task Manager</div>
      <nav className="flex gap-3">
        <Link href="/tasks" className="px-3 py-1 rounded hover:bg-gray-100">Tasks</Link>
        <Link href="/plan" className="px-3 py-1 rounded hover:bg-gray-100">Plan</Link>
      </nav>
    </header>
  );
}
