import Link from "next/link";
import {
  ArrowDown,
  Building2,
  Github,
  GraduationCap,
  Linkedin,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVAccessDialog } from "@/components/CVAccessDialog";
import { PixelFrame } from "@/components/ui/pixel-frame";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import {
  portfolioProfile,
  socialLinks,
  storyChapters,
} from "@/data/portfolio";

const originChapter = storyChapters[0];
const heroSocials = socialLinks.filter(
  (social) => social.id === "github" || social.id === "linkedin",
);

export function HeroSection() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-border bg-background pt-16"
    >
      <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-60" />
      <div className="dither-field pointer-events-none absolute right-0 top-16 -z-10 h-72 w-1/3 opacity-30 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div
        aria-hidden="true"
        className="absolute left-0 top-16 h-1 w-32 bg-primary sm:w-52"
      />

      <div className="section-shell flex flex-col justify-center py-8 sm:py-12 lg:min-h-[calc(88svh-4rem)] lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:gap-12 xl:gap-20">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <SystemLabel>
                {`${originChapter.index} // ${originChapter.portfolioLabel}`}
              </SystemLabel>
              <StatusIndicator pulse>Operator online</StatusIndicator>
            </div>

            <h1
              id="hero-title"
              className="mt-4 text-[clamp(3rem,15vw,7.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.075em] text-foreground sm:mt-6 lg:mt-8 lg:text-[clamp(5.5rem,9vw,8.25rem)]"
            >
              <span className="block">Sukhraj</span>
              <span className="block text-primary">Kalon</span>
            </h1>

            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-lg font-semibold text-foreground sm:mt-6 sm:text-xl lg:text-2xl">
              <span>{portfolioProfile.role}</span>
              <span className="font-normal text-ink-muted">
                at {portfolioProfile.employer}
              </span>
            </p>

            <dl className="mt-4 grid max-w-2xl grid-cols-2 gap-px border border-border bg-border sm:mt-5">
              <div className="flex min-h-14 items-center gap-3 bg-surface px-2 py-2 sm:px-4 sm:py-2.5">
                <GraduationCap
                  aria-hidden="true"
                  className="hidden h-4 w-4 shrink-0 text-primary sm:block"
                />
                <div>
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                    Education signal
                  </dt>
                  <dd className="mt-1 text-[0.6875rem] font-medium leading-4 text-foreground sm:text-sm">
                    {portfolioProfile.education}
                  </dd>
                </div>
              </div>
              <div className="flex min-h-14 items-center gap-3 bg-surface px-2 py-2 sm:px-4 sm:py-2.5">
                <MapPin
                  aria-hidden="true"
                  className="hidden h-4 w-4 shrink-0 text-primary sm:block"
                />
                <div>
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                    Current base
                  </dt>
                  <dd className="mt-1 text-[0.6875rem] font-medium leading-4 text-foreground sm:text-sm">
                    {portfolioProfile.location}
                  </dd>
                </div>
              </div>
            </dl>

            <p className="mt-4 border-l-2 border-primary pl-3 font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.06em] text-ink-muted sm:hidden">
              Full-stack systems / Cloud services / AI automation / Secure engineering
            </p>

            <p className="text-pretty mt-5 hidden max-w-2xl text-sm leading-6 text-ink-muted sm:block sm:text-base sm:leading-7">
              {portfolioProfile.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
              <Button size="lg" asChild>
                <Link href="/#projects">View projects</Link>
              </Button>

              <CVAccessDialog buttonClassName="h-11 px-5 text-xs" />

              {heroSocials.map((social) => {
                const Icon = social.id === "github" ? Github : Linkedin;

                return (
                  <Button key={social.id} variant="ghost" size="lg" asChild>
                    <Link
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon aria-hidden="true" />
                      {social.label}
                    </Link>
                  </Button>
                );
              })}
            </div>

            <Link
              href="/#projects"
              className="group mt-5 inline-grid min-h-11 grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-border pt-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-primary sm:mt-8"
              aria-label="Continue to chapter 02, Selected Work"
            >
              <span className="text-primary">02</span>
              <span>Continue to selected work</span>
              <ArrowDown
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-y-1"
              />
            </Link>
          </div>

          <PixelFrame
            tone="cyan"
            raised
            className="mx-auto hidden w-full max-w-[29rem] overflow-hidden bg-surface lg:block"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-4 py-3">
              <SystemLabel tone="cyan">{"Operator record // SK"}</SystemLabel>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-faint">
                ID-01
              </span>
            </div>

            <div className="relative grid min-h-[17rem] place-items-center overflow-hidden bg-background micro-grid sm:min-h-[20rem]">
              <span
                aria-hidden="true"
                className="signal-scan absolute inset-x-0 top-0 z-10 h-9 border-y border-signal-cyan/20 bg-signal-cyan/5"
              />
              <div
                role="img"
                aria-label="Pixel-art representation of Sukhraj Kalon wearing a dark bomber jacket with a blue signal stripe"
                className="operator-sprite relative z-0"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 left-4 h-3 w-3 border-b border-l border-signal-cyan"
              />
              <span
                aria-hidden="true"
                className="absolute right-4 top-4 h-3 w-3 border-r border-t border-signal-cyan"
              />
            </div>

            <dl className="grid grid-cols-2 gap-px border-t border-border bg-border">
              <div className="bg-surface p-3 sm:p-4">
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                  Assignment
                </dt>
                <dd className="mt-1.5 flex items-center gap-2 text-xs font-semibold sm:text-sm">
                  <Building2 aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                  {portfolioProfile.employer}
                </dd>
              </div>
              <div className="bg-surface p-3 sm:p-4">
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                  Discipline
                </dt>
                <dd className="mt-1.5 text-xs font-semibold sm:text-sm">
                  Software Engineering
                </dd>
              </div>
              <div className="bg-surface p-3 sm:p-4">
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                  Systems
                </dt>
                <dd className="mt-1.5 text-xs font-semibold sm:text-sm">
                  Full-stack / Cloud
                </dd>
              </div>
              <div className="bg-surface p-3 sm:p-4">
                <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-ink-faint">
                  Method
                </dt>
                <dd className="mt-1.5 text-xs font-semibold sm:text-sm">
                  Secure / AI-assisted
                </dd>
              </div>
            </dl>
          </PixelFrame>
        </div>
      </div>
    </section>
  );
}
