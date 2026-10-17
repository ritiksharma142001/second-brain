import Link from "next/link";
import { Brain } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={siteConfig.name}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[color:var(--shadow-ink)] bg-primary text-primary-foreground shadow-[2px_2px_0_0_var(--highlight)] transition-transform group-hover:-rotate-6">
        <Brain className="h-5 w-5" />
      </span>
      <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">
        {siteConfig.name}
      </span>
    </Link>
  );
}
