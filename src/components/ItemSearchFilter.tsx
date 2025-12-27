import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Item } from "@/hooks/useItems";

interface ItemSearchFilterProps {
  items: Item[];
  onFilteredItems: (items: Item[]) => void;
}

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Appliances", 
  "Furniture",
  "Kitchen",
  "Tools",
  "Outdoor",
  "Sports",
  "Other"
];

export function ItemSearchFilter({ items, onFilteredItems }: ItemSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showRecallsOnly, setShowRecallsOnly] = useState(false);

  // Get unique brands from items
  const brands = useMemo(() => {
    const uniqueBrands = new Set(items.map(item => item.brand).filter(Boolean));
    return ["All Brands", ...Array.from(uniqueBrands)] as string[];
  }, [items]);

  const [selectedBrand, setSelectedBrand] = useState("All Brands");

  // Filter items based on search and filters
  useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.serial_number?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Brand filter
    if (selectedBrand !== "All Brands") {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }

    // Recall filter
    if (showRecallsOnly) {
      filtered = filtered.filter(item => item.recall_match);
    }

    onFilteredItems(filtered);
  }, [items, searchQuery, selectedCategory, selectedBrand, showRecallsOnly, onFilteredItems]);

  const hasActiveFilters = 
    searchQuery.trim() || 
    selectedCategory !== "All Categories" || 
    selectedBrand !== "All Brands" ||
    showRecallsOnly;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedBrand("All Brands");
    setShowRecallsOnly(false);
  };

  return (
    <div className="glass-effect border border-primary/20 rounded-xl p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, brand, or serial number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Category Select */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[160px] bg-background/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand Select */}
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-[160px] bg-background/50">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Recall Toggle */}
        <Button
          variant={showRecallsOnly ? "destructive" : "outline"}
          size="sm"
          onClick={() => setShowRecallsOnly(!showRecallsOnly)}
          className="gap-2"
        >
          {showRecallsOnly ? "Showing Recalls" : "Recalls Only"}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory !== "All Categories" && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <button onClick={() => setSelectedCategory("All Categories")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedBrand !== "All Brands" && (
            <Badge variant="secondary" className="gap-1">
              {selectedBrand}
              <button onClick={() => setSelectedBrand("All Brands")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {showRecallsOnly && (
            <Badge variant="destructive" className="gap-1">
              Recalls Only
              <button onClick={() => setShowRecallsOnly(false)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
