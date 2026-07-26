import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Eye, MessageSquare } from "lucide-react";

async function getStats() {
  const [totalPosts, totalUsers, totalViews, totalComments] = await Promise.all([
    db.post.count(),
    db.user.count(),
    db.post.aggregate({
      _sum: {
        views: true,
      },
    }),
    db.comment.count(),
  ]);

  return {
    totalPosts,
    totalUsers,
    totalViews: totalViews._sum.views || 0,
    totalComments,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
    },
    {
      title: "Total Comments",
      value: stats.totalComments,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your blog statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Welcome to your admin dashboard! Use the sidebar to navigate to different sections.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
