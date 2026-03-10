import { useEffect, useRef, useState } from "react";
import { Megaphone, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    id: 1,
    title: "Sponsor Licence Applications",
    message: "Need help with Sponsor Licence Applications? Contact the Denizns team for full end-to-end support.",
    cta: "Get Help",
    accent: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
  },
  {
    id: 2,
    title: "Skilled Worker Visa Applications",
    message: "We assist with Skilled Worker Visa Applications and all other Home Office immigration applications.",
    cta: "Learn More",
    accent: "from-secondary/20 to-secondary/5",
    iconColor: "text-secondary",
  },
  {
    id: 3,
    title: "New Sponsor Licence",
    message: "Planning to apply for a new Sponsor Licence? Our immigration experts can guide you through the full process.",
    cta: "Start Today",
    accent: "from-accent/30 to-accent/5",
    iconColor: "text-accent-foreground",
  },
  {
    id: 4,
    title: "Compliance & Mock Audits",
    message: "Need compliance support or a mock audit? Denizns provides full sponsor licence compliance services and audit preparation.",
    cta: "Book Audit",
    accent: "from-success/20 to-success/5",
    iconColor: "text-success",
  },
  {
    id: 5,
    title: "HR Policy & Documentation",
    message: "We help organisations build compliant HR policies, contracts, and procedures aligned with UK immigration rules.",
    cta: "Find Out More",
    accent: "from-info/20 to-info/5",
    iconColor: "text-info",
  },
];

export function ServicesWidget() {
  const [current, setCurrent] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SERVICES.length);
    }, 4000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => { setCurrent(c => (c - 1 + SERVICES.length) % SERVICES.length); resetTimer(); };
  const next = () => { setCurrent(c => (c + 1) % SERVICES.length); resetTimer(); };

  const service = SERVICES[current];

  return (
    <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className={cn("p-5 bg-gradient-to-r transition-all duration-500", service.accent)}>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Megaphone className={cn("h-4 w-4", service.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-0.5">Denizns Services</p>
            <h3 className="text-sm font-bold leading-snug">{service.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{service.message}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {/* Dots */}
          <div className="flex items-center gap-1">
            {SERVICES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer(); }}
                className={cn("h-1.5 rounded-full transition-all", i === current ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30")}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={prev} className="h-6 w-6 rounded-full bg-background/60 flex items-center justify-center hover:bg-background/80 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={next} className="h-6 w-6 rounded-full bg-background/60 flex items-center justify-center hover:bg-background/80 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setIsContactOpen(true)}
            >
              {service.cta}
            </Button>
          </div>
        </div>
      </div>

      {/* Contact form overlay */}
      {isContactOpen && (
        <div className="p-5 border-t bg-muted/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Contact Denizns</h4>
            </div>
            <button onClick={() => setIsContactOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Your name"
              className="col-span-1 h-8 text-xs px-3 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              placeholder="Email address"
              className="col-span-1 h-8 text-xs px-3 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              placeholder="How can we help you?"
              rows={2}
              className="col-span-2 text-xs p-2 rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-7 text-xs flex-1">Send Request</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsContactOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
