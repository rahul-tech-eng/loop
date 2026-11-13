import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}