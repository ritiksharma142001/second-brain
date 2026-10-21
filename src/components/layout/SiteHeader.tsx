import Link from "next/link";
import { CassetteTape, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/layout/Brand";
import { MobileNav } from "@/components/layout/MobileNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserNav } from "@/components/layout/UserNav";

export const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

/** Site-wide header. Rendered by every layout so it never disappears when navigating. */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Brand />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/blog" className={navLinkClass}>
            Blog
          </Link>
          <Link
            href="/mixtapes"
            className={`${navLinkClass} flex items-center gap-1.5`}
          >
            <CassetteTape className="h-4 w-4" />
            Mixtapes
          </Link>
          <Link
            href="/search"
            className={`${navLinkClass} flex items-center gap-1.5`}
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
          <ThemeToggle />
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Get started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav user={session?.user} />
        </div>
      </div>
    </header>
  );
}
