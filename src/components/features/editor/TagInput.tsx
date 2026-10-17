"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { generateSlug } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Existing tag names, offered as autocomplete. */
  suggestions?: string[];
  max?: number;
  id?: string;
}

/** Type a tag and press Enter or comma to add it; Backspace removes the last one. */
export function TagInput({
  value,
  onChange,
  suggestions = [],
  max = 8,
  id,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const listId = useId();

  const add = (raw: string) => {
    const name = raw.trim().replace(/^#/, "").replace(/\s+/g, " ").slice(0, 30);
    setDraft("");
    const slug = generateSlug(name);
    if (
      !slug ||
      value.length >= max ||
      value.some((tag) => generateSlug(tag) === slug)
    )
      return;
    onChange([...value, name]);
  };

  return (
    <div>
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background/60 px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
        {value.map((tag) => (
          <span key={tag} className="sticker">
            #{tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          list={listId}
          disabled={value.length >= max}
          placeholder={
            value.length >= max
              ? "Tag limit reached"
              : value.length
                ? ""
                : "japan, kyoto, street-food..."
          }
          onChange={(e) => {
            const text = e.target.value;
            if (text.includes(",")) text.split(",").forEach(add);
            else setDraft(text);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <datalist id={listId}>
          {suggestions
            .filter(
              (s) => !value.some((v) => generateSlug(v) === generateSlug(s)),
            )
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      </div>
      <p className="mt-1.5 font-mono text-xs text-muted-foreground">
        {value.length}/{max} · press Enter or comma to add
      </p>
    </div>
  );
}
