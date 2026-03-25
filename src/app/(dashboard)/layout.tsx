import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const prisma = new PrismaClient();

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/pos", label: "Point of Sale", icon: "🛒" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/accounts", label: "Accounts & Invoicing", icon: "🧾" },
  { href: "/dashboard/reports", label: "Reports", icon: "📊" },
]

const bottomLinks = [
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tenant: true },
  });

  if (!dbUser) {
    await supabase.auth.signOut();
    return redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background shadow-sm sm:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-primary">ERP</span>
            <span className="text-xl font-black tracking-tight">System</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-between py-4">
          {/* Tenant label */}
          <div className="px-4 mb-3">
            <div className="rounded-lg bg-primary/5 px-3 py-2 border border-primary/10">
              <div className="text-xs text-muted-foreground font-medium">Business</div>
              <div className="text-sm font-semibold truncate">{dbUser.tenant.name}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 px-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-3 space-y-0.5 border-t pt-3 mt-3">
            {bottomLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">{dbUser.firstName} {dbUser.lastName}</span>
              <br />
              <span className="capitalize opacity-70">{dbUser.role}</span>
            </div>
            <form action="/api/auth/sign-out" method="POST">
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" type="submit">
                🚪 Log out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:pl-60 w-full min-h-screen">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
