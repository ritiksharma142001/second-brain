import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, FolderOpen, Tags, Users, Settings, BookOpen, MessageCircle } from "lucide-react";

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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <BookOpen className="h-6 w-6" />
            Second Brain
          </Link>
        </div>
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
      <main className="flex-1 pl-64">
        <div className="border-b bg-background/95 backdrop-blur">
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
  );
}
