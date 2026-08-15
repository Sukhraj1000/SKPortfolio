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
          Player 01 / {portfolioProfile.role} / {portfolioProfile.location}
        </QuestLabel>
        <h1
          id="hero-title"
          aria-label={`${portfolioProfile.storyHeadline.before} ${portfolioProfile.storyHeadline.emphasis} ${portfolioProfile.storyHeadline.after}`}
        >
          {portfolioProfile.storyHeadline.before}{" "}
          <em>{portfolioProfile.storyHeadline.emphasis}</em>{" "}
          {portfolioProfile.storyHeadline.after}
        </h1>
        <p className="pq-hero-role">
          {portfolioProfile.name} · {portfolioProfile.role} at{" "}
          <strong>{portfolioProfile.employer}</strong>
        </p>
        <p className="pq-hero-summary" data-hero-summary>
          {portfolioProfile.summary} {portfolioProfile.journey}
        </p>

        <div className="pq-hero-actions">
          <QuestLink href="/#projects" variant="primary">
            Start the story <span aria-hidden="true">→</span>
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
            <dt>Current station</dt>
            <dd>{portfolioProfile.employer}</dd>
          </div>
          <div>
            <dt>Class unlocked</dt>
            <dd>{portfolioProfile.education}</dd>
          </div>
          <div>
            <dt>Core toolkit</dt>
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
          <span>IRON//SIGNAL</span>
          <b>Profile link</b>
          <i>Online</i>
        </div>
        <div className="pq-hero-operator">
          <OperatorSprite size="large" />
        </div>
        <div className="pq-scene-beacon"><i /></div>
        <div className="pq-scene-platform" />
        <div className="pq-scene-caption">
          <span>Origin point</span>
          <strong>Curiosity → capability</strong>
        </div>
      </div>

      <div
        className="pq-objective-console"
        data-motion="hero-console"
        aria-label="Current portfolio objective"
      >
        <span className="pq-objective-label">Current objective</span>
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
