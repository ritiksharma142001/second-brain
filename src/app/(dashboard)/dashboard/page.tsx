import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, MessageCircle, Eye, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return null;
  }

  const [bookmarksCount, commentsCount, historyCount, user] = await Promise.all([
    prisma.bookmark.count({
      where: { userId: session.user.id },
    }),
    prisma.comment.count({
      where: { userId: session.user.id },
    }),
    prisma.viewHistory.count({
      where: { userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      title: "Bookmarks",
      value: bookmarksCount,
      icon: Bookmark,
      description: "Posts you've saved",
    },
    {
      title: "Comments",
      value: commentsCount,
      icon: MessageCircle,
      description: "Your comments",
    },
    {
      title: "Reading History",
      value: historyCount,
      icon: Eye,
      description: "Posts you've read",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || "User"}!
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium">Email:</span>{" "}
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Member since:</span>{" "}
            <span className="text-sm text-muted-foreground">
              {user?.createdAt &&
                new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
