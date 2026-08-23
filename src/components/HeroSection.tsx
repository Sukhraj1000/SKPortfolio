import { CVAccessDialog } from "@/components/CVAccessDialog";
import { OperatorSprite, QuestLabel, QuestLink } from "@/components/pixel-quest/QuestPrimitives";
import { portfolioProfile } from "@/data/portfolio";

export function HeroSection() {
  return (
    <section id="home" data-chapter="01" aria-labelledby="hero-title" className="pq-hero">
      <div className="pq-hero-grid" aria-hidden="true" />

      <div className="pq-hero-copy" data-motion="hero-copy">
        <QuestLabel>
          {portfolioProfile.role} / {portfolioProfile.location}
        </QuestLabel>
        <h1 id="hero-title">
          <span>Sukhraj</span> <em>Kalon</em>
        </h1>
        <p className="pq-hero-role">{portfolioProfile.role}</p>
        <p className="pq-hero-summary" data-hero-summary>
          {portfolioProfile.positioning}
        </p>

        <div className="pq-hero-actions">
          <QuestLink href="/#projects" variant="primary">
            View selected work <span aria-hidden="true">→</span>
          </QuestLink>
          <div className="pq-hero-cv">
            <CVAccessDialog buttonText="Request private CV" buttonClassName="pq-button" />
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
        <div className="pq-scene-window-bar">
          <span>Portfolio route / Dispatch</span>
          <strong>01: Profile</strong>
        </div>
        <div className="pq-scene-grid" />
        <div className="pq-dispatch-stacks">
          <span>
            <i />
            Build<small>01</small>
          </span>
          <span>
            <i />
            Verify<small>02</small>
          </span>
          <span>
            <i />
            Deliver<small>03</small>
          </span>
        </div>
        <div className="pq-signal-tower">
          <i />
          <i />
          <i />
          <strong>Link / ready</strong>
        </div>
        <div className="pq-scene-terminal" data-profile-equipment="terminal">
          <i />
          <b>Engineering route</b>
          <span>5 chapters connected</span>
        </div>
        <div className="pq-scene-entry" data-profile-start>
          <span>Start / 01</span>
          <i />
        </div>
        <div className="pq-operator-berth" data-operator-berth>
          <i />
          <i />
          <i />
        </div>
        <div className="pq-hero-operator" data-profile-operator>
          <OperatorSprite size="large" />
        </div>
        <div className="pq-scene-route" data-profile-route>
          <i />
          <i />
          <i />
          <span>→</span>
        </div>
        <div className="pq-destination-console" data-profile-equipment="destination">
          <i />
          <b>Next</b>
          <small>Work</small>
        </div>
        <div className="pq-scene-platform" />
        <div className="pq-scene-caption">
          <span>
            <i /> Journey ready
          </span>
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
