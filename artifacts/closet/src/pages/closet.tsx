import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Nav } from "@/components/layout/nav";
import { useGetClosetSummary, useListItems, getGetClosetSummaryQueryKey, getListItemsQueryKey, useDeleteItem, useCreateItem } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Category } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UploadCloud, Loader2, Shirt, Shuffle } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";

const categories: { value: Category; label: string }[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
  { value: "outerwear", label: "Outerwear" },
  { value: "shoes", label: "Shoes" },
  { value: "accessory", label: "Accessories" },
];

function AddItemDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("top");
  const [color, setColor] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading } = useUpload();
  const createItem = useCreateItem();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !category) return;

    try {
      const uploadRes = await uploadFile(file);
      if (!uploadRes) throw new Error("Upload failed");

      await createItem.mutateAsync({
        data: {
          name,
          category,
          color: color || null,
          imagePath: uploadRes.objectPath,
        },
      });

      queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetClosetSummaryQueryKey() });
      toast({ title: "Item added to your closet" });
      onOpenChange(false);
      setFile(null);
      setPreview(null);
      setName("");
      setColor("");
      setCategory("top");
    } catch (err) {
      toast({ title: "Error adding item", variant: "destructive" });
    }
  };

  const isSubmitting = isUploading || createItem.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add a piece</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {preview ? (
              <div className="relative w-full aspect-square max-h-[200px]">
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click or drag image to upload</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG up to 10MB</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">What is it?</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Favorite Denim Jacket" required data-testid="input-name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color (optional)</Label>
              <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Navy blue" data-testid="input-color" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!file || !name || isSubmitting} data-testid="button-submit-item">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add to closet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClosetPage() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: items = [], isLoading } = useListItems(filter !== "all" ? { category: filter } : undefined);
  const { data: summary } = useGetClosetSummary();
  const deleteItem = useDeleteItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDelete = async (id: number) => {
    try {
      await deleteItem.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetClosetSummaryQueryKey() });
      toast({ title: "Item removed" });
    } catch (err) {
      toast({ title: "Failed to remove item", variant: "destructive" });
    }
  };

  const filters: { value: Category | "all"; label: string }[] = [
    { value: "all", label: "All Items" },
    ...categories,
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="container mx-auto px-4 max-w-5xl mt-8">
        <header className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">Your Closet</h1>
            <p className="text-muted-foreground mt-2">
              {summary ? `${summary.totalItems} items · ${summary.savedOutfits} outfits` : "Loading stats..."}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="rounded-full shadow-md" size="lg" data-testid="button-add-item">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </header>

        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter(f.value)}
              data-testid={`filter-${f.value}`}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif mb-2">It's a little empty in here</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Start building your digital wardrobe by adding your first piece of clothing.
            </p>
            <Button onClick={() => setDialogOpen(true)}>Add your first item</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-enter">
            {items.map((item, i) => (
              <Card key={item.id} className="group overflow-hidden border-border/50 hover:shadow-md transition-shadow" data-testid={`item-${item.id}`}>
                <div className="aspect-[3/4] relative bg-muted/30 p-4">
                  <img
                    src={`/api/storage${item.imagePath}`}
                    alt={item.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
                    onClick={() => handleDelete(item.id)}
                    data-testid={`delete-item-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4 bg-card">
                  <h3 className="font-medium text-sm truncate" title={item.name}>{item.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {item.category} {item.color && `· ${item.color}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AddItemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      
      {items.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg px-8 h-14 text-base font-medium animate-in slide-in-from-bottom-10"
            onClick={() => setLocation('/outfit')}
            data-testid="fab-generate"
          >
            <Shuffle className="mr-2 h-5 w-5" /> Generate Outfit
          </Button>
        </div>
      )}
    </div>
  );
}
