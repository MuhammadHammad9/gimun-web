import { Phone } from "lucide-react";
import type { SiteConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DirectorDirectoryFrame } from "./DirectorDirectoryFrame";

type Contact = NonNullable<SiteConfig["contacts"]>[number];

/** Pakistani mobile numbers as dialable links: "0333 9200251" -> "tel:+923339200251". */
export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `tel:${digits.startsWith("0") ? `+92${digits.slice(1)}` : `+${digits}`}`;
}

export function contactsFor(
  site: SiteConfig,
  {
    track,
    group,
  }: { track?: "gimun" | "moot-cup"; group?: Contact["group"] } = {},
) {
  return (site.contacts ?? []).filter(
    (c) =>
      (!group || c.group === group) &&
      (!track || c.track === track || c.track === "shared"),
  );
}

export function ContactDirectory({
  contacts,
  className,
  track,
  stackIndex,
}: {
  contacts: Contact[];
  className?: string;
  track?: "gimun" | "gmc";
  stackIndex?: number;
}) {
  if (contacts.length === 0) return null;
  const list = (
    <ul
      className={cn(
        track
          ? "director-directory__grid"
          : "grid gap-px overflow-hidden rounded-2xl border border-line-2 bg-line-2 sm:grid-cols-2 lg:grid-cols-3",
        !track && className,
      )}
    >
      {contacts.map((person) => (
        <li
          key={`${person.name}-${person.role}`}
          className="flex flex-col gap-1 bg-canvas p-4"
        >
          <span className="font-medium text-text">{person.name}</span>
          <span className="text-[0.8125rem] text-text-3">{person.role}</span>
          {person.phone && (
            <a
              href={telHref(person.phone)}
              className="mt-1 inline-flex w-fit items-center gap-2 font-mono text-small text-text-2 hover:text-text"
            >
              <Phone
                aria-hidden="true"
                strokeWidth={1.75}
                className="size-3.5"
              />
              {person.phone}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
  return track ? (
    <DirectorDirectoryFrame track={track} className={className} stackIndex={stackIndex}>
      {list}
    </DirectorDirectoryFrame>
  ) : (
    list
  );
}
