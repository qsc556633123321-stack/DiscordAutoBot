import './globals.css';

export const metadata = {
  title: 'Discord Community OS',
  description: 'Discord Bot Web Dashboard MVP'
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
