"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AVATAR_SEEDS, AVATAR_STYLES, buildAvatarUrl } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  initial: { name: string; bio: string; image: string | null; email: string };
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [image, setImage] = useState<string | null>(initial.image);
  const [style, setStyle] = useState<string>(AVATAR_STYLES[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, image }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus({ type: "error", text: data.error ?? "Failed to update profile." });
        return;
      }

      // Refresh the session token so the header shows the new name/picture.
      // (update() with no argument only re-reads the session, so pass a payload to trigger the refresh.)
      await update({ refresh: true });
      router.refresh();
      setStatus({ type: "success", text: "Profile updated successfully!" });
    } catch {
      setStatus({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={image || undefined} alt={name} />
          <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Profile picture</p>
          <p className="text-xs text-muted-foreground">Pick a cartoon avatar below</p>
          {image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 h-7 px-2 text-xs"
              onClick={() => setImage(null)}
            >
              Use my initials instead
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {AVATAR_STYLES.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={style === s.id ? "default" : "outline"}
              onClick={() => setStyle(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {AVATAR_SEEDS.map((seed) => {
            const url = buildAvatarUrl(style, seed);
            const selected = image === url;
            return (
              <button
                key={seed}
                type="button"
                onClick={() => setImage(url)}
                aria-label={`Choose ${seed} avatar`}
                aria-pressed={selected}
                className={cn(
                  "relative overflow-hidden rounded-full border bg-muted transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected && "ring-2 ring-primary"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="aspect-square w-full" loading="lazy" />
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Check className="h-5 w-5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers a little about yourself"
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground">{bio.length}/300</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={initial.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
      </div>

      {status && (
        <p
          role="status"
          className={cn("text-sm", status.type === "success" ? "text-green-600" : "text-destructive")}
        >
          {status.text}
        </p>
      )}

      <Button type="submit" disabled={isSaving || name.trim().length < 2}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
