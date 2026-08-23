"use client";

import * as React from "react";
import { FileText, Linkedin, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SystemLabel } from "@/components/ui/system-label";
import { contactDetails, socialLinks } from "@/data/portfolio";
import { cn } from "@/lib/utils";

interface CVAccessDialogProps {
  buttonClassName?: string;
  buttonText?: string;
}

const cvSubject = encodeURIComponent("CV request from sukhrajkalon.info");
const cvBody = encodeURIComponent(
  "Hi Sukhraj,\n\nI found your portfolio and would like to request a copy of your CV.\n\nThanks,",
);
const cvMailto = `mailto:${contactDetails.email}?subject=${cvSubject}&body=${cvBody}`;

function PrivateCVRequestContent() {
  const linkedIn = socialLinks.find((social) => social.id === "linkedin");

  return (
    <div className="border-t border-border px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
      <div className="border-l-2 border-primary bg-background px-4 py-3 text-sm leading-6 text-foreground">
        {contactDetails.cvRequest} I&apos;ll share the most relevant version directly.
      </div>

      <div className="mt-5 grid gap-2.5">
        <Button className="w-full" asChild>
          <a href={cvMailto}>
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

      <p className="mt-4 font-mono text-sm leading-5 text-ink-muted">
        Shared privately on request.
      </p>
    </div>
  );
}

function CVRequestDialog({
  buttonClassName,
  buttonText = "Request CV",
  mobile = false,
}: CVAccessDialogProps & { mobile?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLAnchorElement>(null);
  const contentId = React.useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size={mobile ? "default" : "sm"}
        className={cn("group text-sm", mobile ? "w-full justify-center" : "h-11", buttonClassName)}
        asChild
      >
        <a
          ref={triggerRef}
          href={cvMailto}
          aria-controls={open ? contentId : undefined}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            setOpen(true);
          }}
        >
          <FileText aria-hidden="true" className="transition-colors group-hover:text-primary" />
          {buttonText}
        </a>
      </Button>

      <DialogContent
        id={contentId}
        className="max-w-md gap-0 overflow-hidden rounded-none border border-border-strong bg-surface p-0 shadow-[6px_6px_0_var(--shadow-strong)]"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <DialogHeader className="px-5 pb-4 pr-12 pt-5 text-left sm:px-6 sm:pr-12 sm:pt-6">
          <SystemLabel>CV access</SystemLabel>
          <DialogTitle className="pt-2 text-2xl leading-tight text-foreground">
            Request Sukhraj&apos;s CV
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-ink-muted">
            The full CV is shared privately with recruiters, hiring managers, and relevant
            collaborators.
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
