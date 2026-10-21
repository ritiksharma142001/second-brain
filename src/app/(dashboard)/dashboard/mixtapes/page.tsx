import Link from "next/link";
import { CassetteTape, Pencil } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { listMixtapesByAuthor } from "@/lib/mixtape-data";
import { Button } from "@/components/ui/button";
import { MixtapeCard } from "@/components/features/mixtapes/MixtapeCard";
import { DeleteMixtapeButton } from "@/components/features/mixtapes/DeleteMixtapeButton";

export const metadata = { title: "My mixtapes" };

export default async function MyMixtapesPage() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;
  const tapes = await listMixtapesByAuthor(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">My mixtapes</h2>
          <p className="mt-1 text-muted-foreground">
            Private tapes are only visible to you until you publish them to the
            shelf.
          </p>
        </div>
        <Button asChild>
          <Link href="/mixtapes/new">
            <CassetteTape /> Make a mixtape
          </Link>
        </Button>
      </div>

      {tapes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <CassetteTape className="mx-auto h-10 w-10 text-highlight" />
          <p className="mt-3 font-medium">No tapes yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Make one for someone, or just for yourself.
          </p>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {tapes.map((tape) => (
            <div key={tape.id}>
              <MixtapeCard tape={tape} showStatus />
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/mixtapes/${tape.id}/edit`}>
                    <Pencil /> Edit
                  </Link>
                </Button>
                <DeleteMixtapeButton id={tape.id} title={tape.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
