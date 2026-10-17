/**
 * Adds 20 sample posts (travel, technology, programming, AI).
 * Safe to re-run: posts are matched by slug and never overwritten.
 *
 *   npm run db:seed:posts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const p = (text: string) => `<p>${text}</p>`;
const h2 = (text: string) => `<h2>${text}</h2>`;
const ul = (...items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const quote = (text: string) => `<blockquote><p>${text}</p></blockquote>`;
const code = (lang: string, src: string) => `<pre><code class="language-${lang}">${src}</code></pre>`;

interface SeedPost {
  title: string;
  excerpt: string;
  category: "travel" | "technology" | "programming" | "ai";
  tags: string[];
  author: "admin@example.com" | "user@example.com";
  body: string;
}

const posts: SeedPost[] = [
  // ───────────── Travel ─────────────
  {
    title: "Kyoto in the Rain: A Slow Itinerary",
    excerpt: "Rain turns Kyoto into a different city: quieter temples, glossy stone lanes and tea houses with a free seat.",
    category: "travel",
    tags: ["japan", "kyoto", "city-guide", "photography"],
    author: "admin@example.com",
    body:
      p("Most guides tell you to avoid Kyoto in the rainy season. I think that is bad advice. The crowds thin out, the moss on the temple gardens turns an almost unreal green, and every lane shines like it has been polished for you.") +
      h2("Where to spend the wet hours") +
      ul("Kinkaku-ji early, before the tour buses, when the gold pavilion doubles itself in the pond", "Nishiki Market for a covered, rain-proof lunch", "A matcha-and-wagashi stop in a Gion tea house") +
      p("Pack a compact umbrella and shoes you do not mind soaking. Temple floors are cold, so bring dry socks to change into.") +
      quote("The best photographs of Kyoto were all taken by someone who refused to go back to the hotel.") +
      p("By evening the lanterns of Pontocho reflect on the wet cobbles and the whole district glows. Stay for dinner; you earned it."),
  },
  {
    title: "Eating Our Way Through Osaka",
    excerpt: "Takoyaki, okonomiyaki and kushikatsu: a street-food crawl through the kitchen of Japan.",
    category: "travel",
    tags: ["japan", "osaka", "street-food"],
    author: "user@example.com",
    body:
      p("Osaka has a saying, <em>kuidaore</em>: eat until you drop. After three days in Dotonbori I understand it completely.") +
      h2("The order that worked for us") +
      ul("Takoyaki from a stall with a queue, eaten too hot and burning your tongue on purpose", "Okonomiyaki cooked on the grill in front of you, with extra bonito flakes", "Kushikatsu, and remember: never double-dip in the shared sauce") +
      p("Go hungry and share everything. Portions are small by design so you can try more. Cash is still king at the smaller stalls, so keep a few thousand yen in coins and notes.") +
      p("Our favourite discovery was a tiny counter behind the Shinsekai tower that served only fried skewers and cold beer. No menu in English, just point and smile."),
  },
  {
    title: "Island Hopping in Bali on a Budget",
    excerpt: "Bali is easy to overspend in and easy to do cheaply. Here is the route, the ferries and the costs.",
    category: "travel",
    tags: ["bali", "indonesia", "budget-travel", "beaches"],
    author: "admin@example.com",
    body:
      p("Bali is not one place. The south is surf bars and traffic, Ubud is rice terraces and yoga, and the small islands off the coast feel like another country entirely.") +
      h2("A simple two-week route") +
      ul("Five nights in Ubud: walk the terraces, take a cooking class", "Fast boat to Nusa Penida for the cliffs and manta rays", "Finish in Sidemen, where the volcano views are free") +
      p("Rent a scooter only if you are confident; otherwise a driver for the day costs about the same as a taxi in a small city. Eat at warungs, the family-run cafes, and a full meal rarely passes a few dollars.") +
      p("The single best money-saver: travel in the shoulder months of May and September, when prices drop and the beaches empty."),
  },
  {
    title: "A Week on Iceland's Ring Road",
    excerpt: "1,332 kilometres, countless waterfalls and one very stubborn sheep: our road trip around Iceland.",
    category: "travel",
    tags: ["iceland", "road-trip", "photography", "hiking"],
    author: "user@example.com",
    body:
      p("The Ring Road circles the whole island, and you can technically drive it in two days. Please do not. Give it a week and let the weather decide your plans.") +
      h2("Stops worth the detour") +
      ul("Seljalandsfoss, where you can walk behind the waterfall", "Jokulsarlon, icebergs drifting out to a black-sand beach", "The Myvatn area for geothermal baths without the Blue Lagoon crowds") +
      p("Fuel up whenever you see a station in the north and east; they can be far apart. Check the road and wind conditions every morning, because a gust can take a car door clean off.") +
      p("We saw the northern lights on our fifth night from a gravel lay-by, wrapped in every layer we owned. No photograph does it justice.") ,
  },
  {
    title: "Lisbon in Three Days",
    excerpt: "Tram 28, custard tarts and sunset viewpoints: a walkable three-day plan for Portugal's hilly capital.",
    category: "travel",
    tags: ["portugal", "lisbon", "city-guide", "street-food"],
    author: "admin@example.com",
    body:
      p("Lisbon is built on seven hills, so wear shoes with good grip. The reward is a viewpoint around nearly every corner.") +
      h2("Day by day") +
      ul("Day one: Alfama, the castle and a fado dinner", "Day two: Belem for the tower, the monastery and the original pasteis de nata", "Day three: a day trip to Sintra, then sunset at Miradouro da Senhora do Monte") +
      p("Skip Tram 28 at midday, when the queue is long, and ride it first thing instead. Or do what locals do and just climb the stairs.") +
      p("Eat where the menu is short and handwritten. Grilled sardines and a glass of vinho verde on a terrace is the most Lisbon thing you can do."),
  },
  {
    title: "Solo in Rome: What I Wish I Knew",
    excerpt: "Travelling alone in Rome is easy once you know a few things about timing, tickets and tourist traps.",
    category: "travel",
    tags: ["italy", "rome", "solo-travel", "city-guide"],
    author: "user@example.com",
    body:
      p("I arrived in Rome alone and slightly nervous. Within a day I had stopped worrying; the city is made for wandering.") +
      h2("Lessons from a week alone") +
      ul("Book the Vatican Museums and Colosseum in advance, or lose half a day in a queue", "Fill a bottle at the free <em>nasoni</em> fountains", "Eat dinner after eight, and avoid any restaurant with a photo menu by a famous monument") +
      p("Early mornings are gold. At seven the Trevi Fountain is almost empty and the light on the marble is soft and warm.") +
      p("Solo travel taught me to say yes to small invitations: a stranger's tip for a coffee bar, a wine bar owner's recommendation. Those became the best memories."),
  },
  {
    title: "Trekking to Machu Picchu Without Rushing",
    excerpt: "Why the slower four-day Salkantay route beat the classic trail for us, and how to prepare for the altitude.",
    category: "travel",
    tags: ["peru", "hiking", "backpacking"],
    author: "admin@example.com",
    body:
      p("Everyone talks about the Inca Trail, but permits sell out months ahead. The Salkantay trek is wilder, a little tougher and, in my opinion, more beautiful.") +
      h2("Preparing for altitude") +
      ul("Spend two days in Cusco before you start walking", "Drink coca tea and plenty of water", "Go slowly; the trail will still be there in an hour") +
      p("The second day crosses a pass at around 4,600 metres. Lungs burn, the wind bites, and then the cloud lifts and the whole valley opens up beneath you.") +
      p("Machu Picchu itself arrives almost as an afterthought. After four days of walking, seeing it appear through the mist at dawn felt earned."),
  },
  {
    title: "Chiang Mai's Night Markets",
    excerpt: "Khao soi, mango sticky rice and handmade crafts: how to enjoy Chiang Mai after dark without overspending.",
    category: "travel",
    tags: ["thailand", "chiang-mai", "street-food", "budget-travel"],
    author: "user@example.com",
    body:
      p("As the sun sets, the streets of old Chiang Mai fill with carts, lanterns and the smell of charcoal. It is the best free entertainment in the city.") +
      h2("What to eat first") +
      ul("Khao soi, a coconut curry noodle soup that this region is famous for", "Sai oua, spicy northern sausage, hot off the grill", "Mango sticky rice for dessert, always") +
      p("Wander the Sunday Walking Street and bargain gently; a smile goes further than a hard stare. Most food stalls charge a few dollars per dish, so you can sample widely.") +
      p("Look for the stalls with locals queuing. That is a better review than any rating on a map."),
  },
  {
    title: "Packing Light: One Bag for Two Months",
    excerpt: "A 30-litre bag, ten items of clothing and no regrets. My carry-on-only system for long trips.",
    category: "travel",
    tags: ["backpacking", "packing", "budget-travel"],
    author: "admin@example.com",
    body:
      p("On my first long trip I carried a huge pack and used about a third of it. Now I travel with one 30-litre bag, and it changed how I move.") +
      h2("The core kit") +
      ul("Three tops and two bottoms in quick-dry fabric", "One warm layer and one light rain shell", "A small wash kit: travel soap, a clothesline, a sink plug") +
      p("The rule is simple: if you cannot imagine wearing it at least three times, it stays home. Laundry is cheap nearly everywhere.") +
      quote("You are not packing for the worst case. You are packing for a normal day, and buying the rest if you need it.") +
      p("A lighter bag means cheaper flights, easier trains and a lot less stress at every transfer."),
  },
  {
    title: "Chasing Sunrise in the Dolomites",
    excerpt: "Three hut-to-hut days in the Italian Alps, with golden peaks at dawn and strudel at every stop.",
    category: "travel",
    tags: ["italy", "dolomites", "hiking", "photography"],
    author: "user@example.com",
    body:
      p("The Dolomites glow pink at sunrise, a phenomenon the locals call <em>enrosadira</em>. We set our alarms for four in the morning to see it, and it was worth every yawn.") +
      h2("Hut-to-hut basics") +
      ul("Book mountain huts (rifugi) early for July and August", "Carry a sleeping-bag liner, since blankets are provided but pillows are not", "Always order the strudel") +
      p("Days are long but never lonely: each hut serves hot food, and hikers from everywhere swap stories over dinner. The trail signs are excellent and cell service is patchy, so download offline maps first.") +
      p("On the final morning we stood on a ridge as the first light hit the peaks. Nobody spoke for a full minute."),
  },

  // ───────────── Technology ─────────────
  {
    title: "Why I Moved My Side Project to Next.js 16",
    excerpt: "Turbopack, server components and caching changes: what improved, what broke and what I would do differently.",
    category: "technology",
    tags: ["nextjs", "react", "performance"],
    author: "admin@example.com",
    body:
      p("I put off upgrading for months, expecting a painful migration. In the end the move to Next.js 16 took an afternoon and made the app noticeably quicker.") +
      h2("What got better") +
      ul("Dev server start times dropped sharply with Turbopack", "Server components cut the JavaScript shipped to the browser", "Clearer caching defaults mean fewer surprises") +
      p("What broke? A couple of dependencies that assumed the old middleware file name, and async request APIs such as <code>params</code> now needing an <code>await</code>.") +
      p("My advice: upgrade on a branch, run your type checker first, then your tests. Most problems show up as compile errors, which is the best kind of problem to have."),
  },
  {
    title: "Building a Second Brain With Plain Markdown",
    excerpt: "You do not need a fancy app to capture ideas. A folder of Markdown files and three habits is enough.",
    category: "technology",
    tags: ["productivity", "notes"],
    author: "user@example.com",
    body:
      p("I have tried every note-taking app. What finally stuck was the least exciting option: a folder of plain text files.") +
      h2("Three habits that matter") +
      ul("Capture first, organise later: one inbox file for everything", "Review weekly: move the good ideas into their own notes", "Link notes to each other so ideas can find one another") +
      p("Plain Markdown means your notes outlive any single app. They are searchable, easy to back up and readable in twenty years.") +
      quote("A good note is one your future self can understand without context.") +
      p("Publishing the best ones as blog posts turns private thinking into something others can learn from. That is the whole idea behind a second brain."),
  },
  {
    title: "Local-First Apps: Why They Feel Faster",
    excerpt: "Reading and writing locally, syncing later: the design idea that makes apps feel instant.",
    category: "technology",
    tags: ["performance", "local-first", "design"],
    author: "admin@example.com",
    body:
      p("The fastest network request is the one you never make. Local-first apps keep your data on your device and sync in the background.") +
      h2("Why it feels instant") +
      ul("Reads and writes hit local storage, so there is no spinner", "The app works on a plane or in a tunnel", "Conflicts are merged automatically, instead of showing an error") +
      p("The trade-off is complexity. You need a sync strategy and a plan for conflicting edits. Tools such as CRDTs have made this far more approachable than it was a few years ago.") +
      p("Even if you do not go fully local-first, caching aggressively and updating the screen optimistically can borrow most of the benefit."),
  },

  // ───────────── Programming ─────────────
  {
    title: "Postgres Indexes in Plain English",
    excerpt: "What an index actually is, when it helps, and how to read EXPLAIN without panicking.",
    category: "programming",
    tags: ["postgres", "performance", "databases"],
    author: "admin@example.com",
    body:
      p("An index is a sorted shortcut. Without one, the database reads every row to answer your question. With one, it jumps almost straight to the answer.") +
      h2("Adding one") +
      code("sql", "CREATE INDEX idx_posts_published_at\n  ON posts (published_at DESC);") +
      p("Put an index on columns you filter or sort by often, and on foreign keys. Do not index everything: each index slows down writes and takes space.") +
      h2("Check it is used") +
      code("sql", "EXPLAIN ANALYZE\nSELECT * FROM posts\nWHERE published_at > now() - interval '7 days';") +
      p("Look for <code>Index Scan</code> rather than <code>Seq Scan</code>. If you still see a sequential scan on a big table, your filter may not match the index."),
  },
  {
    title: "A Practical Guide to Prisma Migrations",
    excerpt: "Stop using db push in production. Here is the safer migration workflow, and how to adopt it on an existing database.",
    category: "programming",
    tags: ["prisma", "postgres", "databases"],
    author: "user@example.com",
    body:
      p("<code>prisma db push</code> is great for prototyping, but it can drop data to make the schema match. In production you want versioned migrations.") +
      h2("The workflow") +
      ul("Develop with <code>prisma migrate dev</code> and commit the generated SQL", "Deploy with <code>prisma migrate deploy</code>, which only applies pending migrations", "Never edit a migration that has already been applied") +
      h2("Adopting it on an existing database") +
      code("bash", "npx prisma migrate diff --from-empty \\\n  --to-schema-datamodel prisma/schema.prisma --script \\\n  &gt; prisma/migrations/0_init/migration.sql\nnpx prisma migrate resolve --applied 0_init") +
      p("That marks your current schema as the baseline, so future changes are tracked cleanly from here."),
  },
  {
    title: "Testing React Components Without the Pain",
    excerpt: "Test what users see, not what your code does. A small set of habits that make tests last.",
    category: "programming",
    tags: ["react", "testing"],
    author: "admin@example.com",
    body:
      p("Fragile tests usually test implementation details: state values, internal function calls, class names. When you refactor, they all break even though nothing changed for the user.") +
      h2("Test behaviour instead") +
      ul("Find elements by role and label, the way a person would", "Click and type like a user, then assert on the visible result", "Mock the network, not your own components") +
      code("tsx", "test('shows an error for a short password', async () =&gt; {\n  render(&lt;SignUp /&gt;)\n  await user.type(screen.getByLabelText(/password/i), 'abc')\n  await user.click(screen.getByRole('button', { name: /sign up/i }))\n  expect(screen.getByRole('alert')).toHaveTextContent(/at least 8/i)\n})") +
      p("If a test breaks only when behaviour changes, it is doing its job."),
  },
  {
    title: "CSS Grid Layouts You'll Actually Reuse",
    excerpt: "Four grid patterns, from auto-fill card lists to a sticky-sidebar page, that cover most real layouts.",
    category: "programming",
    tags: ["css", "design"],
    author: "user@example.com",
    body:
      p("CSS Grid can look intimidating, but a handful of patterns cover most of what you will ever build.") +
      h2("A responsive card grid with no media queries") +
      code("css", ".cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));\n  gap: 1.5rem;\n}") +
      p("Cards wrap automatically as the screen narrows. No breakpoints needed.") +
      h2("A sidebar layout") +
      code("css", ".page {\n  display: grid;\n  grid-template-columns: 16rem 1fr;\n  gap: 2rem;\n}\n.sidebar { position: sticky; top: 5rem; align-self: start; }") +
      p("Remember <code>align-self: start</code>; without it the sidebar stretches the full height and sticky does nothing."),
  },

  // ───────────── AI ─────────────
  {
    title: "Prompt Patterns That Make LLMs Reliable",
    excerpt: "Clear roles, examples and output formats: simple techniques that turn flaky prompts into dependable ones.",
    category: "ai",
    tags: ["ai", "llm", "prompt-engineering"],
    author: "admin@example.com",
    body:
      p("Most unreliable AI output comes from vague instructions. A few small patterns fix a surprising amount of it.") +
      h2("Four patterns that work") +
      ul("State the task, the audience and the format up front", "Give one or two examples of the output you want", "Ask for structured output, such as JSON with named fields", "Tell the model what to do when it is unsure, instead of leaving it to guess") +
      p("Then test your prompt on awkward inputs: empty text, very long text, the wrong language. A prompt that survives those is ready to ship.") +
      quote("Treat prompts like code: version them, test them and review changes.") +
      p("Small, boring improvements add up faster than clever tricks."),
  },
  {
    title: "What AI Can't Replace in Code Review",
    excerpt: "Automated reviewers catch bugs and style issues. They still miss context, intent and team judgement.",
    category: "ai",
    tags: ["ai", "code-review"],
    author: "user@example.com",
    body:
      p("AI assistants are now genuinely useful in code review. They spot missing null checks, risky regexes and inconsistent naming within seconds.") +
      h2("Where humans still matter") +
      ul("Does this change solve the right problem?", "Will this design hold up in six months?", "Is the team comfortable maintaining it?") +
      p("Those questions depend on context that rarely lives in the diff: past incidents, product decisions, who will be on call.") +
      p("The best setup I have seen lets automation handle the mechanical checks, freeing people to talk about design and trade-offs. Review becomes a conversation again, not a checklist."),
  },
  {
    title: "A Beginner's Map of Machine Learning",
    excerpt: "Supervised, unsupervised and reinforcement learning explained with everyday examples and no maths.",
    category: "ai",
    tags: ["ai", "machine-learning"],
    author: "admin@example.com",
    body:
      p("Machine learning sounds mysterious, but the core idea is simple: instead of writing rules, you show a program examples and let it find the pattern.") +
      h2("Three families") +
      ul("<strong>Supervised</strong>: learn from labelled examples, like photos tagged &quot;cat&quot; or &quot;dog&quot;", "<strong>Unsupervised</strong>: find structure in unlabelled data, such as grouping similar customers", "<strong>Reinforcement</strong>: learn by trial and reward, the way you train a dog or a game-playing agent") +
      p("Most of what you meet day to day, like spam filters, recommendations and voice assistants, is supervised learning behind the scenes.") +
      p("You do not need advanced maths to start. Pick a small dataset, try a simple model and see what happens. Curiosity beats prerequisites."),
  },
];

const readingTime = (html: string) =>
  Math.max(1, Math.ceil(html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length / 200));

const ACRONYMS = new Set(["ai", "llm", "css", "ml"]);
const tagName = (slug: string) =>
  ACRONYMS.has(slug)
    ? slug.toUpperCase()
    : slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function main() {
  const authors = new Map(
    (await prisma.user.findMany({ where: { email: { in: ["admin@example.com", "user@example.com"] } } })).map((u) => [u.email, u.id])
  );
  const categories = new Map((await prisma.category.findMany()).map((c) => [c.slug, c.id]));

  const missing = [...new Set(posts.flatMap((post) => [post.author, post.category]))].filter(
    (key) => !authors.has(key) && !categories.has(key)
  );
  if (missing.length) throw new Error(`Run "npx prisma db seed" first. Missing: ${missing.join(", ")}`);

  let created = 0;
  let skipped = 0;

  for (const [index, post] of posts.entries()) {
    const slug = slugify(post.title);
    if (await prisma.post.findUnique({ where: { slug }, select: { id: true } })) {
      skipped++;
      continue;
    }

    // Spread over the last ~60 days, oldest first.
    const daysAgo = Math.round(((posts.length - index) / posts.length) * 60);
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await prisma.post.create({
      data: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.body,
        status: "PUBLISHED",
        publishedAt,
        readingTime: readingTime(post.body),
        views: 5 + ((index * 37) % 240),
        authorId: authors.get(post.author)!,
        categoryId: categories.get(post.category)!,
        tags: {
          connectOrCreate: post.tags.map((name) => ({
            where: { slug: slugify(name) },
            create: { name: tagName(slugify(name)), slug: slugify(name) },
          })),
        },
      },
    });
    created++;
  }

  console.log(`✅ ${created} posts created, ${skipped} already existed`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding posts failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
