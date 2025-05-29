// app/layout.tsx
import SessionWrapper from './SessionWrapper';
import './globals.css'; // Убедитесь, что путь правильный

export const metadata = {
  title: 'Site Beta',
  description: 'User Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
