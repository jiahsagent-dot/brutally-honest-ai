// Grok-powered critique endpoint.
// Rate limit: 1 request per IP per 60s (in-memory, best-effort).
// Cost cap: short response (~200 tokens) and non-reasoning model to keep $/call ~$0.001.

const RATE = new Map(); // ip -> last ts

function rateLimited(ip) {
  const now = Date.now();
  const last = RATE.get(ip) || 0;
  if (now - last < 60_000) return true;
  RATE.set(ip, now);
  if (RATE.size > 5000) {
    const cutoff = now - 600_000;
    for (const [k, v] of RATE) if (v < cutoff) RATE.delete(k);
  }
  return false;
}

const MODE_PROMPTS = {
  resume:
    "You are a brutally honest hiring manager who has read 50,000 resumes. The user is going to paste a resume bullet. Tear it apart in EXACTLY 4 sentences. Sentence 1: name the specific problem (vague verbs, missing metric, buzzword soup, etc). Sentence 2: explain why that fails. Sentence 3: give a concrete rewrite. Sentence 4: one parting shot. Be funny, mean, and surgical. No bullet points. No greetings. No softening.",
  email:
    "You are a brutally honest sales leader who deletes 200 cold emails a day. The user is going to paste a cold email. Tear it apart in EXACTLY 4 sentences. Sentence 1: name the worst sin (fake personalization, vague value prop, manipulative subject, etc). Sentence 2: explain the psychological reason it fails. Sentence 3: rewrite the worst line. Sentence 4: parting shot. Funny, mean, surgical. No greeting, no bullets.",
  landing:
    "You are a brutally honest landing-page critic who has read every SaaS homepage on the internet. The user is going to paste a hero line or paragraph. Tear it apart in EXACTLY 4 sentences. Sentence 1: name the cliché. Sentence 2: explain who they sound exactly like. Sentence 3: rewrite the line tighter. Sentence 4: parting shot. Funny, mean, surgical. No bullets.",
  tweet:
    "You are a brutally honest social-media editor. The user is going to paste a tweet/post. Tear it apart in EXACTLY 4 sentences. Sentence 1: name the failure (humblebrag, faux-deep, ratio bait, etc). Sentence 2: explain why no one will engage. Sentence 3: suggest a sharper version. Sentence 4: parting shot. Funny, mean, surgical.",
  pitch:
    "You are a brutally honest VC who has heard 10,000 pitches. The user is going to paste a one-liner or pitch. Tear it apart in EXACTLY 4 sentences. Sentence 1: name the cliché (Uber-for, AI-powered, platform, etc). Sentence 2: name the obvious unanswered question. Sentence 3: rewrite it so it doesn't sound like every other deck. Sentence 4: parting shot. Funny, mean, surgical.",
  other:
    "You are a brutally honest editor. The user is going to paste a piece of writing. Tear it apart in EXACTLY 4 sentences. Identify the central failure, explain why it fails, give a concrete fix, and deliver a parting shot. Be funny, mean, and surgical. No greeting, no bullets.",
};

export async function POST(req) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return Response.json(
      { error: 'Slow down — one roast per minute per IP. Try again shortly.' },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Bad request.' }, { status: 400 });
  }
  const { mode, text } = body || {};
  if (!text || typeof text !== 'string') {
    return Response.json({ error: 'Missing text.' }, { status: 400 });
  }
  if (text.length > 4000) {
    return Response.json({ error: 'Too long.' }, { status: 400 });
  }
  const system = MODE_PROMPTS[mode] || MODE_PROMPTS.other;

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return Response.json({ error: 'Server not configured.' }, { status: 500 });
  }

  try {
    const r = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4.20-0309-non-reasoning',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text },
        ],
        max_tokens: 280,
        temperature: 0.85,
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      console.error('xai error', r.status, errText.slice(0, 300));
      return Response.json(
        { error: 'AI service is having a moment. Try again in a sec.' },
        { status: 502 }
      );
    }
    const data = await r.json();
    const critique = data?.choices?.[0]?.message?.content?.trim();
    if (!critique) {
      return Response.json(
        { error: 'Empty response. Try again.' },
        { status: 502 }
      );
    }
    return Response.json({ critique });
  } catch (e) {
    console.error('crit error', e);
    return Response.json({ error: 'Network hiccup. Try again.' }, { status: 502 });
  }
}

export const runtime = 'nodejs';
