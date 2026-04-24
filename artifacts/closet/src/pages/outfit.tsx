import { useState } from "react";
import { Nav } from "@/components/layout/nav";
import {
  useGenerateRandomOutfit,
  useSaveOutfit,
  useSuggestOutfit,
  getGenerateRandomOutfitQueryKey,
  getListOutfitsQueryKey,
  getGetClosetSummaryQueryKey,
} from "@workspace/api-client-react";
import type { ClothingItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shuffle, Heart, Loader2, Sparkles, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type Mode = "shuffle" | "stylist";

const promptIdeas = [
  "Coffee with a friend on a chilly Sunday",
  "Casual client meeting, want to feel put-together",
  "Dinner date, slightly dressy but comfortable",
  "Long flight tomorrow — easy, layered, looks tidy",
  "Picnic in the park, sunny and warm",
];

export default function OutfitPage() {
  const [mode, setMode] = useState<Mode>("shuffle");
  const [prompt, setPrompt] = useState("");
  const [stylistResult, setStylistResult] = useState<{
    items: ClothingItem[];
    reasoning: string;
    suggestedName: string;
  } | null>(null);

  const {
    data: shuffleOutfit,
    refetch,
    isFetching: isShuffleFetching,
    isError,
  } = useGenerateRandomOutfit({
    query: {
      enabled: true,
      queryKey: getGenerateRandomOutfitQueryKey(),
      staleTime: 0,
    },
  });

  const suggestMutation = useSuggestOutfit();
  const saveOutfitMutation = useSaveOutfit();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [animationKey, setAnimationKey] = useState(0);

  const items: ClothingItem[] =
    mode === "stylist"
      ? stylistResult?.items ?? []
      : shuffleOutfit?.items ?? [];
  const isFetching = mode === "stylist" ? suggestMutation.isPending : isShuffleFetching;
  const hasItems = items.length > 0;

  const handleShuffle = () => {
    setMode("shuffle");
    setAnimationKey((p) => p + 1);
    refetch();
  };

  const handleSuggest = async (textOverride?: string) => {
    const text = (textOverride ?? prompt).trim();
    if (!text) {
      toast({ title: "Tell the stylist what you have in mind." });
      return;
    }
    setMode("stylist");
    setAnimationKey((p) => p + 1);
    try {
      const result = await suggestMutation.mutateAsync({ data: { prompt: text } });
      setStylistResult(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "The stylist didn't respond. Try again.";
      toast({ title: "Couldn't suggest an outfit", description: message, variant: "destructive" });
    }
  };

  const openSaveDialog = () => {
    setOutfitName(mode === "stylist" ? stylistResult?.suggestedName ?? "" : "");
    setSaveDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasItems || !outfitName) return;
    try {
      await saveOutfitMutation.mutateAsync({
        data: { name: outfitName, itemIds: items.map((i) => i.id) },
      });
      queryClient.invalidateQueries({ queryKey: getListOutfitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetClosetSummaryQueryKey() });
      toast({ title: "Outfit saved!" });
      setSaveDialogOpen(false);
      setOutfitName("");
    } catch (err) {
      toast({ title: "Failed to save outfit", variant: "destructive" });
    }
  };

  const showEmptyState =
    mode === "shuffle" && (isError || (!isShuffleFetching && !hasItems));

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 max-w-3xl mt-8 pb-20">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
            Style Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Shuffle for inspiration, or ask the AI stylist for something specific.
          </p>
        </header>

        {/* Mode tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full border bg-card p-1">
            <button
              onClick={() => setMode("shuffle")}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                mode === "shuffle"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-shuffle"
            >
              <Shuffle className="h-4 w-4 inline mr-2" />
              Shuffle
            </button>
            <button
              onClick={() => setMode("stylist")}
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${
                mode === "stylist"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-stylist"
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              AI stylist
            </button>
          </div>
        </div>

        {/* Stylist input */}
        {mode === "stylist" && (
          <Card className="p-5 mb-8 bg-card border">
            <Label htmlFor="stylist-prompt" className="text-sm font-medium mb-2 block">
              What's the day looking like?
            </Label>
            <Textarea
              id="stylist-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. brunch with my in-laws, want to look polished but cozy"
              maxLength={500}
              rows={2}
              className="resize-none"
              data-testid="input-stylist-prompt"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {promptIdeas.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setPrompt(idea);
                    handleSuggest(idea);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`prompt-idea-${idea.slice(0, 10)}`}
                >
                  {idea}
                </button>
              ))}
            </div>
            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={() => handleSuggest()}
              disabled={suggestMutation.isPending || !prompt.trim()}
              data-testid="button-stylist-suggest"
            >
              {suggestMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Ask the stylist
            </Button>
          </Card>
        )}

        {showEmptyState ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <h3 className="text-xl font-serif mb-2">Not enough items</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Add some pieces to your closet first.
            </p>
            <Button onClick={() => setLocation("/closet")} data-testid="button-go-add">
              Go to Closet
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Stylist reasoning */}
            {mode === "stylist" && stylistResult && !suggestMutation.isPending && (
              <div className="w-full max-w-lg mb-6 rounded-2xl bg-accent/40 border border-accent-foreground/10 p-5">
                <div className="flex items-start gap-3">
                  <Quote className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary font-medium mb-1">
                      {stylistResult.suggestedName}
                    </p>
                    <p
                      className="text-foreground leading-relaxed italic"
                      data-testid="text-stylist-reasoning"
                    >
                      {stylistResult.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full max-w-lg relative min-h-[200px] flex items-center justify-center">
              {isFetching && !hasItems ? (
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                  {mode === "stylist" && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Pulling pieces from your closet…
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4" key={animationKey}>
                  {items.map((item, index) => (
                    <Card
                      key={`${item.id}-${animationKey}`}
                      className="flex items-center p-4 bg-card border-border/50 shadow-sm shuffle-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`outfit-item-${item.id}`}
                    >
                      <div className="h-24 w-24 bg-muted/30 rounded-md p-2 flex-shrink-0">
                        <img
                          src={`/api/storage${item.imagePath}`}
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                          {item.category}
                        </p>
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        {item.color && (
                          <p className="text-sm text-muted-foreground">{item.color}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {hasItems && (
              <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-full h-14"
                  onClick={
                    mode === "shuffle" ? handleShuffle : () => handleSuggest()
                  }
                  disabled={isFetching || (mode === "stylist" && !prompt.trim())}
                  data-testid="button-shuffle"
                >
                  {isFetching ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : mode === "stylist" ? (
                    <Sparkles className="h-5 w-5 mr-2" />
                  ) : (
                    <Shuffle className="h-5 w-5 mr-2" />
                  )}
                  {mode === "stylist" ? "Try again" : "Shuffle Again"}
                </Button>
                <Button
                  size="lg"
                  className="flex-1 rounded-full h-14"
                  onClick={openSaveDialog}
                  disabled={isFetching || !hasItems}
                  data-testid="button-save-dialog"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Save Look
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Name this look</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="outfitName">Outfit Name</Label>
              <Input
                id="outfitName"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g. Casual Friday, Date Night"
                required
                autoFocus
                data-testid="input-outfit-name"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={!outfitName || saveOutfitMutation.isPending}
                data-testid="button-save-outfit"
              >
                {saveOutfitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save to Wardrobe
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
