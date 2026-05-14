import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  userId?: string;
  placeholder?: string;
}

export const CategorySelect = ({ value, onChange, userId, placeholder = "Select category…" }: Props) => {
  const { categories, addCategory, getColor } = useCategories(userId);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const exact = categories.find((c) => c.name.toLowerCase() === search.trim().toLowerCase());

  const handleCreate = () => {
    const name = search.trim();
    if (!name) return;
    addCategory(name);
    onChange(name);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-12 justify-between font-normal text-base"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getColor(value) }}
              />
              {value}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {search.trim() ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create "{search.trim()}"
                </button>
              ) : (
                "No categories"
              )}
            </CommandEmpty>
            <CommandGroup>
              {categories.map((c) => (
                <CommandItem
                  key={c.name}
                  value={c.name}
                  onSelect={() => {
                    onChange(c.name);
                    setOpen(false);
                  }}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === c.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              {search.trim() && !exact && (
                <CommandItem onSelect={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create "{search.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
