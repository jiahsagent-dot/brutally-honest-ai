'use client';

import { useState } from 'react';

const TIP_ADDRESS =
  process.env.NEXT_PUBLIC_TIP_WALLET_ADDRESS ||
  '5eSbNtWjwFGV1MRGrLTTDsoUsu2Sxp55PRZNe55gjKAq';

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=0&data=solana:${TIP_ADDRESS}`;

const MODES = [
  { id: 'resume', label: 'Resume bullet' },
  { id: 'email', label: 'Cold email' },
  { id: 'landing', label: 'Landing-page copy' },
  { id: 'tweet', label: 'Tweet / post' },
  { id: 'pitch', label: 'Pitch / one-liner' },
  { id: 'other', label: 'Other' },
];

const PLACEHOLDERS = {
  resume:
    "e.g. Led cross-functional initiatives to drive synergistic outcomes across the organization, resulting in significant impact.",
  email:
    "e.g. Hi {firstName}, I came across your profile and was impressed by your work at {company}. I help teams like yours scale their pipeline...",
  landing:
    "e.g. The AI-first platform that empowers modern teams to unlock their full potential, faster.",
  tweet: "e.g. Just shipped. The future is now.",
  pitch: "e.g. We're Uber for X.",
  other: "Paste anything you want destroyed.",
};

export default function Page() {
  const [mode, setMode] = useState('resume');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  async function critique() {
    setErr('');
    setResult('');
    if (!text.trim()) {
      setErr('Paste something first.');
      return;
    }
    if (text.length > 4000) {
      setErr('Keep it under 4,000 characters.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Something broke.');
      setResult(data.critique);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyAddr() {
    try {
      await navigator.clipboard.writeText(TIP_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <main className="wrap">
      <div className="hero">
        <h1>
          Get <span className="accent">brutally</span> honest feedback.
        </h1>
        <p className="sub">
          Paste a resume bullet, cold email, landing-page line, tweet, or pitch.
          An AI that doesn&apos;t care about your feelings tells you what&apos;s
          actually wrong. Free. No signup.
        </p>
      </div>

      <div className="card">
        <div className="modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`mode ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
              type="button"
            >
              {m.label}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDERS[mode]}
          maxLength={4200}
        />
        <div className="row">
          <button
            className="btn"
            onClick={critique}
            disabled={loading}
            type="button"
          >
            {loading ? 'Destroying…' : 'Roast it'}
          </button>
          <span className="hint">{text.length} / 4000</span>
        </div>
        {err && <div className="err">{err}</div>}
      </div>

      {result && (
        <>
          <div className="result">
            <span className="verdict">Verdict</span>
            {'\n'}
            {result}
          </div>

          <div className="tip">
            <img src={QR_URL} alt="Solana tip QR code" />
            <div>
              <h3>Felt that? Tip in SOL.</h3>
              <p>
                Any amount. Solana, mainnet. The full tip jar goes to keeping
                this free and the lights on.
              </p>
              <code>{TIP_ADDRESS}</code>
              <div className="row">
                <button className="btn ghost" onClick={copyAddr} type="button">
                  {copied ? 'Copied ✓' : 'Copy address'}
                </button>
                <a
                  className="btn ghost"
                  href={`solana:${TIP_ADDRESS}`}
                  style={{ textDecoration: 'none' }}
                >
                  Open in Phantom
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="footer">
        Built with Grok 4. Tips, complaints, and screenshots welcome on{' '}
        <a href="https://x.com/Jaisagent">X</a>.
      </div>
    </main>
  );
}
