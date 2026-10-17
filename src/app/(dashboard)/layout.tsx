import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Home, PenSquare, Bookmark, History, Settings } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/posts", label: "My Posts", icon: PenSquare },
    { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container mx-auto max-w-7xl flex-1 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
