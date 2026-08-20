import { CVAccessDialog } from "@/components/CVAccessDialog";
import {
  OperatorSprite,
  QuestLabel,
  QuestLink,
} from "@/components/pixel-quest/QuestPrimitives";
import { portfolioProfile } from "@/data/portfolio";

export function HeroSection() {
  return (
    <section
      id="home"
      data-chapter="01"
      aria-labelledby="hero-title"
      className="pq-hero"
    >
      <div className="pq-hero-grid" aria-hidden="true" />

      <div className="pq-hero-copy" data-motion="hero-copy">
        <QuestLabel>
          {portfolioProfile.role} / {portfolioProfile.location}
        </QuestLabel>
        <h1 id="hero-title">{portfolioProfile.name}</h1>
        <p className="pq-hero-role">{portfolioProfile.role}</p>
        <p className="pq-hero-summary" data-hero-summary>
          {portfolioProfile.positioning}
        </p>

        <div className="pq-hero-actions">
          <QuestLink href="/#projects" variant="primary">
            View selected work <span aria-hidden="true">→</span>
          </QuestLink>
          <div className="pq-hero-cv">
            <CVAccessDialog
              buttonText="Request private CV"
              buttonClassName="pq-button"
            />
          </div>
        </div>

        <dl className="pq-hero-proof">
          <div>
            <dt>Location</dt>
            <dd>{portfolioProfile.location}</dd>
          </div>
          <div>
            <dt>Education</dt>
            <dd>{portfolioProfile.education}</dd>
          </div>
          <div>
            <dt>Focus</dt>
            <dd>{portfolioProfile.toolkit}</dd>
          </div>
        </dl>
      </div>

      <div className="pq-hero-scene" data-motion="hero-scene" aria-hidden="true">
        <div className="pq-scene-sky">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="pq-scene-terminal">
          <span>Portfolio / Start</span>
          <b>Profile ready</b>
          <i>Chapter 01 / 05</i>
        </div>
        <div className="pq-scene-entry">
          <span>Start</span>
          <i />
        </div>
        <div className="pq-hero-operator">
          <OperatorSprite size="large" />
        </div>
        <div className="pq-scene-route">
          <i />
          <i />
          <i />
          <span>→</span>
        </div>
        <div className="pq-scene-beacon"><i /></div>
        <div className="pq-scene-platform" />
        <div className="pq-scene-caption">
          <span>Entry point</span>
          <strong>Profile → selected work</strong>
        </div>
      </div>

      <div
        className="pq-objective-console"
        data-motion="hero-console"
        aria-label="Current portfolio objective"
      >
        <span className="pq-objective-label">Engineering approach</span>
        <p>{portfolioProfile.storyObjective}</p>
        <div className="pq-console-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  );
}
