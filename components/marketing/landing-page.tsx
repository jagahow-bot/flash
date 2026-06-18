import Link from "next/link";
import {
  Bot,
  CalendarDays,
  DollarSign,
  Layers,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LandingStructuredData } from "@/components/marketing/landing-structured-data";
import { ProductShowcase } from "@/components/marketing/product-showcase";
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

const sectionShell = "mx-auto max-w-6xl px-4";
const proseWidth = "mx-auto max-w-3xl";
const headingClass =
  "text-balance text-2xl font-semibold leading-relaxed tracking-wide sm:text-3xl";
const bodyClass = "text-pretty leading-relaxed tracking-wide text-muted-foreground";

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
            <div className={cn("relative", sectionShell, "py-20 sm:py-28")}>
              <div className="flex flex-col items-center text-center">
                <p className="mb-6 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs leading-relaxed tracking-wide text-muted-foreground">
                  <Sparkles
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  {dict.hero.eyebrow}
                </p>

                <h1
                  id="hero-heading"
                  className="max-w-4xl text-balance text-4xl font-bold leading-relaxed tracking-wide sm:text-5xl lg:text-6xl"
                >
                  <span className="block">{dict.hero.brand}</span>
                  <span className="block">{dict.hero.heading}</span>
                </h1>
                {dict.hero.subtitle ? (
                  <p className="mt-4 max-w-2xl text-pretty text-lg font-medium leading-relaxed tracking-wide text-foreground sm:text-xl">
                    {dict.hero.subtitle}
                  </p>
                ) : null}
                {dict.hero.description ? (
                  <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed tracking-wide text-muted-foreground">
                    {dict.hero.description}
                  </p>
                ) : null}

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="/login" prefetch={false}>
                    <Button size="lg" className="w-full min-w-[160px] sm:w-auto">
                      {dict.hero.ctaLogin}
                    </Button>
                  </Link>
                  <Link href="/register" prefetch={false}>
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
            className="border-b bg-muted/20"
            aria-labelledby="about-heading"
          >
            <div className={cn(sectionShell, "py-16 sm:py-20")}>
              <div className={proseWidth}>
                <h2 id="about-heading" className={cn(headingClass, "text-center")}>
                  {dict.about.title}
                </h2>
                <div className="mt-8 space-y-4">
                  {dict.about.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className={bodyClass}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <ProductShowcase dict={dict} />

          {/* Features */}
          <section
            id="features"
            aria-labelledby="features-heading"
          >
            <div className={cn(sectionShell, "py-16 sm:py-20")}>
              <div className={cn(proseWidth, "text-center")}>
                <h2 id="features-heading" className={headingClass}>
                  {dict.features.title}
                </h2>
                {dict.features.subtitle ? (
                  <p className={cn("mt-3", bodyClass)}>{dict.features.subtitle}</p>
                ) : null}
              </div>

              <div className={cn(proseWidth, "mt-12 grid gap-6 sm:grid-cols-2")}>
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
                        <h3 className="text-balance text-lg font-semibold leading-relaxed tracking-wide">
                          {feature.title}
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className={cn("text-sm", bodyClass)}>
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="border-y bg-muted/20"
            aria-labelledby="pricing-heading"
          >
            <div className={cn(sectionShell, "py-16 sm:py-20")}>
              <div className={cn(proseWidth, "text-center")}>
                <div
                  className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/5 ring-1 ring-primary/10"
                  aria-hidden="true"
                >
                  <DollarSign className="size-6 text-primary" />
                </div>
                <h2 id="pricing-heading" className={headingClass}>
                  {dict.pricing.title}
                </h2>
                <p className={cn("mt-3", bodyClass)}>{dict.pricing.subtitle}</p>
              </div>

              <div className={cn(proseWidth, "mt-10 grid gap-4 sm:grid-cols-3")}>
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-balance text-base leading-relaxed tracking-wide">
                      {dict.pricing.pricePerBooking}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-balance text-base leading-relaxed tracking-wide">
                      {dict.pricing.noMonthlyFee}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-balance text-base leading-relaxed tracking-wide">
                      {dict.pricing.freeTier}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <p className={cn(proseWidth, "mt-6 text-center text-sm", bodyClass)}>
                {dict.pricing.footnote}
              </p>
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="border-y bg-muted/20"
            aria-labelledby="how-heading"
          >
            <div className={cn(sectionShell, "py-16 sm:py-20")}>
              <div className={cn(proseWidth, "text-center")}>
                <h2 id="how-heading" className={headingClass}>
                  {dict.howItWorks.title}
                </h2>
                <div className="mt-3 space-y-4">
                  {dict.howItWorks.subtitle.split("\n").map((line) => (
                    <p key={line} className={bodyClass}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className={cn(proseWidth, "mt-12 grid gap-10 lg:grid-cols-2")}>
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
            aria-labelledby="faq-heading"
          >
            <div className={cn(sectionShell, "py-16 sm:py-20")}>
              <div className={proseWidth}>
                <h2 id="faq-heading" className={headingClass}>
                  {dict.faq.title}
                </h2>
              </div>

              <div className={cn(proseWidth, "mt-10 space-y-3 text-left")}>
                {dict.faq.items.map((item, index) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border bg-card ring-1 ring-foreground/5 open:ring-foreground/10"
                    {...(index === 0 ? { open: true } : {})}
                  >
                    <summary className="cursor-pointer list-none px-5 py-4 font-medium leading-relaxed tracking-wide marker:content-none [&::-webkit-details-marker]:hidden">
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
                    <div className={cn("border-t px-5 pb-4 pt-3 text-sm", bodyClass)}>
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className="border-t bg-primary text-primary-foreground"
            aria-labelledby="cta-heading"
          >
            <div className={cn(sectionShell, "py-16 text-center sm:py-20")}>
              <div className={proseWidth}>
                <h2 id="cta-heading" className={headingClass}>
                  {dict.cta.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {dict.cta.description.split("\n").map((line) => (
                    <p
                      key={line}
                      className="text-pretty leading-relaxed tracking-wide text-primary-foreground/80"
                    >
                      {line}
                    </p>
                  ))}
                </div>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                  <Link href="/login" prefetch={false}>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full min-w-[180px] sm:w-auto"
                    >
                      {dict.cta.loginButton}
                    </Button>
                  </Link>
                  <Link href="/register" prefetch={false}>
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
    <div className="text-center lg:text-left">
      <h3 className="text-balance text-lg font-semibold leading-relaxed tracking-wide">
        {title}
      </h3>
      <ol className="mt-6 space-y-6">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col items-center gap-3 lg:flex-row lg:items-start lg:gap-4"
          >
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
            <div className="max-w-sm lg:max-w-none">
              <p className="font-medium leading-relaxed tracking-wide">{step.title}</p>
              <p className={cn("mt-1 text-sm", bodyClass)}>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
