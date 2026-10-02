import { NotFoundActions } from '@frontend/components/errors/NotFoundActions';
import { GlitchCode } from '@frontend/components/errors/GlitchCode';

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found__signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="not-found__content">
        <GlitchCode />
        <h1 id="not-found-title" className="not-found__title">Page not found</h1>
        <p className="not-found__copy">
          The page or resource you&apos;re looking for may have moved, been renamed, or is temporarily unavailable.
        </p>
        <NotFoundActions />
      </div>
    </section>
  );
}
