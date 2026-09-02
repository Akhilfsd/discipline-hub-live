import './globals.css';

export const metadata = {
  title: 'Discipline Hub Live',
  description: 'Uncompromising focus and tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
