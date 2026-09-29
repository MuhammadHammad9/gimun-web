/** Server-rendered so the transition surface is ready before client hydration. */
export function PageCurtain() {
  return (
    <div
      aria-hidden="true"
      className="page-curtain print:hidden"
      data-curtain="idle"
      data-testid="page-curtain"
    >
      <div className="page-curtain__panels">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="page-curtain__panel" data-curtain-panel key={index} />
        ))}
      </div>
      <div className="page-curtain__copy">
        <p className="page-curtain__mask">
          <span className="page-curtain__section" data-curtain-line data-curtain-section />
        </p>
        <p className="page-curtain__mask">
          <span className="page-curtain__title" data-curtain-line data-curtain-title />
        </p>
      </div>
    </div>
  );
}

