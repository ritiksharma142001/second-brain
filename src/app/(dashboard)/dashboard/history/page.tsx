import Link from "next/link";
import { Clock, History } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { LibraryRow } from "@/components/features/dashboard/LibraryRow";
import { ClearHistoryButton, RemoveHistoryButton } from "@/components/features/dashboard/LibraryButtons";

export const metadata = { title: "Reading history" };

const DAY = 24 * 60 * 60 * 1000;

/** Groups entries by calendar day: Today, Yesterday, This week, Earlier. */
function dayLabel(date: Date, now: Date) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - date.getTime()) / DAY) + 1;
  if (date.getTime() >= startOfToday) return "Today";
  if (diffDays <= 1) return "Yesterday";
  if (diffDays <= 7) return "This week";
  return "Earlier";
}

const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export default async function HistoryPage() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const history = await prisma.viewHistory.findMany({
    where: { userId: session.user.id, post: { status: "PUBLISHED" } },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          readingTime: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { viewedAt: "desc" },
    take: 50,
  });

  const now = new Date();
  const groups = new Map<string, typeof history>();
  for (const item of history) {
    const label = dayLabel(item.viewedAt, now);
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Reading history</h2>
          <p className="mt-1 text-muted-foreground">
            Posts you&apos;ve recently read{history.length > 0 && ` · ${history.length}`}
          </p>
        </div>
        {history.length > 0 && <ClearHistoryButton />}
      </div>

      {history.length === 0 ? (
        <div className="window">
          <div className="window-bar">
            <span className="dot" /><span className="dot" /><span className="dot" />
            <span className="ml-2">history.log</span>
          </div>
          <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <History className="h-10 w-10 text-highlight" />
            <div>
              <p className="text-lg font-bold">No reading history yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Posts you open while signed in will show up here.
              </p>
            </div>
            <Button asChild>
              <Link href="/blog">Start exploring</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([label, items]) => (
            <section key={label}>
              <h3 className="eyebrow mb-3">{`// ${label}`}</h3>
              <div className="space-y-4">
                {items.map(({ id, viewedAt, post }) => (
                  <LibraryRow
                    key={id}
                    post={post}
                    action={<RemoveHistoryButton postId={post.id} />}
                    meta={
                      <>
                        <span>
                          {label === "Today" || label === "Yesterday"
                            ? timeFormat.format(viewedAt)
                            : `${dateFormat.format(viewedAt)}, ${timeFormat.format(viewedAt)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readingTime} min read
                        </span>
                      </>
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
