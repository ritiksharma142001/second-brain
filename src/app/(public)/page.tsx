import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Lightbulb,
  MessagesSquare,
  PenLine,
  Rss,
  Search,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/features/PostCard";

const TOPICS = ["ideas", "notes", "essays", "tutorials", "code", "design", "books", "tools", "life", "learning"];

async function getLatestPosts() {
  try {
    return await db.post.findMany({
      where: { status: "PUBLISHED" },
      include: { category: { select: { name: true } }, author: { select: { name: true, image: true } } },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch (error) {
    // The landing page must render even if the database is briefly unavailable.
    console.error("Failed to load latest posts:", error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getLatestPosts();

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="container relative grid items-center gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p className="eyebrow rise mb-5" style={{ "--d": 0 } as React.CSSProperties}>
            {"// capture ideas · share knowledge"}
          </p>
          <h1
            className="rise text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ "--d": 1 } as React.CSSProperties}
          >
            Your <span className="marker">second brain</span>,<br className="hidden sm:block" />{" "}
            on the open web.
          </h1>
          <p
            className="rise mt-6 max-w-xl text-lg leading-8 text-muted-foreground"
            style={{ "--d": 2 } as React.CSSProperties}
          >
            A calm, fast place to write down what you learn, turn rough notes into
            articles, and share them with readers who care.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ "--d": 3 } as React.CSSProperties}>
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start writing <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">Read the blog</Link>
            </Button>
          </div>
          <p className="rise mt-6 font-mono text-xs text-muted-foreground" style={{ "--d": 4 } as React.CSSProperties}>
            free · no credit card · your words stay yours
          </p>
        </div>

        {/* Retro "note" window */}
        <div className="rise relative" style={{ "--d": 3 } as React.CSSProperties}>
          <div className="window">
            <div className="window-bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="ml-2">capture.md</span>
            </div>
            <div className="space-y-3 p-6 font-mono text-sm leading-relaxed">
              <p className="text-muted-foreground">
                <span className="text-teal">$</span> new idea
              </p>
              <p>
                <span className="text-highlight">title:</span> tiny habits beat big goals
              </p>
              <p>
                <span className="text-highlight">tags:</span> #habits #notes #growth
              </p>
              <p className="text-muted-foreground">
                &ldquo;Make it so small you can&apos;t say no, then let it grow.&rdquo;
              </p>
              <p className="caret">
                <span className="text-teal">&gt;</span> publishing
              </p>
            </div>
          </div>
          <span className="sticker bob absolute -right-3 -top-4 hidden sm:inline-flex" style={{ "--r": "4deg" } as React.CSSProperties}>
            <Lightbulb className="h-3.5 w-3.5 text-highlight" /> new idea
          </span>
          <span
            className="sticker bob absolute -bottom-4 -left-3 hidden sm:inline-flex"
            style={{ "--r": "-3deg", animationDelay: "1.2s" } as React.CSSProperties}
          >
            <Rss className="h-3.5 w-3.5 text-teal" /> published
          </span>
        </div>
      </section>

      {/* ───────── Topic marquee ───────── */}
      <div className="marquee overflow-hidden border-y bg-card/50 py-4 backdrop-blur-sm" aria-hidden>
        <div className="marquee-track font-mono text-sm uppercase tracking-widest text-muted-foreground">
          {[...TOPICS, ...TOPICS].map((topic, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="px-6">{topic}</span>
              <span className="text-highlight">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ───────── Latest posts ───────── */}
      {posts.length > 0 && (
        <section className="container py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">{"// fresh from the notebook"}</p>
              <h2 className="text-3xl font-bold sm:text-4xl">Latest posts</h2>
            </div>
            <Link href="/blog" className="flex items-center gap-1 text-sm font-medium hover:text-highlight">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── Features (bento) ───────── */}
      <section className="container py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow mb-3">{"// what's inside"}</p>
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need, nothing you don&apos;t</h2>
          <p className="mt-4 text-muted-foreground">
            A focused toolkit for writing and sharing, wrapped in an interface that gets out of your way.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="window lg:col-span-2">
            <div className="window-bar">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <span className="ml-2">editor</span>
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <PenLine className="mb-3 h-8 w-8 text-highlight" />
                <h3 className="text-xl font-bold">A rich, distraction-free editor</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Headings, quotes, tables, task lists, images and syntax-highlighted code, with an editor
                  that feels like a notebook.
                </p>
              </div>
              <pre className="overflow-hidden rounded-lg border bg-muted p-4 font-mono text-xs leading-6">
{`## Why it works
- capture fast
- edit later
> ship it

\`\`\`ts
publish(idea)
\`\`\``}
              </pre>
            </div>
          </article>

          {[
            { icon: Search, title: "Search that finds it", text: "Filter by category, tag and keyword to get back to any note in seconds." },
            { icon: Zap, title: "Fast by default", text: "Server-rendered pages and tuned queries keep every page snappy." },
            { icon: ShieldCheck, title: "Secure sign-in", text: "Hashed passwords, optional Google sign-in and brute-force protection." },
            { icon: MessagesSquare, title: "Real conversations", text: "Threaded comments and likes keep readers talking to each other." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="window p-6 transition-transform hover:-translate-y-1">
              <Icon className="mb-3 h-8 w-8 text-teal" />
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}

          <article className="window p-6 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-sm">
                <BarChart3 className="mb-3 h-8 w-8 text-highlight" />
                <h3 className="text-lg font-bold">See what resonates</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Views, reading time and comments on every post, so you know what your readers love.
                </p>
              </div>
              <div className="flex h-24 items-end gap-2" aria-hidden>
                {[35, 55, 40, 75, 60, 90, 70].map((h, i) => (
                  <span
                    key={i}
                    className="w-6 rounded-t-md border-[1.5px] border-[color:var(--shadow-ink)] bg-highlight/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ───────── How it works ───────── */}
      <section className="container py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow mb-3">{"// how it works"}</p>
          <h2 className="text-3xl font-bold sm:text-4xl">From a spark to a published post</h2>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            { n: "01", icon: Lightbulb, title: "Capture", text: "Jot the idea down the moment it arrives. Save it as a draft." },
            { n: "02", icon: Brain, title: "Shape", text: "Refine it with the editor until it says exactly what you mean." },
            { n: "03", icon: Send, title: "Share", text: "Publish in one click and let readers find, save and discuss it." },
          ].map(({ n, icon: Icon, title, text }) => (
            <li key={n} className="relative rounded-xl border bg-card/80 p-6 shadow-[3px_3px_0_0_var(--shadow-ink)] backdrop-blur-sm">
              <span className="font-mono text-5xl font-bold text-foreground/10">{n}</span>
              <Icon className="my-3 h-7 w-7 text-highlight" />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Call to action ───────── */}
      <section className="container pb-8 pt-12">
        <div className="window">
          <div className="window-bar">
            <span className="dot" /><span className="dot" /><span className="dot" />
            <span className="ml-2">welcome.txt</span>
          </div>
          <div className="px-6 py-16 text-center sm:py-20">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-5xl">
              Start your <span className="marker">second brain</span> today
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Create a free account, write your first post, and join readers who love good ideas.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Create your account <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">I already have one</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
