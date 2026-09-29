'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { defaultNavigation } from '@/lib/navigation';

interface Destination {
  label: string;
  href: string;
  section: string;
  description?: string;
}

/** Every public page, once, with the section it belongs to. */
function destinations(): Destination[] {
  const parents = new Map(defaultNavigation.filter((i) => !i.parentId).map((i) => [i.id, i.label]));
  const seen = new Set<string>();
  const list: Destination[] = [
    { label: 'Home', href: '/', section: 'GIMUN & GMC', description: 'Where diplomacy meets the courtroom' },
    { label: 'Register', href: '/register', section: 'Apply', description: 'Apply for GIMUN or the GIKI Moot Court' },
  ];
  for (const item of defaultNavigation) {
    const section = item.parentId ? (parents.get(item.parentId) ?? '') : item.label;
    list.push({
      label: item.parentId ? item.label : `${item.label} overview`,
      href: item.href,
      section,
      description: item.description,
    });
  }
  list.push({ label: 'Privacy', href: '/privacy', section: 'About', description: 'How registration data is handled' });
  return list.filter((d) => (seen.has(d.href) ? false : (seen.add(d.href), true)));
}

const ALL = destinations();

/**
 * The quick jump dialog (Ctrl+K or Cmd+K, or the search button in the header):
 * type a few letters, arrow to a page, Enter to go. A native modal dialog,
 * so focus stays inside and Escape closes it; the header button restores
 * focus. Loaded only the first time it is opened.
 */
export default function QuickJump({ onClose, navigate }: { onClose: () => void; navigate: (href: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const id = useId();


  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = ALL.filter((d) => {
    const text = `${d.label} ${d.section} ${d.description ?? ''}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });

  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
  }, []);

  const go = (destination: Destination | undefined) => {
    if (!destination) return;
    dialog.current?.close();
    navigate(destination.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!results.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = (active + step + results.length) % results.length;
      setActive(next);
      document.getElementById(`${id}-option-${next}`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="quick-jump"
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
    >
      <h2 id={`${id}-title`} className="sr-only">
        Jump to a page
      </h2>
      <div className="quick-jump__field">
        <Search aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-text-3" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? `${id}-option-${active}` : undefined}
          aria-label="Page to jump to"
          placeholder="Jump to a page"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className="quick-jump__input"
        />
        <kbd className="quick-jump__key">Esc</kbd>
      </div>

      <ul id={`${id}-list`} role="listbox" aria-label="Pages" className="quick-jump__list">
        {results.map((destination, index) => (
          <li
            key={destination.href}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={index === active}
            className="quick-jump__option"
            onPointerMove={() => setActive(index)}
            onClick={() => go(destination)}
          >
            <span className="min-w-0">
              <span className="quick-jump__label">{destination.label}</span>
              {destination.description && <span className="quick-jump__copy">{destination.description}</span>}
            </span>
            <span className="quick-jump__section">{destination.section}</span>
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="quick-jump__arrow" />
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="quick-jump__empty">No page matches “{query}”.</p>}
      <p className="quick-jump__hint" aria-hidden="true">
        <kbd className="quick-jump__key">↑</kbd>
        <kbd className="quick-jump__key">↓</kbd> to move, <kbd className="quick-jump__key">Enter</kbd> to go
      </p>
    </dialog>
  );
}
