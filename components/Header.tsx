"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userOpen, setUserOpen] = useState(false);
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

        {/* Auth buttons / user menu */}
        {status === 'loading' ? (
          <div className="px-3 py-1 text-sm text-gray-400">Loading...</div>
        ) : session?.user ? (
          <div className="relative">
            <button onClick={() => setUserOpen(u => !u)} className="flex items-center gap-2">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image as string} alt={session.user.name || 'User'} className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">{(session.user.name || 'U').charAt(0)}</div>
              )}
              <span className="text-sm text-gray-700">{session.user.name || session.user.email}</span>
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md p-2">
                <Link href="/settings" className="block px-2 py-1 text-sm hover:bg-gray-50">Settings</Link>
                <button onClick={() => signOut()} className="w-full text-left px-2 py-1 text-sm hover:bg-gray-50">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => signIn(undefined, { callbackUrl: '/tasks' })} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Sign In</button>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/demo', { method: 'POST' });
                  // navigate to tasks so the server will scope to demo user
                  window.location.href = '/tasks';
                } catch (e) {
                  console.error('Demo sign-in failed', e);
                }
              }}
              className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              Sign in (demo)
            </button>
          </div>
        )}
      </nav>

      {open && (
        <div className="absolute left-4 right-4 top-16 bg-white shadow-md rounded-md p-3 sm:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/tasks" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50">Tasks</Link>
            <Link href="/plan" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50">Plan</Link>

            {/* Mobile auth actions: show sign in / demo or user menu actions */}
            {status === 'loading' ? (
              <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
            ) : session?.user ? (
              <div className="flex flex-col gap-2">
                <Link href="/settings" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50">Settings</Link>
                <button onClick={() => signOut()} className="w-full text-left px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">Sign Out</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => signIn(undefined, { callbackUrl: '/tasks' })} className="w-full px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Sign In</button>
                <button onClick={async () => { try { await fetch('/api/auth/demo', { method: 'POST' }); window.location.href = '/tasks'; } catch (e) { console.error('Demo sign-in failed', e); } }} className="w-full px-3 py-2 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Sign in (demo)</button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
