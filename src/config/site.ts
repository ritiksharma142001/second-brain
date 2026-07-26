export const siteConfig = {
  name: "Second Brain",
  tagline: "Capture Ideas. Share Knowledge.",
  description: "A modern blogging platform for sharing knowledge and ideas",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/secondbrain",
    github: "https://github.com/secondbrain",
  },
  authors: [
    {
      name: "Second Brain Team",
      url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  ],
  creator: "Second Brain",
};

export const CATEGORIES = [
  { name: "Technology", slug: "technology", color: "#3B82F6", icon: "Laptop" },
  { name: "Programming", slug: "programming", color: "#8B5CF6", icon: "Code" },
  { name: "AI", slug: "ai", color: "#EC4899", icon: "Brain" },
  { name: "Career", slug: "career", color: "#10B981", icon: "Briefcase" },
  { name: "Books", slug: "books", color: "#F59E0B", icon: "Book" },
  { name: "Productivity", slug: "productivity", color: "#EF4444", icon: "Zap" },
  { name: "Life", slug: "life", color: "#06B6D4", icon: "Heart" },
  { name: "Open Source", slug: "open-source", color: "#6366F1", icon: "Github" },
  { name: "Next.js", slug: "nextjs", color: "#000000", icon: "Triangle" },
  { name: "JavaScript", slug: "javascript", color: "#F7DF1E", icon: "FileCode" },
];
