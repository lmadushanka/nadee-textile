import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:gap-8">
        <AdminSidebar />
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
