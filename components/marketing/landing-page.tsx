import Link from "next/link";
import {
  Bot,
  CalendarDays,
  Layers,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LandingStructuredData } from "@/components/marketing/landing-structured-data";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LandingDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const featureIcons = [Bot, Layers, CalendarDays, Wallet] as const;

export function LandingPage({
  dict,
  audienceType,
}: {
  dict: LandingDictionary;
  audienceType?: string;
}) {
  return (
    <>
      <LandingStructuredData dict={dict} audienceType={audienceType} />

      <div className="flex min-h-screen flex-col">
        <SiteHeader dict={dict} />

        <main id="main-content">
          {/* Hero */}
          <section
            className="relative overflow-hidden border-b"
            aria-labelledby="hero-heading"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.92_0_0),transparent)]"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex items-center gap-3">
                  <p className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    {dict.hero.eyebrow}
                  </p>
                  <LanguageSwitcher dict={dict} className="hidden sm:inline-flex" />
                </div>

                <h1
                  id="hero-heading"
                  className="text-5xl font-bold tracking-tight sm:text-6xl"
                >
                  {dict.hero.brand}
                  <span className="mt-3 block text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {dict.hero.heading}
                  </span>
                </h1>
                <p className="mt-4 max-w-2xl whitespace-pre-line text-lg font-medium text-foreground sm:text-xl">
                  {dict.hero.subtitle}
                </p>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-base text-muted-foreground">
                  {dict.hero.description}
                </p>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="/login">
                    <Button size="lg" className="w-full min-w-[160px] sm:w-auto">
                      {dict.hero.ctaLogin}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full min-w-[160px] sm:w-auto"
                    >
                      {dict.hero.ctaRegisterStudio}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About / AIO product description */}
          <section
            className="border-b bg-muted/20 py-16 sm:py-20"
            aria-labelledby="about-heading"
          >
            <div className="mx-auto max-w-3xl px-4">
              <h2
                id="about-heading"
                className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {dict.about.title}
              </h2>
              <div className="mt-8 space-y-4 text-muted-foreground">
                {dict.about.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="whitespace-pre-line leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section
            id="features"
            className="py-16 sm:py-20"
            aria-labelledby="features-heading"
          >
            <div className="mx-auto max-w-6xl px-4">
              <div className="mx-auto max-w-2xl text-center">
                <h2
                  id="features-heading"
                  className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  {dict.features.title}
                </h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">
                  {dict.features.subtitle}
                </p>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2">
                {dict.features.items.map((feature, index) => {
                  const Icon = featureIcons[index] ?? Sparkles;
                  return (
                    <Card key={feature.title} className="h-full">
                      <CardHeader>
                        <div
                          className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/5 ring-1 ring-primary/10"
                          aria-hidden="true"
                        >
                          <Icon className="size-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="whitespace-pre-line text-sm leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="border-y bg-muted/20 py-16 sm:py-20"
            aria-labelledby="how-heading"
          >
            <div className="mx-auto max-w-6xl px-4">
              <div className="mx-auto max-w-2xl text-center">
                <h2
                  id="how-heading"
                  className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  {dict.howItWorks.title}
                </h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">
                  {dict.howItWorks.subtitle}
                </p>
              </div>

              <div className="mt-12 grid gap-10 lg:grid-cols-2">
                <FlowColumn
                  title={dict.howItWorks.clientTitle}
                  steps={dict.howItWorks.clientSteps}
                  accent="primary"
                />
                <FlowColumn
                  title={dict.howItWorks.studioTitle}
                  steps={dict.howItWorks.studioSteps}
                  accent="muted"
                />
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section
            id="faq"
            className="py-16 sm:py-20"
            aria-labelledby="faq-heading"
          >
            <div className="mx-auto max-w-3xl px-4 text-left">
              <div>
                <h2
                  id="faq-heading"
                  className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  {dict.faq.title}
                </h2>
                <p className="mt-3 text-muted-foreground">{dict.faq.subtitle}</p>
              </div>

              <div className="mt-10 space-y-3 text-left">
                {dict.faq.items.map((item, index) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border bg-card ring-1 ring-foreground/5 open:ring-foreground/10"
                    {...(index === 0 ? { open: true } : {})}
                  >
                    <summary className="cursor-pointer list-none px-5 py-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {item.question}
                        <span
                          className="text-muted-foreground transition-transform group-open:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <div className="whitespace-pre-line border-t px-5 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className="border-t bg-primary py-16 text-primary-foreground sm:py-20"
            aria-labelledby="cta-heading"
          >
            <div className="mx-auto max-w-3xl px-4 text-center">
              <h2
                id="cta-heading"
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {dict.cta.title}
              </h2>
              <p className="mt-4 whitespace-pre-line text-primary-foreground/80">
                {dict.cta.description}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full min-w-[180px] sm:w-auto"
                  >
                    {dict.cta.loginButton}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-w-[180px] border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
                  >
                    {dict.cta.studioButton}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter dict={dict} />
      </div>
    </>
  );
}

function FlowColumn({
  title,
  steps,
  accent,
}: {
  title: string;
  steps: { title: string; description: string }[];
  accent: "primary" | "muted";
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ol className="mt-6 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                accent === "primary"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted-foreground/15 text-foreground",
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
