import { ArrowRight } from 'lucide-react';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';

export interface NextStep {
  href: string;
  title: string;
  /** One line on why a visitor would go there from this page. */
  body: string;
}

/**
 * The end of a utility page: two or three places a visitor usually goes next,
 * each with its reason. Replaces a closing call to action on pages whose job
 * is to inform rather than to persuade.
 */
export function NextSteps({ steps, title = 'Where to next' }: { steps: NextStep[]; title?: string }) {
  return (
    <section className="next-steps" aria-labelledby="next-steps-title">
      <div className="wrap">
        <h2 id="next-steps-title" className="next-steps__title">
          {title}
        </h2>
        <ul className="next-steps__list">
          {steps.map((step) => (
            <li key={step.href}>
              <Link href={step.href} className="next-step" data-glow="">
                <span className="next-step__title">
                  {step.title}
                  <ArrowRight aria-hidden="true" strokeWidth={1.75} className="next-step__arrow" />
                </span>
                <span className="next-step__body">{step.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
