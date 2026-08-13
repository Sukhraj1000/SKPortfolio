"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  Github,
  Keyboard,
  Mail,
  RadioTower,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVAccessDialog } from "@/components/CVAccessDialog";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import type { GamePanelId, GameSnapshot } from "@/components/game/game-types";
import {
  capabilityGroups,
  contactDetails,
  experience,
  portfolioProjects,
  socialLinks,
} from "@/data/portfolio";
import { getObfuscatedEmail } from "@/lib/utils";
import styles from "./GameExperience.module.css";

function PanelHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <header>
      <SystemLabel>{label}</SystemLabel>
      <h2 id="signal-panel-title" className="text-balance mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p id="signal-panel-description" className="text-pretty mt-3 max-w-3xl text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
        {description}
      </p>
    </header>
  );
}

function ProjectPanel({ panelId }: { panelId: GamePanelId }) {
  const projectId = panelId.replace("project:", "");
  const project = portfolioProjects.find((item) => item.id === projectId);
  if (!project) return null;

  return (
    <>
      <PanelHeader
        label={`Mission Archive // ${project.kind}`}
        title={project.title}
        description={project.summary}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Problem", project.problem],
          ["Ownership", project.contribution],
          ["Result", project.outcome],
        ].map(([label, copy]) => (
          <section key={label} className="border-l border-border-strong bg-background px-4 py-3">
            <h3 className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-primary">
              {label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-foreground">{copy}</p>
          </section>
        ))}
      </div>

      <ul aria-label={`${project.title} technologies`} className="mt-5 flex flex-wrap gap-1.5">
        {project.technologies.map((technology) => (
          <li key={technology} className="border border-border bg-surface px-2 py-1 font-mono text-[0.625rem] text-foreground">
            {technology}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.links.map((link) => {
          const Icon = link.kind === "source" ? Github : ExternalLink;
          return (
            <Button key={link.href} size="sm" variant={link.kind === "live" ? "default" : "outline"} asChild>
              <Link href={link.href} target="_blank" rel="noopener noreferrer">
                <Icon aria-hidden="true" />
                {link.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </>
  );
}

function BriefingPanel() {
  return (
    <>
      <PanelHeader
        label="Onboarding checkpoint"
        title="Movement is the tutorial."
        description="Cross the industrial route from left to right. Terminals reveal real portfolio evidence; four signal cores unlock the final Comms uplink."
      />
      <dl className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
        {[
          ["Move", "A / D or Left / Right"],
          ["Jump", "Space or Up"],
          ["Interact", "E or Enter"],
          ["Pause / Exit", "HUD controls or Escape"],
        ].map(([term, detail]) => (
          <div key={term} className="bg-background p-4">
            <dt className="flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-primary">
              <Keyboard aria-hidden="true" className="h-4 w-4" />
              {term}
            </dt>
            <dd className="mt-2 text-sm text-foreground">{detail}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function FieldLogPanel() {
  return (
    <>
      <PanelHeader
        label="Field Log // Shared evidence"
        title="A path into secure engineering."
        description="The same reverse-chronological experience records used by Portfolio mode, now recovered from the Field Log console."
      />
      <ol className="mt-6 grid gap-3">
        {experience.map((entry) => (
          <li key={entry.id} className="border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{entry.role}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary">
                  <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
                  {entry.organisation}
                </p>
              </div>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted">
                {entry.start} — {entry.end}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-muted">{entry.summary}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function LoadoutPanel() {
  return (
    <>
      <PanelHeader
        label="Loadout Bay // Shared evidence"
        title="Capability grouped by delivery outcome."
        description="Primary methods and supporting tools remain factual rather than being turned into artificial percentage scores."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {capabilityGroups.map((group) => (
          <section key={group.id} className="border border-border bg-background p-4">
            <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{group.summary}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item.name}
                  className={item.level === "primary"
                    ? "border border-primary bg-primary px-2 py-1 font-mono text-[0.625rem] font-semibold text-primary-foreground"
                    : "border border-border bg-surface px-2 py-1 font-mono text-[0.625rem] text-foreground"}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function CommsPanel({ completed = false }: { completed?: boolean }) {
  const [email, setEmail] = React.useState("");
  React.useEffect(() => setEmail(getObfuscatedEmail()), []);
  const subject = encodeURIComponent("IRON//SIGNAL portfolio conversation");

  return (
    <>
      <PanelHeader
        label={completed ? "Final uplink // Restored" : "Comms Tower // Direct channels"}
        title={completed ? "Signal restored. Story complete." : "The next chapter starts with a useful problem."}
        description={completed
          ? "You recovered all four story signals and restored the communications uplink. The same direct recruiter routes remain available here and in Portfolio mode."
          : "Recruiters, engineering teams and collaborators can continue the conversation without completing the game."}
      />

      {completed ? (
        <div className="mt-5 flex items-center gap-3 border-l-2 border-signal-green bg-background p-4">
          <Check aria-hidden="true" className="h-5 w-5 text-signal-green" />
          <p className="text-sm font-semibold text-foreground">All four cores linked. Local completion recorded.</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2.5">
        <CVAccessDialog buttonClassName="h-11 px-4" />
        <Button variant="outline" asChild>
          <a href={email ? `mailto:${email}?subject=${subject}` : undefined} aria-disabled={!email}>
            <Mail aria-hidden="true" />
            {contactDetails.emailLabel}
          </a>
        </Button>
        {socialLinks.map((social) => (
          <Button key={social.id} variant="ghost" asChild>
            <Link href={social.href} target="_blank" rel="noopener noreferrer">
              {social.label}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
}

export function SignalPanel({
  panelId,
  snapshot,
  onClose,
  onExit,
}: {
  panelId: GamePanelId;
  snapshot: GameSnapshot;
  onClose: () => void;
  onExit: () => void;
}) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    closeButtonRef.current?.focus();
    const panel = panelRef.current;
    if (!panel) return;

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.hasAttribute("aria-hidden"));
      if (focusable.length === 0) return;
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

    panel.addEventListener("keydown", trapFocus);
    return () => panel.removeEventListener("keydown", trapFocus);
  }, [panelId]);

  let content: React.ReactNode;
  if (panelId.startsWith("project:")) content = <ProjectPanel panelId={panelId} />;
  else if (panelId === "briefing") content = <BriefingPanel />;
  else if (panelId === "field-log") content = <FieldLogPanel />;
  else if (panelId === "loadout") content = <LoadoutPanel />;
  else if (panelId === "uplink") content = <CommsPanel completed />;
  else content = <CommsPanel />;

  return (
    <div className={styles.panelBackdrop}>
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-panel-title"
        aria-describedby="signal-panel-description"
        className={styles.signalPanel}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-4 py-3">
          <div className="flex items-center gap-3">
            <RadioTower aria-hidden="true" className="h-4 w-4 text-primary" />
            <StatusIndicator tone="info">Simulation paused</StatusIndicator>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close terminal and resume gameplay"
            title="Close terminal"
            className="grid h-11 w-11 place-items-center border border-border-strong bg-surface text-foreground hover:border-primary hover:text-primary"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className={styles.panelBody}>
          {content}

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted">
              {`Score ${snapshot.score.toLocaleString()} // ${snapshot.cores.length}/4 cores`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Resume game
              </Button>
              {panelId === "uplink" ? (
                <Button size="sm" onClick={onExit}>
                  Exit to Portfolio
                  <ArrowUpRight aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
