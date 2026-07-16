import Navbar from '@/app/components/Navbar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}