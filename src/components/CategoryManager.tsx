import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Trash2, Check } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "@/hooks/use-toast";

interface Props {
  userId: string;
}

export const CategoryManager = ({ userId }: Props) => {
  const { categories, addCategory, updateCategory, deleteCategory, DEFAULT_COLORS } = useCategories(userId);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [editingName, setEditingName] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast({ title: "Category name required", variant: "destructive" });
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Category already exists", variant: "destructive" });
      return;
    }
    addCategory(trimmed, newColor);
    setNewName("");
    toast({ title: `Added "${trimmed}"` });
  };

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Categories
        </CardTitle>
        <CardDescription>Create and color-code your item categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="New category name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1"
          />
          <div className="flex gap-2 items-center">
            <ColorPicker value={newColor} onChange={setNewColor} colors={DEFAULT_COLORS} />
            <Button onClick={handleAdd} size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories yet. Add one above.
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <Badge
                  variant="outline"
                  className="gap-1.5 border-2"
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </Badge>
                <div className="flex items-center gap-1">
                  {editingName === cat.name ? (
                    <>
                      <ColorPicker
                        value={cat.color}
                        onChange={(c) => updateCategory(cat.name, { color: c })}
                        colors={DEFAULT_COLORS}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingName(null)}
                        aria-label="Done"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingName(cat.name)}
                    >
                      Edit color
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteCategory(cat.name);
                      toast({ title: `Removed "${cat.name}"` });
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ColorPicker = ({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (c: string) => void;
  colors: string[];
}) => (
  <div className="flex gap-1 items-center p-1 rounded-md border bg-background">
    {colors.map((c) => (
      <button
        key={c}
        type="button"
        onClick={() => onChange(c)}
        className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
          value === c ? "border-foreground" : "border-transparent"
        }`}
        style={{ backgroundColor: c }}
        aria-label={`Select color ${c}`}
      />
    ))}
  </div>
);
