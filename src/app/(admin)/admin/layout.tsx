import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Users,
  MessageCircle,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Posts", href: "/admin/posts", icon: FileText },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen },
    { name: "Tags", href: "/admin/tags", icon: Tags },
    { name: "Comments", href: "/admin/comments", icon: MessageCircle },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="flex">
        {/* Sidebar (sits below the site header) */}
        <aside className="fixed bottom-0 left-0 top-16 z-40 w-64 border-r bg-background/80 backdrop-blur-sm">
          <nav className="space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-4 left-0 right-0 border-t px-4 pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Site</Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 pl-64">
          <div className="border-b bg-background/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-6">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <div className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </div>
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
