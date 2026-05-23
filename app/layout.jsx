import './globals.css';

const SITE = 'https://brutally-honest-ai.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'Brutally Honest AI — get roasted by an AI that pulls no punches',
  description:
    'Paste a resume bullet, cold email, landing-page line, tweet, or pitch. Get a ruthless 4-sentence critique. Free. No signup.',
  openGraph: {
    title: 'Brutally Honest AI',
    description:
      'Paste anything. Get an AI critique that pulls no punches. Free. No signup.',
    url: SITE,
    siteName: 'Brutally Honest AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brutally Honest AI',
    description:
      'Paste anything. Get an AI critique that pulls no punches. Free.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
