import { Link, useLocation } from "wouter";
import { Shirt, Shuffle, Layers, LogOut } from "lucide-react";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Nav() {
  const [location] = useLocation();
  const { signOut } = useClerk();

  const links = [
    { href: "/closet", label: "Closet", icon: Shirt },
    { href: "/outfit", label: "Generator", icon: Shuffle },
    { href: "/outfits", label: "Saved", icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
        <Link href="/closet" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Shirt className="h-5 w-5" />
          </div>
          <span className="font-serif font-bold text-xl hidden sm:inline-block">Curated</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{link.label}</span>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL })}
            className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            data-testid="button-signout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline-block ml-2">Sign out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
