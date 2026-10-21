import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { MixtapeEditor } from "@/components/features/mixtapes/MixtapeEditor";

export const metadata = { title: "Make a mixtape", robots: { index: false } };

export default async function NewMixtapePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/signin");

  return (
    <div className="container py-10">
      <MixtapeEditor />
    </div>
  );
}
