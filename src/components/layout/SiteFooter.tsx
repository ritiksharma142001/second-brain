import Link from "next/link";
import { auth } from "@/lib/auth";
import { Brand } from "@/components/layout/Brand";
import { navLinkClass } from "@/components/layout/SiteHeader";

export async function SiteFooter() {
  const session = await auth();

  return (
    <footer className="mt-24 border-t bg-background/60 backdrop-blur-sm">
      <div className="container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Brand />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A notebook for the open web. Capture ideas, shape them into
              articles, and share what you know.
            </p>
          </div>
          <div>
            <h3 className="eyebrow mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/blog" className={navLinkClass}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/search" className={navLinkClass}>
                  Search
                </Link>
              </li>
              <li>
                <a href="/rss.xml" className={navLinkClass}>
                  RSS feed
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-4">Account</h3>
            <ul className="space-y-2.5 text-sm">
              {session?.user ? (
                <>
                  <li>
                    <Link href="/dashboard" className={navLinkClass}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/posts/new" className={navLinkClass}>
                      Write a post
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/signin" className={navLinkClass}>
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/signup" className={navLinkClass}>
                      Create account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 font-mono text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Second Brain</p>
          <p>made with care &amp; a little nostalgia</p>
        </div>
      </div>
    </footer>
  );
}
