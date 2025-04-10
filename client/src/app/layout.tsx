import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { TransactionProvider } from '@/context/TransactionContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Beam Finance',
  description: 'A secure financial platform for transfers and investments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WalletProvider>
            <TransactionProvider>
              {children}
              <Toaster position="top-right" />
            </TransactionProvider>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}