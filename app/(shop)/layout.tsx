import Navbar from '@/components/Navbar'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t mt-auto py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Mini Store · Mọi quyền được bảo lưu
      </footer>
    </>
  )
}
