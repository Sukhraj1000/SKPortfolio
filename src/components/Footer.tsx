"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVAccessDialog } from "@/components/CVAccessDialog";
import { PixelFrame } from "@/components/ui/pixel-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import {
  contactDetails,
  portfolioProfile,
  socialLinks,
  storyChapters,
} from "@/data/portfolio";
import { getObfuscatedEmail } from "@/lib/utils";

const contactChapter = storyChapters[4];

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  x: ArrowUpRight,
} as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    setEmail(getObfuscatedEmail());
  }, []);

  const subject = encodeURIComponent("Portfolio conversation from sukhrajkalon.info");
  const body = encodeURIComponent(
    "Hi Sukhraj,\n\nI found your portfolio and would like to discuss a relevant opportunity or collaboration.\n\nThanks,",
  );

  return (
    <>
      <section
        id="contact"
        data-game-checkpoint="comms"
        aria-labelledby="contact-title"
        className="relative py-16 sm:py-20 lg:py-24"
      >
        <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-40" />
        <div className="dither-field pointer-events-none absolute bottom-0 right-0 -z-10 h-72 w-1/2 opacity-25 [mask-image:linear-gradient(to_left,black,transparent)]" />

        <div className="section-shell">
          <SectionHeading
            label={contactChapter.portfolioLabel}
            index={contactChapter.index}
            headingId="contact-title"
            title={contactChapter.title}
            description={contactChapter.summary}
          />

          <div className="mt-10 grid items-start gap-8 sm:mt-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:gap-14">
            <div>
              <SystemLabel tone="green">Contact</SystemLabel>
              <p className="text-pretty mt-5 max-w-xl text-xl font-semibold leading-8 text-foreground sm:text-2xl sm:leading-9">
                Recruiters, hiring managers, engineering teams, and collaborators can
                get in touch about relevant work or request a private CV.
              </p>
              <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
                Include a little context about the role, team, or problem so I can
                respond usefully.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <CVAccessDialog buttonClassName="h-11 px-5" />
                <Button variant="outline" size="lg" asChild>
                  <a
                    href={email ? `mailto:${email}?subject=${subject}&body=${body}` : undefined}
                    aria-disabled={!email}
                    onClick={(event) => {
                      if (!email) event.preventDefault();
                    }}
                  >
                    <Mail aria-hidden="true" />
                    {contactDetails.emailLabel}
                  </a>
                </Button>
              </div>
            </div>

            <PixelFrame tone="cyan" raised className="overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-4 py-3">
                <SystemLabel tone="cyan">Contact details</SystemLabel>
                <StatusIndicator>Available</StatusIndicator>
              </div>

              <dl className="grid gap-px bg-border sm:grid-cols-2">
                <div className="bg-surface p-4 sm:p-5">
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                    Location
                  </dt>
                  <dd className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-primary" />
                    {contactDetails.location}
                  </dd>
                </div>
                <div className="bg-surface p-4 sm:p-5">
                  <dt className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                    CV access
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-foreground">
                    Shared privately on request
                  </dd>
                </div>
              </dl>

              <ul aria-label="Professional and social profiles" className="grid sm:grid-cols-3">
                {socialLinks.map((social) => {
                  const Icon = socialIcons[social.id];

                  return (
                    <li key={social.id} className="border-t border-border sm:border-r sm:last:border-r-0">
                      <Link
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-16 items-center justify-between gap-3 px-4 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-foreground transition-colors hover:bg-surface-raised hover:text-primary"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                          {social.label}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </PixelFrame>
          </div>
        </div>
      </section>

      <footer className="border-t border-border-strong bg-surface">
        <div className="section-shell grid gap-8 py-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Link
              href="/#home"
              className="inline-flex min-h-11 items-center gap-3 text-foreground transition-colors hover:text-primary"
            >
              <span className="grid h-9 w-9 place-items-center bg-primary font-mono text-xs font-bold text-primary-foreground">
                {portfolioProfile.initials}
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {portfolioProfile.name}
                </span>
                <span className="mt-1 block font-mono text-sm uppercase tracking-[0.04em] text-ink-muted">
                  {portfolioProfile.role}
                </span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-ink-muted">
              &copy; {currentYear} {portfolioProfile.name}. All rights reserved.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ol className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end">
              {storyChapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    href={chapter.href}
                    className="inline-flex min-h-11 items-center font-mono text-sm font-semibold uppercase tracking-[0.04em] text-ink-muted transition-colors hover:text-primary"
                  >
                    {chapter.index} {chapter.portfolioLabel}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </footer>
    </>
  );
}
