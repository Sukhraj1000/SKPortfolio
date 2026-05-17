"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Linkedin } from "lucide-react";
import { cn, getObfuscatedEmail } from "@/lib/utils";

interface CVAccessDialogProps {
  buttonClassName?: string;
  buttonText?: string;
}

function PrivateCVRequestContent() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getObfuscatedEmail());
  }, []);

  const subject = encodeURIComponent("CV request from sukhrajkalon.info");
  const body = encodeURIComponent(
    "Hi Sukhraj,\n\nI found your portfolio and would like to request a copy of your CV.\n\nThanks,"
  );

  return (
    <div className="space-y-4 py-2">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-gray-200">
        I don&apos;t publish my full CV as an open download. If you&apos;re a recruiter, hiring manager, or collaborator, please request it directly and I&apos;ll share the right version privately.
      </div>

      <div className="grid gap-3">
        <Button className="w-full bg-primary hover:bg-primary/90 text-white" asChild>
          <a href={email ? `mailto:${email}?subject=${subject}&body=${body}` : "#"}>
            <Mail className="mr-2 h-4 w-4" />
            Request CV by Email
          </a>
        </Button>

        <Button variant="outline" className="w-full border-white/10 glass-morphism hover:border-primary/50 hover:bg-primary/10" asChild>
          <a href="https://www.linkedin.com/in/sukhraj-kalon-037031252/" target="_blank" rel="noopener noreferrer">
            <Linkedin className="mr-2 h-4 w-4" />
            Contact on LinkedIn
          </a>
        </Button>
      </div>
    </div>
  );
}

export function CVAccessDialog({ buttonClassName, buttonText = "Request CV" }: CVAccessDialogProps = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 text-xs rounded-full border-white/10 glass-morphism hover:border-primary/50 hover:bg-primary/10 transition-all shadow-sm group",
            buttonClassName
          )}
        >
          <FileText className="mr-1.5 h-3.5 w-3.5 group-hover:text-primary transition-colors" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-black/95 border border-primary/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Request CV Privately</DialogTitle>
          <DialogDescription className="text-gray-300">
            My full CV is no longer available as a public download.
          </DialogDescription>
        </DialogHeader>
        <PrivateCVRequestContent />
      </DialogContent>
    </Dialog>
  );
}

interface CVAccessDialogMobileProps {
  buttonClassName?: string;
  buttonText?: string;
}

export function CVAccessDialogMobile({ buttonClassName, buttonText = "Request CV" }: CVAccessDialogMobileProps = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-center rounded-lg glass-morphism",
            buttonClassName
          )}
        >
          <FileText className="mr-2 h-4 w-4" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-black/95 border border-primary/20 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Request CV Privately</DialogTitle>
          <DialogDescription className="text-gray-300">
            My full CV is no longer available as a public download.
          </DialogDescription>
        </DialogHeader>
        <PrivateCVRequestContent />
      </DialogContent>
    </Dialog>
  );
}
