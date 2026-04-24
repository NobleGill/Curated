import { SignInButton, SignUpButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import {
  Shirt,
  Camera,
  Sparkles,
  Heart,
  Coffee,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Shirt className="h-5 w-5" />
            </div>
            <span className="font-serif font-bold text-xl">Curated</span>
          </div>
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button variant="ghost" data-testid="button-signin">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button data-testid="button-signup">Get started</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                A little less &ldquo;I have nothing to wear&rdquo;
              </div>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                The wardrobe
                <span className="block text-primary italic">you forgot you had.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Most of us own plenty of beautiful clothes &mdash; we just keep reaching for the
                same five. Curated is a quiet little place to photograph what you already love,
                see it all in one spot, and rediscover combinations you&rsquo;d genuinely wear.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <SignUpButton mode="modal">
                  <Button size="lg" className="text-base px-7" data-testid="button-hero-signup">
                    Start my closet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-7"
                    data-testid="button-hero-signin"
                  >
                    I&rsquo;ve been here before
                  </Button>
                </SignInButton>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                Free to try. No credit card. Your closet, your business.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/40 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative grid grid-cols-5 gap-3">
                <div className="col-span-3">
                  <img
                    src="hero-flatlay.png"
                    alt="A capsule wardrobe arranged on a cream linen background"
                    className="w-full rounded-2xl border shadow-md object-cover aspect-[4/3]"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-3">
                  <img
                    src="hero-rail.png"
                    alt="A wooden clothing rail in soft morning light"
                    className="w-full rounded-2xl border shadow-md object-cover aspect-[3/4]"
                  />
                </div>
                <div className="col-span-2 -mt-2">
                  <img
                    src="hero-phone.png"
                    alt="Photographing a folded cardigan with a phone"
                    className="w-full rounded-2xl border shadow-md object-cover aspect-square"
                  />
                </div>
                <div className="col-span-3 -mt-2">
                  <div className="rounded-2xl border bg-card p-5 h-full flex flex-col justify-between">
                    <div className="flex gap-1 text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mt-3 italic">
                      &ldquo;I finally remembered I owned that green cardigan. Wore it twice this
                      week.&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">&mdash; Priya, Brooklyn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Soft divider */}
      <div className="border-t border-border/60" />

      {/* How it works */}
      <section className="container mx-auto px-4 max-w-6xl py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.18em] text-primary font-medium mb-3">
            How it works
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Three small habits, a wardrobe that finally feels like yours.
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: Camera,
              title: "Snap as you go",
              body: "While you&rsquo;re putting laundry away, photograph the pieces you actually wear. Tag them as a top, bottom, shoes, outerwear, or an accessory. That&rsquo;s the whole onboarding.",
            },
            {
              step: "02",
              icon: Sparkles,
              title: "Shuffle on slow mornings",
              body: "Tap once and Curated pulls a head-to-toe outfit from what you already own. Don&rsquo;t love it? Tap again. It&rsquo;s like having a friend rummage through your closet for you.",
            },
            {
              step: "03",
              icon: Heart,
              title: "Keep the keepers",
              body: "When something just works, save it with a name &mdash; &ldquo;Sunday brunch&rdquo;, &ldquo;client meeting&rdquo;, &ldquo;rainy Tuesday&rdquo;. Future-you will thank present-you at 7:42 a.m.",
            },
          ].map((s) => (
            <div key={s.step} className="relative">
              <div className="absolute -left-2 -top-4 font-serif italic text-7xl text-primary/15 select-none">
                {s.step}
              </div>
              <div className="relative">
                <div className="bg-accent text-accent-foreground inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-2">{s.title}</h3>
                <p
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: s.body }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story / image break */}
      <section className="bg-accent/30 border-y">
        <div className="container mx-auto px-4 max-w-6xl py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="hero-rail.png"
              alt="A clothing rail in warm afternoon light"
              className="w-full rounded-2xl border shadow-md object-cover aspect-[3/4] max-h-[520px]"
            />
          </div>
          <div>
            <Quote className="h-8 w-8 text-primary mb-4" />
            <p className="font-serif text-2xl md:text-3xl leading-snug">
              I started Curated because I bought another striped shirt I didn&rsquo;t need. Three,
              actually. They were lovely. I already owned four.
            </p>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              The point of Curated isn&rsquo;t to buy more, prettier, faster. It&rsquo;s the
              opposite. It&rsquo;s a quiet inventory of what you&rsquo;ve already chosen, and a
              gentle nudge to wear it. Less algorithmic feed, more the back of your friend&rsquo;s
              dog-eared notebook.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Coffee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Maya, who keeps forgetting to dry-clean</p>
                <p className="text-xs text-muted-foreground">Founder &amp; perpetual over-buyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Made for you */}
      <section className="container mx-auto px-4 max-w-6xl py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-[0.18em] text-primary font-medium mb-3">
            Made for
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            People who like their stuff &mdash; just not the chaos.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "The 7 a.m. panicker",
              body: "You don&rsquo;t want a stylist. You want one less decision before coffee.",
            },
            {
              title: "The thoughtful shopper",
              body: "You buy slowly and on purpose. You&rsquo;d like to actually wear what you bought.",
            },
            {
              title: "The packer-procrastinator",
              body: "Trip on Friday. Suitcase still empty. A saved outfit list is your friend.",
            },
            {
              title: "The closet curator",
              body: "Your wardrobe is small and considered. You enjoy seeing it laid out beautifully.",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border bg-card p-6 hover:border-primary/40 transition-colors"
            >
              <h3 className="font-serif text-xl font-semibold mb-2">{p.title}</h3>
              <p
                className="text-muted-foreground text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: p.body }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto px-4 max-w-3xl py-20">
          <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-center mb-12">
            Honest answers to the things you were going to ask anyway.
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Do I have to photograph every single thing I own?",
                a: "Please don&rsquo;t. Start with the ten or fifteen pieces you actually reach for. The whole point is that this should feel light, not like a Sunday-afternoon archiving project.",
              },
              {
                q: "Will the AI judge my style?",
                a: "There&rsquo;s no AI here judging anything. We just shuffle from what you upload &mdash; one piece per category. If you only own black jeans, you&rsquo;re always getting black jeans. That&rsquo;s a feature.",
              },
              {
                q: "Is my closet private?",
                a: "Yes. Your account is yours. Your photos and outfits are tied to your sign-in and not shared with anyone else.",
              },
              {
                q: "What if I delete an item I&rsquo;d saved in an outfit?",
                a: "The outfit stays as a memory of the piece. Tidy, low-drama.",
              },
            ].map((f) => (
              <div key={f.q} className="rounded-2xl border bg-card p-6">
                <h3 className="font-serif text-xl font-semibold mb-2">{f.q}</h3>
                <p
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 max-w-4xl py-20 text-center">
        <h2 className="font-serif text-4xl md:text-6xl font-bold leading-tight">
          So, what are you wearing
          <span className="block text-primary italic">on Tuesday?</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
          Spend ten minutes today photographing what you love. Spend the rest of the week
          actually wearing it.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <SignUpButton mode="modal">
            <Button size="lg" className="text-base px-8" data-testid="button-cta-signup">
              Build my closet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8"
              data-testid="button-cta-signin"
            >
              Sign in
            </Button>
          </SignInButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded">
              <Shirt className="h-3.5 w-3.5" />
            </div>
            <span>Curated &mdash; made on a quiet Sunday.</span>
          </div>
          <span className="italic">Wear what you already love.</span>
        </div>
      </footer>
    </div>
  );
}
