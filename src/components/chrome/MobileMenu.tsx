"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { TransitionLink as Link } from "@/components/motion/TransitionLink";
import { useRenderedAt, useSiteConfig } from "@/components/SiteConfigProvider";
import { lockScroll, unlockScroll } from "@/lib/motion/bridge";
import { firstIntent } from "@/lib/motion/gates";
import { prefersReducedMotion } from "@/lib/motion/policy";
import { navigationTree } from "@/lib/navigation";
import { eventPhase } from "@/lib/phase";
import { BrandMark } from "./BrandMark";
import { isCurrentPath } from "./nav-utils";
import { ThemeSwitch } from "./ThemeSwitch";

type MenuState = "closed" | "open" | "closing";

// The header renders this menu on every page, so a static GSAP import put
// GSAP in every page's first-load JavaScript. It loads on the visitor's first
// touch, scroll or key press instead, and again on demand when the menu opens.
let gsapModule: Promise<typeof import("gsap")> | undefined;
const loadGsap = () => (gsapModule ??= import("gsap").catch((error: unknown) => {
  gsapModule = undefined;
  throw error;
}));

const FOCUSABLE =
  'a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

/** The accessible mobile dialog, with React Bits-inspired staggered side panels. */
export function MobileMenu({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const site = useSiteConfig();
  const renderedAt = useRenderedAt();
  const pathname = usePathname();
  // The full set, not the header's: on a phone this is the only navigation.
  // Register has its own button at the foot of the menu.
  const groups = navigationTree(site.navigation, "footer").filter(
    (g) => g.href !== "/register",
  );
  const registrationOpen = eventPhase(site, renderedAt) === "registration-open";
  const menuRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [state, setState] = useState<MenuState>(open ? "open" : "closed");
  if (open && state !== "open") setState("open");
  if (!open && state === "open") setState("closing");

  // Fetch GSAP once the visitor shows intent, so it is ready before a tap opens the menu.
  useEffect(() => {
    void firstIntent().then(loadGsap).catch(() => undefined);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu || state === "closed") return;
    const backdrop = menu.querySelector<HTMLElement>(".mobile-menu__backdrop");
    const panels = Array.from(
      menu.querySelectorAll<HTMLElement>(".mobile-menu__panel"),
    );
    const surface = menu.querySelector<HTMLElement>(".mobile-menu__surface");
    const rows = Array.from(
      menu.querySelectorAll<HTMLElement>(".mobile-menu__rise"),
    );
    if (!surface || !backdrop) return;

    let cancelled = false;
    let timer: number | undefined;
    let timeline: { kill: () => void } | undefined;
    // The panels stay hidden until GSAP shows them, so focus moves in only then.
    const focusClose = () => {
      if (state === "open" && !menu.contains(document.activeElement)) closeRef.current?.focus();
    };
    const finish = () => setState("closed");
    loadGsap()
      .then(({ gsap }) => {
        if (cancelled) return;
        if (prefersReducedMotion()) {
          gsap.set([...panels, surface], { xPercent: state === "open" ? 0 : 110, visibility: "visible" });
          gsap.set(backdrop, { opacity: state === "open" ? 1 : 0 });
          gsap.set(rows, { y: 0, opacity: 1 });
          focusClose();
          if (state === "closing") timer = window.setTimeout(finish, 0);
          return;
        }

        const tl = gsap.timeline({
          onComplete: state === "closing" ? finish : undefined,
        });
        timeline = tl;
        if (state === "open") {
          gsap.set([...panels, surface], { xPercent: 110, visibility: "visible" });
          gsap.set(backdrop, { opacity: 0 });
          gsap.set(rows, { y: 22, opacity: 0.35 });
          focusClose();
          tl
            .to(backdrop, { opacity: 1, duration: 0.32, ease: "power2.out" }, 0)
            .to(panels, { xPercent: 0, duration: 0.5, ease: "power4.out", stagger: 0.07 }, 0)
            .to(surface, { xPercent: 0, duration: 0.56, ease: "power4.out" }, 0.16)
            .to(
              rows,
              {
                y: 0,
                opacity: 1,
                duration: 0.42,
                ease: "power3.out",
                stagger: 0.035,
              },
              0.3,
            );
        } else {
          tl
            .to(
              surface,
              { xPercent: 110, duration: 0.36, ease: "power3.inOut" },
              0,
            )
            .to(
              [...panels].reverse(),
              {
                xPercent: 110,
                duration: 0.36,
                ease: "power3.inOut",
                stagger: 0.045,
              },
              0.04,
            )
            .to(backdrop, { opacity: 0, duration: 0.28, ease: "power2.out" }, 0.12);
        }
      })
      // Offline before GSAP arrived: close without the animation rather than strand the dialog.
      .catch(() => {
        if (cancelled) return;
        if (state === "closing") finish();
        else {
          for (const el of [...panels, surface]) el.style.visibility = "visible";
          backdrop.style.opacity = "1";
          focusClose();
        }
      });
    return () => {
      cancelled = true;
      timeline?.kill();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [state]);

  const requestClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  // Lock scrolling, trap focus, close on Escape.
  useEffect(() => {
    if (state !== "open") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll("mobile-menu");
    requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable =
        menuRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      unlockScroll("mobile-menu");
    };
  }, [state, requestClose]);

  if (state === "closed") return null;

  return (
    <div
      ref={menuRef}
      className="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile menu"
      aria-hidden={state === "closing"}
      data-state={state}
      data-lenis-prevent=""
    >
      <button
        type="button"
        className="mobile-menu__backdrop"
        tabIndex={-1}
        aria-hidden="true"
        onClick={requestClose}
      />
      <div className="mobile-menu__panels" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span key={index} className="mobile-menu__panel" />
        ))}
      </div>
      <div className="mobile-menu__surface">
        <div className="mobile-menu__top">
          <Link href="/" className="brand" onClick={requestClose}>
            <BrandMark className="brand__mark" />
            <span>GIMUN &amp; GMC</span>
          </Link>
          <button
            ref={closeRef}
            type="button"
            className="mobile-menu__close"
            aria-label="Close mobile menu"
            onClick={requestClose}
          >
            <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="mobile-menu__nav">
          <ul>
            <li className="mobile-menu__group">
              <span className="mobile-menu__mask">
                <Link
                  href="/"
                  className="mobile-menu__link mobile-menu__rise"
                  aria-current={pathname === "/" ? "page" : undefined}
                  onClick={requestClose}
                >
                  Home
                </Link>
              </span>
            </li>
            {groups.map((item) => (
              <li key={item.id} className="mobile-menu__group">
                <span className="mobile-menu__mask">
                  <Link
                    href={item.href}
                    className="mobile-menu__link mobile-menu__rise"
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={requestClose}
                  >
                    {item.label}
                  </Link>
                </span>
                {item.dropdown.length > 0 && (
                  <ul className="mobile-menu__children mobile-menu__rise">
                    {item.dropdown.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          className="mobile-menu__child"
                          aria-current={
                            isCurrentPath(child.href, pathname)
                              ? "page"
                              : undefined
                          }
                          onClick={requestClose}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-menu__bottom">
          <Link
            href="/register"
            className="mobile-menu__cta"
            onClick={requestClose}
          >
            {registrationOpen
              ? "Register for GIMUN or GMC"
              : "Registration status"}
            <span className="mobile-menu__cta-icon" aria-hidden="true">
              <ArrowRight strokeWidth={1.75} className="size-4" />
            </span>
          </Link>
          <ThemeSwitch variant="segmented" />
        </div>
      </div>
    </div>
  );
}
