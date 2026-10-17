import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/features/settings/ProfileForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/signin");

  // Read from the database (not the session) so the form always shows saved values.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, image: true, email: true, role: true, id: true },
  });
  if (!user) redirect("/auth/signin");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              name: user.name ?? "",
              bio: user.bio ?? "",
              image: user.image,
              email: user.email,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1 text-sm font-medium">Role</p>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">Account ID</p>
            <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
