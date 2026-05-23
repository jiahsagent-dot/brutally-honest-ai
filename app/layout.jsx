import './globals.css';

export const metadata = {
  title: 'Brutally Honest AI — get roasted by an AI that pulls no punches',
  description:
    'Paste a resume bullet, cold email, landing-page line, or pitch. Get a ruthless 4-sentence critique. Free. No signup.',
  openGraph: {
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
