"use client";
import React from 'react';

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full bg-gray-200 rounded h-4">
      <div className="bg-blue-600 h-4 rounded" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}
