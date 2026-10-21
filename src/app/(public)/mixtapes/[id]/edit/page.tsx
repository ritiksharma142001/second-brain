import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { getMixtapeForViewer } from "@/lib/mixtape-data";
import { MixtapeEditor } from "@/components/features/mixtapes/MixtapeEditor";

export const metadata = { title: "Edit mixtape", robots: { index: false } };

export default async function EditMixtapePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/signin");

  const found = await getMixtapeForViewer((await params).id, session.user);
  // Only the owner edits; anyone else just sees "not found".
  if (!found?.isOwner) notFound();
  const { tape } = found;

  return (
    <div className="container py-10">
      <MixtapeEditor
        initial={{
          id: tape.id,
          title: tape.title,
          dedication: tape.dedication,
          note: tape.note,
          tapeLength: tape.tapeLength,
          color: tape.color,
          isPublic: tape.isPublic,
          tracks: tape.tracks.map((t) => ({
            side: t.side,
            title: t.title,
            artist: t.artist,
            year: t.year,
            durationSec: t.durationSec,
            note: t.note,
            link: t.link,
          })),
        }}
      />
    </div>
  );
}
