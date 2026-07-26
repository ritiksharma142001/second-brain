"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: BookOpen },
    { href: "/blog", label: "Blog", icon: BookOpen },
  ];

  if (user) {
    navItems.push({
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    });

    if (user.role === "ADMIN") {
      navItems.push({
        href: "/admin",
        label: "Admin",
        icon: LayoutDashboard,
      });
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
          <nav className="container px-4 py-6">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="border-t pt-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm">
                      <p className="font-medium">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mt-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/auth/signin">
                      <LogIn className="mr-3 h-5 w-5" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
