import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Regular User",
      role: "USER",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Created regular user:", user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "technology" },
      update: {},
      create: {
        name: "Technology",
        slug: "technology",
        description: "Latest tech trends and innovations",
        color: "#3B82F6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "programming" },
      update: {},
      create: {
        name: "Programming",
        slug: "programming",
        description: "Coding tutorials and best practices",
        color: "#8B5CF6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "ai" },
      update: {},
      create: {
        name: "AI",
        slug: "ai",
        description: "Artificial Intelligence and Machine Learning",
        color: "#EC4899",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs" },
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript" },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      title: "Getting Started with Next.js 15",
      slug: "getting-started-nextjs-15",
      excerpt:
        "Learn how to build modern web applications with Next.js 15 and the App Router.",
      content: `<h2>Introduction</h2><p>Next.js 15 brings exciting new features and improvements to the popular React framework.</p><h2>Key Features</h2><p>Server Components, improved performance, and better developer experience.</p>`,
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 5,
      authorId: admin.id,
      categoryId: categories[0].id,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "TypeScript Best Practices in 2026",
      slug: "typescript-best-practices-2026",
      excerpt:
        "Essential TypeScript patterns and practices for modern application development.",
      content: `<h2>Introduction</h2><p>TypeScript continues to evolve with powerful features for type-safe development.</p><h2>Best Practices</h2><p>Always use strict mode, leverage type inference, and avoid 'any'.</p>`,
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      readingTime: 7,
      authorId: admin.id,
      categoryId: categories[1].id,
      tags: {
        connect: [{ id: tags[2].id }],
      },
    },
  });

  console.log(`✅ Created ${2} sample posts`);

  // Create sample comments
  const comment1 = await prisma.comment.create({
    data: {
      content: "Great article! Very helpful for beginners.",
      postId: post1.id,
      userId: user.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Thanks! Glad you found it useful.",
      postId: post1.id,
      userId: admin.id,
      parentId: comment1.id,
    },
  });

  console.log("✅ Created sample comments");

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📝 You can now:");
  console.log("   - Sign in with: admin@example.com (Admin access)");
  console.log("   - Sign in with: user@example.com (Regular user)");
  console.log("\n⚠️  Note: You'll need to request a magic link via the sign-in page");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
