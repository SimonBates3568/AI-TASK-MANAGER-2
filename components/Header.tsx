"use client";
import Link from 'next/link';
import React, { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="AI Task Manager" className="h-10 w-10 rounded-md shadow-sm" />
        <div>
          <div className="text-2xl font-bold">AI Task Manager</div>
          <div className="hidden sm:block text-sm text-gray-500">Smart tasks with AI priority</div>
        </div>
      </div>

      <div className="sm:hidden">
        <button aria-label="Toggle menu" className="p-2 rounded-md bg-gray-100" onClick={()=>setOpen(o=>!o)}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
        </button>
      </div>

      <nav className={`hidden sm:flex gap-3 items-center`}>
        <Link href="/tasks" className="px-3 py-1 rounded hover:bg-gray-100">Tasks</Link>
        <Link href="/plan" className="px-3 py-1 rounded hover:bg-gray-100">Plan</Link>
      </nav>

      {open && (
        <div className="absolute left-4 right-4 top-16 bg-white shadow-md rounded-md p-3 sm:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/tasks" className="px-3 py-2 rounded hover:bg-gray-50">Tasks</Link>
            <Link href="/plan" className="px-3 py-2 rounded hover:bg-gray-50">Plan</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
