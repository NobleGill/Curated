import { Nav } from "@/components/layout/nav";
import { useListOutfits, useDeleteOutfit, getListOutfitsQueryKey, getGetClosetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function SavedOutfitsPage() {
  const { data: outfits = [], isLoading } = useListOutfits();
  const deleteOutfit = useDeleteOutfit();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteOutfit.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListOutfitsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetClosetSummaryQueryKey() });
      toast({ title: "Outfit removed" });
    } catch (err) {
      toast({ title: "Failed to remove outfit", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 max-w-5xl mt-8 pb-20">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">Saved Looks</h1>
          <p className="text-muted-foreground mt-2">Your personal lookbook of favorite combinations.</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : outfits.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif mb-2">No saved looks yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Generate some random outfits and save your favorites to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-enter">
            {outfits.map((outfit) => (
              <Card key={outfit.id} className="overflow-hidden border-border/50 group" data-testid={`saved-outfit-${outfit.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/20">
                  <div>
                    <CardTitle className="font-serif text-xl">{outfit.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(outfit.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDelete(outfit.id)}
                    data-testid={`delete-outfit-${outfit.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 bg-card">
                  <div className="grid grid-cols-5 gap-2">
                    {outfit.items.map((item) => (
                      <div key={item.id} className="aspect-square bg-muted/30 rounded-md p-1 relative group/item" title={item.name}>
                        <img 
                          src={`/api/storage${item.imagePath}`} 
                          alt={item.name} 
                          className="w-full h-full object-contain mix-blend-multiply" 
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
