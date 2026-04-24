import { useEffect, useRef } from "react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import ClosetPage from "@/pages/closet";
import OutfitPage from "@/pages/outfit";
import SavedOutfitsPage from "@/pages/saved-outfits";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(15, 60%, 50%)",
    colorForeground: "hsl(20, 20%, 15%)",
    colorMutedForeground: "hsl(20, 10%, 45%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(40, 33%, 97%)",
    colorInput: "hsl(40, 33%, 99%)",
    colorInputForeground: "hsl(20, 20%, 15%)",
    colorNeutral: "hsl(30, 20%, 85%)",
    colorModalBackdrop: "rgba(20, 16, 12, 0.55)",
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox:
      "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-border shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-foreground text-2xl",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary font-medium hover:underline",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-primary",
    alertText: "text-foreground",
    logoBox: "justify-center mb-2",
    logoImage: "h-10 w-10",
    socialButtonsBlockButton:
      "border border-border bg-background hover:bg-muted",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
    formFieldInput: "bg-input border border-border text-foreground",
    footerAction: "text-center",
    dividerLine: "bg-border",
    alert: "bg-muted border border-border",
    otpCodeFieldInput: "bg-input border border-border text-foreground",
    formFieldRow: "",
    main: "gap-4",
  },
};

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/closet" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to open your closet",
          },
        },
        signUp: {
          start: {
            title: "Create your closet",
            subtitle: "Start building your digital wardrobe",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/closet">
              <Protected>
                <ClosetPage />
              </Protected>
            </Route>
            <Route path="/outfit">
              <Protected>
                <OutfitPage />
              </Protected>
            </Route>
            <Route path="/outfits">
              <Protected>
                <SavedOutfitsPage />
              </Protected>
            </Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  if (clerkPubKey.startsWith("pk_test_ZHVtbXk")) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
        <h1 style={{ color: "#E07870" }}>Authentication Setup Required</h1>
        <p>The application is running, but it requires a real Clerk Publishable Key.</p>
        <p>Please edit <code>d:\digital-closet\artifacts\closet\.env</code> and add your actual <code>VITE_CLERK_PUBLISHABLE_KEY</code> to see the full application.</p>
      </div>
    );
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
