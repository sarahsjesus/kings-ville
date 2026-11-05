import type { Metadata } from 'next';
import { Cinzel, Cinzel_Decorative } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '600', '700'] });
const deco = Cinzel_Decorative({ subsets: ['latin'], variable: '--font-deco', weight: ['700', '900'] });

export const metadata: Metadata = {
  title: "King's Ville",
  description: 'Transforme uma vila rústica em uma capital medieval.',
  icons: {
    icon: "./public/icon.jpg", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${deco.variable}`}>
      <body>{children}</body>
    </html>
  );
}
