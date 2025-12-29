"use client";
import React, { useState } from 'react';

type Priority = 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';

export default function TaskInput({ onCreated, onAiResult, autoAccept, threshold, onAutoAccept, onToast }: { onCreated?: (id: string) => void, onAiResult?: (id: string, priority?: Priority) => void, autoAccept?: boolean, threshold?: number, onAutoAccept?: (id: string, priority?: Priority) => void, onToast?: (msg: string) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [override, setOverride] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [nlText, setNlText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<any>(null);
  const [parsedDueDate, setParsedDueDate] = useState<string | null>(null);
  const [parsedTags, setParsedTags] = useState<string[]>([]);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    // Create with manual override if provided, else default MEDIUM
    const initialPriority = override || 'MEDIUM';

    const payload: any = { title, description, priority: initialPriority };
    if (parsedDueDate) payload.dueDate = parsedDueDate;
    if (parsedTags && parsedTags.length) payload.tags = parsedTags;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const created = await res.json();
    if (!res.ok || created?.error) {
      console.error('Create task failed', created);
      const msg = 'Failed to create task: ' + (created?.error || 'unknown');
      if (onToast) onToast(msg); else alert(msg);
      setLoading(false);
      return;
    }

    // notify parent that a task was created so it can show AI-pending state
    if (created?.id) onCreated?.(created.id);

    // After creation, call AI to get recommendation and update if user didn't override
    if (!override) {
      try {
        const pRes = await fetch('/api/priority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        const body = await pRes.json();
        const priority = body.priority;
        const confidence = typeof body.confidence === 'number' ? body.confidence : 0;
        const raw = body.raw ?? '';
        const evaluatedAt = new Date().toISOString();
        // notify parent of AI result (even if same as created)
        onAiResult?.(created.id, priority);

        // Persist AI metadata
        // If autoAccept is enabled and confidence >= threshold, apply the priority change
        const shouldApply = !!autoAccept && (confidence >= (threshold ?? 0.7));

        if (shouldApply && priority && priority !== created.priority) {
          await fetch(`/api/tasks/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority, aiAssigned: true, aiSuggestion: priority, aiConfidence: confidence, aiResponse: raw, aiEvaluatedAt: evaluatedAt }),
          });
          // notify page to show toast
          onAutoAccept?.(created.id, priority);
        } else {
          // Only persist the AI metadata (suggestion/confidence/response) without changing the primary priority
          await fetch(`/api/tasks/${created.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aiAssigned: true, aiSuggestion: priority, aiConfidence: confidence, aiResponse: raw, aiEvaluatedAt: evaluatedAt }),
          });
        }
      } catch (err) {
        // notify parent that AI finished without suggestion
        onAiResult?.(created.id, undefined);
      }
    } else {
      // user overrode; no AI call
      onAiResult?.(created.id, undefined);
    }

    setTitle('');
    setDescription('');
    setOverride('');
    setLoading(false);
  }

  // Natural language parse: call backend endpoint to convert text -> structured task
  async function handleParse() {
    const text = nlText.trim();
    if (!text) return;
    setParsing(true);
    try {
      const res = await fetch('/api/nlp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const body = await res.json();
      if (body && !body.error) {
        setParsed(body);
      } else {
        setParsed({ error: body?.error ?? 'parse_failed' });
      }
    } catch (err) {
      setParsed({ error: String(err) });
    }
    setParsing(false);
  }

  function applyParsed() {
    if (!parsed) return;
    setTitle(parsed.title ?? '');
    setDescription(parsed.description ?? '');
    setOverride(parsed.priority ?? '');
    setParsedDueDate(parsed.dueDate ?? null);
    setParsedTags(Array.isArray(parsed.tags) ? parsed.tags : []);
    // clear parsed after applying
    setParsed(null);
    setNlText('');
  }

  // Voice capture using Web Speech API (best-effort)
  function toggleRecognition() {
    const Win: any = window as any;
    const SpeechRecognition = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser');

    if (recognitionActive) {
      recognitionRef.current?.stop();
      setRecognitionActive(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev: any) => {
      const txt = Array.from(ev.results).map((r: any) => r[0].transcript).join(' ');
      setNlText(prev => (prev ? prev + ' ' + txt : txt));
    };
    rec.onend = () => setRecognitionActive(false);
    rec.onerror = () => setRecognitionActive(false);
    recognitionRef.current = rec;
    rec.start();
    setRecognitionActive(true);
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4">
      <div className="mb-2 border rounded p-2 bg-surface">
        <label className="block text-sm font-medium">Type or speak a task (natural language)</label>
        <textarea className="input mt-1 block w-full" rows={3} value={nlText} onChange={e=>setNlText(e.target.value)} placeholder="e.g. Finish quarterly report by Friday, high priority; remind John" />
        <div className="flex gap-2 mt-2">
          <button type="button" className="btn" onClick={handleParse} disabled={parsing}>{parsing ? 'Parsing...' : 'Parse'}</button>
          <button type="button" className="btn" onClick={toggleRecognition}>{recognitionActive ? 'Stop' : 'Use voice'}</button>
          {parsed && !parsed.error ? <button type="button" className="btn" onClick={applyParsed}>Use parsed</button> : null}
        </div>

        {parsed ? (
          <div className="mt-2 p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border rounded text-sm">
            {parsed.error ? <div className="text-red-600">Parse error: {parsed.error}</div> : (
              <div>
                <div><strong>Title:</strong> {parsed.title}</div>
                <div><strong>Description:</strong> {parsed.description}</div>
                <div><strong>Priority:</strong> {parsed.priority}</div>
                <div><strong>Due:</strong> {parsed.dueDate ?? 'none'}</div>
                <div><strong>Tags:</strong> {(parsed.tags||[]).join(', ')}</div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Title</label>
        <input className="input mt-1 block w-full" value={title} onChange={e=>setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Description</label>
        <textarea className="input mt-1 block w-full" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Manual Priority (optional)</label>
        {/* responsive width: full on small screens, fixed on larger */}
        <select className="mt-1 block w-full sm:w-48 input" value={override} onChange={e=>setOverride(e.target.value)}>
          <option value="">-- AI recommendation --</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button className="btn" disabled={loading}>{loading? 'Saving...' : 'Add Task'}</button>
      </div>
    </form>
  );
}
