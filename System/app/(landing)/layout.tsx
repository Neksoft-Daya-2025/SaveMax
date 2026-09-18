/* Developed by RUDRA via NEKLLM */
'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === '/') return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
