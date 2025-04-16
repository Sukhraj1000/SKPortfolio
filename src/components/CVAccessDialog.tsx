"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Add buttonClassName and buttonText props to component
interface CVAccessDialogProps {
  buttonClassName?: string;
  buttonText?: string;
}

// Simple client-side CAPTCHA simulation
// In production, you would use a proper service like reCAPTCHA
const SimpleCaptcha = ({ onVerify }: { onVerify: (success: boolean) => void }) => {
  const [value, setValue] = useState("");
  // Generate different captcha texts for better security
  const [captchaText, setCaptchaText] = useState("SKPORT");
  
  // Generate a captcha on component mount
  useEffect(() => {
    const options = [
        "SKPORT", "WEBDEV", "SECURE", "DESIGN", "CREATE", 
        "CODING", "REACT", "NEXTJS", "PYTHON", "SYSTEM", 
        "VERIFY", "CRYPTO", "PROGRAM", "DEVOPS", "INVENT",
        "SCRIPT", "BUILD", "GITHUB", "GITLAB", "DEPLOY",
        "DOCKER", "CLOUD", "SERVER", "VISUAL", "LAYOUT",
        "STYLE", "LOGIC", "SYNTAX", "RENDER", "COMPILE",
        "NODEJS", "FRONT", "MOBILE", "WEBAPP", "HYBRID",
        "NATIVE", "DEVICE", "ACCESS", "PERMIT", "RESUME",
        "TALENT", "SKILLS", "CAREER", "FUTURE", "GROWTH",
        "JAVA", "SCALA", "KOTLIN", "ANGULAR", "SVELTE",
        "JQUERY", "EMBER", "REDUX", "VUEJS", "NUXTJS"
      ];
    setCaptchaText(options[Math.floor(Math.random() * options.length)]);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(value.toUpperCase() === captchaText);
  };
  
  return (
    <div className="my-4 p-4 border border-primary/20 rounded-lg bg-black/80 shadow-xl">
      <p className="text-sm text-white mb-3">Please verify you are human:</p>
      <div className="flex items-center justify-center mb-4">
        <div className="text-xl tracking-widest font-bold py-3 px-6 bg-primary/30 text-white rounded-md select-none border border-primary/30 shadow-inner">
          {captchaText}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter the text above"
          className="px-4 py-2 rounded-md bg-black/90 border border-primary/40 focus:border-primary focus:outline-none text-white"
        />
        <Button type="submit" variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white font-medium">
          Verify
        </Button>
      </form>
    </div>
  );
};

// Create secure time-limited token
const createSecureToken = () => {
  // Add timestamp that expires after 15 minutes
  const expiry = Date.now() + (15 * 60 * 1000);
  // Convert to base36 and add random string
  const token = expiry.toString(36) + Math.random().toString(36).substring(2, 10);
  // Store in sessionStorage (cleared when browser is closed)
  sessionStorage.setItem('cv_access_token', token);
  sessionStorage.setItem('cv_access_time', String(Date.now()));
  return token;
};

// Update the component signature to accept props
export function CVAccessDialog({ buttonClassName, buttonText = "Resume" }: CVAccessDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleVerify = (success: boolean) => {
    setIsVerified(success);
  };
  
  const handleDownload = () => {
    if (!isVerified) return;
    
    setIsDownloading(true);
    
    // Generate secure token
    const token = createSecureToken();
    
    // Add a slight delay for UX
    setTimeout(() => {
      // Use the token in the URL to verify access
      window.open(`/Sukhrajport_CV.pdf?token=${token}`, "_blank", "noopener,noreferrer");
      setIsDownloading(false);
      // Close dialog after successful download
      setTimeout(() => setIsOpen(false), 1000);
    }, 500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <DialogTitle className="text-white">Resume Download</DialogTitle>
          <DialogDescription className="text-gray-300">
            Please complete the verification to access the resume.
          </DialogDescription>
        </DialogHeader>
        
        {!isVerified ? (
          <SimpleCaptcha onVerify={handleVerify} />
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-green-500/30 p-3 text-green-400 border border-green-500/30">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-center text-gray-200">Verification successful! You can now download the resume.</p>
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {isDownloading ? (
                <>Downloading...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Update the mobile version as well
interface CVAccessDialogMobileProps {
  buttonClassName?: string;
  buttonText?: string;
}

export function CVAccessDialogMobile({ buttonClassName, buttonText = "Resume" }: CVAccessDialogMobileProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleVerify = (success: boolean) => {
    setIsVerified(success);
  };
  
  const handleDownload = () => {
    if (!isVerified) return;
    
    setIsDownloading(true);
    
    // Generate secure token
    const token = createSecureToken();
    
    // Add a slight delay for UX
    setTimeout(() => {
      // Use the token in the URL to verify access
      window.open(`/Sukhrajport_CV.pdf?token=${token}`, "_blank", "noopener,noreferrer");
      setIsDownloading(false);
      // Close dialog after successful download
      setTimeout(() => setIsOpen(false), 1000);
    }, 500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <DialogTitle className="text-white">Resume Download</DialogTitle>
          <DialogDescription className="text-gray-300">
            Please complete the verification to access the resume.
          </DialogDescription>
        </DialogHeader>
        
        {!isVerified ? (
          <SimpleCaptcha onVerify={handleVerify} />
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-green-500/30 p-3 text-green-400 border border-green-500/30">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-center text-gray-200">Verification successful! You can now download the resume.</p>
            <Button 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {isDownloading ? (
                <>Downloading...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 