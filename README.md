# Brutally Honest AI

> Paste anything. Get an AI critique that pulls no punches. Free. No signup.

**Live:** https://brutally-honest-ai.vercel.app

A tiny one-page web tool that takes a resume bullet, cold email, landing-page line, tweet, or pitch — and returns a ruthless 4-sentence critique. Pretty good at finding the buzzword-soup, the vague verbs, the missing metric, and the cliché.

Built on Next.js 14 + xAI Grok + Solana tip jar. No accounts, no tracking, no upsell. Tips welcome (SOL mainnet) but completely optional.

## Why
LinkedIn copy and cold emails are usually full of softening words that hide the actual claim. This tool forces the opposite: it tells you the worst version of how the reader actually feels.

## Stack
- Next.js 14 (App Router) on Vercel
- xAI Grok (grok-4.20-0309-non-reasoning) — fast, cheap, has the right voice
- Solana mainnet tip jar (no platform fees)
- ~250 lines of code, one server route, one client page

## Run locally
```bash
npm install
cp .env.example .env.local  # add XAI_API_KEY
npm run dev
```
