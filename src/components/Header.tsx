import { auth } from "@/auth";
import { FloatingSiteHeader } from "@/components/FloatingSiteHeader";

export async function Header() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const isAdmin = session?.user?.role === "admin";
  const userLabel = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <FloatingSiteHeader
      isLoggedIn={isLoggedIn}
      isAdmin={isAdmin}
      userLabel={userLabel}
    />
  );
}
