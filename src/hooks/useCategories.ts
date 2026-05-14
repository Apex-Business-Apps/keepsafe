import { useState, useEffect, useCallback, useMemo } from "react";

export interface Category {
  name: string;
  color: string;
}

const STORAGE_KEY = (userId: string) => `keepsafe.categories.${userId}`;

const DEFAULT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
];

const SEED: Category[] = [
  { name: "Electronics", color: "#6366f1" },
  { name: "Appliances", color: "#10b981" },
  { name: "Furniture", color: "#f59e0b" },
  { name: "Tools", color: "#ef4444" },
  { name: "Kitchen", color: "#8b5cf6" },
];

export const useCategories = (userId?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY(userId));
      if (raw) {
        setCategories(JSON.parse(raw));
      } else {
        setCategories(SEED);
        localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(SEED));
      }
    } catch {
      setCategories(SEED);
    }
  }, [userId]);

  const persist = useCallback((next: Category[]) => {
    setCategories(next);
    if (userId) {
      try {
        localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
    }
  }, [userId]);

  const addCategory = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    const finalColor = color || DEFAULT_COLORS[categories.length % DEFAULT_COLORS.length];
    persist([...categories, { name: trimmed, color: finalColor }]);
  }, [categories, persist]);

  const updateCategory = useCallback((oldName: string, updates: Partial<Category>) => {
    persist(categories.map((c) => (c.name === oldName ? { ...c, ...updates } : c)));
  }, [categories, persist]);

  const deleteCategory = useCallback((name: string) => {
    persist(categories.filter((c) => c.name !== name));
  }, [categories, persist]);

  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.name.toLowerCase(), c.color));
    return map;
  }, [categories]);

  const getColor = useCallback((name?: string | null) => {
    if (!name) return "#94a3b8";
    return colorMap.get(name.toLowerCase()) || "#94a3b8";
  }, [colorMap]);

  return { categories, addCategory, updateCategory, deleteCategory, getColor, DEFAULT_COLORS };
};
