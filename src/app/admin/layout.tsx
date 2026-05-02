import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

function safeAdminCallback(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/admin";
  }
  const pathOnly = raw.split("?")[0] ?? raw;
  if (!pathOnly.startsWith("/admin")) {
    return "/admin";
  }
  return raw;
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  const h = await headers();
  const callbackPath = safeAdminCallback(h.get("x-nadee-login-callback"));

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <AdminSidebar />
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
