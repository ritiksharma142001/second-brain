import Link from "next/link";
import { CassetteTape, Clock, Heart, PenLine } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { listPublicMixtapes } from "@/lib/mixtape-data";
import { Button } from "@/components/ui/button";
import { MixtapeCard } from "@/components/features/mixtapes/MixtapeCard";

export const metadata = {
  title: "Mixtapes",
  description:
    "Cassette mixtapes made the old way: 30 minutes a side, a note for every song, a dedication on the label.",
};

const RULES = [
  {
    icon: Clock,
    title: "Tape runs out",
    text: "30 minutes a side on a C60, 45 on a C90. Every song has to earn its place.",
  },
  {
    icon: PenLine,
    title: "Liner notes",
    text: "Write why each song is there. That's the part nobody does any more.",
  },
  {
    icon: Heart,
    title: "Dedicate it",
    text: "Write who it's for on the label, add a letter, then share it or keep it.",
  },
];

export default async function MixtapesPage() {
  const [tapes, session] = await Promise.all([
    listPublicMixtapes(),
    getServerSession(),
  ]);
  const signedIn = !!session?.user;

  return (
    <div className="container py-12 sm:py-16">
      <header className="mb-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow rise mb-3">{"// the tape shelf"}</p>
          <h1
            className="rise text-4xl font-bold sm:text-6xl"
            style={{ "--d": 1 } as React.CSSProperties}
          >
            Mixtapes, the <span className="marker">old way</span>
          </h1>
          <p
            className="rise mt-4 max-w-xl text-lg text-muted-foreground"
            style={{ "--d": 2 } as React.CSSProperties}
          >
            Before endless playlists, you made someone a tape. Pick songs old
            and new, fit them on two sides, write a note for each one and a
            dedication on the label.
          </p>
          <div
            className="rise mt-6 flex flex-wrap gap-3"
            style={{ "--d": 3 } as React.CSSProperties}
          >
            <Button asChild size="lg">
              <Link href={signedIn ? "/mixtapes/new" : "/auth/signin"}>
                <CassetteTape /> Make a mixtape
              </Link>
            </Button>
            {signedIn && (
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard/mixtapes">My tapes</Link>
              </Button>
            )}
          </div>
        </div>
        <ul className="grid gap-3">
          {RULES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border bg-card/80 p-4 backdrop-blur-sm"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-highlight" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </header>

      {tapes.length === 0 ? (
        <div className="window mx-auto max-w-lg">
          <div className="window-bar">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="ml-2">shelf.txt</span>
          </div>
          <div className="p-10 text-center">
            <p className="caret font-mono text-sm text-muted-foreground">
              The shelf is empty. Be the first to leave a tape
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tapes.map((tape) => (
            <MixtapeCard key={tape.id} tape={tape} />
          ))}
        </div>
      )}
    </div>
  );
}
