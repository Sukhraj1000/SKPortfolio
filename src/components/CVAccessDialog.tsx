"use client";

import * as React from "react";
import { FileText, Linkedin, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SystemLabel } from "@/components/ui/system-label";
import { contactDetails, socialLinks } from "@/data/portfolio";
import { cn, getObfuscatedEmail } from "@/lib/utils";

interface CVAccessDialogProps {
  buttonClassName?: string;
  buttonText?: string;
}

function PrivateCVRequestContent() {
  const [email, setEmail] = React.useState("");
  const linkedIn = socialLinks.find((social) => social.id === "linkedin");

  React.useEffect(() => {
    setEmail(getObfuscatedEmail());
  }, []);

  const subject = encodeURIComponent("CV request from sukhrajkalon.info");
  const body = encodeURIComponent(
    "Hi Sukhraj,\n\nI found your portfolio and would like to request a copy of your CV.\n\nThanks,",
  );

  return (
    <div className="border-t border-border px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
      <div className="border-l-2 border-primary bg-background px-4 py-3 text-sm leading-6 text-foreground">
        {contactDetails.cvRequest} I&apos;ll share the most relevant version directly.
      </div>

      <div className="mt-5 grid gap-2.5">
        <Button className="w-full" asChild>
          <a
            href={email ? `mailto:${email}?subject=${subject}&body=${body}` : undefined}
            aria-disabled={!email}
            onClick={(event) => {
              if (!email) event.preventDefault();
            }}
          >
            <Mail aria-hidden="true" />
            Request CV by email
          </a>
        </Button>

        {linkedIn ? (
          <Button variant="outline" className="w-full" asChild>
            <a href={linkedIn.href} target="_blank" rel="noopener noreferrer">
              <Linkedin aria-hidden="true" />
              Contact on LinkedIn
            </a>
          </Button>
        ) : null}
      </div>

      <p className="mt-4 font-mono text-[0.625rem] uppercase leading-5 tracking-[0.08em] text-ink-faint">
        No public download / direct request only
      </p>
    </div>
  );
}

function CVRequestDialog({
  buttonClassName,
  buttonText = "Request CV",
  mobile = false,
}: CVAccessDialogProps & { mobile?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={mobile ? "default" : "sm"}
          className={cn(
            "group text-xs",
            mobile ? "w-full justify-center" : "h-11",
            buttonClassName,
          )}
        >
          <FileText
            aria-hidden="true"
            className="transition-colors group-hover:text-primary"
          />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-none border border-border-strong bg-surface p-0 shadow-[6px_6px_0_var(--shadow-strong)]">
        <DialogHeader className="px-5 pb-4 pr-12 pt-5 text-left sm:px-6 sm:pr-12 sm:pt-6">
          <SystemLabel>Recruiter access // Private channel</SystemLabel>
          <DialogTitle className="pt-2 text-2xl leading-tight text-foreground">
            Request Sukhraj&apos;s CV
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-ink-muted">
            The full CV is shared privately with recruiters, hiring managers, and
            relevant collaborators.
          </DialogDescription>
        </DialogHeader>
        <PrivateCVRequestContent />
      </DialogContent>
    </Dialog>
  );
}

export function CVAccessDialog(props: CVAccessDialogProps = {}) {
  return <CVRequestDialog {...props} />;
}

export function CVAccessDialogMobile(props: CVAccessDialogProps = {}) {
  return <CVRequestDialog {...props} mobile />;
}
