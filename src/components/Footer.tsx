"use client";

import * as React from "react";
import Link from "next/link";
import { CVAccessDialog } from "@/components/CVAccessDialog";
import {
  OperatorSprite,
  QuestLabel,
  QuestLink,
} from "@/components/pixel-quest/QuestPrimitives";
import {
  contactDetails,
  portfolioProfile,
  socialLinks,
  storyChapters,
} from "@/data/portfolio";
import { getObfuscatedEmail } from "@/lib/utils";

export function ContactSection() {
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    setEmail(getObfuscatedEmail());
  }, []);

  const subject = encodeURIComponent("Portfolio conversation from sukhrajkalon.info");
  const body = encodeURIComponent(
    "Hi Sukhraj,\n\nI found your portfolio and would like to discuss a relevant opportunity or collaboration.\n\nThanks,",
  );

  return (
    <section
      id="contact"
      data-chapter="05"
      aria-labelledby="contact-title"
      className="pq-ending"
    >
      <div className="pq-ending-scene" data-motion="ending-scene" aria-hidden="true">
        <span className="pq-arrival-grid" />
        <span className="pq-bay-frame is-a"><i /></span>
        <span className="pq-bay-frame is-b"><i /></span>
        <span className="pq-overhead-signal"><i /><i /><i /><b>Channel open</b></span>
        <span className="pq-comms-panel"><i /><b>Contact link</b><small>Ready / 05</small></span>
        <div className="pq-ending-operator">
          <OperatorSprite size="large" />
        </div>
        <span className="pq-ending-door"><i /><b>Open</b></span>
        <span className="pq-ending-route" />
        <strong className="pq-arrival-label">05 / Arrival bay</strong>
      </div>

      <div className="pq-ending-copy" data-motion="record">
        <QuestLabel>Chapter 05 / Contact</QuestLabel>
        <h2 id="contact-title">
          <span>Continue the</span>{" "}<em>conversation.</em>
        </h2>
        <p>
          Relevant engineering roles, product work, and collaborations are welcome.
          The complete professional evidence remains easy to scan; the spatial layer
          gives the journey a memorable frame.
        </p>
        <p className="pq-contact-policy">{contactDetails.cvRequest}</p>

        <div className="pq-ending-actions">
          <div className="pq-contact-cv">
            <CVAccessDialog
              buttonText="Request private CV"
              buttonClassName="pq-button"
            />
          </div>
          <a
            className="pq-button"
            data-variant="secondary"
            href={email ? `mailto:${email}?subject=${subject}&body=${body}` : undefined}
            aria-disabled={!email}
            onClick={(event) => {
              if (!email) event.preventDefault();
            }}
          >
            {contactDetails.emailLabel} <span aria-hidden="true">→</span>
          </a>
        </div>

        <dl className="pq-contact-meta">
          <div>
            <dt>Location</dt>
            <dd>{contactDetails.location}</dd>
          </div>
          <div>
            <dt>Response path</dt>
            <dd>Role, team, or project context welcome</dd>
          </div>
        </dl>

        <ul className="pq-social-links" aria-label="Professional and social profiles">
          {socialLinks.map((social) => (
            <li key={social.id}>
              <QuestLink
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="quiet"
              >
                {social.label} <span aria-hidden="true">↗</span>
              </QuestLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pq-legal-footer pq-scope">
      <div className="pq-shell pq-legal-inner">
        <div>
          <Link href="/#home" className="pq-legal-brand">
            <span aria-hidden="true">{portfolioProfile.initials}</span>
            <strong>{portfolioProfile.name}</strong>
          </Link>
          <p>
            &copy; {currentYear} {portfolioProfile.name}. All rights reserved.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ol>
            {storyChapters.map((chapter) => (
              <li key={chapter.id}>
                <Link href={chapter.href}>
                  {chapter.index} {chapter.portfolioLabel}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </footer>
  );
}
