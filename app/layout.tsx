import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Websocket chat',
  description: 'Websocket chat by next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased text-black`}>{children}</body>
    </html>
  );
}
