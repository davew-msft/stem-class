import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RIC Recycling Scanner',
  description: 'Scan recycling codes to learn about local recyclability and earn points',
  keywords: ['recycling', 'RIC codes', 'environmental', 'sustainability'],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-green-600">♻️</div>
                  <h1 className="ml-3 text-xl font-semibold text-gray-900">
                    RIC Scanner
                  </h1>
                </div>
                <div className="text-sm text-gray-600">
                  Scan • Learn • Earn Points
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="mt-12 border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-gray-600 text-sm">
                Help protect the environment by recycling responsibly
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}