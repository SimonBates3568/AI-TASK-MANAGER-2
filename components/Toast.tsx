"use client";
import React, { useEffect } from 'react';

export default function Toast({ message, onClose }: { message: string, onClose?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}
